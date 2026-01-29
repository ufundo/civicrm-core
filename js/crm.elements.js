CRM = CRM || {};

// TODO: merge into elements mixin autoloader
CRM.loadElement = (tagName) => {

  // load template first, so the JS doesn't have to wait for it
  // TODO: skip if no template
  fetch(CRM.url(`civicrm/elements/${tagName}`))
   .then((response) => response.text())
   .then((content) => {
     template = document.createElement('template');
     template.id = tagName;
     template.innerHTML= content;
     document.body.append(template);
   })
   // now load the custom element definition
   .then(() => import(`${CRM.resourceUrls.civicrm}/elements/${tagName}.js`));
}