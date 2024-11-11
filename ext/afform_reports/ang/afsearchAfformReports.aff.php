<?php
use CRM_AfformReports_ExtensionUtil as E;

return [
  'type' => 'search',
  'title' => E::ts('Afform Reports'),
  'icon' => 'fa-list-alt',
  'server_route' => 'civicrm/afform/reports',
  'search_displays' => [
    'Afform_Reports.Afform_Reports_Table',
  ],
];
