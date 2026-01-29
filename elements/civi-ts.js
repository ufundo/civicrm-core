/**
 * TODO:
 * - integrate with/reuse CRM.ts and CRM.strings
 * - handle multiple domains
 * - handle parameters?
 * - handle attributes
 * - use a bespoke endpoint for fetching strings
 */

CRM = CRM || {};

CRM.babel = {

  toFetch: [],

  nextFetch: null,

  get: (src) => localStorage.getItem('civi-babel-' + src),

  // TODO: add cache key?
  set: (src, translation) => localStorage.setItem('civi-babel-' + src, translation),

  ts: (string) => {
    const translation = CRM.babel.get(string);
    if (!translation) {
      CRM.babel.queueFetch(string);
      return null;
    }

    return translation;
  },

  queueFetch: (string) => {
    if (CRM.babel.toFetch.includes(string)) {
      return;
    }

    CRM.babel.toFetch.push(string);

    // if we have 50 strings backed up, fetch immediately
    if (CRM.babel.toFetch.length > 100) {
      clearTimeout(CRM.babel.nextFetch);
      CRM.babel.doFetch();
    }
    // otherwise debounce the fetch for 1s
    else {
      clearTimeout(CRM.babel.nextFetch);
      CRM.babel.nextFetch = setTimeout(() => CRM.babel.doFetch(), 1000);
    }
  },

  doFetch: () => {
    // get the batch
    const thisBatch = CRM.babel.toFetch;
    CRM.babel.toFetch = [];

    // prep the batch for best cacheability
    thisBatch.sort();
//    const batchHash = md5(thisBatch);

    // TODO: use a bespoke endpoint to allow caching and/or rate handling
    CRM.api4('System', 'translate', {
      strings: thisBatch,
 //     hash: batchHash
    })
    // add
    .then((response) => {
      if (response.is_error) {
        // fetch failed - requeue
        thisBatch.forEach((string) => CRM.babel.queueFetch(string));
        return;
      }

      // add returned strings to local storage
      Object.entries(response.dictionary).forEach((e) => CRM.babel.set(e[0], e[1]));

      CRM.babel.propogate(thisBatch);
    })
  },


  propogate: (strings) => {
    strings.forEach((string) => {
      const translation = CRM.babel.get(string);
      document.querySelectorAll(`civi-ts[src="${string}"]`).forEach((e) => e.innerText = translation);
    });
  }

}

class CiviTs extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    // if a translation exists it will be added immediately
    // if not babel will fetch and propogate
    this.innerText = CRM.babel.ts(this.getAttribute('src'));
  }
}

// Register the custom element
customElements.define('civi-ts', CiviTs);

