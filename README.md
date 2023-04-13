# Brunswick

A mostly empty theme. The extension is licensed under [AGPL-3.0](LICENSE.txt).

## Changelog

0.1 - proof of concept empty theme structure doing just two things: for older CMS interfaces enforces a 100% font-size default to cascade the browser default font-size, and demonstrates a 1rem variable on top of that for Civi body text size.

## Requirements

* PHP v7.4+
* CiviCRM 5.49+

## Setting up a testing/developoment environment

If you want to test and work on this this across multiple CMS+Civi instances on on machine, you can use [SymLinks](https://en.wikipedia.org/wiki/Symbolic_link) between Civi's extension folders to point to the same instance of Brunswick.

E.g. after downloading the theme to `~/Sites/localhost/drupal/web/sites/default/files/civicrm/ext` you could make an alias from, say,  `~/Sites/localhost/wordpress/wp-content/uploads/civicrm` with `ln -s /Users/admin/Sites/localhost/dru9civi/web/sites/default/files/civicrm/ext/brunswick brunswick`



