<?php
declare(strict_types = 1);

use CRM_PayPalPpcp_ExtensionUtil as E;
use GuzzleHttp\Client;

/**
 * Implement the multi-step credential lookup with PayPal Partner API.
 *
 * This end-point is called after we have received the
 *
 * @link https://developer.paypal.com/docs/multiparty/seller-onboarding/build-onboarding/
 */
class CRM_PayPalPpcp_Page_Onboard extends CRM_Core_Page {

  public function run(?\Psr\Http\Message\ServerRequestInterface $request = NULL) {
    $data = (string) $request->getBody();
    $parsed = json_decode($data, TRUE);
    $state = Civi::service('oauth2.state')->load($parsed['state']);

    // Let's make sure our inputs are generally sane.
    $basicString = '/^[-_a-zA-Z0-9]+$/';
    $validations = array_keys(array_filter([
      '"code" must be well-formed.' => empty($parsed['code']) || !preg_match($basicString, $parsed['code']),
      '"paypal_shared_id" must be well-formed.' => empty($parsed['paypal_shared_id']) || !preg_match($basicString, $parsed['paypal_shared_id']),
      '"state.code_verifier" must be well-formed.' => empty($state['code_verifier']) || !preg_match($basicString, $state['code_verifier']),
      '"state.paypalPartnerMerchantId" must be well-formed.' => empty($state['paypalPartnerMerchantId']) || !preg_match($basicString, $state['paypalPartnerMerchantId']),
    ]));
    if (!empty($validations)) {
      throw new \CRM_Core_Exception("Invalid request:\n" . implode("\n", $validations));
    }

    // Lookup configuration
    /** @var \Civi\OAuth\OAuthTemplates $templates */
    $templates = Civi::service('oauth_client.templates');
    $provider = Civi::service('paypal_ppcp.registration')->getProvider($state['paypalProvider']);
    $template = $provider['template'];
    $client = new Client(['base_uri' => $template['url_api']]);

    // "Step 4": Use auth-code + shared-id + code-verifier to get bearer-token
    // https://developer.paypal.com/docs/multiparty/seller-onboarding/build-onboarding/#get-seller-access-token
    $response = $client->post('/v1/oauth2/token', [
      'auth' => [$parsed['paypal_shared_id'], ''],
      'form_params' => [
        'grant_type'    => 'authorization_code',
        'code'          => $parsed['code'],
        'code_verifier' => $state['code_verifier'],
      ],
    ]);
    $bearerCreds = json_decode((string) $response->getBody(), TRUE);

    // "Step 5": Use bearer-token to get REST API credentials
    // https://developer.paypal.com/docs/multiparty/seller-onboarding/build-onboarding/#get-seller-rest-api-credentials
    $response = $client->get('/v1/customer/partners/' . urlencode($state['paypalPartnerMerchantId']) . '/merchant-integrations/credentials/', [
      'headers' => [
        'Authorization' => 'Bearer ' . $bearerCreds['access_token'],
        'Content-Type' => 'application/json',
      ],
    ]);
    $restCreds = json_decode((string) $response->getBody(), TRUE);

    // Store the REST API creds
    $values = $templates->evaluate($template, ['rest_creds' => $restCreds]);
    Civi\Api4\PaymentProcessor::update()
      ->addWhere('id', '=', $state['paypalPaymentProcessorId'])
      ->setValues($values)
      ->execute();

    \CRM_Core_Session::setStatus('', ts('Received API credentials'), 'info');

    // All done.
    CRM_Utils_System::sendJSONResponse([
      'status' => 'ok',
    ]);
  }

}
