(function (angular, $, _) {
  "use strict";

  // Provides pluggable chart types for use in the chart_kit display and admin components
  angular.module('crmChartKit').factory('chartKitChartTypes', (
    chartKitPie,
    chartKitRow,
    chartKitGridSimple,
    chartKitGridStackColumns,
    chartKitGridCompareColumns,
    chartKitGridCompareRows,
    chartKitGridStackRows,
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
            key: 'rows',
            label: ts('Group Based On Values in a Column'),
          },
          {
            key: 'columns',
            label: ts('Use Multiple Columns'),
          }
        ],
        layerType: [
          {
            key: 'stack',
            label: ts('Stack'),
          },
          {
            key: 'compare',
            label: ts('Compare'),
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
        let layerType = settings.layerType;

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
          seriesType = 'columns';
        }

        switch (seriesType) {
          case 'rows':
            switch (layerType) {
              case 'stack':
                return chartKitGridStackRows;
              case 'compare':
              default:
                return chartKitGridCompareRows;
            }
          case 'columns':
            switch (layerType) {
              case 'stack':
                return chartKitGridStackColumns;
              case 'compare':
              default:
                return chartKitGridCompareColumns;
            }
          default:
            return chartKitGridSimple;
        }
      }
    });
  });
})(angular, CRM.$, CRM._);
