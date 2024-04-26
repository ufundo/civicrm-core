<?php

namespace Civi\Standalone\PathLoader;

class Utils
{
  public static function deriveWebRoot(): string
  {
    return (self::schemeFromEnvOrServerVars() . '://' . self::hostFromEnvOrServerVars());
  }

  protected static function hostFromEnvOrServerVars(): string
  {
    return getenv('CIVICRM_SITE_HOST') ?: $_SERVER['HTTP_HOST'];
  }

  /**
   * @todo this might fail behind a proxy?
   */
  protected static function schemeFromEnvOrServerVars(): string
  {
    $schemeFromEnvVar = getenv('CIVICRM_SITE_SCHEME');

    if ($schemeFromEnvVar) {
      return $schemeFromEnvVar;
    }

    if ((!empty($_SERVER['REQUEST_SCHEME']) && $_SERVER['REQUEST_SCHEME'] == 'https') ||
      (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ||
      (!empty($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == '443')) {
      return 'https';
    }

    return 'http';
  }
}