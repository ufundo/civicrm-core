<?php
// This file declares a CSS theme for CiviCRM.

return array (
  'name' => 'riverlea',
  'title' => 'RiverLea',
  'prefix' => NULL,
  'url_callback' => '\\Civi\\Core\\Themes\\Resolvers::simple',
  'excludes'     => [ 'css/contactSummary.css', 'css/admin.css' ], // @todo redo 'css/dashboard.css'
  'search_order' => ['_riverlea_core_', '_fallback_'],
);