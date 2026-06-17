<?php

namespace Civi\Standalone;

use Civi\Core\Event\GenericHookEvent;

/**
 * Standalone's custom error handler (was previously in index.php)
 */
class ErrorHandler {

  protected static bool $handlingError = FALSE;

  protected static array $messages = [];

  public static function setHandler(int $errorLevel = E_ALL): void {
    set_error_handler([self::class, 'handleError'], $errorLevel);
  }

  public static function handleError(
    int $errno,
    string $errstr,
    ?string $errfile,
    ?int $errline
  ) {

    self::$messages[] = [
      'errno' => $errno,
      'errstr' => $errstr,
      'errfile' => $errfile,
      'errline' => $errline,
      // always compute the backtrace
      // we can decide later whether to render it when we
      // are sure the settings are loaded
      'trace' => self::getBacktrace(),
    ];
  }

  /**
   * Get current backtrace
   * TODO: we have lots of other helpers for this, can we use one of those?
   */
  protected static function getBacktrace(): string {
    $traceLines = array_map(function ($item) {
      $_ = '';
      if (!empty($item['function'])) {
        if (!empty($item['class']) && !empty($item['type'])) {
          $_ = htmlspecialchars("$item[class]$item[type]$item[function]() ");
        }
        else {
          $_ = htmlspecialchars("$item[function]() ");
        }
      }
      $_ .= "<code>" . htmlspecialchars($item['file'] ?? '(internal)') . '</code> line ' . ($item['line'] ?? '(none)');
      return $_;
    }, array_slice(debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS), 1));

    return '<pre class=backtrace>' . implode("\n", $traceLines) . '</pre>';
  }

  public static function onAlterContent(GenericHookEvent $e): void {
    if (!self::$messages) {
      return;
    }

    // only print in debug mode
    $config = \CRM_Core_Config::singleton();
    if (!$config->debug) {
      return;
    }

    $escapedMessages = array_map(fn ($message) => [
      'errno' => \htmlspecialchars($message['errno']),
      'errstr' => \htmlspecialchars($message['errstr']),
      'errfile' => \htmlspecialchars($message['errfile']),
      'errline' => $message['errline'],
      // suppress traces if not enabled - note should already
      // contain escaped html
      'trace' => $config->backtrace ? $message['trace'] : '',
    ], self::$messages);

    $renderedMessages = implode("\n", array_map(fn ($message) => <<<HTML
      <li style="white-space:pre-wrap">
        {$message['errstr']} [{$message['errno']}]
        <code>{$message['errfile']}</code> line {$message['errline']}
        {$message['trace']}
      </li>
    HTML, $escapedMessages));

    $messageContainer = <<<HTML
      <div class="status error standalone-errors">
        <ul>{$renderedMessages}</ul>
      </div>
      <script type="text/javascript">
        (function() {
          const errorMessages = document.querySelector('div.standalone-errors');
          const breadcrumb = document.querySelector('nav.breadcrumb');

          if (breadcrumb) {
            breadcrumb.after(errorMessages);
          }
          else {
            document.querySelector('#crm-container').prepend(errorMessages);
          }
        })();
      </script>
    HTML;

    $e->content = str_replace('<!-- STANDALONE ERRORS -->', $messageContainer, $e->content);
  }

}
