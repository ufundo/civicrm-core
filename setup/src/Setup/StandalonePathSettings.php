<?php

namespace Civi\Setup;

/**
 * Opinionated helper for configuring default paths and urls in standalone (could be generally usable?)
 *
 *
 * note: paths generally get set as $civicrm_paths[k]['url'|'path'] = v
 * though there are exceptions (private directory does not have a url, some paths are specified directly in old config)
 *
 * default structure uses project root = web root (e.g. /var/www/html)
 * and then:
 * ./private (private files)
 * ./private/civicrm.settings.php (civicrm site settings file)
 * ./private/cached_templates (template compilation directory)
 * ./private/log
 * ./public (public files)
 *
 * @see https://lab.civicrm.org/dev/core/-/issues/5073
 */

 class StandalonePathSettings {

  public const DEFAULT_PATHS_WITHOUT_URLS = [
    // default from PHP SERVER VARS
    'project_root' => null,

    // private
    'private'      => '[project_root]/private',
    // private subdirs
    'settings'     => '[private]/civicrm.settings.php',
    'compile'      => '[private]/cached_templates',
    'private_uploads'       => '[private]/uploads',
    'tmp'          => '[private]/tmp',
    'log'          => '[private]/log',
    'l10n'         => '[private]/translations',
  ];

  public const DEFAULT_PATHS_WITH_URLS = [
    // default from PHP SERVER VARS
    'web_root'    => null,

    // public (note: corresponds to civicrm.files)
    'public'      => '[web_root]/public',
    // public subdirs
    'public_uploads'     => '[public]/uploads',
    // extensions
    'extensions'  => '[web_root]/extensions',

    // core
    'core'        => '[web_root]/core',
    // core subdirs
    'bower'       => '[core]/bower_components',
    'vendor'      => '[core]/vendor',
    'packages'    => '[core]/packages',
    'setup'       => '[core]/setup',
  ];

  protected array $defaultPathsWithoutUrls;
  protected array $defaultPathsWithUrls;

  protected array $configuredPaths = [];


  public function __construct(array $defaultPathsWithoutUrls = [], array $defaultPathsWithUrls = [])
  {
    $this->defaultPathsWithoutUrls = $defaultPathsWithoutUrls ?: self::DEFAULT_PATHS_WITHOUT_URLS;
    $this->defaultPathsWithUrls = $defaultPathsWithUrls ?: self::DEFAULT_PATHS_WITH_URLS;
  }

  public function setKeys(array $pathKeysToSetInOrder, array $urlKeysToSetInOrder)
  {
    foreach ($pathKeysToSetInOrder as $key) {
      $this->setPathFromEnvVarOrDefault($key);
    }

    foreach ($urlKeysToSetInOrder as $key) {
      $this->setUrlFromEnvVarOrDerive($key);
    }
  }

  public function setAllKeys()
  {
    $this->setKeys(
      array_keys($this->defaultPathsWithoutUrls + $this->defaultPathsWithUrls),
      array_keys($this->defaultPathsWithUrls)
    );
  }

  public static function defaultSetup(): StandalonePathSettings
  {
    $settings = new self();

    $settings->setAllKeys();

    return $settings;
  }

  protected function setPath(string $key, string $value)
  {
    // replace tokens before setting value
    $value = $this->replacePathTokens($value);

    // clean path string
    $value = str_replace('/', DIRECTORY_SEPARATOR, $value);
    $value = rtrim($value, DIRECTORY_SEPARATOR);

    if (!$value) {
      throw new \ValueError('Cannot set empty string path for key: ' . $key);
    }

    $this->configuredPaths[$key] = $this->configuredPaths[$key] ?? [];
    $this->configuredPaths[$key]['path'] = $value;
  }

  public function getPath(string $key): string
  {
    $path = $this->configuredPaths[$key]['path'] ?? null;
    if (!$path) {
      throw new \Exception('No path set for key: ' . $key);
    }
    return $path;
  }

  /**
   * for a path string
   * - replace [token] with path from $this->buildPaths
   *
   * @return string
   * @throws \Exception if a token that isn't already defined is used
   */
  protected function replacePathTokens(string $path): string
  {
    // replace any parts which are already set tokens
    foreach (array_keys($this->configuredPaths) as $key) {
      $token = '[' . $key . ']';
      $tokenValue = $this->getPath($key);

      $path = str_replace($token, $tokenValue, $path);
    }

    // check for outstanding tokens
    if (preg_match('/\[.+\]/', $path)) {
      throw new \Exception("Couldn't replace all tokens in path: " . $path);
    }

    return $path;
  }

  protected function pathFromEnvVar(string $key): ?string
  {
    $path = getenv('CIVICRM_PATH_' . strtoupper($key));

    return $path ?: null;
  }

  protected function pathFromDefault($key): ?string
  {
    if ($key === 'project_root') {
      $path = $_SERVER['SERVER_ROOT'] ?? $_SERVER['DOCUMENT_ROOT'] ?? null;
    }
    else if ($key === 'web_root') {
      $path = $_SERVER['DOCUMENT_ROOT'] ?? $this->getPath('project_root');
    }
    else {
      $path = $this->defaultPathsWithoutUrls[$key] ?? $this->defaultPathsWithUrls[$key] ?? null;
    }

    return $path ?: null;
  }

  protected function setPathFromEnvVarOrDefault(string $key)
  {
    $path = $this->pathFromEnvVar($key) ?: $this->pathFromDefault($key);

    if (!$path) {
      $envVarName = 'CIVICRM_PATH_' . strtoupper($key);
      throw new \Exception("Couldn't determine path for '{$key}'. You can set explicitly using environment variable {$envVarName}");
    }

    $this->setPath($key, $path);
  }


  protected function urlFromEnvVar(string $key): ?string
  {
    return getenv('CIVICRM_URL_' . strtoupper($key)) ?: null;
  }


  protected function setUrl(string $key, string $value)
  {
    $value = rtrim($value, '/');

    if (!$value) {
      throw new \ValueError('Cannot set empty string url for key: ' . $key);
    }
    $this->configuredPaths[$key] = $this->configuredPaths[$key] ?? [];
    $this->configuredPaths[$key]['url'] = $value;
  }

  public function getUrl(string $key): string
  {
    $url = $this->configuredPaths[$key]['url'] ?? null;
    if (!$url) {
      throw new \Exception('No url set for key: ' . $key);
    }
    return $url;
  }


  protected function deriveWebRoot(): string
  {
    return ($this->schemeFromEnvOrServerVars() . '://' . $this->hostFromEnvOrServerVars());
  }

  protected function hostFromEnvOrServerVars(): string
  {
    return getenv('CIVICRM_SITE_HOST') ?: $_SERVER['HTTP_HOST'];
  }

  /**
   * @todo this might fail behind a proxy?
   */
  protected function schemeFromEnvOrServerVars(): string
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

  /**
   * @throws \Exception if the target path isnt below the web root
   */
  protected function deriveUrlFromWebRoot(string $targetPathKey): string
  {
    $webRootPath = $this->getPath('web_root');
    $targetPath = $this->getPath($targetPathKey);

    // check target path is inside the webroot
    // (it might be valid to use a directory outside the webroot if doing something clever, but you'll need to set the URL directly)
    if (strpos($targetPath, $webRootPath) !== 0) {
      $urlEnvVar = 'CIVICRM_URL_' . strtoupper($targetPathKey);
      throw new \Exception("Couldn't determine relative path from web_root ('{$webRootPath}') to {$targetPathKey} ('{$targetPath}') in order to derive the URL - please ensure one path under the other or set {$urlEnvVar} directly");
    }

    $relativePath = substr($targetPath, strlen($webRootPath));

    return $this->getUrl('web_root') . str_replace(DIRECTORY_SEPARATOR, '/', $relativePath);
  }

  protected function setUrlFromEnvVarOrDerive(string $key)
  {
    $url = $this->urlFromEnvVar($key);

    if (!$url) {
      $url = ($key === 'web_root') ? $this->deriveWebRoot() : $this->deriveUrlFromWebRoot($key);
    }

    $this->setUrl($key, $url);
  }


  public function getCorePathConfig()
  {
    $keyMap = [
      'cms.root' => 'web_root',
      'civicrm.private' => 'private',
      'civicrm.files' => 'public_uploads',
      'civicrm.l10n' => 'l10n',
      'civicrm.tmp' => 'tmp',
      'civicrm.custom' => 'private_uploads',
      'civicrm.log' => 'log',
    ];

    $mapped = [];

    foreach ($keyMap as $theirKey => $ourKey) {
      $mapped[$theirKey] = $this->configuredPaths[$ourKey];
    }

    return $mapped;
  }

  public function getDomainLevelPathSettings()
  {
    $userFrameworkResourceUrl = (\Composer\InstalledVersions::isInstalled('civicrm/civicrm-asset-plugin'))
      ? $this->getUrl('public') . '/assets/civicrm/core' : $this->getUrl('core');

    return [
      'extensionsDir' => $this->getPath('extensions'),
      'extensionsURL' => $this->getUrl('extensions'),
      'imageUploadDir' => $this->getPath('public_uploads'),
      'imageUploadURL' => $this->getUrl('public_uploads'),
      'uploadDir' => $this->getPath('tmp'),
      'customFileUploadDir' => $this->getPath('private_uploads'),
      'userFrameworkResourceURL' => $userFrameworkResourceUrl,
    ];
  }

  /**
   * this is mainly to ensure "old style" settings are set with their direct properties
   * @todo overrides any existing values - is this ok?
   */
  public function setPathsOnInstallerModel(&$model)
  {
    $model->paths = $this->getCorePathConfig();

    $model->mandatorySettings = $this->getDomainLevelPathSettings();

    // set old style settings on the model as well
    $model->cmsBaseUrl = $this->getUrl('web_root');
    $model->templateCompilePath = $this->getPath('compile');
    $model->customFileUploadDir = $this->getPath('private_uploads');
    $model->uploadDir = $this->getPath('tmp');
    $model->settingsPath = $this->getPath('settings');
    $model->imageUploadDir = $this->getPath('public_uploads');
    $model->extensionsDir = $this->getPath('extensions');

    $model->srcPath = $this->getPath('core');
    $model->setupPath = $this->getPath('setup');
  }

 }