# RiverLea Theme Framework

Theme architecture for CiviCRM that separates visual/UI CSS from structural CSS using CSS variables. It currently has two variations, or 'streams': Hoxton, based on Shoreditch, and Abingdon, based on Grenwich. Edit civicrm.css file to swap between them.

The extension is licensed under [AGPL-3.0](LICENSE.txt).

## Changelog

- 0.1 - proof-of-concept, Brunswick, empty theme structure doing just two things: for older CMS interfaces enforces a 100% font-size default to cascade the browser default font-size, and demonstrates a 1rem variable on top of that for some Civi body text sizes. The computed font-size of Civi paragraph and table text should show as 16px in Inspector (for standard setups).
- 0.2 - adds a bunch of css variables for testing/dev, adds the entirity of the current Greenwich Bootstrap 3 build to start cutting it back, and adds a components directory with initial component 'accordions' (with animated exapnd/close + CSS variables). Separate components files will likely be merged when the extension is moving to testing, to reduce http requests.
- 0.3 - Backdrop, Drupal7 + Seven, Drupal9 + Claro/Seven, Joomla 4, Standalone, WordPress. Loads with two theme variations/streams: Minetta and Walbrook. Does not cover: front-end layouts, < 1000px screens, Joomla 3, other Drupal admin themes. CSS files restructure into `/core/css` and `[stream-name]/css/` with stream variables defined in `[stream-name]/css/_variables.css`.

## Installation (CLI, Zip)

Sysadmins and developers may download the `.zip` file for this extension and
install it with the command-line tool [cv](https://github.com/civicrm/cv).

```bash
cd <extension-dir>
wget https://lab.civicrm.org/extensions/riverlea/-/archive/master/riverlea-master.zip
unzip riverlea-master.zip
```

## Installation (CLI, Git)

Sysadmins and developers may clone the [Git](https://en.wikipedia.org/wiki/Git) repo for this extension and
install it with the command-line tool [cv](https://github.com/civicrm/cv).

```bash
git clone https://lab.civicrm.org/extensions/riverlea.git
cv en riverlea
```

## Usage

After installing the extension, select it via Nav menu > Administer > Customize Data and Screens > Display Preferences, and save.

In some instances, after upgrading CiviCRM, the theme defaults back to Civi's default theme and you will need to disable and re-enable the theme extension.
