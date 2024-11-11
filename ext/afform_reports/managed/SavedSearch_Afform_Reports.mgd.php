<?php
use CRM_AfformReports_ExtensionUtil as E;

return [
  [
    'name' => 'SavedSearch_Afform_Reports',
    'entity' => 'SavedSearch',
    'cleanup' => 'unused',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Afform_Reports',
        'label' => E::ts('Afform Reports'),
        'api_entity' => 'Afform',
        'api_params' => [
          'version' => 4,
          'select' => [
            'name',
            'title',
            'description',
            'placement:label',
            'server_route',
          ],
          'orderBy' => [],
          'where' => [
            ['server_route', 'IS NOT EMPTY'],
            ['type:name', '=', 'search'],
            [
              'placements',
              '!=',
              'afsearchAfformReports',
            ],
          ],
        ],
      ],
      'match' => ['name'],
    ],
  ],
  [
    'name' => 'SavedSearch_Afform_Reports_SearchDisplay_Afform_Reports_Table',
    'entity' => 'SearchDisplay',
    'cleanup' => 'unused',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Afform_Reports_Table',
        'label' => E::ts('Afform Reports Table'),
        'saved_search_id.name' => 'Afform_Reports',
        'type' => 'table',
        'settings' => [
          'description' => E::ts(NULL),
          'sort' => [],
          'limit' => 50,
          'pager' => [],
          'placeholder' => 5,
          'columns' => [
            [
              'type' => 'field',
              'key' => 'title',
              'dataType' => 'String',
              'label' => E::ts('Title'),
              'sortable' => TRUE,
            ],
            [
              'type' => 'field',
              'key' => 'description',
              'dataType' => 'String',
              'label' => E::ts('Description'),
              'sortable' => TRUE,
            ],
            [
              'size' => 'btn-xs',
              'links' => [
                [
                  'path' => '[server_route]',
                  'icon' => 'fa-external-link',
                  'text' => E::ts('Open'),
                  'style' => 'info',
                  'condition' => [],
                  'task' => '',
                  'entity' => '',
                  'action' => '',
                  'join' => '',
                  'target' => '',
                ],
                [
                  'path' => 'civicrm/admin/afform#/edit/[name]',
                  'icon' => 'fa-pen-to-square',
                  'text' => E::ts('Edit'),
                  'style' => 'warning',
                  'condition' => [],
                  'task' => '',
                  'entity' => '',
                  'action' => '',
                  'join' => '',
                  'target' => '',
                ],
              ],
              'type' => 'buttons',
              'alignment' => 'text-right',
            ],
          ],
          'actions' => FALSE,
          'classes' => ['table', 'table-striped'],
          'actions_display_mode' => 'menu',
        ],
      ],
      'match' => [
        'saved_search_id',
        'name',
      ],
    ],
  ],
];
