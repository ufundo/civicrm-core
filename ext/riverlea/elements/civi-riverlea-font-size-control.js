(function () {

  const STORAGE_KEY = 'civi-riverlea-user-controls-font-size';

  class CiviRiverleaFontSizeControl extends HTMLElement {

    // Three levels, as in the original cycler; small and big are further from default than before.
     /* jshint ignore:start */
    static MODES = {
      small: {label: ts('Smaller')},
      default: {label: ts('Default')},
      big: {label: ts('Larger')},
    };

    // Choices stored by the five-level version of this control.
    static LEGACY_MODES = {smaller: 'small', bigger: 'big'};
    /* jshint ignore:end */

    static savedMode() {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const mode = CiviRiverleaFontSizeControl.LEGACY_MODES[saved] || saved;
      return CiviRiverleaFontSizeControl.MODES[mode] ? mode : 'default';
    }

    static applyMode(mode) {
      // civi-riverlea-font-size-control.css maps this attribute to the --crm-font-size variables.
      document.documentElement.dataset.civiFontSize = mode;
    }

    connectedCallback() {
      this.render();
      this.setMode(CiviRiverleaFontSizeControl.savedMode());
      this.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => this.setMode(button.dataset.mode));
      });
      this.querySelector('[role="radiogroup"]').addEventListener('keydown', (e) => this.onKeydown(e));
    }

    render() {
      const buttons = Object.entries(CiviRiverleaFontSizeControl.MODES).map(([mode, details]) => {
        const label = ts('Text size: %1', {1: details.label});
        return `<button type="button" role="radio" class="civi-riverlea-font-size-option" data-mode="${mode}" title="${label}" aria-label="${label}">A</button>`;
      }).join('');
      this.innerHTML = `
        <span class="civi-riverlea-font-size-control-wrap">
          <span role="radiogroup" class="civi-riverlea-font-size-picker" aria-label="${ts('Text size')}">${buttons}</span>
        </span>
      `;
    }

    setMode(mode) {
      if (!CiviRiverleaFontSizeControl.MODES[mode]) {
        return;
      }
      this.mode = mode;
      CiviRiverleaFontSizeControl.applyMode(mode);
      // Roving tabindex: only the checked option is in the tab order; arrow keys move between options.
      this.querySelectorAll('button').forEach((button) => {
        const checked = button.dataset.mode === mode;
        button.setAttribute('aria-checked', checked ? 'true' : 'false');
        button.tabIndex = checked ? 0 : -1;
      });
      window.localStorage.setItem(STORAGE_KEY, mode);
    }

    onKeydown(e) {
      const modes = Object.keys(CiviRiverleaFontSizeControl.MODES);
      const step = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[e.key];
      if (!step) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const next = modes[Math.min(modes.length - 1, Math.max(0, modes.indexOf(this.mode) + step))];
      this.setMode(next);
      this.querySelector(`button[data-mode="${next}"]`).focus();
    }
  }

  customElements.define('civi-riverlea-font-size-control', CiviRiverleaFontSizeControl);

  // Apply the saved size as soon as this script runs, rather than when the control mounts in the menu.
  CiviRiverleaFontSizeControl.applyMode(CiviRiverleaFontSizeControl.savedMode());

})();
