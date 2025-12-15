// https://civicrm.org/licensing
(function(angular, $, _) {
  "use strict";

  angular.module('crmSearchDisplay').component('crmSearchDisplaySubsearch', {
    bindings: {
      colData: '<',
    },
    controller: function ($scope, $element, $compile) {
      this.$onInit = () => {
        const search = JSON.stringify(this.colData.search);
        const display = JSON.stringify(this.colData.display);
        const settings = JSON.stringify(this.colData.settings);
        const filters = JSON.stringify(this.colData.filters);
        $element.html(`
          <crm-search-display-${this.colData.type}
            search='${search}'
            display='${display}'
            api-entity='${this.colData.api_entity}'
            settings='${settings}'
            filters='${filters}' />
        `);
//        $element.html(`
//          <crm-search-display-${this.type}
//            search='{{:: colData.search }}'
//            display='{{:: colData.display }}'
//            api-entity='{{:: colData.apiEntity }}'
//            settings='{{:: colData.settings }}'
//            options='{{:: colData.options }}' />
//        `);
        $compile($element.contents())($scope);
      };
    }
//      $scope.$watch(
//        // watch the 'compile' expression for changes
//        () => $scope.$eval(attrs.subsearch),
//        (value) =>
//          // when the 'compile' expression changes
//          // assign it into the current DOM
//          $element.html(value);

//          // compile the new DOM and link it to the current
//          // scope.
//          // NOTE: we only compile .childNodes so that
//          // we don't get into infinite loop compiling ourselves
//          $compile($element.contents())($scope);
//        }
//      );
  });

})(angular, CRM.$, CRM._);
