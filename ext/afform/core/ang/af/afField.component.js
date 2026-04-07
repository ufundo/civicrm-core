(function (angular, _, $) {

  let afFieldId = 0;

  const getRelativeDate = (dateString, includeTime) => {
    const parts = dateString.split(' ');
    const baseDate = new Date();
    let unit = parts[2] || 'day';
    let offset = parseInt(parts[1] || '0', 10);

    switch (unit) {
      case 'week':
        offset *= 7;
        break;

      case 'year':
        offset *= 365;
    }
    let newDate = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
    let localYear = newDate.getFullYear();
    let localMonth = String(newDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    let localDay = String(newDate.getDate()).padStart(2, '0');
    let defaultDate = `${localYear}-${localMonth}-${localDay}`; // Format YYYY-MM-DD

    if (includeTime) {
      defaultDate += ' ' + newDate.toTimeString().slice(0,8);
    }
    return defaultDate;
  }

  class AfField extends HTMLElement {

    connectedCallback() {
      this.fieldId = _.kebabCase(this.fieldName) + '-' + afFieldId++;
      afFieldId += 1;

      this.initialise();
      this.render();
    }

    get fieldName() {
      return this.getAttribute('name');
    }

    get defn() {
      // NOTE: this is an angular expression so we can only consume
      // via angular $scope.$eval below
      // TODO: how do we de-angularise this?
      return this.getAttribute('defn');
    }

    get afFieldset() {
      return this.closest('[af-fieldset]');
    }

    get afJoin() {
      return this.closest('[af-join]');
    }

    get afRepeatItem() {
      return this.closest('[af-repeat-item]');
    }

    get $afFieldset() {
      return angular.element(this.afFieldset).controller('afFieldset');
    }

    get $afJoin() {
      const el = this.afJoin;
      return el ? angular.element(el).controller('afJoin') : null;
    }

    get $afRepeatItem() {
      const el = this.afRepeatItem;
      return el ? angular.element(el).controller('afRepeatItem') : null;
    }

    get $scope() {
      return angular.element(this).scope();
    }

    get $defn() {
      return this.$scope.$eval(this.defn);
    }

    get dataProvider() {
      const closestController = this.closest('[af-fieldset],[af-join],[af-repeat-item]');
      return closestController.matches('[af-repeat-item]') ? this.afRepeatItem : this.afJoin || this.afFieldset;
    }

    get $dataProvider() {
      const closestController = this.closest('[af-fieldset],[af-join],[af-repeat-item]');
      return closestController.matches('[af-repeat-item]') ? this.$afRepeatItem : this.$afJoin || this.$afFieldset;
    }

    get searchOperator() {
      return this.operatorSelect.value;
    }

    render() {
      this.innerHTML = '';

      const $defn = this.$defn;

      this.$scope.$ctrl = {
        defn: $defn
      };

      if ($defn.label && !($defn.input_type == 'CheckBox' && $defn.data_type == 'Boolean')) {
        const label = document.createElement('label');
        label.classList.add('.crm-af-field-label');
        label.innerText = this.$defn.label;
        label.for = this.fieldId;

        if (this.$defn.required) {
          const marker = document.createElement('span');
          marker.classList.add('crm-marker');
          marker.title = ts('Required');
          marker.innerText = '*';
          label.append(marker);
        }

        this.append(label)
      }

      if ($defn.help_pre) {
        const helpPre = document.createElement('p');
        helpPre.classList.add('crm-af-field-help-pre')
        helpPre.innerText = $defn.help_pre;
        this.append(helpPre)
      }

      const field = document.createElement('af-field-input');
      field.classList.add('crm-af-field');
      field.setAttribute('defn', this.defn);

      if ($defn.expose_operator) {
        const inputGroup = document.createElement('div')
        inputGroup.classList.add('input-group');


        this.operatorSelect = document.createElement('select');
        this.operatorSelect.classList.add('form-control', 'afform-search-operator');
        this.operatorSelect.setAttribute('crm-ui-select', true);
        this.operatorSelect.onchange = () => this.onChangeOperator();

        Object.keys($defn.operators).forEach((value) => {
          const option = document.createElement('option');
          option.value = value
          option.innerText = $defn.operators[value];
        })

        inputGroup.append(field);

        this.append(inputGroup);
      }
      else {
        this.append(field);
      }

      if ($defn.help_post) {
        const helpPost = document.createElement('p');
        helpPost.classList.add('crm-af-field-help-post')
        helpPost.innerText = $defn.help_post;
        this.append(helpPost)
      }
    }

    getFieldOptions() {
      if (this.$defn.data_type === 'Boolean') {
        if (this.fieldOptions) {
          this.fieldOptions.forEach((option) => option.id = !!option.id);
        } else {
          this.fieldOptions = [{id: true, label: ts('Yes')}, {id: false, label: ts('No')}];
        }
      }
    }

    initialise() {
      // When this field is removed by afIf, also remove its value from the data model.
      if (this.$defn.input_type !== 'DisplayOnly') {
        $(this).on('afIfDestroy', () => {
          delete this.$dataProvider.getFieldData()[this.fieldName];
        });
      };

      // Reinitialize value when resetting form
      $(this).on('afFormReset', () => {
        delete this.$dataProvider.getFieldData()[this.fieldName];
        this.initializeValue(false);
      });

      if (this.$defn.search_operator) {
        this.search_operator = this.$defn.search_operator;
      }

      this.fieldOptions = this.$defn.options || null;

      // Ensure boolean options are truly boolean

      // is_primary field - watch others in this afRepeat block to ensure only one is selected
      if (this.fieldName === 'is_primary' && 'repeatIndex' in this.$dataProvider) {
        this.fieldOptions = [{id: true, label: ''}];
      }

      // ChainSelect - watch control field & reload options as needed
      if (this.$defn.input_type === 'ChainSelect' && this.$defn.input_attrs.control_field) {
        const controlField = namePrefix + this.$defn.input_attrs.control_field;

        this.dataProvider.addEventListener('change', () => {
          const val = this.$dataProvider.getFieldData()[controlField];

          // After switching option list, remove invalid options
          const validateValue = () => {
            const options = this.getOptions();
            let value = this.$dataProvider.getFieldData()[this.fieldName];

            if (Array.isArray(value)) {
              // Remove invalid options from value array
              value.splice(0, value.length, ...value.filter((item) =>
                options.some((option) => option.id == item)
              ));
            }
            else {
              // Unset single value if invalid
              if (value && !options.some(option => option.id == value)) {
                value = '';
              }
              // Hack: Because the option list changed, Select2 sometimes fails to update the value.
              // Manual updates like this shouldn't be necessary with ngModel binding, but can't find a better fix yet:
              // See https://lab.civicrm.org/dev/core/-/issues/5415
              $(this.querySelector('input[crm-ui-select]')).val(value).change();
            }
          }

          if (val && (typeof val === 'number' || val.length)) {
            $(this.querySelector('input[crm-ui-select]')).addClass('loading').prop('disabled', true);
            const params = {
              name: this.$afFieldset.getFormName(),
              modelName: this.$afFieldset.getName(),
              fieldName: this.fieldName,
              joinEntity: this.$afJoin ? this.$afJoin.entity : null,
              values: this.$dataProvider.getFieldData()
            };
            CRM.api4('Afform', 'getOptions', params)
              .then((data) => {
                $(this.querySelector('input[crm-ui-select]')).removeClass('loading').prop('disabled', !data.length);
                this.fieldOptions = data;
                validateValue();
              });
          } else {
            this.fieldOptions = null;
            validateValue();
          }
        });
      }

      // Dynamic foreign key
      if (this.$defn.input_type === 'EntityRef' && this.$defn.dfk_entities && this.$defn.input_attrs.control_field) {
        const controlField = namePrefix + this.$defn.input_attrs.control_field;

        this.dataProvider.addEventListener('change', (e) => {
          const val = this.$dataProvider.getFieldData()[controlField];
          if (val && val.length) {
            if (Array.isArray(val)) {
              this.fkEntity = this.defn.dfk_entities[val[0]];
            } else {
              this.fkEntity = this.defn.dfk_entities[val];
            }
          } else {
            this.fkEntity = null;
          }
        });
      }
    }

    // Sets field value dynamically based on route parameters
    // Note: routeParams might come from the url, or they could be passed via a modal popup
    setValueFromRouteParams(routeParams) {
      if (!routeParams) {
        return;
      }
      // Unique field name = entity_name index . join . field_name
      const entityName = this.$afFieldset.getName();
      const joinEntity = this.$afJoin ? this.$afJoin.entity : null;
      let uniquePrefix = '';
      if (entityName) {
        const index = this.getEntityIndex();
        uniquePrefix = entityName + (index ? index + 1 : '') + (joinEntity ? '.' + joinEntity : '') + '.';
      }
      // Set default value from url with uniquePrefix + fieldName
      if ((uniquePrefix + this.fieldName) in routeParams) {
        this.setValue(routeParams[uniquePrefix + this.fieldName]);
      }
      // Set default value from url with fieldName only
      else if (this.fieldName in routeParams) {
        this.setValue(routeParams[this.fieldName]);
      }
      else if (routeParams._s) {
        this.setValue(this.$afFieldset.getSearchParamSetFieldValue(this.fieldName));
      }
    }

    initializeValue(firstLoad) {
      // Set default value if specified. Note that setValueFromUrl() will override this.
      if (firstLoad && this.$afFieldset.getStoredValue(this.fieldName) !== undefined) {
        this.setValue(this.$afFieldset.getStoredValue(this.fieldName));
      }
      // Set default value based on field defn
      else if ('afform_default' in this.$defn) {
        this.setValue(this.$defn.afform_default);
      }

      if (this.$defn.search_range) {
        // Initialize value as object unless using relative date select
        const initialVal = this.$dataProvider.getFieldData()[this.fieldName];
        if (!Array.isArray(this.$dataProvider.getFieldData()[this.fieldName]) &&
          (this.$defn.input_type !== 'Select' || !this.$defn.is_date || initialVal === '{}')
        ) {
          this.$dataProvider.getFieldData()[this.fieldName] = {};
        }
        // Initialize inputAttrs (only used for datePickers at the moment)
        if (this.$defn.is_date) {
          this.inputAttrs.push(this.$defn.input_attrs || {});
          for (let i = 1; i <= 2; ++i) {
            const attrs = _.cloneDeep(this.$defn.input_attrs || {});
            attrs.placeholder = attrs['placeholder' + i];
            attrs.timePlaceholder = attrs['timePlaceholder' + i];
            this.inputAttrs.push(attrs);
          }
        }
      }
    }


    // correct the type for the value, make sure numbers are numbers and not string
    correctValueType(value, dataType) {
      // let's skip type correction for null values
      if (value === null) {
        return value;
      }

      // if value is a number than change it to number
      if (Array.isArray(value)) {
        return value.map((val) => this.correctValueType(val, dataType));
      } else if (dataType === 'Integer' || dataType === 'Float') {
        return Number(value);
      } else if (dataType === 'Boolean') {
        return (value == 1);
      }
      return value;
    }

    isMultiple() {
      return (
        (['Select', 'EntityRef', 'ChainSelect'].includes(this.$defn.input_type) && this.$defn.input_attrs.multiple) ||
        ((this.$defn.input_type === 'CheckBox' || this.$defn.input_type === 'Toggle') && this.$defn.data_type !== 'Boolean') ||
        ((this.$defn.input_type === 'Hidden' || this.$defn.input_type === 'DisplayOnly') && (this.$defn.serialize || this.$defn.data_type === 'Array'))
      );
    };

    // Set default value; ensure data type matches input type
    setValue(value) {
      // For values passed from the url, split
      if (typeof value === 'string' && this.isMultiple()) {
        value = value.split(',');
      }
      // When reloading values for fields with operators, the stored value is an object "operator"
      if (typeof value === 'object' && value !== null && this.search_operator) {
        // if the operator is a user select, load from the passed value
        // (we expect the value to be an Object with a single key)
        if (this.$defn.expose_operator) {
          this.search_operator = Object.keys(value)[0];
        }
        value = value[this.search_operator] ? value[this.search_operator] : null;
      }
      // Support "Select Current User" default
      if (this.$defn.input_type === 'EntityRef' && ['Contact', 'Individual'].includes(this.fkEntity) && value === 'user_contact_id') {
        value = CRM.config.cid;
      }
      // correct the value type
      if (this.$defn.input_type !== 'DisplayOnly') {
        value = correctValueType(value, this.$defn.data_type);
      }

      if (this.$defn.input_type === 'Date' && typeof value === 'string' && value.startsWith('now')) {
        value = getRelativeDate(value, this.$defn.input_attrs.time);
      }
      if (this.$defn.input_type === 'Number' && this.$defn.search_range) {
        if (!_.isPlainObject(value)) {
          value = {
            '>=': +(('' + value).split('-')[0] || 0),
            '<=': +(('' + value).split('-')[1] || 0),
          };
        }
      } else if (this.$defn.input_type === 'Number') {
        value = Number(value);
      }
      // Initialze search range unless the field also has options (as in a date search) and
      // the default value is a valid option.
      else if (this.$defn.search_range && !_.isPlainObject(value) &&
        !(this.$defn.options && this.$defn.options.some((option) => option.id === value))
      ) {
        value = {
          '>=': ('' + value).split('-')[0],
          '<=': ('' + value).split('-')[1] || '',
        };
      }
      this.getSetValue(value);
    }

    // Get the repeat index of the entity fieldset (not the join)
    getEntityIndex() {
      // If already in a join repeat, look up the outer repeat
      if ('repeatIndex' in this.$dataProvider && this.$dataProvider.afRepeat.getRepeatType() === 'join') {
        return this.$dataProvider.outerRepeatItem ? this.$dataProvider.outerRepeatItem.repeatIndex : 0;
      } else {
        return this.afRepeatItem ? this.afRepeatItem.repeatIndex : 0;
      }
    };

    isReadonly() {
      if (this.$defn.input_attrs && this.$defn.input_attrs.autofill && !this.afJoin) {
        return this.afFieldset.getEntity().actions[this.$defn.input_attrs.autofill] === false;
      }
      // TODO: Not actually used, but could be used if we wanted to render displayOnly
      // fields as more than just raw data. I think we probably ought to do so for entityRef fields
      // Since the ids are kind of meaningless. Making that change would require adding a function
      // to get the widget template rather than just concatenating the input_type into an ngInclude.
      return this.$defn.input_type === 'DisplayOnly';
    };

    isDisabled() {
      if (this.isReadonly()) {
        return true;
      }
      return this.$defn.input_type === 'EntityRef' && !this.fkEntity;
    };

    getDisplayValue(value) {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) {
        return '';
      }
      if (this.fieldOptions) {
        let keys = Array.isArray(value) ? value : [value];
        let options = this.fieldOptions.filter((option) => keys.includes(option.id));
        return options.map((option) => option.label).join(', ');
      }
      if (this.$defn.data_type === 'Date' || this.$defn.data_type === 'Timestamp') {
        try {
          return CRM.utils.formatDate(value, null, this.$defn.data_type === 'Timestamp');
        } catch (e) {
          return '';
        }
      }
      if (this.fkEntity) {
        // EntityRef fields: fetch label via API if not already present
        // This is async, so we return a placeholder and update later
        const ids = Array.isArray(value) ? value : [value];
        if (!this._entityLabels) {
          this._entityLabels = {};
        }
        // Call autocomplete api
        if (!(ids.join() in this._entityLabels)) {
          this._entityLabels[ids.join()] = null;
          const params = this.getAutocompleteParams();
          params.ids = ids;
          crmApi4(this.fkEntity, 'autocomplete', params)
            .then((result) => {
              // Join all labels
              this._entityLabels[ids.join()] = result.map((item) => item.label).join(', ');
            });
        }
        return this._entityLabels[ids.join()] || ts('Loading...');
      }
      return value;
    };

    // onChange callback from Existing entity field
    onSelectEntity() {
      if (this.$defn.input_attrs && this.$defn.input_attrs.autofill) {
        const val = this.getSetSelect();
        const entity = this.afFieldset.modelName;
        const entityIndex = this.getEntityIndex();
        const joinEntity = this.afJoin ? this.afJoin.entity : null;
        const joinIndex = this.afJoin && this.$dataProvider.repeatIndex || 0;
        this.afFieldset.afFormCtrl.loadData(entity, entityIndex, val, this.$defn.name, joinEntity, joinIndex);
      }
    };

    // Params for the Afform.submitFile API when uploading a file field
    getFileUploadParams() {
      return {
        modelName: this.afFieldset.getName(),
        fieldName: this.fieldName,
        joinEntity: this.afJoin ? this.afJoin.entity : null,
        entityIndex: this.getEntityIndex(),
        joinIndex: this.afJoin && this.$dataProvider.repeatIndex || null
      };
    };

    getAutocompleteParams() {
      let fieldName = this.afFieldset.getName();
      // Append join name which will be unpacked by AfformAutocompleteSubscriber::processAfformAutocomplete
      if (this.afJoin) {
        fieldName += '+' + this.afJoin.entity;
      }
      fieldName += ':' + this.fieldName;
      return {
        formName: 'afform:' + this.afFieldset.getFormName(),
        fieldName: fieldName,
        values: this.$dataProvider.getFieldData()
      };
    };

    getOptions() {
      return this.fieldOptions;
    };

    select2Options() {
      return {
        results: _.transform(this.getOptions(), function(result, opt) {
          result.push({id: opt.id, text: opt.label});
        }, [])
      };
    };

    onChangeOperator = function() {
      this.$dataProvider.getFieldData()[this.fieldName] = {};
    }

    // Getter/Setter function for most fields (except select & entityRef)
    get value() {
      if (!this.$dataProvider) {
        return;
      }
      const currentVal = this.$dataProvider.getFieldData()[this.fieldName];
      if (this.search_operator) {
        return (currentVal || {})[this.search_operator];
      }
      return currentVal;
    }

    // Getter/Setter function for most fields (except select & entityRef)
    set value(val) {
      if (!this.$dataProvider) {
        return;
      }
      const currentVal = this.$dataProvider.getFieldData()[this.fieldName];
      if (this.search_operator) {
        if (typeof currentVal !== 'object') {
          this.$dataProvider.getFieldData()[this.fieldName] = {};
        }
        return (this.$dataProvider.getFieldData()[this.fieldName][this.search_operator] = val);
      }
      return (this.$dataProvider.getFieldData()[this.fieldName] = val);
    }

    // Getter/Setter function for fields of type select or entityRef.
    // Setter - transform raw string/array from Select2 into correct data type
    setSelect(val) {
      if (!this.$dataProvider) {
        return;
      }
      const currentVal = this.$dataProvider.getFieldData()[this.fieldName];
      if (this.$defn.is_date) {
        // The '{}' string is a placeholder for "choose date range"
        if (val === '{}') {
          val = !_.isPlainObject(currentVal) ? {} : currentVal;
        }
      }
      // If search_range, this select is the "low" value (the high value uses ng-model without a getterSetter fn)
      else if (this.$defn.search_range) {
        return (this.$dataProvider.getFieldData()[this.fieldName]['>='] = val);
      }
      else if (this.search_operator) {
        if (typeof currentVal !== 'object') {
          this.$dataProvider.getFieldData()[this.fieldName] = {};
        }
        return (this.$dataProvider.getFieldData()[this.fieldName][this.search_operator] = val);
      }
      if (this.$defn.data_type === 'Boolean') {
        return (this.$dataProvider.getFieldData()[this.fieldName] = (val === 'true'));
      }
      if (this.$defn.data_type === 'Integer' || this.$defn.data_type === 'Float') {
        if (typeof val === 'string') {
          return (this.$dataProvider.getFieldData()[this.fieldName] = val.length ? Number(val) : null);
        } else if (Array.isArray(val)) {
          return (this.$dataProvider.getFieldData()[this.fieldName] = val.map(Number));
        }
      }
      return (this.$dataProvider.getFieldData()[this.fieldName] = val);
    }

    // Getter - transform data into a simple string or array for Select2
    getSelect() {
      if (!this.$dataProvider) {
        return;
      }
      const currentVal = this.$dataProvider.getFieldData()[this.fieldName];
      if (this.$defn.is_date) {
        return _.isPlainObject(currentVal) ? '{}' : currentVal;
      }
      // If search_range, this select is the "low" value (the high value uses ng-model without a getterSetter fn)
      else if (this.$defn.search_range) {
        return currentVal['>='];
      }
      else if (this.search_operator) {
        return (currentVal || {})[this.search_operator];
      }
      // Convert false to "false" and 0 to "0"
      else if (!this.isMultiple() && (typeof currentVal === 'boolean' || typeof currentVal === 'number')) {
        return JSON.stringify(currentVal);
      }
      return currentVal;
    }
  }

  window.customElements.define('af-field', AfField);

  // this is a very minimal angular component to allow using existing input_type templates
  // TODO: rework each input type as its own component using a clear interface with af-field
  angular.module('af').component('afFieldInput', {
    bindings: {
      defn: '='
    },
    template: '<div ng-include="$ctrl.defn.template"></div>',
    controller: function($scope, $element, crmApi4, $timeout) {

      this.$onInit = () => {
        const afField = $element[0].closest('af-field');
        // add some functions from the component to the angular scope
        this.isMultiple = () => afField.isMultiple();
        $scope.dataProvider = afField.$dataProvider;

        $scope.getSetValue = function (val) {
          return arguments.length ? afField.value = val : afField.value;
        };
        $scope.getSetSelect = function (val) {
          return arguments.length ? afField.setSelect(val) : afField.getSelect();
        }
        $scope.select2Options = () => afField.select2Options();

        // Wait for parent controllers to initialize
        $timeout(() => {
          afField.initializeValue(true);
          $scope.$watch('$parent.routeParams', () => afField.setValueFromRouteParams());
        });
      }

    }
  });
})(angular, CRM._, CRM.$);