<?php

namespace Civi\Api4\Action\SavedSearch;

use Civi\Api4\Generic\BasicBatchAction;

use CRM_Search_ExtensionUtil as E;

class CreateReport extends BasicBatchAction {

  public function getSelect() {
    return ['id', 'name', 'label', 'api_entity', 'api_params'];
  }

  protected function doTask($savedSearch) {
    $reportName = $savedSearch['name'] . '_report_' . (new \DateTime())->format('Ymd_His');
    $label = $savedSearch['label'];

    $entity = $savedSearch['api_entity'];
    $fields = $savedSearch['api_params']['select'];
    $fieldMeta = (array) civicrm_api4($entity, 'getFields', [
      'checkPermissions' => FALSE,
      'where' => [['name', 'IN', $fields]],
    ])->indexBy('name');

    // in case fields aren't recognised by getFields, just use
    // the select expression as the name and label
    // TODO: how to handle functions etc
    foreach ($fields as $field) {
      $fieldMeta[$field] ??= [
        'name' => $field,
        'label' => $this->deriveColumnLabel($field, $entity),
      ];
    }

    $searchDisplay = \Civi\Api4\SearchDisplay::create(FALSE)
      ->addValue('saved_search_id', $savedSearch['id'])
      ->addValue('name', $reportName)
      ->addValue('label', E::ts('%1 Report Table', [1 => $label]))
      ->addValue('type', 'table')
      ->addValue('settings', $this->getSearchDisplaySettings($fieldMeta))
      ->execute();

    $route = 'civicrm/reports/' . $reportName;
    $afform = \Civi\Api4\Afform::create(FALSE)
      ->addValue('title', E::ts('%1 Report', [1 => $label]))
      ->addValue('layout', $this->getAfformLayout($savedSearch['name'], $reportName, $fields))
      ->addValue('server_route', $route)
      ->execute();

    return [
      'name' => $reportName,
      'url' => (string) \Civi::url($route),
    ];
  }

  private function getSearchDisplaySettings(array $fieldMeta): array {
    $columns = array_values(array_map(fn ($field) => [
      'type' => 'field',
      'key' => $field['name'],
      'label' => $field['label'],
      'sortable' => TRUE,
    ], $fieldMeta));

    // TODO: add default buttons? might be nice to e.g. link to primary entity?

    return [
      'description' => NULL,
      'sort' => [],
      'limit' => 50,
      'pager' => [],
      'placeholder' => 5,
      'columns' => $columns,
      'actions' => TRUE,
      'classes' => ['table', 'table-striped'],
      'toolbar' => [],
      'toggleColumns' => TRUE,
      'cssRules' => [
        ['disabled', 'is_active', '=', FALSE],
      ],
    ];
  }

  private function getAfformLayout(string $savedSearchName, string $searchDisplayName, array $fieldNames) {
    return \CRM_Core_Smarty::singleton()->fetchWith('CRM/Afform/ReportTable.tpl', [
      'fields' => $fieldNames,
      'savedSearch' => $savedSearchName,
      'searchDisplay' => $searchDisplayName,
    ]);
  }

  private function deriveColumnLabel(string $selectExpr, string $entity) {
    // TODO: how to get human labels from SearchKit select field
    // expressions?
    return $selectExpr;
  }

}
