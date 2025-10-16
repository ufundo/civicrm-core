// source: paypal.initiator.js
(function ($, CRM, _, undefined) {

  CRM.ppcp = CRM.ppcp || [];
  CRM.ppcp.onboard = function (request) {
    const url = CRM.url('civicrm/ajax/paypal-onboard', request);
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }).then(function(response){
      if (response.status === 200) {
        window.location = window.location;
      }
      else {
        CRM.alert(ts('Error obtaining credentials. Check browser log and server log for details.'), ts('Credential Failure'), 'error');
        console.log('Credential Failure', { request, response });
      }
    });
  };

}(CRM.$, CRM, CRM._));
