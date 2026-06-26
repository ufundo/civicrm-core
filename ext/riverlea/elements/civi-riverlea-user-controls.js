(function () {


  class CiviRiverleaUserControls extends HTMLElement {

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

    connectedCallback() {
      this.render();
      this.loadMode();
      this.querySelector('button').addEventListener('click', () => this.nextMode());
    }

    render() {
      this.innerHTML = `
        <button type="button" role="switch" class="civi-riverlea-color-scheme-switch">
          <i class="crm-i" role="img" aria-disabled="true"></i>
        </button>
      `;
    }

    nextMode() {
      this.setMode(CiviRiverleaUserControls.MODES[this.mode].next);
    }

    setMode(mode) {
      this.mode = mode;

      document.querySelector(':root').dataset.civiColorScheme = this.mode;

      this.renderMode();

      this.saveMode();
    }

    renderMode() {
      const details = CiviRiverleaUserControls.MODES[this.mode];

      // swap the icon class
      this.querySelector('.crm-i').classList.remove('fa-sun', 'fa-moon', 'fa-circle-half-stroke');
      this.querySelector('.crm-i').classList.add(details.icon);

      const button = this.querySelector('button');
      button.dataset.mode = this.mode;
      const description = ts('Backend theme mode: %1. Click to switch', {1: details.label});
      button.title = description;
      //redundant?
      button.setAttribute('aria-label', description);

    }

    saveMode() {
      window.localStorage.setItem('civi-riverlea-user-controls-color-scheme', this.mode);
    }

    loadMode() {
      const saved = window.localStorage.getItem('civi-riverlea-user-controls-color-scheme');
      this.setMode(saved ? saved : 'auto');
    }
  }

  customElements.define('civi-riverlea-user-controls', CiviRiverleaUserControls);

  document.addEventListener('DOMContentLoaded', () => {
    const controls = document.createElement('civi-riverlea-user-controls');

    const menu = document.querySelector('#civicrm-menu');

    if (menu) {
      // add straight to the menu
      menu.append(controls);
      return;
    }

    // if not add to the document body so we can get started
    document.querySelector('body').append(controls);

    // and watch for the menu, reposition
    const observer = new MutationObserver(() => {
      const menu = document.querySelector('#civicrm-menu');
      if (menu) {
        menu.append(controls);
        observer.disconnect();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});
  });

})();
