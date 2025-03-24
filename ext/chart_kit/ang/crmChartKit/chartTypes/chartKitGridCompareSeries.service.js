(function (angular, $, _, dc) {
    "use strict";

    // common renderer for line/bar/area charts, which will stack by default
    // (compare with composite chart, where each column can be line/bar/area )
    angular.module('crmChartKit').factory('chartKitGridCompareSeries', () => ({
        adminTemplate: '~/crmChartKit/chartTypes/chartKitGridCompareSeries.html',

        getInitialDisplaySettings: () => ({
          showLegend: 'right',
          seriesDisplayType: 'line',
        }),

        hasCoordinateGrid: true,

        getAxes: () => ({
            'x': {
                label: ts('X-Axis'),
                scaleTypes: ['date', 'numeric', 'categorical'],
                isDimension: true,
            },
            'w': {
                label: ts('Grouping'),
                scaleTypes: ['categorical'],
                isDimension: true,
            },
            'y': {
                label: ts('Value'),
                sourceDataTypes: ['Integer', 'Money', 'Boolean'],
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

        // the legend gets the series "name", which is the delisted value of the series column
        legendTextAccessor: (displayCtrl) => ((d) => displayCtrl.renderDataValue(d.name, displayCtrl.getFirstColumnForAxis('w'))),

        getChartConstructor: () => dc.seriesChart,

        loadChartData: (displayCtrl) => {
            displayCtrl.chart.chart((displayCtrl.settings.seriesDisplayType === 'bar') ? dc.barChart : dc.lineChart);

            const xCol = displayCtrl.getFirstColumnForAxis('x');
            const wCol = displayCtrl.getFirstColumnForAxis('w');
            const yCol = displayCtrl.getFirstColumnForAxis('y');

            displayCtrl.chart
                .dimension(displayCtrl.dimension)
                .group(displayCtrl.group)
                .valueAccessor(displayCtrl.getValueAccessor(yCol))
                .keyAccessor(displayCtrl.getValueAccessor(xCol))
                .seriesAccessor(displayCtrl.getValueAccessor(wCol));

            displayCtrl.buildCoordinateGridIfAny();
        }
    }));
})(angular, CRM.$, CRM._, CRM.chart_kit.dc);

