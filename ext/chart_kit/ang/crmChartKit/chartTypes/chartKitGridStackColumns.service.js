(function (angular, $, _, dc) {
    "use strict";

    // common renderer for line/bar/area charts, which will stack by default
    // (compare with composite chart, where each column can be line/bar/area )
    angular.module('crmChartKit').factory('chartKitGridStackColumns', () => ({
        adminTemplate: '~/crmChartKit/chartTypes/chartKitGridStackColumns.html',

        getInitialDisplaySettings: () => ({}),

        getAxes: function () {
            return ({
            'x': {
                label: ts('X-Axis'),
                scaleTypes: ['date', 'numeric', 'categorical'],
                reduceTypes: []
            },
            'y': {
                key: 'y',
                label: ts('Values'),
                sourceDataTypes: ['Integer', 'Money', 'Boolean', 'Float', 'Double'],
                multiColumn: true,
                colorType: 'one-per-column',
            },
            'z': {
                label: ts('Additional Labels'),
                dataLabelTypes: ['label', 'title'],
                prepopulate: false,
                multiColumn: true,
            }
          });
        },

        getCoordinateGridAxes: () => ['x', 'y'],

        showLegend: (displayCtrl) => (
            displayCtrl.getColumnsForAxis('y').length > 1 &&
            displayCtrl.settings.showLegend &&
            displayCtrl.settings.showLegend !== 'none'
        ),

        getChartConstructor: (displayCtrl) => (displayCtrl.settings.chartType === 'bar') ? dc.barChart : dc.lineChart,

        loadChartData: (displayCtrl) => {
            displayCtrl.chart
                .dimension(displayCtrl.dimension);

            const yAxisColumns = displayCtrl.getColumnsForAxis('y');

            // group the first and then stack additional y columns
            yAxisColumns.forEach((col, i) => {
                if (i === 0) {
                  displayCtrl.chart.group(displayCtrl.group, col.label, displayCtrl.getValueAccessor(col))
                } else {
                  displayCtrl.chart.stack(displayCtrl.group, col.label, displayCtrl.getValueAccessor(col))
                }
            });

            displayCtrl.chart.colors(displayCtrl.buildColumnColorScale(yAxisColumns));

            if (displayCtrl.settings.chartType === 'area') {
                // chart should be a line chart by this point
                displayCtrl.chart.renderArea(true);
            }
        }
    }));
})(angular, CRM.$, CRM._, CRM.chart_kit.dc);