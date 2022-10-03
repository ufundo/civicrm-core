<?php
// This file declares an Angular module which can be autoloaded
// in CiviCRM. See also:
// \https://docs.civicrm.org/dev/en/latest/hooks/hook_civicrm_angularModules/n
return [
  'js' => [
    'ang/brunswickStyleGuide.js',
    'ang/brunswickStyleGuide/*.js',
    'ang/brunswickStyleGuide/*/*.js',
  ],
  'css' => [
    'ang/brunswickStyleGuide.css',
  ],
  'partials' => [
    'ang/brunswickStyleGuide',
  ],
  'requires' => [
    'crmUi',
    'crmUtil',
    'ngRoute',
  ],
  'settings' => [],
];
