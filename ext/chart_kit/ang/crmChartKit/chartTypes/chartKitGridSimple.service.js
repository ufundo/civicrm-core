(function (angular, $, _, dc) {
    "use strict";

    // common renderer for line/bar/area charts, which will stack by default
    // (compare with composite chart, where each column can be line/bar/area )
    angular.module('crmChartKit').factory('chartKitGridSimple', () => ({
        adminTemplate: '~/crmChartKit/chartTypes/chartKitGridSimple.html',

        getInitialDisplaySettings: () => ({}),

        hasCoordinateGrid: true,

        getAxes: () => ({
            'x': {
                label: ts('X-Axis'),
                scaleTypes: ['date', 'numeric', 'categorical'],
                isDimension: true,
            },
            'y': {
                key: 'y',
                label: ts('Values'),
                sourceDataTypes: ['Integer', 'Money', 'Boolean', 'Float', 'Double'],
            },
            'z': {
                label: ts('Additional Labels'),
                dataLabelTypes: ['label', 'title'],
                prepopulate: false,
                multiColumn: true,
            }
        }),

        getChartConstructor: (displayCtrl) => {
            switch (displayCtrl.settings.displayType) {
                case 'area':
                    return (c) => dc.lineChart(c).renderArea(true);
                case 'bar':
                    return dc.barChart;
                case 'line':
                default:
                    return dc.lineChart;
            }
        }
    }));
})(angular, CRM.$, CRM._, CRM.chart_kit.dc);