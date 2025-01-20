(function (angular, $, _, dc) {
    "use strict";

    // common renderer for line/bar/area charts, which will stack by default
    // (compare with composite chart, where each column can be line/bar/area )
    angular.module('crmChartKit').factory('chartKitGridStackSeries', () => ({
        adminTemplate: '~/crmChartKit/chartTypes/chartKitGridStackSeries.html',

        getInitialDisplaySettings: () => ({}),

        getAxes: function () {
            return ({
                'x': {
                    label: ts('X-Axis'),
                    scaleTypes: ['date', 'numeric', 'categorical'],
                    reduceTypes: []
                },
                'w': {
                    label: ts('Grouping'),
                    scaleTypes: ['categorical'],
                    reduceTypes: ['list'],
                },
                'y': {
                    key: 'y',
                    label: ts('Values'),
                    sourceDataTypes: ['Integer', 'Money', 'Boolean'],
                },
                'z': {
                    label: ts('Additional Labels'),
                    dataLabelTypes: ['label', 'title'],
                    prepopulate: false,
                    multiColumn: true,
                }
            });
        },

        buildDimension: (displayCtrl) => {
            const xCol = displayCtrl.getFirstColumnForAxis('x');
            if (!xCol) {
                return;
            }

            // get series col if any
            const seriesCol = displayCtrl.getFirstColumnForAxis('w');

            // we need to add the series values in the dimension or they will get
            // aggregated
            displayCtrl.dimension = displayCtrl.ndx.dimension((d) => {
                const xValue = d[xCol.index];
                const seriesVal = seriesCol ? d[seriesCol.index] : null;

                // we used to use a string separator rather than array to
                // not corrupt ordering on xValue
                // TODO: ?
                return [xValue, seriesVal];
            });
        },

        getCoordinateGridAxes: () => ['x', 'y'],

        showLegend: (displayCtrl) => (
            displayCtrl.getColumnsForAxis('w').length &&
            displayCtrl.settings.showLegend &&
            displayCtrl.settings.showLegend !== 'none'),

        getChartConstructor: (displayCtrl) => (displayCtrl.settings.chartType === 'bar') ? dc.barChart : dc.lineChart,

        loadChartData: (displayCtrl) => {
            displayCtrl.chart
                .dimension(displayCtrl.dimension);

            const yColumn = displayCtrl.getFirstColumnForAxis('y');

            if (!yColumn) {
                return;
            }

            const yValueAccessor = displayCtrl.getValueAccessor(yColumn);

            const wColumn = displayCtrl.getFirstColumnForAxis('w');

            if (!wColumn) {
                displayCtrl.chart.group(displayCtrl.group, yValueAccessor);
            } else {
                // for a specific value of W, we want a new value accessor which returns the
                // y value for that datapoint if the w value matches, otherwise is 0
                const crossedValueAccessor = (w) => (
                    (d) => (d.key[1] === w) ? yValueAccessor(d) : 0
                );

                // wValues are list reduced - so the column total is the list of all values
                // that appear in the dataset
                const wValues = displayCtrl.columnTotals[wColumn.index];

                wValues.forEach((w, i) => {
                    if (i === 0) {
                      displayCtrl.chart.group(displayCtrl.group, displayCtrl.renderDataValue(w, wColumn), crossedValueAccessor(w))
                    } else {
                      displayCtrl.chart.stack(displayCtrl.group, displayCtrl.renderDataValue(w, wColumn), crossedValueAccessor(w))
                    }
                });

                // we need to plot using the x axis from the keys
                displayCtrl.chart.keyAccessor((d) => d.key[0]);
            }

            displayCtrl.chart.hidableStacks(true)
            // displayCtrl.chart.colors(displayCtrl.buildColumnColorScale(yColumns));

            if (displayCtrl.settings.chartType === 'area') {
                // chart should be a line chart by this point
                displayCtrl.chart.renderArea(true);
            }
        }
    }));
})(angular, CRM.$, CRM._, CRM.chart_kit.dc);

