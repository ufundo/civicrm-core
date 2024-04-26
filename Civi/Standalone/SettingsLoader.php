<?php

class SettingsLoader
{
  public static function load() {
    // note, if CIVICRM_SETTINGS_PATH points to a single file, then this will
    // be equivalent to just loading that
    foreach (PathLoader::singleton()->getSettingsFiles() as $settingsFile) {
      require_once $settingsFile;
    }
  }
}