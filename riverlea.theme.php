<?php
// This file declares a CSS theme for CiviCRM.

return array (
  'name' => 'riverlea',
  'title' => 'RiverLea',
  'prefix' => NULL,
  'url_callback' => '\\Civi\\Core\\Themes\\Resolvers::simple',
  'search_order' => ['riverlea', '_fallback_'],
  'excludes' => ['css/bootstrap.css'],
);