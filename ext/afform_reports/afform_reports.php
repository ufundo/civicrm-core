<?php

require_once 'afform_reports.civix.php';

use CRM_AfformReports_ExtensionUtil as E;

/**
 * Implements hook_civicrm_config().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_config/
 */
function afform_reports_civicrm_config(&$config): void {
  _afform_reports_civix_civicrm_config($config);
}

/**
 * Implements hook_civicrm_install().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_install
 */
function afform_reports_civicrm_install(): void {
  _afform_reports_civix_civicrm_install();
}

/**
 * Implements hook_civicrm_enable().
 *
 * @link https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_enable
 */
function afform_reports_civicrm_enable(): void {
  _afform_reports_civix_civicrm_enable();
}
