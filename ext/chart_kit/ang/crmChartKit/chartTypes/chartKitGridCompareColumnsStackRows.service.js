(function (angular, $, _, dc) {
  "use strict";

  angular.module('crmChartKit').factory('chartKitGridCompareColumnsStackRows', (chartKitColumnConfig) => ({
    adminTemplate: '~/crmChartKit/chartTypes/chartKitGridCompareColumnsStackRows.html',


    getInitialDisplaySettings: () => ({
      barWidth: 10,
      barGap: 5,
    }),

    hasCoordinateGrid: true,

    getAxes: () => ({
      'x': {
        label: ts('X-Axis'),
        // prefer date/categorical
        scaleTypes: ['date', 'numeric', 'categorical'],
        reduceTypes: [],
        isDimension: true,
      },
      'w': {
        label: ts('Grouping'),
        scaleTypes: ['categorical'],
        reduceTypes: ['list'],
        prepopulate: false,
      },
      'y': {
        key: 'y',
        label: ts('Values'),
        sourceDataTypes: ['Integer', 'Money', 'Boolean', 'Float', 'Double'],
        displayTypes: ['bar', 'line', 'area'],
        multiColumn: true,
        // TODO how to handle colour scheming
        // we need to be able to create a scale
        // to handle series values
        // colorType: 'one-per-column',
      },
      'z': {
        label: ts('Additional Labels'),
        dataLabelTypes: ['label', 'title'],
        prepopulate: false,
        multiColumn: true,
      }
    }),

    showLegend: (displayCtrl) => (displayCtrl.settings.showLegend && displayCtrl.settings.showLegend !== 'none'),

    getChartConstructor: () => dc.compositeChart,

    buildGroup: (displayCtrl) => {
      // get cols we need
      const wColumn = displayCtrl.getFirstColumnForAxis('w');
      const cols = displayCtrl.getColumns();

      if (!wColumn) {
        // reduce every coordinate using the functions from its column reduce type
        const reduceAdd = (p, v) => {
          cols.forEach((col) => {
            p[col.index] = col.reducer.add(p[col.index], v[col.index]);
          });
          return p;
        };
        const reduceSub = (p, v) => {
          cols.forEach((col) => {
            p[col.index] = col.reducer.sub(p[col.index], v[col.index]);
          });
          return p;
        };
        const reduceStart = () => {
          const p = {};
          cols.forEach((col) => {
            p[col.index] = col.reducer.start();
          });
          return p;
        };

        displayCtrl.group = displayCtrl.dimension.group().reduce(reduceAdd, reduceSub, reduceStart);

        // find grand totals for each column
        const columnTotals = displayCtrl.ndx.groupAll().reduce(reduceAdd, reduceSub, reduceStart).value();

        displayCtrl.setColumnTotals(columnTotals);
      }

      else {
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
            console.log(columnTotals);
            //columnTotals[col.index] = col.reducer.final(columnTotals[col.index]);
          }
        });

        displayCtrl.setColumnTotals(columnTotals);
      }
    },


    loadChartData: (displayCtrl) => {
      // get our y columns
      const yCols = displayCtrl.getColumnsForAxis('y');
      const wCol = displayCtrl.getFirstColumnForAxis('w');

      // wValues are list reduced - so the column total is the list of all values
      // that appear in that column in the dataset
      const allSeries = wCol ? wCol.total.map((w) => ({
        key: w,
        label: wCol.renderDataValue(w)
      })) : [];

      // build color scale integrating user-assigned colors
      //const colorScale = chartKitColumnConfig.buildColumnColorScale(yCols);

      // compose subchart for each column
      displayCtrl.chart
        // we need to add to main chart for axis building
        .dimension(displayCtrl.dimension)
        .group(displayCtrl.group)
        .shareTitle(false)
        .compose(yCols.map((yCol) => {

          const displayType = (displayCtrl.settings.displayType === 'mixed') ? yCol.displayType : displayCtrl.settings.displayType;
          const subChart = ((displayType === 'bar') ? dc.barChart : dc.lineChart)(displayCtrl.chart);

          subChart
            .dimension(displayCtrl.dimension)
            //.colorCalculator(() => colorScale(yCol.label));

          if (!allSeries.length) {
            subChart
              .group(displayCtrl.group, yCol.label, yCol.getDataValue)
          }
          else {
            allSeries.forEach((series, i) => {
              const seriesValueAccessor = (d) => {
                const stored = d.value[yCol.index][series.key] ?? null;
                if (stored === null) {
                  return null;
                }
                return yCol.reducer.final(stored, yCol.total);
              };
              const seriesLabel = (yCols.length > 1) ? `${yCol.label} - ${series.label}` : series.label;

              if (i === 0) {
                subChart.group(displayCtrl.group, seriesLabel, seriesValueAccessor);
              } else {
                subChart.stack(displayCtrl.group, seriesLabel, seriesValueAccessor);
              }
            });
          }

          // this is used to suppress other y cols from the labels
          const otherYColIndexes = yCols.map((otherCol) => otherCol.index).filter((index) => index !== yCol.index);

          subChart
            .title((d) => displayCtrl.renderDataLabel(d, 'title', otherYColIndexes))
            .label((d) => displayCtrl.renderDataLabel(d, 'label', otherYColIndexes))
            .useRightYAxis(yCol.useRightAxis);

          if (displayType === 'area') {
            subChart.renderArea(true);
          }


          subChart.hidableStacks(true)

          return subChart;
      }));

      // we also override getRenderedLabel on each column to account for our by series data points
      if (allSeries.length) {
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
      }

      // dc doesn't deal with bars overlapping by default
      // so now we need to shrink them
      //
      // we do this based on barWidth & barGap settings
      // but we check to make sure these will fit
      const yAxisBars = yCols.filter((col) => col.displayType === 'bar');
      const barCount = yAxisBars.length * (allSeries.length ? allSeries.length : 1);

      if (barCount > 1) {
        displayCtrl.chart.on('renderlet', (chart) => {
          const tickCount = chart.xUnitCount();
          const xAxisLength = chart.xAxisLength();

          // work out how much space we have total on the x-axis
          const groupSpace = Math.max(barCount, Math.floor(xAxisLength / (tickCount + 1)));
          const maxBarSpace = Math.max(1, Math.floor(groupSpace / barCount));

          // cap setting values below max
          displayCtrl.settings.barGap = Math.floor(Math.min(displayCtrl.settings.barGap, maxBarSpace - 1));
          displayCtrl.settings.barWidth = Math.floor(Math.min(displayCtrl.settings.barWidth, maxBarSpace - displayCtrl.settings.barGap));
          const barSpace = displayCtrl.settings.barWidth + displayCtrl.settings.barGap;
          const centerOffset = Math.floor((groupSpace - (barCount * barSpace)) / 2);

          yCols.forEach((col, subIndex) => {
            const offsetIndex = yAxisBars.findIndex((barCol) => barCol.index === col.index);
            if (offsetIndex < 0) {
              // not a bar
              return;
            }

            dc.transition(displayCtrl.chart.selectAll(`.sub._${subIndex} .bar`))
              .attr('width', displayCtrl.settings.barWidth)
              .attr('transform', `translate(${(offsetIndex * barSpace + centerOffset)}, 0)`);
            // move labels to align with bars
            dc.transition(displayCtrl.chart.selectAll(`.sub._${subIndex} .barLabel`))
              .attr('transform', `translate(${((offsetIndex - barCount + 0.5) * barSpace)}, 0)`);
          });
        });
      }
    },

    // helper for whether to display grouped bar settings in the admin screen
    isGroupedBar: (displayCtrl) => (displayCtrl.getColumnsForAxis('y').filter((col) => col.displayType === 'bar').length > 1),
  }));
})(angular, CRM.$, CRM._, CRM.chart_kit.dc);

