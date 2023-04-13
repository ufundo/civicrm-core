<?php

require_once 'brunswick.civix.php';
// phpcs:disable
use CRM_Brunswick_ExtensionUtil as E;
// phpcs:enable

/**
 * Implements hook_civicrm_config().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_config/
 */
function brunswick_civicrm_config(&$config) {
  _brunswick_civix_civicrm_config($config);
}

/**
 * Implements hook_civicrm_alterBundle(). Add Bootstrap.
 */

 function brunswick_civicrm_alterBundle(CRM_Core_Resources_Bundle $bundle) {
  $theme = Civi::service('themes')->getActiveThemeKey();
  if ($theme !== 'brunswick') {
    return;
  }

  switch ($theme . ':' . $bundle->name) {
    case 'brunswick:bootstrap3':
      $bundle->clear();
      $bundle->addStyleFile('brunswick', 'css/bootstrap.css');
      $bundle->addScriptFile('brunswick', 'js/bootstrap.min.js', [
        'translate' => FALSE,
      ]);
      $bundle->addScriptFile('brunswick', 'js/noConflict.js', [
        'translate' => FALSE,
      ]);
      break;
  }
  if ($bundle->name == 'coreStyles') {
    $bundle->filter(function($snippet) {
      if ($snippet['name'] == 'civicrm:css/civicrm.css') {
        $snippet['weight'] = 290;
        return $snippet;
      }
      elseif (($snippet['name'] == 'civicrm:css/custom.css') or (strpos($snippet['name'], 'custom.css') !== false)) {
        $snippet['weight'] = 300;
        return $snippet;
      }
      return TRUE;
    });
  }
}

/**
 * Implements hook_civicrm_xmlMenu().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_xmlMenu
 */
function brunswick_civicrm_xmlMenu(&$files) {
  _brunswick_civix_civicrm_xmlMenu($files);
}

/**
 * Implements hook_civicrm_install().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_install
 */
function brunswick_civicrm_install() {
  _brunswick_civix_civicrm_install();
}

/**
 * Implements hook_civicrm_postInstall().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_postInstall
 */
function brunswick_civicrm_postInstall() {
  _brunswick_civix_civicrm_postInstall();
}

/**
 * Implements hook_civicrm_uninstall().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_uninstall
 */
function brunswick_civicrm_uninstall() {
  _brunswick_civix_civicrm_uninstall();
}

/**
 * Implements hook_civicrm_enable().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_enable
 */
function brunswick_civicrm_enable() {
  _brunswick_civix_civicrm_enable();
}

/**
 * Implements hook_civicrm_disable().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_disable
 */
function brunswick_civicrm_disable() {
  _brunswick_civix_civicrm_disable();
}

/**
 * Implements hook_civicrm_upgrade().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_upgrade
 */
function brunswick_civicrm_upgrade($op, CRM_Queue_Queue $queue = NULL) {
  return _brunswick_civix_civicrm_upgrade($op, $queue);
}

/**
 * Implements hook_civicrm_managed().
 *
 * Generate a list of entities to create/deactivate/delete when this module
 * is installed, disabled, uninstalled.
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_managed
 */
function brunswick_civicrm_managed(&$entities) {
  _brunswick_civix_civicrm_managed($entities);
}

/**
 * Implements hook_civicrm_caseTypes().
 *
 * Add CiviCase types provided by this extension.
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_caseTypes
 */
function brunswick_civicrm_caseTypes(&$caseTypes) {
  _brunswick_civix_civicrm_caseTypes($caseTypes);
}

/**
 * Implements hook_civicrm_angularModules().
 *
 * Add Angular modules provided by this extension.
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_angularModules
 */
function brunswick_civicrm_angularModules(&$angularModules) {
  // Auto-add module files from ./ang/*.ang.php
  _brunswick_civix_civicrm_angularModules($angularModules);
}

/**
 * Implements hook_civicrm_alterSettingsFolders().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_alterSettingsFolders
 */
function brunswick_civicrm_alterSettingsFolders(&$metaDataFolders = NULL) {
  _brunswick_civix_civicrm_alterSettingsFolders($metaDataFolders);
}

/**
 * Implements hook_civicrm_entityTypes().
 *
 * Declare entity types provided by this module.
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_entityTypes
 */
function brunswick_civicrm_entityTypes(&$entityTypes) {
  _brunswick_civix_civicrm_entityTypes($entityTypes);
}

/**
 * Implements hook_civicrm_themes().
 */
function brunswick_civicrm_themes(&$themes) {
  _brunswick_civix_civicrm_themes($themes);
}

// --- Functions below this ship commented out. Uncomment as required. ---

/**
 * Implements hook_civicrm_preProcess().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_preProcess
 */
//function brunswick_civicrm_preProcess($formName, &$form) {
//
//}

/**
 * Implements hook_civicrm_navigationMenu().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_navigationMenu
 */
//function brunswick_civicrm_navigationMenu(&$menu) {
//  _brunswick_civix_insert_navigation_menu($menu, 'Mailings', [
//    'label' => E::ts('New subliminal message'),
//    'name' => 'mailing_subliminal_message',
//    'url' => 'civicrm/mailing/subliminal',
//    'permission' => 'access CiviMail',
//    'operator' => 'OR',
//    'separator' => 0,
//  ]);
//  _brunswick_civix_navigationMenu($menu);
//}
