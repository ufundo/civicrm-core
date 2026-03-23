<?php

return [
  [
    'name' => 'SavedSearch_Contact_Summary_ActivityContacts',
    'entity' => 'SavedSearch',
    'cleanup' => 'unused',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Contact_Summary_ActivityContacts',
        'label' => ts('Contact Summary Activities Tab - Activity Contacts'),
        'api_entity' => 'Contact',
        'api_params' => [
          'version' => 4,
          'select' => [
            'sort_name',
            'display_name',
            'Contact_ActivityContact_Activity_01.record_type_id:name',
            'Contact_ActivityContact_Activity_01.id',
          ],
          'orderBy' => [],
          'where' => [],
          'join' => [
            [
              'Activity AS Contact_ActivityContact_Activity_01',
              'INNER',
              'ActivityContact',
              [
                'id',
                '=',
                'Contact_ActivityContact_Activity_01.contact_id',
              ],
            ],
          ],
          'having' => [],
        ],
      ],
      'match' => [
        'name',
      ],
    ],
  ],
  [
    'name' => 'SavedSearch_Contact_Summary_ActivityContacts_SearchDisplay_Contact_Summary_ActivityContacts',
    'entity' => 'SearchDisplay',
    'cleanup' => 'unused',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Contact_Summary_ActivityContacts',
        'label' => ts('Contact Summary Activities Tab - Activity Contacts'),
        'saved_search_id.name' => 'Contact_Summary_ActivityContacts',
        'type' => 'list',
        'settings' => [
          'description' => NULL,
          'sort' => [
            [
              'sort_name',
              'DESC',
            ],
          ],
          'limit' => 3,
          'pager' => [
            'hide_single' => TRUE,
            //'show_count' => TRUE,
            'expose_limit' => TRUE,
          ],
          'placeholder' => 1,
          'columns' => [
            [
              'type' => 'field',
              'key' => 'display_name',
              //'label' => ts(''),
             // 'label' => FALSE,
              'sortable' => TRUE,
            ],
          ],
          'classes' => [
            'table',
            'table-striped',
          ],
          'toolbar' => [],
        ],
      ],
      'match' => [
        'name',
        'saved_search_id',
      ],
    ],
  ],
];
