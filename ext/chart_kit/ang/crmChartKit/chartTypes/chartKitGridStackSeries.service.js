(function (angular, $, _, dc) {
    "use strict";

    // common renderer for line/bar/area charts, which will stack by default
    // (compare with composite chart, where each column can be line/bar/area )
    angular.module('crmChartKit').factory('chartKitGridStackSeries', () => ({
        adminTemplate: '~/crmChartKit/chartTypes/chartKitGridStackSeries.html',

        getInitialDisplaySettings: () => ({}),

        getAxes: () => ({
          'x': {
              label: ts('X-Axis'),
              scaleTypes: ['date', 'numeric', 'categorical'],
              reduceTypes: [],
              isGridAxis: true,
              isDimension: true,
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
              isGridAxis: true,
          },
          // TODO: supporting reduce types for additional labels is complicated
          // because we build the group differently
          // 'z': {
          //     label: ts('Additional Labels'),
          //     dataLabelTypes: ['label', 'title'],
          //     prepopulate: false,
          //     multiColumn: true,
          // }
        }),

        showLegend: (displayCtrl) => displayCtrl.settings.showLegend &&
            displayCtrl.settings.showLegend !== 'none',

        getChartConstructor: (displayCtrl) => (displayCtrl.settings.chartType === 'bar') ? dc.barChart : dc.lineChart,

        buildGroup: (displayCtrl) => {
            // get cols we need
            const yColumn = displayCtrl.getFirstColumnForAxis('y');
            const wColumn = displayCtrl.getFirstColumnForAxis('w');

            if (!yColumn || !wColumn) {
                return;
            }

            const cols = displayCtrl.getColumnsWithReducers();

            // we have to add an extra depth to the reduction of the y column
            const reduceAdd = (p, v) => cols.map((col) => {
                if (col.axis === 'y') {
                  const w = v[wColumn.index];
                  const yValue = p[col.index];

                  if (!(w in yValue)) {
                      yValue[w] = col.reducer.start();
                  }

                  yValue[w] = col.reducer.add(yValue[w], v[col.index]);
                  return yValue;
                }
                return col.reducer.add(p[col.index], v[col.index]);
            });
            const reduceSub = (p, v) => cols.map((col) => {
                if (col.axis === 'y') {
                  const w = v[wColumn.index];
                  const yValue = p[col.index];

                  yValue[w] = col.reducer.sub(yValue[w], v[col.index]);
                  return yValue;
                }
                return col.reducer.sub(p[col.index], v[col.index]);
            });
            const reduceStart = () => cols.map((col) => {
                if (col.axis === 'y') {
                    return {};
                }
                return col.reducer.start();
            });

            displayCtrl.group = displayCtrl.dimension.group().reduce(reduceAdd, reduceSub, reduceStart);

            // find totals in each column
            displayCtrl.columnTotals = displayCtrl.ndx.groupAll().reduce(reduceAdd, reduceSub, reduceStart).value();

            // the total for Y will be split by series. for calcs we might need to aggregate the overall total?
            // this might be tricksy depending on reduce type
            console.log(displayCtrl.columnTotals[yColumn.index]);

            const ySeriesTotals = Object.values(displayCtrl.columnTotals[yColumn.index]);

            const yGrandTotal = ySeriesTotals.reduce((a, b) => {
              switch (yColumn.reduceType) {
                  case 'list':
                    return a.concat(b);

                  case 'mean':
                    return [
                        a[0] + b[0],
                        a[1] + b[1]
                    ];

                  default:
                    return a + b;
              }
            });

            displayCtrl.columnTotals[yColumn.index] = yGrandTotal;
        },

        loadChartData: (displayCtrl) => {
            displayCtrl.chart.dimension(displayCtrl.dimension);

            // get cols we need
            const xColumn = displayCtrl.getFirstColumnForAxis('x');
            const yColumn = displayCtrl.getFirstColumnForAxis('y');
            const wColumn = displayCtrl.getFirstColumnForAxis('w');


            if (!xColumn || !yColumn || !wColumn) {
                return;
            }

            const yValueAccessor = displayCtrl.getValueAccessor(yColumn);

            // wValues are list reduced - so the column total is the list of all values
            // that appear in that column in the dataset
            const wValues = displayCtrl.columnTotals[wColumn.index];

            wValues.forEach((w, i) => {
                const seriesLabel = displayCtrl.renderDataValue(w, wColumn);
                const seriesValueAccessor = (d) => yValueAccessor(d)[w] ?? null;

                if (i === 0) {
                    displayCtrl.chart.group(displayCtrl.group, seriesLabel, seriesValueAccessor);
                } else {
                    displayCtrl.chart.stack(displayCtrl.group, seriesLabel, seriesValueAccessor);
                }
            });

            // we need to plot using the x axis from the keys
            //displayCtrl.chart.keyAccessor((d) => d.key);

            displayCtrl.chart.hidableStacks(true)

            if (displayCtrl.settings.chartType === 'area') {
                // chart should be a line chart by this point
                displayCtrl.chart.renderArea(true);
            }
        }
    }));
})(angular, CRM.$, CRM._, CRM.chart_kit.dc);

