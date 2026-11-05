(function () {

  // Each control's custom element and the core UserMenu slot StyleLoader reserves for it.
  const controls = {
    'civi-riverlea-dark-mode-control': 'RiverleaDarkModeControl',
    'civi-riverlea-font-size-control': 'RiverleaFontSizeControl',
  };

  let inlineWrapper = null;

  // Without a UserMenu slot (e.g. the menu was customised) fall back to an inline menubar item.
  const getInlineWrapper = (menu) => {
    if (!inlineWrapper) {
      inlineWrapper = document.createElement('li');
      inlineWrapper.className = 'civi-riverlea-user-controls';
      menu.append(inlineWrapper);
    }
    return inlineWrapper;
  };

  const mountControls = (menu) => {
    // if and when the control is defined, add an instance to the menu
    // (the definitions will be loaded based on admin setting)
    Object.entries(controls).forEach(([control, slotName]) => {
      customElements.whenDefined(control).then(() => {
        const slot = menu.querySelector(`.crm-menubar-usermenu-item[data-name="${slotName}"]`);
        (slot || getInlineWrapper(menu)).append(document.createElement(control));
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('civicrm-menu');
    if (menu) {
      mountControls(menu);
      return;
    }

    const observer = new MutationObserver(() => {
      const menu = document.getElementById('civicrm-menu');
      if (menu) {
        mountControls(menu);

        observer.disconnect();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});
  });

})();
