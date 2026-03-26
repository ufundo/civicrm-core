<?php

// Conditionally exclude CiviCase activities
$excludeCaseActivities = (CRM_Core_Component::isEnabled('CiviCase') && !\Civi::settings()->get('civicaseShowCaseActivities'));
return [
  [
    'name' => 'SavedSearch_Contact_Summary_Activities',
    'entity' => 'SavedSearch',
    'cleanup' => 'unused',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Contact_Summary_Activities',
        'label' => ts('Contact Summary Activities'),
        'api_entity' => 'Activity',
        'api_params' => [
          'version' => 4,
          'select' => [
            'activity_type_id:label',
            'subject',
            'activity_date_time',
            'status_id:label',
          ],
          'orderBy' => [],
          'where' => $excludeCaseActivities ? [['case_id', 'IS EMPTY']] : [],
          'groupBy' => [
            'id',
          ],
          'join' => [],
          'having' => [],
        ],
      ],
      'match' => [
        'name',
      ],
    ],
  ],
  [
    'name' => 'SavedSearch_Contact_Summary_Activities_SearchDisplay_Contact_Summary_Activities_Tab',
    'entity' => 'SearchDisplay',
    'cleanup' => 'unused',
    'update' => 'unmodified',
    'params' => [
      'version' => 4,
      'values' => [
        'name' => 'Contact_Summary_Activities_Tab',
        'label' => ts('Contact Summary Activities Tab'),
        'saved_search_id.name' => 'Contact_Summary_Activities',
        'type' => 'table',
        'settings' => [
          'description' => NULL,
          'sort' => [
            [
              'activity_date_time',
              'DESC',
            ],
          ],
          'limit' => 20,
          'pager' => [
            'hide_single' => TRUE,
            'show_count' => TRUE,
            'expose_limit' => TRUE,
          ],
          'placeholder' => 5,
          'columns' => [
            [
              'type' => 'field',
              'key' => 'activity_type_id:label',
              'label' => ts('Type'),
              'sortable' => TRUE,
              'icons' => [
                [
                  'field' => 'activity_type_id:icon',
                  'side' => 'left',
                ],
              ],
            ],
            [
              'type' => 'field',
              'key' => 'subject',
              'label' => ts('Subject'),
              'sortable' => TRUE,
              'editable' => TRUE,
            ],
            [
              'type' => 'field',
              'key' => 'activity_date_time',
              'label' => ts('Date'),
              'sortable' => TRUE,
            ],
            [
              'type' => 'field',
              'key' => 'status_id:label',
              'label' => ts('Status'),
              'sortable' => TRUE,
              'editable' => TRUE,
            ],
            [
              'type' => 'include',
              'label' => ts('Added By'),
              'path' => '~/crmAdminUi/activityContactsSource.html',
              'alignment' => 'text-left',
            ],
            [
              'type' => 'include',
              'label' => ts('With'),
              'path' => '~/crmAdminUi/activityContactsTargets.html',
              'alignment' => 'text-left',
            ],
            [
              'type' => 'include',
              'label' => ts('Assigned To'),
              'path' => '~/crmAdminUi/activityContactsAssignees.html',
              'alignment' => 'text-left',
            ],
            [
              'text' => '',
              'style' => 'default',
              'size' => 'btn-xs',
              'icon' => 'fa-bars',
              'links' => [
                [
                  'entity' => 'Activity',
                  'action' => 'view',
                  'target' => 'crm-popup',
                  'icon' => 'fa-external-link',
                  'text' => ts('View Activity'),
                  'style' => 'default',
                ],
                [
                  'entity' => 'Activity',
                  'action' => 'update',
                  'target' => 'crm-popup',
                  'icon' => 'fa-pencil',
                  'text' => ts('Update Activity'),
                  'style' => 'default',
                ],
                [
                  'entity' => 'Activity',
                  'action' => 'delete',
                  'target' => 'crm-popup',
                  'icon' => 'fa-trash',
                  'text' => ts('Delete Activity'),
                  'style' => 'danger',
                ],
              ],
              'type' => 'menu',
              'alignment' => 'text-right',
            ],
          ],
          'classes' => [
            'table',
            'table-striped',
          ],
          'toolbar' => [
            [
              'action' => 'add',
              'entity' => 'Activity',
              'text' => ts('Add Activity'),
              'icon' => 'fa-plus',
              'style' => 'primary',
              'target' => 'crm-popup',
            ],
          ],
        ],
      ],
      'match' => [
        'name',
        'saved_search_id',
      ],
    ],
  ],
];
