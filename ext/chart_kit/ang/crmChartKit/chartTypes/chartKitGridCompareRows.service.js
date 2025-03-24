(function (angular, $, _, dc) {
    "use strict";

    // common renderer for line/bar/area charts, which will stack by default
    // (compare with composite chart, where each column can be line/bar/area )
    angular.module('crmChartKit').factory('chartKitGridCompareRows', () => ({
        adminTemplate: '~/crmChartKit/chartTypes/chartKitGridCompareRows.html',

        getInitialDisplaySettings: () => ({
          showLegend: 'right',
        }),

        hasCoordinateGrid: true,

        getAxes: () => ({
            'x': {
                label: ts('X-Axis'),
                scaleTypes: ['date', 'numeric', 'categorical'],
                isDimension: true,
            },
            'y': {
              label: ts('Value'),
              sourceDataTypes: ['Integer', 'Money', 'Boolean'],
              // TODO: support average/percentage aggregators with series
              reduceTypes: ['sum', 'count']
            },
            'w': {
                label: ts('Grouping'),
                scaleTypes: ['categorical'],
                reduceTypes: ['list'],
                isDimension: true,
                prepopulate: false,
            },
            // TODO: fix additional labels for compare series
            //'z': {
            //  label: ts('Additional labels'),
            //  dataLabelTypes: ['title', 'label'],
            //  multiColumn: true,
            //  prepopulate: false,
            //}
        }),

        showLegend: (displayCtrl) => (displayCtrl.settings.showLegend && displayCtrl.settings.showLegend !== 'none'),

        getChartConstructor: () => dc.seriesChart,

        loadChartData: (displayCtrl) => {
            displayCtrl.chart.chart((displayCtrl.settings.displayType === 'bar') ? dc.barChart : dc.lineChart);

            const xCol = displayCtrl.getFirstColumnForAxis('x');
            const wCol = displayCtrl.getFirstColumnForAxis('w');
            const yCol = displayCtrl.getFirstColumnForAxis('y');

            displayCtrl.chart
                .dimension(displayCtrl.dimension)
                .group(displayCtrl.group)
                .valueAccessor(yCol.getDataValue)
                .keyAccessor((d) => parseFloat(xCol.getDataValue(d)[0]))
                .seriesAccessor(wCol.getRenderedValue)

            displayCtrl.buildCoordinateGrid();
        }
    }));
})(angular, CRM.$, CRM._, CRM.chart_kit.dc);

