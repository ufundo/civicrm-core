<?php

namespace Civi\Standalone;

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

 class PathLoader {

  /**
   * array of paths civicrm expects, with default pattern and whether or not they have an accompanying url
   *
   * note: loaded in order (so defaults can use keys that appear before them)
   */
  public const DEFAULT_PATH_STRUCTURE = [
    'app_root' => [
      'hasUrl' => FALSE,
      // default from PHP SERVER VARS
    ],
    'private' => [
      'hasUrl' => FALSE,
      'default' => '[project_root]/private',
    ],
    'settings' => [
      'hasUrl' => FALSE,
      'default' => '[project_root]/settings',
    ],
    'compile'      => [
      'hasUrl' => FALSE,
      'default' => '[private]/cached_templates',
    ],
    'private_uploads' => [
      'hasUrl' => FALSE,
      'default'  => '[private]/uploads',
    ],
    'tmp'          => [
      'hasUrl' => FALSE,
      'default' => '[private]/tmp',
    ],
    'log'          => [
      'hasUrl' => FALSE,
      'default' => '[private]/log',
    ],
    'translations'         => [
      'hasUrl' => FALSE,
      'default' => '[private]/translations',
    ],
    // 'default' => DETERMINED FROM PHP SERVER VARS
    'web_root'    => [
      'hasUrl' => TRUE,
    ],
    // (note: corresponds to civicrm.files)
    'public'      => [
      'hasUrl' => TRUE,
      'default' => '[web_root]/public',
    ],
    'public_uploads'     =>[
      'hasUrl' => TRUE,
      'default' =>  '[public]/uploads',
    ],
    'extensions'  => [
      'hasUrl' => TRUE,
      'default' => '[web_root]/extensions',
    ],
    'core'        => [
      'hasUrl' => TRUE,
      'default' => '[web_root]/core',
    ],
    'bower'       => [
      'hasUrl' => TRUE,
      'default' => '[core]/bower_components',
    ],
    'vendor'      => [
      'hasUrl' => TRUE,
      'default' => '[core]/vendor',
    ],
    'packages'    => [
      'hasUrl' => TRUE,
      'default' => '[core]/packages',
    ],
    'setup'       => [
      'hasUrl' => TRUE,
      'default' => '[core]/setup',
    ],
  ];

  protected array $paths;
  protected array $urls;

  protected static ?StandalonePathLoader $singleton = null;

  /**
   * @param array $pathStructureOverrides
   */
  public function __construct(array $pathStructureOverrides = [])
  {
    // merge in overrides, remove any keys that have been nulled)
    $pathStructure = array_filter(array_merge(self::DEFAULT_PATH_STRUCTURE, $pathStructureOverrides));

    foreach ($pathStructure as $key => $pathConfig) {
      $this->setPathFromEnvVarOrDefault($key);

      if ($pathConfig['hasUrl']) {
        $this->setUrlFromEnvVarOrDerive($key);
      }
    }
  }

  public static function singleton(): StandalonePathLoader
  {
    if (!self::$singleton) {
      self::$singleton = new self();
    }
    return self::$singleton;
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

    $this->paths[$key] = $value;
  }

  public function getPath(string $key): string
  {
    $path = $this->paths[$key] ?? null;
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
    foreach ($this->paths as $key => $value) {
      $token = '[' . $key . ']';
      $path = str_replace($token, $value, $path);
    }

    // check for outstanding tokens
    if (preg_match('/\[.+\]/', $path)) {
      throw new \Exception("Unreplaced tokens in path: " . $path);
    }

    return $path;
  }

  public function pathEnvVarName(string $key): string
  {
    return 'CIVICRM_PATH_' . strtoupper($key);
  }

  protected function pathEnvVarValue(string $key): ?string
  {
    return getenv($this->pathEnvVarName($key)) ?: null;
  }

  protected function pathDefaultValue($key): ?string
  {
    if ($key === 'project_root') {
      $path = $_SERVER['DOCUMENT_ROOT'] ?? null;
    }
    else if ($key === 'web_root') {
      $path = $_SERVER['DOCUMENT_ROOT'] ?? $this->getPath('project_root');
    }
    else {
      $path = $this->pathStructure[$key]['default'] ?? null;
    }

    return $path ?: null;
  }

  protected function setPathFromEnvVarOrDefault(string $key)
  {
    $path = $this->pathEnvVarValue($key) ?: $this->pathDefaultValue($key);

    if (!$path) {
      throw new \Exception("Couldn't determine path for '{$key}'. You can set explicitly using environment variable {$this->pathEnvVarName($key)}");
    }

    $this->setPath($key, $path);
  }


  protected function setUrl(string $key, string $value)
  {
    $value = rtrim($value, '/');

    if (!$value) {
      throw new \ValueError('Cannot set empty string url for key: ' . $key);
    }
    $this->urls[$key] = $value;
  }

  public function getUrl(string $key): string
  {
    $url = $this->urls[$key] ?? null;
    if (!$url) {
      throw new \Exception('No url set for key: ' . $key);
    }
    return $url;
  }

  public function urlEnvVarName(string $key): string
  {
    return 'CIVICRM_URL_' . strtoupper($key);
  }

  protected function urlEnvVarValue(string $key): ?string
  {
    return getenv($this->urlEnvVarName($key)) ?: null;
  }

  protected function setUrlFromEnvVarOrDerive(string $key)
  {
    $url = $this->urlFromEnvVar($key) ?: $this->attemptToDeriveUrl($key);

    if (!$url) {
      throw new \Exception(
        "Couldn't determine url for '{$key}'.
         Either set explicitly using environment variable {$this->urlEnvVarName($key)} or ensure the corresponding path is inside the webroot.
         (Current path is {$this->getPath($key)}, web root path is {$this->getPath('web_root')}"
      );
    }

    $this->setUrl($key, $url);
  }

  protected function attemptToDeriveUrl($key)
  {
    if ($key === 'web_root') {
      return StandalonePathLoader\Utils::deriveWebRoot();
    }

    return $this->attemptToDeriveUrlFromPath($this->getPath($key));
  }

  /**
   * Derives the url for a target path based on its relative directory to
   * the web root
   *
   * @return ?string the url if derived, or null if not possible
   */
  protected function attemptToDeriveUrlFromPath(string $targetPath): ?string
  {
    $webRootPath = $this->getPath('web_root');

    // check target path is inside the webroot
    // (it might be valid to use a directory outside the webroot if you're doing something clever,
    // but you'll need to set the URL directly)
    if (strpos($targetPath, $webRootPath) !== 0) {
      return null;
    }

    $relativePath = substr($targetPath, strlen($webRootPath));

    return $this->getUrl('web_root') . str_replace(DIRECTORY_SEPARATOR, '/', $relativePath);
  }

  protected function getPathAndUrlIfSet(string $key): array
  {
    return array_filter([
      'path' => $this->getPath($key),
      'url' => $this->urls[$key] ?? null,
    ]);
  }



  public function getUserFrameworkResourceUrl(): string
  {
    return (\Composer\InstalledVersions::isInstalled('civicrm/civicrm-asset-plugin'))
      ? $this->getUrl('public') . '/assets/civicrm/core' : $this->getUrl('core');
  }

  public function getCorePathConfig(): array
  {
    $keyMap = [
      'cms.root' => 'web_root',
      'civicrm.private' => 'private',
      'civicrm.files' => 'public_uploads',
      'civicrm.l10n' => 'translations',
      'civicrm.tmp' => 'tmp',
      'civicrm.custom' => 'private_uploads',
      'civicrm.log' => 'log',
    ];

    $mapped = [];

    foreach ($keyMap as $theirKey => $ourKey) {
      $mapped[$theirKey] = $this->getPathAndUrlIfSet($ourKey);
    }

    return $mapped;
  }

  public function getDomainLevelPathSettings(): array
  {
    return array_filter([
      'extensionsDir' => $this->getPath('extensions'),
      'extensionsURL' => $this->getUrl('extensions'),
      'imageUploadDir' => $this->getPath('public_uploads'),
      'imageUploadURL' => $this->getUrl('public_uploads'),
      'uploadDir' => $this->getPath('tmp'),
      'customFileUploadDir' => $this->getPath('private_uploads'),
      'userFrameworkResourceURL' => $this->getUserFrameworkResourceUrl(),
    ]);
  }

  /**
   * this is mainly just an adaptor to ensure "old style" settings are set with their direct properties
   * @todo overrides any existing values - is this ok?
   */
  public function setRequiredPathsForInstaller(&$model)
  {
    $model->paths = [
      'civicrm.files' => $this->getPathAndUrlIfSet('public_uploads'),
    ];
    $model->mandatorySettings = [
      'userFrameworkResourceURL' => $this->getUserFrameworkResourceUrl(),
    ];

    // set old style settings on the model as well
    $model->cmsBaseUrl = $this->getUrl('web_root');
    $model->templateCompilePath = $this->getPath('compile');
    $model->customFileUploadDir = $this->getPath('private_uploads');
    $model->uploadDir = $this->getPath('tmp');
    $model->imageUploadDir = $this->getPath('public_uploads');
    $model->extensionsDir = $this->getPath('extensions');

    $model->srcPath = $this->getPath('core');
    $model->setupPath = $this->getPath('setup');

    // for standalone, the installer will just write a minimal env settings file in the settings directory
    // which will load before the other settings files to provide env variables
    // for other cmses we will leave alone for now.
    if ($model->cms === 'Standalone') {
      $model->settingsPath = $this->getPath('settings') . DIRECTORY_SEPARATOR . '_installtime.env.php';
    }
  }

  public function getSettingsFiles(): array
  {
    $settingsPath = $this->getPath('settings');

    if (is_dir($settingsPath)) {
      return array_merge(
        // allow .env.php files have priority
        glob($settingsPath . DIRECTORY_SEPARATOR . '*.env.php'),
        glob($settingsPath . DIRECTORY_SEPARATOR . '*.settings.php'),
      );
    }
    elseif (file_exists($settingsPath)) {
      return [$settingsPath];
    }
    else {
      return [];
    }
  }

  public function setPhpIncludePaths()
  {
    $updatedIncludePath = implode(PATH_SEPARATOR, [
      // '.' // @todo why was this included from civicrm.settings.php? what would it refer to?
      $this->getPath('core'),
      $this->getPath('packages'),
      get_include_path(),
    ]);

    if (set_include_path($updatedIncludePath) === false) {
      echo "Could not set the include path<p>";
      exit();
    }
  }
 }
