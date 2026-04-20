(function () {
  const COOKIE_NAME = 'riverlea_dark_mode_backend';
  const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
  const MODES = ['light', 'dark', 'inherit'];
  const MODE_LABELS = {
    light: 'Light',
    dark: 'Dark',
    inherit: 'Auto'
  };
  const MODE_ICONS = {
    light: '☀',
    dark: '🌙',
    inherit: '◐'
  };

  function normalizeMode(mode) {
    return MODES.indexOf(mode) !== -1 ? mode : 'light';
  }

  function getCookie(name) {
    const cookieParts = document.cookie ? document.cookie.split('; ') : [];
    for (let i = 0; i < cookieParts.length; i += 1) {
      const part = cookieParts[i];
      if (part.indexOf(name + '=') === 0) {
        return decodeURIComponent(part.substring(name.length + 1));
      }
    }
    return null;
  }

  function setCookieMode(mode) {
    document.cookie = [
      COOKIE_NAME + '=' + encodeURIComponent(mode),
      'path=/',
      'max-age=' + COOKIE_MAX_AGE,
      'SameSite=Lax'
    ].join('; ');
  }

  function getNextMode(currentMode) {
    const index = MODES.indexOf(normalizeMode(currentMode));
    return MODES[(index + 1) % MODES.length];
  }

  function getModeLabel(mode) {
    return MODE_LABELS[normalizeMode(mode)];
  }

  function getModeIcon(mode) {
    return MODE_ICONS[normalizeMode(mode)];
  }

  function getCurrentMode() {
    const serverMode = CRM && CRM.vars && CRM.vars.riverlea && CRM.vars.riverlea.backendMode;
    return normalizeMode(getCookie(COOKIE_NAME) || serverMode || 'light');
  }

  function isVisible(element) {
    if (!element) {
      return false;
    }

    var rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function getToolbarContainer() {
    var menu = document.querySelector('#civicrm-menu');
    if (!isVisible(menu)) {
      return null;
    }
    return menu;
  }

  function updateSwitchState(button, mode) {
    const normalizedMode = normalizeMode(mode);
    button.setAttribute('data-mode', normalizedMode);
    button.setAttribute('aria-checked', normalizedMode === 'dark' ? 'true' : 'false');
    button.setAttribute('aria-label', 'Backend theme mode: ' + getModeLabel(normalizedMode) + '. Click to switch.');
    button.title = 'Backend theme mode: ' + getModeLabel(normalizedMode) + ' (click to switch)';
    button.querySelector('.riverlea-mode-thumb').textContent = getModeIcon(normalizedMode);
  }

  function createToggleButton(mode) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'riverlea-mode-switch';
    button.setAttribute('role', 'switch');

    const thumb = document.createElement('span');
    thumb.className = 'riverlea-mode-thumb';
    button.appendChild(thumb);

    updateSwitchState(button, mode);

    button.addEventListener('click', function () {
      const currentMode = getCurrentMode();
      const nextMode = getNextMode(currentMode);
      setCookieMode(nextMode);
      window.location.reload();
    });

    return button;
  }

  function placeNextToMenuPositionToggle(container, wrapper) {
    var menuPositionToggle = container.querySelector('#crm-menubar-toggle-position');
    if (menuPositionToggle && menuPositionToggle.parentNode === container) {
      menuPositionToggle.insertAdjacentElement('afterend', wrapper);
      return true;
    }

    container.appendChild(wrapper);
    return false;
  }

  function watchForMenuPositionToggle(container) {
    if (container._riverleaToggleObserver) {
      return;
    }

    const observer = new MutationObserver(function () {
      const wrapper = document.getElementById('riverlea-mode-toggle');
      if (!wrapper || wrapper.parentNode !== container) {
        return;
      }

      if (placeNextToMenuPositionToggle(container, wrapper)) {
        observer.disconnect();
        container._riverleaToggleObserver = null;
      }
    });

    observer.observe(container, {childList: true, subtree: false});
    container._riverleaToggleObserver = observer;
  }

  function mount() {
    if (document.getElementById('riverlea-mode-toggle')) {
      return true;
    }

    const container = getToolbarContainer();
    if (!container) {
      return false;
    }

    const wrapperTag = container.tagName === 'UL' ? 'li' : 'div';
    const wrapper = document.createElement(wrapperTag);
    wrapper.id = 'riverlea-mode-toggle';
    wrapper.className = 'riverlea-mode-toggle-item';

    const innerWrap = document.createElement('span');
    innerWrap.className = 'riverlea-mode-toggle-wrap';

    const currentMode = getCurrentMode();
    innerWrap.appendChild(createToggleButton(currentMode));
    wrapper.appendChild(innerWrap);

    const placedBesideToggle = placeNextToMenuPositionToggle(container, wrapper);
    if (!placedBesideToggle) {
      watchForMenuPositionToggle(container);
    }
    return true;
  }

  function mountOrObserve() {
    if (mount()) {
      return;
    }
    // Menu not yet in DOM — watch for it being added
    const observer = new MutationObserver(function () {
      if (mount()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountOrObserve);
  }
  else {
    mountOrObserve();
  }
})();
