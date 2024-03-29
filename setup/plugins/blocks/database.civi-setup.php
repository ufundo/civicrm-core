<?php
if (!defined('CIVI_SETUP')) {
  exit("Installation plugins must only be loaded by the installer.\n");
}

\Civi\Setup::dispatcher()
  ->addListener('civi.setupui.boot', function (\Civi\Setup\UI\Event\UIBootEvent $e) {
    \Civi\Setup::log()->info(sprintf('[%s] Register blocks', basename(__FILE__)));

    /**
     * @var \Civi\Setup\UI\SetupController $ctrl
     */
    $ctrl = $e->getCtrl();

    $ctrl->blocks['database'] = [
      'is_active' => ($e->getModel()->cms === 'Standalone'),
      'file' => __DIR__ . DIRECTORY_SEPARATOR . 'database.tpl.php',
      'class' => '',
      'weight' => 15,
    ];
    if (empty($ctrl->blocks['database']['is_active'])) {
      return;
    }

    $dbHost  = getenv('CIVICRM_DB_HOST') ?: '127.0.0.1';
    $dbPort  = getenv('CIVICRM_DB_PORT') ?: '3306';
    $webDefault = [
      'server' => $dbHost . ':' . $dbPort,
      'username' => getenv('CIVICRM_DB_USER') ?: '',
      'database' => getenv('CIVICRM_DB_NAME') ?: '',
      // should we expose the env var through the web installer ui? 'password' => getenv('CIVICRM_DB_PASS') ?: '',
      'password' => '',
    ];

    if ($e->getMethod() === 'GET') {
      $e->getModel()->db = $webDefault;
    }
    elseif ($e->getMethod() === 'POST') {
      $db = $e->getField('db', $webDefault);

      foreach (['server', 'database', 'username', 'password'] as $field) {
        $e->getModel()->db[$field] = $db[$field];
      }
    }

  }, \Civi\Setup::PRIORITY_PREPARE);
