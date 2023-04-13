<?php
// This file declares a CSS theme for CiviCRM.

return array (
  'name' => 'brunswick',
  'title' => 'Brunswick',
  'prefix' => NULL,
  'url_callback' => '\\Civi\\Core\\Themes\\Resolvers::simple',
  'search_order' => ['brunswick', '_fallback_'],
  'excludes' => ['css/bootstrap.css'],
);