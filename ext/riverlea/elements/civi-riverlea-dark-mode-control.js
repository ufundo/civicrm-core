(function () {

  const STORAGE_KEY = 'civi-riverlea-user-controls-dark-mode';
  // Key used by the 6.17/6.18 control, still read so existing choices survive the rename.
  const LEGACY_STORAGE_KEY = 'civi-riverlea-user-controls-color-scheme';

  class CiviRiverleaDarkModeControl extends HTMLElement {

     /* jshint ignore:start */
    static MODES = {
      light: {
        label: ts('Light'),
        icon: 'fa-sun',
        next: 'dark',
      },
      dark: {
        label: ts('Dark'),
        icon: 'fa-moon',
        next: 'auto',
      },
      auto: {
        label: ts('Auto'),
        icon: 'fa-circle-half-stroke',
        next: 'light',
      }
    };
    /* jshint ignore:end */

    static savedMode() {
      const saved = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
      return CiviRiverleaDarkModeControl.MODES[saved] ? saved : 'auto';
    }

    static applyMode(mode) {
      document.documentElement.dataset.civiColorScheme = mode;
    }

    connectedCallback() {
      this.render();
      this.loadMode();
      this.querySelector('button').addEventListener('click', () => this.nextMode());
    }

    render() {
      this.innerHTML = `
        <span class="civi-riverlea-dark-mode-control-wrap">
          <button type="button" class="civi-riverlea-dark-mode-switch">
            <i class="crm-i" role="img" aria-hidden="true"></i>
          </button>
        </span>
      `;
    }

    nextMode() {
      this.setMode(CiviRiverleaDarkModeControl.MODES[this.mode].next);
    }

    setMode(mode) {
      this.mode = mode;

      CiviRiverleaDarkModeControl.applyMode(this.mode);

      this.renderMode();

      this.saveMode();
    }

    renderMode() {
      const details = CiviRiverleaDarkModeControl.MODES[this.mode];
      const next = CiviRiverleaDarkModeControl.MODES[details.next];

      // swap the icon class
      this.querySelector('.crm-i').classList.remove('fa-sun', 'fa-moon', 'fa-circle-half-stroke');
      this.querySelector('.crm-i').classList.add(details.icon);

      // A three-state cycle is a plain button (not role=switch); its label says where a click goes next.
      const button = this.querySelector('button');
      button.dataset.mode = this.mode;
      const description = ts('Backend theme mode: %1. Click to switch to %2', {1: details.label, 2: next.label});
      button.title = description;
      button.setAttribute('aria-label', description);
    }

    saveMode() {
      window.localStorage.setItem(STORAGE_KEY, this.mode);
    }

    loadMode() {
      this.setMode(CiviRiverleaDarkModeControl.savedMode());
    }
  }

  customElements.define('civi-riverlea-dark-mode-control', CiviRiverleaDarkModeControl);

  // Apply the saved mode as soon as this script runs, rather than when the control mounts in the menu.
  CiviRiverleaDarkModeControl.applyMode(CiviRiverleaDarkModeControl.savedMode());

})();
