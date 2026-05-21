<?php

namespace Civi\Schema;

use Civi\Core\Service\AutoService;

/**
 * @service civi.schema.fts
 */
class FullTextSearch extends AutoService {

  public function getIndexNamesByEntity(): array {
    return array_map(fn ($def) => array_keys($def['indices']), $this->getDefinedIndices());
  }

  protected function getDefinedIndices(): array {
    return array_filter(array_map(function ($meta) {
      $allIndices = !empty($meta['getIndices']) ? $meta['getIndices']() : [];
      $ftsIndices = array_filter($allIndices, fn ($indexDef) => !empty($indexDef['fts']));
      if (!$ftsIndices) {
        return NULL;
      }
      $indexNameToFields = array_map(fn ($indexDef) => array_keys($indexDef['fields']), $ftsIndices);
      return [
        'table' => $meta['table'],
        'indices' => $indexNameToFields,
      ];
    }, EntityRepository::getEntities()));
  }

  protected function getExistingIndices(string $table) {
    return array_column(\CRM_Core_DAO::executeQuery("SHOW INDEX FROM {$table} WHERE Index_type = 'FULLTEXT'")->fetchAll(), 'Key_name');
  }

  public function addIndices($cleanSlate = FALSE) {
    if ($cleanSlate) {
      $this->dropIndices();
    }

    foreach ($this->getDefinedIndices() as $entity => $meta) {
      $table = $meta['table'];
      $indexNames = array_keys($meta['indices']);
      $toAdd = array_diff($indexNames, $this->getExistingIndices($table));
      if (!$toAdd) {
        continue;
      }
      $sqls = array_map(fn ($name) => "ADD FULLTEXT INDEX {$name} (" . implode(',', $meta['indices'][$name]) . ")", $toAdd);
      $sql = "ALTER TABLE {$table} " . \implode(', ', $sqls);
      echo $sql;
      \CRM_Core_DAO::executeQuery($sql);
    }
  }

  public function dropIndices() {
    foreach ($this->getDefinedIndices() as $entity => $meta) {
      $table = $meta['table'];
      $indexNames = array_keys($meta['indices']);
      $toDrop = \array_intersect($indexNames, $this->getExistingIndices($table));
      if (!$toDrop) {
        continue;
      }
      $sqls = array_map(fn ($name) => "DROP INDEX {$name}", $toDrop);
      $sql = "ALTER TABLE {$table} " . implode(', ', $sqls);
      echo $sql;
      \CRM_Core_DAO::executeQuery($sql);
    }
  }

  public function debug() {
    echo \json_encode($this->getIndexNamesByEntity(), \JSON_PRETTY_PRINT);
  }

}
