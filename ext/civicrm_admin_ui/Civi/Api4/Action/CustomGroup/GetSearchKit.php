<?php

namespace Civi\Api4\Action\CustomGroup;

use CRM_Afform_ExtensionUtil as E;

/**
 * For multi-value custom groups, produce managed records
 * to generate a search kit SavedSearch and SearchDisplays
 * for listing the custom records
 *
 * @package Civi\Api4\Action\CustomGroup
 */
class GetSearchKit extends \Civi\Api4\Generic\BasicBatchAction {

  protected function getSelect() {
    return ['id', 'name', 'title', 'is_multiple'];
  }

  protected function doTask($item) {
    if (!$item['is_multiple']) {
      return [
        'id' => $item['id'],
        'managed' => [],
      ];
    }

    // get active fields for this group to include as columns
    // to include as columns in the search kit
    $fields = (array) \Civi\Api4\CustomField::get(FALSE)
      ->addSelect('name', 'label')
      ->addWhere('custom_group_id', '=', $item['id'])
      ->addWhere('is_active', '=', TRUE)
      ->execute();

    $entityName = 'Custom_' . $item['name'];
    $entityLabel = $item['title'];

    $managed = [];

    $managed[] = $this->getSavedSearch($entityName, $entityLabel, $fields);

    // SavedSearch
    $displayColumns = $this->getFieldColumns($fields);
    $displayColumns[] = $this->getButtonColumn($entityName, $item['name']);

    // for now generate table
    // TODO: grid for non-table tabs
    $managed[] = $this->getSearchDisplay($entityName, $entityLabel, $displayColumns, 'table');

    return [
      'id' => $item['id'],
      'managed' => $managed,
    ];
  }

  protected function getSavedSearch($entityName, $entityLabel, $fields) {
    return [
      'name' => "SavedSearch_{$entityName}",
      'entity' => 'SavedSearch',
      'cleanup' => 'unused',
      'update' => 'unmodified',
      'params' => [
        'version' => 4,
        'values' => [
          'name' => $entityName,
          'label' => E::ts('%1 Search', [1 => $entityLabel]),
          'api_entity' => $entityName,
          'api_params' => [
            'version' => 4,
            'select' => array_map(fn ($field) => $field['name'], $fields),
          ],
        ],
        'match' => ['name'],
      ],
    ];
  }

  protected function getSearchDisplay($entityName, $entityLabel, $columns, $displayType = 'table') {
    return [
      'name' => "SavedSearch_{$entityName}_SearchDisplay_{$entityName}:{$displayType}",
      'entity' => 'SearchDisplay',
      'cleanup' => 'unused',
      'update' => 'unmodified',
      'params' => [
        'version' => 4,
        'values' => [
          'name' => "{$entityName}:{$displayType}",
          'label' => E::ts('%1 %2', [1 => $entityLabel, 2 => ucfirst($displayType)]),
          'saved_search_id.name' => $entityName,
          'type' => $displayType,
          'settings' => [
            'limit' => 50,
            'placeholder' => 5,
            'columns' => $columns,
            'actions' => TRUE,
            'classes' => ['table', 'table-striped'],
            'actions_display_mode' => 'menu',
            // only for grid
            'colno' => '3',
          ],
        ],
        'match' => [
          'saved_search_id',
          'name',
        ],
      ],
    ];
  }

  protected function getFieldColumns($fields) {
    $displayColumns = [];

    $displayColumns[] = [
      'type' => 'field',
      'key' => 'id',
      'label' => E::ts('Record ID'),
      'sortable' => TRUE,
      'break' => TRUE,
    ];

    foreach ($fields as $field) {
      $displayColumns[] = [
        'type' => 'field',
        'key' => $field['name'],
        'label' => $field['label'],
        'sortable' => TRUE,
      ];
    }

    return $displayColumns;
  }

  protected function getButtonColumn($entityName, $groupName) {
    return [
      'size' => 'btn-xs',
      'links' => [
        [
          'entity' => $entityName,
          'action' => 'view',
          'target' => 'crm-popup',
          'icon' => 'fa-eye',
          'text' => E::ts('View'),
          'style' => 'default',
        ],
        [
          // TODO: can we register this as the canonical Update link
          'path' => "civicrm/af/custom/{$groupName}/update#?Record=[id]",
          'target' => 'crm-popup',
          'icon' => 'fa-pencil',
          'text' => E::ts('Edit'),
          'style' => 'warning',
        ],
        [
          'entity' => $entityName,
          'task' => 'delete',
          'target' => 'crm-popup',
          'icon' => 'fa-trash',
          'text' => E::ts('Delete'),
          'style' => 'danger',
        ],
      ],
      'type' => 'buttons',
      'alignment' => 'text-right',
    ];
  }

  public static function getAllManaged() {
    $all = \Civi\Api4\CustomGroup::getSearchKit(FALSE)
      ->addWhere('is_active', '=', TRUE)
      ->addWhere('is_multiple', '=', TRUE)
      ->execute()
      ->column('managed');

    return array_merge(...$all);
  }

}
