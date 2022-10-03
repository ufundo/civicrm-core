<?php
use CRM_Brunswick_ExtensionUtil as E;

class CRM_Brunswick_Page_StyleGuide extends CRM_Core_Page {

  public function run() {
    CRM_Utils_System::setTitle(E::ts('Developer’s style guide'));

    // Example: Assign a variable for use in a template
    // $this->assign('currentTime', date('Y-m-d H:i:s'));

    Civi::service('angularjs.loader')->addModules('brunswickStyleGuide');

    parent::run();
  }

}

