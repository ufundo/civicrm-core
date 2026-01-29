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

namespace Civi\Api4\Action\System;

use Civi\Api4\Generic\AbstractAction;
use Civi\Api4\Generic\Result;

/**
 * Get translated strings
 */
class Translate extends AbstractAction {

  /**
   * @var array
   * @required
   */
  protected array $strings = [];

  public function _run(Result $result) {
    $dictionary = [];

    foreach ($this->strings as $string) {
      $dictionary[$string] = ts($string);
    }

    $result['dictionary'] = $dictionary;
  }

}
