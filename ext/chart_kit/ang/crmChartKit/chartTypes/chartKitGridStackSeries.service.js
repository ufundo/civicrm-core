(function (angular, $, _, dc) {
    "use strict";

    // common renderer for line/bar/area charts, which will stack by default
    // (compare with composite chart, where each column can be line/bar/area )
    angular.module('crmChartKit').factory('chartKitGridStackSeries', () => ({
        adminTemplate: '~/crmChartKit/chartTypes/chartKitGridStackSeries.html',

        getInitialDisplaySettings: () => ({}),

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
              reduceTypes: ['list'],
          },
          'y': {
              key: 'y',
              label: ts('Values'),
              sourceDataTypes: ['Integer', 'Money', 'Boolean'],
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

            const cols = displayCtrl.getColumns();

            const reduceAdd = (p, v) => {
                cols.forEach((col) => {
                  const w = v[wColumn.index];
                  const colValue = p[col.index];

                  if (!(w in colValue)) {
                      colValue[w] = col.reducer.start();
                  }

                  colValue[w] = col.reducer.add(colValue[w], v[col.index]);

                  p[col.index] = colValue;
                });
                return p;
            };
            const reduceSub = (p, v) => {
                cols.forEach((col) => {
                  const w = v[wColumn.index];
                  const colValue = p[col.index];

                  colValue[w] = col.reducer.sub(colValue[w], v[col.index]);
                  p[col.index] = colValue;
                });
                return p;
            };
            const reduceStart = () => {
                const p = {};
                cols.forEach((col) => {
                    p[col.index] = {};
                });
                return p;
            };

            displayCtrl.group = displayCtrl.dimension.group().reduce(reduceAdd, reduceSub, reduceStart);

            // find totals in each column
            const columnTotals = displayCtrl.ndx.groupAll().reduce(reduceAdd, reduceSub, reduceStart).value();

            // the totals will be split by series. for calcs we might need to aggregate the overall total?
            // this might be tricksy depending on reduce type
            displayCtrl.getColumns().forEach((col) => {
                const colTotalsBySeries = Object.values(columnTotals[col.index]);

                columnTotals[col.index] = colTotalsBySeries.reduce((a, b) => {
                  switch (col.reduceType) {
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

                if (col.reduceType === 'mean') {
                    columnTotals[col.index] = col.reducer.final(columnTotals[col.index]);
                }
            });

            displayCtrl.setColumnTotals(columnTotals);
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

            const yValueAccessor = yColumn.getDataValue;

            // wValues are list reduced - so the column total is the list of all values
            // that appear in that column in the dataset
            const seriesKeys = wColumn.total;

            const allSeries = seriesKeys.map((w) => ({key: w, label: wColumn.renderDataValue(w)}));

            allSeries.forEach((series, i) => {
                const seriesValueAccessor = (d) => yValueAccessor(d)[series.key] ?? null;

                if (i === 0) {
                    displayCtrl.chart.group(displayCtrl.group, series.label, seriesValueAccessor);
                } else {
                    displayCtrl.chart.stack(displayCtrl.group, series.label, seriesValueAccessor);
                }
            });

            // we also override getRenderedLabel on each column to account for our by series data points
            displayCtrl.getColumns().forEach((col) => {
              switch (col.axis) {
                case 'x':
                case 'w':
                  col.getRenderedValue = (d) => {
                    const valueBySeries = col.getDataValue(d) ?? {};
                    const allValues = Object.values(valueBySeries);
                    return col.renderDataValue(allValues);
                  };
                  break;
                default:
                  col.getRenderedValue = (d) => {
                    const dataValue = col.getDataValue(d);

                    return allSeries.map((series) => {
                      const renderedValue = col.renderDataValue(dataValue[series.key]);
                      if (renderedValue === null) {
                        return null;
                      }
                      return `${series.label}: ${renderedValue}`;
                    })
                    .filter((label) => !!label)
                    .join(' - ');
                  };
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

