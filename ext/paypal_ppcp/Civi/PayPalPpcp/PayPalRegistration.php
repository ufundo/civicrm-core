<?php

namespace Civi\PayPalPpcp;

use Civi;
use CRM_PayPalPpcp_ExtensionUtil as E;
use Civi\Core\Service\AutoService;
use GuzzleHttp\Client;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * When creating/editing a "Payment Processor" based PayPal Complete, offer buttons
 * to initialize the credentials.
 *
 * @service paypal_ppcp.registration
 */
class PayPalRegistration extends AutoService implements EventSubscriberInterface {

  const ONBOARD_FLOW_TTL = 6 * 60 * 60;

  const PROVIDER_NAME = 'ppcp';

  const MINIBROWSER = 'paypal_minibrowser';

  public static function getSubscribedEvents(): array {
    return [
      // When editing a "PPCP" PaymentProcessor, offer the "PayPal" options.
      '&hook_civicrm_initiators::PaymentProcessor' => ['onCreateInitiators', 0],
    ];
  }

  public function isSupported(): bool {
    return \Civi::container()->has('oauth_client.civi_connect');
  }

  /**
   * @array{array{civi_connect_url:string,template:array}
   */
  public function getProviders(): array {
    if (!$this->isSupported()) {
      return [];
    }

    $hosts = Civi::service('oauth_client.civi_connect')->getHosts();
    $instances = [];
    foreach ($hosts as $hostKey => $host) {
      if (empty($host['url'])) {
        continue;
      }
      $isLive = ($hostKey === 'live');
      $instance = [
        'name' => call_user_func($host['name()'], static::PROVIDER_NAME),
        'title' => call_user_func($host['title()'], E::ts('PayPal Complete')),
        'civi_connect_url' => $host['url'],
        'template' => [
          'user_name' => '{{rest_creds.client_id}}',
          'password' => '{{rest_creds.client_secret}}',
          'subject' => '{{rest_creds.payer_id}}',
          'url_site' => $isLive ? 'https://www.paypal.com/' : 'https://www.sandbox.paypal.com/',
          'url_api' => $isLive ? 'https://api-m.paypal.com/' : 'https://api-m.sandbox.paypal.com/',
        ],
      ];
      $instances[$instance['name']] = $instance;
    }

    return $instances;
  }

  public function getProvider(string $name): ?array {
    $instances = $this->getProviders();
    return $instances[$name] ?? NULL;
  }

  /**
   * When editing a PaymentProcessor, generate a list of options for how to initialize the API keys.
   *
   * @param array $context
   * @param array $available
   * @param string|NULL $default
   * @see CRM_Utils_Hook::initiators()
   */
  public function onCreateInitiators(array $context, array &$available, &$default): void {
    if (!in_array($context['payment_processor_type'], ['PPCP']) || !$this->isSupported()) {
      return;
    }
    if (!\CRM_Core_Permission::check('administer payment processors')) {
      return;
    }

    $providers = $this->getProviders();

    foreach ($providers as $name => $provider) {
      $available[$name] = [
        'title' => $provider['title'],
        // 'tags' => $provider['tags'],
        'render' => function (\CRM_Core_Region $region, array $context, array $initiator) use ($provider) {
          $region->addScriptFile(E::LONG_NAME, 'js/paypal.initiator.js');

          // Ugh, this will be a synchronous part of the pageload. But PayPal requires that we obtain referral
          // URL before we can render a button... i.e. there is no JS API for opening the minibrowser...
          try {
            [$url, $stateId] = $this->createMinibrowserFlow($provider, $context['payment_processor_id']);
          }
          catch (\Throwable $e) {
            \Civi::log()->warning("Failed to create referral URL.", ['exception' => $e]);
            $url = NULL;
            $stateId = NULL;
            $region->addMarkup(sprintf('<div class="alert alert-danger">%s</div>',
              ts('Failed to create referral URL.') . " " . ts('See log for details.')
            ));
          }

          // PayPal callback doesn't tell us -which- button was pressed (e.g. live vs test).
          // So we make separate callbacks (stubs) to ensure that each button triggers a different flow (`stateId`).
          $callback = 'paypal_' . preg_replace(';[^a-zA-Z1-9];', '', $provider['name']) . '_' . \CRM_Utils_String::createRandom(8, 'abcdefghijklmnopqrstuvwxyz');
          $region->addScript(sprintf('function %s(authCode, sharedId) { CRM.ppcp.onboard(CRM._.extend(%s, {code: authCode, paypal_shared_id: sharedId})); }',
            $callback,
            \CRM_Utils_JSON::encodeScriptVar(['state' => $stateId])
          ));

          $region->addMarkup(sprintf(
            '<div><a target="_blank" class="btn btn-xs btn-primary %s" data-paypal-onboard-complete="%s" href="%s" data-paypal-button="true">%s</a></div>',
            $url ? '' : 'disabled',
            htmlentities($callback),
            htmlentities($url ?: ''),
            htmlentities(ts('Connect to %1', [$provider['title']]))
          ));
          $scriptDomain = rtrim($provider['template']['url_site'], '/');
          $region->add([
            'name' => 'paypal-partner-js',
            'markup' => '<script id="paypal-js" src="' . $scriptDomain . '/webapps/merchantboarding/js/lib/lightbox/partner.js"></script>',
            'weight' => 1000,
          ]);
        },
      ];
    }
  }

