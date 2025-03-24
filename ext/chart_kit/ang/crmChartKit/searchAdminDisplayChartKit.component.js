(function (angular, $, _) {
    "use strict";

    angular.module('crmChartKit').component('searchAdminDisplayChartKit', {
        bindings: {
            display: '<',
            apiEntity: '<',
            apiParams: '<'
        },
        require: {
            parent: '^crmSearchAdminDisplay',
            crmSearchAdmin: '^crmSearchAdmin'
        },
        templateUrl: '~/crmChartKit/searchAdminDisplayChartKit.html',
        controller: function ($scope, searchMeta, chartKitColumnConfig, chartKitChartTypes) {
            const ts = $scope.ts = CRM.ts('chart_kit');

            this.getColumnSlots = () => this.display.settings.columns.map((col, colIndex) => {
              // add canonical index for keeping track of oclumns
              col.index = colIndex;
              return col;
            });

            // often we only want the columns which have a source field set
            this.getColumns = () => this.getColumnSlots().filter((col) => col.key);

            this.getColumnsForAxis = (axisKey) => this.getColumns().filter((col) => col.axis === axisKey);

            this.initChartTypeSettings = () => {
              this.chartTypeSettings = chartKitChartTypes.chartTypeSettings;

              this.headerSettings = [{
                key: 'displayType',
                label: ts('Chart Type'),
                options: this.chartTypeSettings.displayType
              }];
            };


            this.getInitialDisplaySettings = () => ({
                columns: [],
                format: {
                    labelColor: '#000000',
                    backgroundColor: '#f2f2ed',
                    height: 480,
                    width: 700,
                    padding: {
                        outer: 10,
                        clip: 20,
                        top: 50,
                        bottom: 50,
                        left: 50,
                        right: 50,
                    }
                }
            });

            this.getInitialDisplaySettingsForChartType = () => this.chartType.getInitialDisplaySettings();

            this.getChartTypeAdminTemplate = () => this.chartType.adminTemplate;

            this.searchColumns = [];

            this.$onInit = () => {
                this.searchColumns = this.apiParams.select.map((col) => searchMeta.fieldToColumn(col, { label: true }));

                if (!this.display.settings) {
                  this.display.settings = {};
                }

                this.initChartTypeSettings();

                this.initChartType();

                $scope.$watch('$ctrl.display.settings', () => this.onSettingChange(), true);

            };

            this.onSettingChange = () => {
              this.initChartType();
            };

            this.initChartType = () => {
              this.chartType = chartKitChartTypes.getChartType(this.display.settings);

              if (!this.chartType) {
                return;
              }

              this.initAxesForChartType();
              this.initDisplaySettingsForChartType();
            };

            this.setSetting = (key, value) => {
              this.display.settings[key] = value;
            }

            this.hasChartType = () => !!this.chartType;

            this.getAxes = () => this.axes;

            this.getAxis = (axisKey) => this.axes[axisKey];

            this.initAxesForChartType = () => {
                const axes = this.chartType.getAxes();

                // merge axis defaults into the axes array
                Object.keys(axes).forEach((key) => {
                    axes[key] = Object.assign({}, chartKitColumnConfig.axisDefaults, axes[key]);
                });

                this.axes = axes;
            };


            this.initDisplaySettingsForChartType = () => {
                // TODO: some kind of deep merge so new settings are added to old charts at all levels
                const baseSettings = this.getInitialDisplaySettings();
                const typeSettings = this.getInitialDisplaySettingsForChartType();

                this.display.settings = Object.assign(
                    {},
                    baseSettings,
                    typeSettings,
                    this.display.settings
                );

                this.display.settings.format = Object.assign(
                    {},
                    baseSettings.format,
                    typeSettings.format,
                    this.display.settings.format
                );

                // populate starting column for each axis
                Object.keys(this.getAxes()).forEach(axisKey => {
                    if (!this.getAxis(axisKey).prepopulate) {
                        return;
                    }
                    if (this.getColumnSlots().some((col) => (col.axis === axisKey))) {
                        return;
                    }
                    this.initColumn(axisKey);
                });
            };

            this.getColumn = (index) => {
                return this.display.settings.columns[index];
            };


            this.getAxis = (axisKey) => {
                // merge in default axis options
                return this.getAxes()[axisKey];
            };

            this.getAxisLabel = (axisKey) => {
                return this.getAxis(axisKey).label;
            };

            this.getAxisSourceDataTypes = (axisKey) => {
                return this.getAxis(axisKey).sourceDataTypes;
            };

            this.getAxisScaleTypeOptions = (axisKey) => {
                return this.getAxis(axisKey).scaleTypes;
            };

            this.getAxisReduceTypeOptions = (axisKey) => {
                if (axisKey === 'x') {
                    return ['list'];
                }
                return this.getAxis(axisKey).reduceTypes;
            };

            this.getAxisDisplayTypeOptions = (axisKey) => {
                if (this.display.settings.displayType !== 'mixed') {
                  return [this.display.settings.displayType];
                }
                return this.getAxis(axisKey).displayTypes;
            };

            this.getAxisDataLabelTypeOptions = (axisKey) => {
                return this.getAxis(axisKey).dataLabelTypes;
            };

            this.getAxisDataLabelFormatterOptions = (axisKey) => {
                return this.getAxis(axisKey).dataLabelFormatters;
            };

            this.getColumnSourceDataTypes = (col) => {
                return this.getAxisSourceDataTypes(col.axis);
            };

            this.getColumnSearchColumnOptions = (col) => {
                const allowedTypes = this.getColumnSourceDataTypes(col);

                if (!allowedTypes && allowedTypes != []) {
                    // all keys
                    return this.searchColumns.map((searchCol) => searchCol.key);
                }

                return this.searchColumns.filter((searchCol) => {
                    // hack: search kit reports option group columns as
                    // "Integer" data type - but for our purposes they
                    // shouldn't be used for numeric scales
                    if (searchCol.key.includes(':label')) {
                        searchCol.dataType = 'Option';
                    }
                    return allowedTypes.includes(searchCol.dataType);
                })
                    .map((searchCol) => searchCol.key);
            };

            this.getColumnSearchColumn = (col) => {
                return this.searchColumns.find((searchColumn) => (searchColumn.key === col.key));
            };

            this.getColumnSourceDataType = (col) => {
                const details = this.getColumnSearchColumn(col);
                return details ? details.dataType : null;
            };

            this.getColumnSourceDataTypeIsDate = (col) => {
                const dataType = this.getColumnSourceDataType(col);
                return dataType && ['Date', 'Time', 'Timestamp'].includes(dataType);
            };

            this.getColumnscaleTypeOptions = (col) => {
                let options = this.getAxisScaleTypeOptions(col.axis);

                // date is only valid if the column type is date
                if (this.getColumnSourceDataTypeIsDate(col)) {
                    options = options.filter((item) => ['date', 'categorical'].includes(item));
                } else if (this.getColumnSourceDataType(col) === 'String') {
                    options = options.filter((item) => item === 'categorical');
                } else {
                    options = options.filter((item) => item !== 'date');
                }
                // this is a bit hacky, but if option groups can be categorical, they
                // probably should be
                if (col.key && col.key.includes(':label') && options.includes('categorical')) {
                    return ['categorical'];
                }
                return options;
            };

            this.getColumnDatePrecisionOptions = (col) => {
                if (this.getColumnSourceDataTypeIsDate(col)) {
                    return chartKitColumnConfig.configOptions.datePrecision.map((option) => option.key);
                }
                return [];
            };

            this.getColumnReduceTypeOptions = (col) => {
                let options = this.getAxisReduceTypeOptions(col.axis);

                switch (col.scaleType) {
                    case 'categorical':
                    case 'date':
                        options = options.filter((item) => ['count', 'list'].includes(item));
                        break;
                }

                return options;
            };

            this.getColumnDisplayTypeOptions = (col) => {
                return this.getAxisDisplayTypeOptions(col.axis);
            };

            this.getColumnDataLabelTypeOptions = (col) => {
                return this.getAxisDataLabelTypeOptions(col.axis);
            };

            this.getColumnDataLabelFormatterOptions = (col) => {
                const options = this.getAxisDataLabelFormatterOptions(col.axis);

                // categorical will often be rendered to string, which
                // dont like being formatted
                if (col.scaleType === 'categorical') {
                    return ['none', 'round', 'formatMoney'];
                }
                // default to money for money columns
                if (col.sourceDataType === 'Money') {
                    return ['formatMoney', 'round', 'none'];
                }

                if (col.scaleType === 'date') {
                    // TODO support fancy date formatting?
                    return ['none'];
                }

                return options;
            };

            this.onColumnSearchColumnChange = (colIndex) => {
                const col = this.getColumn(colIndex);

                const selectedFieldDetails = this.getColumnSearchColumn(col);
                if (selectedFieldDetails) {
                    this.display.settings.columns[colIndex].label = selectedFieldDetails.label;
                    this.display.settings.columns[colIndex].sourceDataType = selectedFieldDetails.dataType;
                }

                // check for reduce/data/label types and pick the first if available
                // otherwise set null
                this.getColumnConfigKeys().forEach((configKey) => {
                    if (configKey === 'searchColumn') {
                        // this is what's just been changed, so dont touch
                        return;
                    }
                    const optionKeys = this.getColumnConfigOptionKeys(col, configKey);
                    this.display.settings.columns[colIndex][configKey] = optionKeys.length ? optionKeys[0] : null;
                });
            };

            this.getAxisColumnSlots = (axisKey) => {
                const axis = this.getAxis(axisKey);

                let axisSlots = this.getColumnSlots().filter((col) => col.axis === axisKey);

                // only display first column for single col
                if (!axis.multiColumn) {
                    axisSlots = axisSlots.slice(0, 1);
                }

                return axisSlots;
            };

            this.getColumnConfigOptionKeys = (col, configKey) => this.getColumnConfigOptionGetters()[configKey](col);

            this.getColumnConfigOptionDetails = (col, configKey) => this.getColumnConfigOptionKeys(col, configKey)
                .map((optionKey) => this.getOptionDetailsForKey(configKey, optionKey))
                .filter((details) => !!details);

            this.getAllOptionDetails = (configKey) => {
                if (configKey === 'searchColumn') {
                    return this.searchColumns;
                }
                return chartKitColumnConfig.configOptions[configKey];
            };

            this.getOptionDetailsForKey = (configKey, optionKey) => this.getAllOptionDetails(configKey).find((option) => option.key === optionKey);

            this.getColumnConfigOptionGetters = () => ({
                searchColumn: this.getColumnSearchColumnOptions,
                scaleType: this.getColumnscaleTypeOptions,
                datePrecision: this.getColumnDatePrecisionOptions,
                reduceType: this.getColumnReduceTypeOptions,
                displayType: this.getColumnDisplayTypeOptions,
                dataLabelType: this.getColumnDataLabelTypeOptions,
                dataLabelFormatter: this.getColumnDataLabelFormatterOptions
            });

            this.getColumnConfigKeys = () =>  Object.keys(this.getColumnConfigOptionGetters());

            this.initColumn = (axisKey) => {
                // add new column for this axis
                this.display.settings.columns.push({
                    axis: axisKey,
                    key: null,
                });

                const colIndex = this.display.settings.columns.length - 1;

                let searchColumnOptions = this.getColumnSearchColumnOptions(this.getColumn(colIndex));

                // filter options for data keys already used
                const alreadyUsedKeys = this.getColumns().map((col) => col.key);
                searchColumnOptions = searchColumnOptions.filter((key) => !alreadyUsedKeys.includes(key));

                // if there are any left, set the first
                this.display.settings.columns[colIndex].key = searchColumnOptions.length ? searchColumnOptions[0] : null;

                // trigger loading column settings
                this.onColumnSearchColumnChange(colIndex);
            };

            this.removeColumn = (colIndex) => {
                this.display.settings.columns.splice(colIndex, 1);
            };

        }
    });
})(angular, CRM.$, CRM._);
