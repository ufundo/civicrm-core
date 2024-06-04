<?php

require_once 'riverlea.civix.php';
use CRM_riverlea_ExtensionUtil as E;

/**
 * Implements hook_civicrm_config().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_config/
 */
function riverlea_civicrm_config(&$config) {
  _riverlea_civix_civicrm_config($config);
}

/**
 * Supports multiple theme variations/streams.
 */

 function riverlea_civicrm_themes(&$themes) {
  $themes['minetta'] = array(
    'ext' => 'riverlea',
    'title' => 'Riverlea: Minetta (~Greenwich)',
    'prefix' => 'streams/minetta/',
  );
  $themes['walbrook'] = array(
    'ext' => 'riverlea',
    'title' => 'Riverlea: Walbrook (~Shoreditch/Island)',
    'prefix' => 'streams/walbrook/',
  );
  $themes['_riverlea_core_'] = array(
    'ext' => 'riverlea',
    'title' => 'Riverlea: base theme',
    'prefix' => 'core/',
  );
}

/**
 * Implements hook_civicrm_alterBundle(). Add Bootstrap.
 */

function riverlea_civicrm_alterBundle(CRM_Core_Resources_Bundle $bundle) {
  $theme = Civi::service('themes')->getActiveThemeKey();
  if ($theme !== 'riverlea') {
    return;
  }

  switch ($theme . ':' . $bundle->name) {
    case 'riverlea:bootstrap3':
      $bundle->clear();
      $bundle->addStyleFile('riverlea', 'css/bootstrap3.css');
      $bundle->addScriptFile('riverlea', 'js/bootstrap.min.js', [
        'translate' => FALSE,
      ]);
      $bundle->addScriptFile('riverlea', 'js/noConflict.js', [
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
 * Implements hook_civicrm_install().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_install
 */
function riverlea_civicrm_install() {
  _riverlea_civix_civicrm_install();
}

/**
 * Implements hook_civicrm_enable().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_enable
 */
function riverlea_civicrm_enable() {
  _riverlea_civix_civicrm_enable();
}
