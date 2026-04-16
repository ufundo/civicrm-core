(function () {
  var COOKIE_NAME = 'riverlea_dark_mode_backend';
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
  var MODES = ['light', 'dark', 'inherit'];
  var MODE_LABELS = {
    light: 'Light',
    dark: 'Dark',
    inherit: 'Auto'
  };
  var MODE_ICONS = {
    light: '☀',
    dark: '🌙',
    inherit: '◐'
  };

  function normalizeMode(mode) {
    return MODES.indexOf(mode) !== -1 ? mode : 'light';
  }

  function getCookie(name) {
    var cookieParts = document.cookie ? document.cookie.split('; ') : [];
    for (var i = 0; i < cookieParts.length; i += 1) {
      var part = cookieParts[i];
      if (part.indexOf(name + '=') === 0) {
        return decodeURIComponent(part.substring(name.length + 1));
      }
    }
    return null;
  }

  function setCookieMode(mode) {
    document.cookie = COOKIE_NAME + '=' + encodeURIComponent(mode)
      + '; path=/'
      + '; max-age=' + COOKIE_MAX_AGE
      + '; SameSite=Lax';
  }

  function getNextMode(currentMode) {
    var index = MODES.indexOf(normalizeMode(currentMode));
    return MODES[(index + 1) % MODES.length];
  }

  function getModeLabel(mode) {
    return MODE_LABELS[normalizeMode(mode)];
  }

  function getModeIcon(mode) {
    return MODE_ICONS[normalizeMode(mode)];
  }

  function getCurrentMode() {
    return normalizeMode(getCookie(COOKIE_NAME) || window.riverleaBackendMode || 'light');
  }

  function ensureStyles() {
    if (document.getElementById('riverlea-mode-toggle-style')) {
      return;
    }

    var style = document.createElement('style');
    style.id = 'riverlea-mode-toggle-style';
    style.textContent = ''
      + '.riverlea-mode-toggle-item{display:flex;align-items:center;list-style:none;}'
      + '#civicrm-menu > .riverlea-mode-toggle-item{float:right;position:relative;z-index:500;padding:0 6px;height:42px;justify-content:center;}'
      + '#crm-menubar-toggle-position + .riverlea-mode-toggle-item{padding-left:4px;}'
      + '.riverlea-mode-toggle-wrap{display:inline-flex;align-items:center;height:100%;}'
      + '.riverlea-mode-switch{position:relative;width:58px;height:30px;border:0;border-radius:999px;cursor:pointer;transition:background .2s ease,box-shadow .2s ease,transform .2s ease;padding:0;outline:none;}'
      + '.riverlea-mode-switch .riverlea-mode-thumb{position:absolute;top:2px;left:2px;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;transition:left .2s ease,transform .2s ease,background .2s ease,color .2s ease;}'
      + '.riverlea-mode-switch[data-mode="light"]{background:#c9c9cf;box-shadow:inset 0 1px 3px rgba(0,0,0,.25);}'
      + '.riverlea-mode-switch[data-mode="light"] .riverlea-mode-thumb{left:2px;background:#ececef;color:#4b4b4b;}'
      + '.riverlea-mode-switch[data-mode="inherit"]{background:linear-gradient(90deg,#c9c9cf 0%,#23262c 100%);box-shadow:inset 0 1px 4px rgba(0,0,0,.35);}'
      + '.riverlea-mode-switch[data-mode="inherit"] .riverlea-mode-thumb{left:16px;background:#d5d5da;color:#2f3033;}'
      + '.riverlea-mode-switch[data-mode="dark"]{background:#1f2227;box-shadow:inset 0 1px 5px rgba(255,255,255,.08),inset 0 -1px 6px rgba(0,0,0,.45);}'
      + '.riverlea-mode-switch[data-mode="dark"] .riverlea-mode-thumb{left:30px;background:#5a5d64;color:#f3f3f4;}'
      + '.riverlea-mode-switch:focus-visible{box-shadow:0 0 0 2px #4c9ffe;}'
      + '@media (max-width: 991px){'
      + '#civicrm-menu > .riverlea-mode-toggle-item{float:none;clear:both;display:block;height:auto;padding:8px 12px;}'
      + '#crm-menubar-toggle-position + .riverlea-mode-toggle-item{padding-left:12px;}'
      + '.riverlea-mode-toggle-wrap{display:flex;justify-content:flex-end;align-items:center;width:100%;height:auto;}'
      + '.riverlea-mode-switch{width:52px;height:28px;}'
      + '.riverlea-mode-switch .riverlea-mode-thumb{width:24px;height:24px;font-size:12px;}'
      + '.riverlea-mode-switch[data-mode="inherit"] .riverlea-mode-thumb{left:14px;}'
      + '.riverlea-mode-switch[data-mode="dark"] .riverlea-mode-thumb{left:26px;}'
      + '}';

    document.head.appendChild(style);
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
    var normalizedMode = normalizeMode(mode);
    button.setAttribute('data-mode', normalizedMode);
    button.setAttribute('aria-checked', normalizedMode === 'dark' ? 'true' : 'false');
    button.setAttribute('aria-label', 'Backend theme mode: ' + getModeLabel(normalizedMode) + '. Click to switch.');
    button.title = 'Backend theme mode: ' + getModeLabel(normalizedMode) + ' (click to switch)';
    button.querySelector('.riverlea-mode-thumb').textContent = getModeIcon(normalizedMode);
  }

  function createToggleButton(mode) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'riverlea-mode-switch';
    button.setAttribute('role', 'switch');

    var thumb = document.createElement('span');
    thumb.className = 'riverlea-mode-thumb';
    button.appendChild(thumb);

    updateSwitchState(button, mode);

    button.addEventListener('click', function () {
      var currentMode = getCurrentMode();
      var nextMode = getNextMode(currentMode);
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

    var observer = new MutationObserver(function () {
      var wrapper = document.getElementById('riverlea-mode-toggle');
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

    var container = getToolbarContainer();
    if (!container) {
      return false;
    }

    ensureStyles();

    var wrapperTag = container.tagName === 'UL' ? 'li' : 'div';
    var wrapper = document.createElement(wrapperTag);
    wrapper.id = 'riverlea-mode-toggle';
    wrapper.className = 'riverlea-mode-toggle-item';

    var innerWrap = document.createElement('span');
    innerWrap.className = 'riverlea-mode-toggle-wrap';

    var currentMode = getCurrentMode();
    innerWrap.appendChild(createToggleButton(currentMode));
    wrapper.appendChild(innerWrap);

    var placedBesideToggle = placeNextToMenuPositionToggle(container, wrapper);
    if (!placedBesideToggle) {
      watchForMenuPositionToggle(container);
    }
    return true;
  }

  function mountWithRetry(attempt) {
    if (mount()) {
      return;
    }
    if (attempt >= 40) {
      return;
    }
    window.setTimeout(function () {
      mountWithRetry(attempt + 1);
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mountWithRetry(0);
    });
  }
  else {
    mountWithRetry(0);
  }
})();
