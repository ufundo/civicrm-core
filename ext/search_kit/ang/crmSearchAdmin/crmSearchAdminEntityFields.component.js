(function(angular, $, _) {
  "use strict";

  angular.module('crmSearchAdmin').component('crmSearchAdminEntityFields', {
    bindings: {
      join: '<',
    },
    require: {
      crmSearchAdmin: '^crmSearchAdmin'
    },
    templateUrl: '~/crmSearchAdmin/crmSearchAdminEntityFields.html',
    controller: function ($scope, $element, searchMeta) {
      var ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
        ctrl = this;

      this.selected = [];
      this.selectable = [];

      this.getAllFields = () => {
        const joinInfo = this.join ? searchMeta.getJoin(this.crmSearchAdmin.savedSearch, this.join) : null;
        const entity = this.join ? joinInfo.entity : this.crmSearchAdmin.savedSearch.api_entity;
        const fieldPrefix = this.join ? joinInfo.alias + '.' : '';
        // TODO: Add extra searchable fields from bridge entity. Though maybe not needed for simple view?
        return searchMeta.getEntity(entity).fields.map((field) => {
          const fieldSuffix = (field.suffixes && field.suffixes.includes('label')) ? ':label' : '';
          return {
            id: fieldPrefix + field.name + fieldSuffix,
            text: field.label,
            description: field.description
          };
        });
      };

      // get fields for the entity and then split between selected/selectable
      this.updateFields = (newSelection) => {
        const allFields = this.getAllFields();
        this.selectable = allFields.filter((field) => !newSelection.includes(field.id));
        // preserve order from newSelection
        this.selected = newSelection.map((key) => allFields.find((field) => key === field.id)).filter((field) => field);
      };

      this.addField = (key) => {
       this.crmSearchAdmin.addParam('select', key);
      };

      this.removeField = (key) => {
        const index = this.crmSearchAdmin.savedSearch.api_params.select.indexOf(key);
        this.crmSearchAdmin.clearParam('select', index);
      };

      this.$onInit = () => {
        $scope.$watchCollection('$ctrl.crmSearchAdmin.savedSearch.api_params.select', (newSelect) => this.updateFields(newSelect));
      };

    }
  });

})(angular, CRM.$, CRM._);
