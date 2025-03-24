(function (angular, $, _) {
  "use strict";

  // Provides pluggable chart types for use in the chart_kit display and admin components
  angular.module('crmChartKit').factory('chartKitChartTypes', (
    chartKitPie,
    chartKitRow,
    chartKitGridCompareColumnsStackRows,
    chartKitGridCompareRows,
    chartKitGridStackColumns,
  ) => {

    const ts = CRM.ts('chart_kit');

    return ({
      chartTypeSettings: {
        displayType: [
          {
            key: 'pie',
            label: ts('Pie'),
            icon: 'fa-pie-chart',
          },
          {
            key: 'row',
            label: ts('Row'),
            icon: 'fa-chart-bar',
          },
          {
            key: 'line',
            label: ts('Line'),
            icon: 'fa-line-chart',
          },
          {
            key: 'bar',
            label: ts('Bar'),
            icon: 'fa-chart-column',
          },
          {
            key: 'area',
            label: ts('Area'),
            icon: 'fa-chart-area',
          },
          {
            key: 'mixed',
            label: ts('Mixed'),
            icon: 'fa-layer-group',
          },
        ],
        seriesType: [
          {
            key: 'compare-columns-stack-rows',
            label: ts('Standard'),
          },
          {
            key: 'compare-rows',
            label: ts('Compare Grouping'),
          },
          {
            key: 'stack-columns',
            label: ts('Stack Values'),
          }
        ],
      },
      getChartType: (settings) => {
        // convert legacy key
        if (settings.chartType && !settings.displayType) {
          settings.displayType = settings.chartType;
        }

        let displayType = settings.displayType;
        let seriesType = settings.seriesType;

        if (!displayType) {
          return null;
        }

        if (displayType === 'pie') {
          return chartKitPie;
        }
        if (displayType === 'row') {
          return chartKitRow;
        }
        if (displayType === 'mixed') {
          // stack columns and compare rows dont allow
          // mixing types
          return chartKitGridCompareColumnsStackRows;
        }

        if (seriesType === 'compare-rows') {
          return chartKitGridCompareRows;
        }
        if (seriesType === 'stack-columns') {
          return chartKitGridStackColumns;
        }

        return chartKitGridCompareColumnsStackRows;
      }
    });
  });
})(angular, CRM.$, CRM._);
