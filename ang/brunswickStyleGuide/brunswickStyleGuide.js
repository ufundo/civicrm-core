(function(angular, $, _) {

  // Declare a list of dependencies.
  angular.module('brunswickStyleGuide', CRM.angRequires('brunswickStyleGuide'));

  angular.module('brunswickStyleGuide').component('brunswickStyleGuide', {
    controllerAs: 'ctrl',
    templateUrl: '~/brunswickStyleGuide/brunswickStyleGuide.html',
    // template: '<div>This works</div>',
    // bindings: { },
    controller: function($scope, crmApi4, crmStatus, crmUiHelp) {
      $scope.loading = true;
    }
  });

})(angular, CRM.$, CRM._);
