<?php
/**
 * @file
 *
 * Determine default settings for Standalone.
 */

if (!defined('CIVI_SETUP')) {
  exit("Installation plugins must only be loaded by the installer.\n");
}



\Civi\Setup::dispatcher()
  ->addListener('civi.setup.checkAuthorized', function (\Civi\Setup\Event\CheckAuthorizedEvent $e) {
    $model = $e->getModel();
    if ($model->cms !== 'Standalone') {
      return;
    }

    \Civi\Setup::log()->info(sprintf('[%s] Handle %s', basename(__FILE__), 'checkAuthorized'));
    $e->setAuthorized(TRUE);
  });


\Civi\Setup::dispatcher()
  ->addListener('civi.setup.init', function (\Civi\Setup\Event\InitEvent $e) {
    $model = $e->getModel();
    if ($model->cms !== 'Standalone') {
      return;
    }
    \Civi\Setup::log()->info(sprintf('[%s] Handle %s', basename(__FILE__), 'init'));

    // @todo why is this set here as well as database.civi-setup.php?
    // (in order to set cms db as well?)
    $dbHost  = getenv('CIVICRM_DB_HOST') ?: '127.0.0.1';
    $dbPort  = getenv('CIVICRM_DB_PORT') ?: '3306';
    $model->db = $model->cmsDb = [
      'server' => $dbHost . ':' . $dbPort,
      'username' => getenv('CIVICRM_DB_USER') ?: '',
      'password' => getenv('CIVICRM_DB_PASS') ?: '',
      'database' => getenv('CIVICRM_DB_NAME') ?: '',
    ];

    /**
    * @todo overwrites any pre-existing settings on $model - is this ok?
    * use a helper class to get all of the paths and urls
    * sourcing fromm env vars if set or falling back to opinionated defaults
    */
    $pathSettingsHelper = \Civi\Setup\StandalonePathSettings::defaultSetup();

    $pathSettingsHelper->setPathsOnInstallerModel($model);

    // Compute default locale.
    $model->lang = $_REQUEST['lang'] ?? 'en_US';
  });
