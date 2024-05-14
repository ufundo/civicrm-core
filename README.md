# RiverLea CiviCRM Core Framework Theme

Theme architecture for CiviCRM that separates visual/UI CSS from structural CSS using CSS variables. It currently has two variations, or 'streams': Hoxton, based on Shoreditch, and Abingdon, based on Grenwich. Edit civicrm.css file to swap between them.

The extension is licensed under [AGPL-3.0](LICENSE.txt).

## Changelog

0.1 - proof-of-concept, Brunswick, empty theme structure doing just two things: for older CMS interfaces enforces a 100% font-size default to cascade the browser default font-size, and demonstrates a 1rem variable on top of that for some Civi body text sizes. The computed font-size of Civi paragraph and table text should show as 16px in Inspector (for standard setups).
0.2 - adds a bunch of css variables for testing/dev, adds the entirity of the current Greenwich Bootstrap 3 build to start cutting it back, and adds a components directory with initial component 'accordions' (with animated exapnd/close + CSS variables). Separate components files will likely be merged when the extension is moving to testing, to reduce http requests.
0.3.alpha - RiverLea CiviCRM theme at ~ 80% (*"The last 20% of work takes the same amount of time as the previous 80%."). Has two 'streams' Hoxton and Abingdon.

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

## Changelog / known issues

Version 0.22 - Tiny Joomla fix, for post 5.72 (update only needed for Joomla users with Civi > 5.72)

Version 0.21 - A few more Claro resets and Joomla 4 fixes. Tidies up accordion css (separates new and legacy).

Version 0.20 - Supports CiviCRM 5.69+ accessible accordions, adjusts colour names with some Standalone variables, tweaks themetest style.

Version 0.19 - Continued fixes, including from Nicolas Ganivet @ CiviDesk. For versions of Civi before 5.69.

Version 0.18 - Many small fixes, including increased SearchKit, FormBuilder, D9 Claro and Joomla4 support.

Version 0.17 - Improved Form Builder and Search Kit support, some D9+ Claro theme resets

Version 0.16 - Multiple small fixes

Version 0.15 - Resolved a problematic Bootstrap issue. Improved display on Civi Bootstrap screens (API4, FormBuilder, SearchKit, etc)

Version 0.14 - Backdrop test and tweak. Swapped fonts to system fonts to improve speed & reduce size.

Version 0.13 - Drupal 9 & Joomla 4, addresses cascade order (loads theme CSS after other Civi css) – thanks @aydun. Tested against 5.42

Version 0.12 - improved Cases/Reports handling. PHP7.4 (thanks @mjwconsult). Updated for v5.37.1

Version 0.11 - some fixes, styles Afform. Updated for version 5.35

Version 0.10 - adds Bootstrap to everything, styles API4 Explorer & SearchKit

Version 0.9 - updated for version 5.33.2

Version 0.8 - further button tidying

Version 0.7 - updated for CiviCRM 5.31.0, fixed extension accordion bug.

Version 0.6 - updated for CiviCRM 5.30.0

Version 0.5 - updated for CiviCRM 5.27.4

Version 0.4 - added Drupal 8 support

Version 0.2 - added Wordpress support, merged css, basic responsiveness.
- Uses colour variables so will not work on Internet Explorer (flag if this is an issue and fallbacks can be added)
- .Woff versions of fonts used as the smallest - but ttf and otf versions are included. To further improve speed, change font-family to 'inherit' to use the theme fonts (FontAwesome is still needed)
- Many sprites have been removed - animated gifs (loaders) are kept, as are a few sprites that are either hard to replace with FA (ie the select2 dropdown arrows), or whose use is unclear
- More testing is needed, issues welcome.

Version 0.1 
- is a quick merge of the default civicrm.css and civicrm-shelford.css. This means some sprite paths may be broken and there are duplicate selectors.
- use of CSS variables not supported by IE or < MS Edge 15.
- not tested on Wordpress, Backdrop or Drupal 8.
