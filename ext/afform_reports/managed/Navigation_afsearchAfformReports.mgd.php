<?php
use CRM_AfformReports_ExtensionUtil as E;

return [
  [
    'name' => 'Navigation_afsearchAfformReports',
    'entity' => 'Navigation',
    'cleanup' => 'unused',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'label' => E::ts('Afform Reports'),
        'name' => 'afsearchAfformReports',
        'url' => 'civicrm/afform/reports',
        'icon' => 'crm-i fa-list-alt',
        'permission' => [
          'access CiviReport',
        ],
        'permission_operator' => 'AND',
        'parent_id.name' => 'Reports',
        'weight' => 1,
      ],
      'match' => ['name', 'domain_id'],
    ],
  ],
];
