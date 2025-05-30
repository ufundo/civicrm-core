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

namespace Civi\Api4\Service\Spec\Provider;

use Civi\Api4\Query\Api4SelectQuery;
use Civi\Api4\Service\Spec\FieldSpec;
use Civi\Api4\Service\Spec\RequestSpec;

/**
 * @service
 * @internal
 */
class ActivityCaseField extends \Civi\Core\Service\AutoService implements Generic\SpecProviderInterface {

  /**
   * @inheritDoc
   */
  public function modifySpec(RequestSpec $spec) {
    $action = $spec->getAction();

    $field = new FieldSpec('case_id', 'Activity', 'Integer');
    $field->setTitle(ts('Case ID'));
    $field->setLabel($action === 'get' ? ts('Filed on Case') : ts('File on Case'));
    $field->setDescription(ts('CiviCase this activity belongs to.'));
    $field->setFkEntity('Case');
    $field->setInputType('EntityRef');
    $field->setColumnName('id');
    $field->setSqlRenderer(['\Civi\Api4\Service\Schema\Joiner', 'getExtraJoinSql']);
    $spec->addFieldSpec($field);
  }

  /**
   * @inheritDoc
   */
  public function applies($entity, $action) {
    return $entity === 'Activity';
  }

}
