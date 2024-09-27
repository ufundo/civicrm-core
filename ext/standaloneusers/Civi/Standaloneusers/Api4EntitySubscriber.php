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

namespace Civi\Standaloneusers;

use CRM_Standaloneusers_ExtensionUtil as E;

use Civi\Core\Event\GenericHookEvent;
use Civi\Core\Service\AutoService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Lets Api4 know about entities in this extension
 * @service
 * @internal
 */
class Api4EntitySubscriber extends AutoService implements EventSubscriberInterface {

  /**
   * @return array
   */
  public static function getSubscribedEvents(): array {
    return [
      'civi.api4.entityTypes' => 'on_civi_api4_entityTypes',
    ];
  }

  /**
   * Register entities based on Api4 classes in this extension
   *
   * @param \Civi\Core\Event\GenericHookEvent $event
   */
  public static function on_civi_api4_entityTypes(GenericHookEvent $event): void {
    $dir = E::path('Civi/Api4/');
    foreach (glob("$dir/*.php") as $file) {
      $className = 'Civi\Api4\\' . basename($file, '.php');
      if (is_a($className, 'Civi\Api4\Generic\AbstractEntity', TRUE)) {
        $info = $className::getInfo();
        $event->entities[$info['name']] = $info;
      }
    }
  }

}
