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

use CRM_AfformAdmin_ExtensionUtil as E;

return [
  'afform_admin_hide_inline_edit_menus' => [
    'group_name' => 'Afform Admin',
    'group' => 'afform_admin',
    'name' => 'afform_admin_hide_inline_edit_menus',
    'type' => 'Boolean',
    'html_type' => 'checkbox',
    'default' => NULL,
    'title' => ts('Hide Inline Edit Menus'),
    'is_domain' => 1,
    'is_contact' => 0,
    'description' => ts('By default adequately permissioned users will see inline edit menus in the corner of Afforms. Set this setting to disable them.'),
  ],

]
