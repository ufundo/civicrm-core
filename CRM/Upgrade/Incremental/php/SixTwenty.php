<?php
/*
 +--------------------------------------------------------------------+
 | Copyright CiviCRM LLC. All rights reserved.                        |
 |                                                                    |
 | This work is published under the GNU AGPLv3 license with some      |
 | permitted exceptions and without any warranty. For full license    |
 | and copyright information, see https://civicrm.org/licensing       |
 +--------------------------------------------------------------------+
 */

/**
 * Upgrade logic for the 6.20.x series.
 *
 * Each minor version in the series is handled by either a `6.20.x.mysql.tpl` file,
 * or a function in this class named `upgrade_6_20_x`.
 * If only a .tpl file exists for a version, it will be run automatically.
 * If the function exists, it must explicitly add the 'runSql' task if there is a corresponding .mysql.tpl.
 *
 * This class may also implement `setPreUpgradeMessage()` and `setPostUpgradeMessage()` functions.
 */
class CRM_Upgrade_Incremental_php_SixTwenty extends CRM_Upgrade_Incremental_Base {

  /**
   * Upgrade step; adds tasks including 'runSql'.
   *
   * @param string $rev
   *   The version number matching this function name
   */
  public function upgrade_6_20_alpha1($rev): void {
    $this->addTask(ts('Upgrade DB to %1: SQL', [1 => $rev]), 'runSql', $rev);

    $this->addTask('Add ContributionPage.thankyou_mode', 'alterSchemaField', 'ContributionPage', 'thankyou_mode', [
      'title' => ts('Thank-you Mode'),
      'sql_type' => 'varchar(255)',
      'input_type' => 'Radio',
      'description' => ts('Choose between a thank you page or redirect'),
      'default' => 'page',
    ], 'AFTER `goal_amount`');

    $this->addTask('Add ContributionPage.thankyou_redirect_url', 'alterSchemaField', 'ContributionPage', 'thankyou_redirect_url', [
      'title' => ts('Thank-you Redirect URL'),
      'sql_type' => 'text',
      'input_type' => 'Url',
      'description' => ts('Set a URL to redirect users to after completion, instead of generating a thank you page'),
    ], 'AFTER `thankyou_footer`');

  }

}
