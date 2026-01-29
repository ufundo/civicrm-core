<?php

namespace Civi\Core;

use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Psr7\ServerRequest;

/**
 * @service civi.elements
 */
class Elements {

  public static function get(ServerRequest $request) {
    $query = $request->getQueryParams();
    $element = explode('/', $query['q'])[2];
    $locale = $query['locale'] ?? NULL;

    // TODO cache control?
    $headers = [];

// load css/js alongside the template?
// inserting <script> tags into the DOM doesn't work so well
// $css = \file_get_contents(\Civi::paths()->getPath("[civicrm.root]/elements/{$element}.css"));
// $js = \file_get_contents(\Civi::paths()->getPath("[civicrm.root]/elements/{$element}.js"));
// $html = self::renderTemplate($element, $locale);

// $body = <<<HTML
//   <template id="#{$element}">$html</template>
//   <script>{$js}</script>
//   <style>{$css}</style>
// HTML;

    $body = self::renderTemplate($element, $locale);

    return new Response(200, $headers, $body);

  }

  protected static function renderTemplate(string $element, ?string $locale = NULL): string {
    if ($locale) {
      try {
        \CRM_Core_I18n::singleton()->setLocale($locale);
      }
      catch (\Throwable $e) {
        // just use default
      }
    }
    try {
      return \CRM_Core_Smarty::singleton()->fetch("elements/{$element}.tpl");
    }
    catch (\Throwable $e) {
      return '';
    }
  }

}