  /**
   * PayPal Minibrowser flow is similar-but-different to the OAuth AuthorizationCode flow:
   *
   * - Both present the user with a screen to login and approve permission.
   * - Both give an auth `code` - which can be exchanged for a bearer-token.
   * - For initiation, minibrowser doesn't use HTTP redirects or query-params -- it uses a custom JS API (with callbacks).
   * - The requests for exchanging tokens are shaped a bit differently.
   *
   * This function is analogous to OAuthClient::authorizationCode() -- it takes some inputs, creates the state, and
   * gives you back a URL.
   *
   * @param array $provider
   * @param int $paymentProcessorId
   * @return array
   *   Tuple [0 => string $url, 1 => string $stateId]
   */
  public function createMinibrowserFlow(array $provider, int $paymentProcessorId): array {
    // The purpose of the nonce is to ensure that the party initiating the request is the same one that does the final token-retrieval.
    // To enforce this purpose, we won't directly reveal the nonce to browsers. It stored in the `state`.
    $sellerNonce = \CRM_Utils_String::createRandom(64, \CRM_Utils_String::ALPHANUMERIC);

    $referral = $this->createReferral($provider['civi_connect_url'], $sellerNonce);

    // This is analogous to calling `OAuthClient::authorizationCode()` -- both setup a new `state` for a new pageflow.
    $stateId = \Civi::service('oauth2.state')->store([
      'ttl' => static::ONBOARD_FLOW_TTL,
      'grant_type' => static::MINIBROWSER,
      // 'storage' => 'OAuthSysToken',
      // 'scopes' => [],
      // 'tag' => 'PaymentProcessor:' . $paymentProcessorId,
      'code_verifier' => $sellerNonce,
      'paypalProvider' => $provider['name'],
      'paypalPaymentProcessorId' => $paymentProcessorId,
      'paypalPartnerMerchantId' => $referral['partnerMerchantId'],
    ]);

    $url = $referral['link']['href'] . '&displayMode=minibrowser';
    return [$url, $stateId];
  }

  /**
   * Get referral URL from civicrm.org.
   *
   * @param string $serviceUrl
   *   Ex: 'https://connect.civicrm.org'
   * @param string $sellerNonce
   * @return array{link:array{href:string}, partnerMerchantId:string}
   *   'link': an array. ex: ['href' => 'https://...', 'rel' => 'action_url', ...]
   *   'partnerMerchantId': string
   * @throws \GuzzleHttp\Exception\GuzzleException
   * @link https://developer.paypal.com/docs/multiparty/seller-onboarding/build-onboarding/#generate-signup-link
   */
  public function createReferral(string $serviceUrl, string $sellerNonce): array {
    $response = (new Client())->post("$serviceUrl/paypal/referral-url", [
      'form_params' => [
        'seller_nonce' => $sellerNonce,
      ],
    ]);
    $data = (string) $response->getBody();
    $parsed = json_decode($data, TRUE);
    foreach ($parsed['links'] as $link) {
      if ($link['rel'] == 'action_url') {
        return ['link' => $link, 'partnerMerchantId' => $parsed['partnerMerchantId']];
      }
    }
    throw new \CRM_Core_Exception("Filed to identify action_url in createReferralUrl()");
  }

}
