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

  dictionary: {},

  toFetch: [],

  nextFetch: null,

  ts: (string) => {
    if (!CRM.babel.dictionary[string]) {
      CRM.babel.queueFetch(string);
      return null;
    }

    return CRM.babel.dictionary[string];
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

      // add returned strings to dictionary
      Object.assign(CRM.babel.dictionary, response.dictionary);

      CRM.babel.propogate(thisBatch);
    })
  },


  propogate: (strings) => {
    strings.forEach((string) => {
      const translation = CRM.babel.dictionary[string];
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

