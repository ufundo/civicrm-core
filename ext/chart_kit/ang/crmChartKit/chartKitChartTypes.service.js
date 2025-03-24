(function (angular, $, _) {
  "use strict";

  // Provides pluggable chart types for use in the chart_kit display and admin components
  angular.module('crmChartKit').factory('chartKitChartTypes', (
    chartKitPie,
    chartKitRow,
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

        const displayType = settings.displayType;

        if (displayType === 'pie') {
          return chartKitPie;
        }
        if (displayType === 'row') {
          return chartKitRow;
        }

        const layerType = settings.layerType;

        const yCols = settings.columns.filter((col) => col.axis === 'y').length;

        const seriesType = (yCols > 1) ? 'columns' : 'rows';

        if (layerType === 'stack' && seriesType === 'rows') {
          return chartKitGridStackRows;
        }

        if (layerType === 'stack' && seriesType === 'columns') {
          return chartKitGridStackColumns;
        }

        if (layerType === 'compare' && seriesType === 'rows') {
          return chartKitGridCompareRows;
        }

        if (layerType === 'compare' && seriesType === 'columns') {
          return chartKitGridCompareColumns;
        }

        // defaults based on display type
        if (displayType === 'mixed') {
          return chartKitGridCompareColumns;
        }
        if (displayType === 'line') {
          return chartKitGridCompareColumns;
        }
        if (displayType === 'bar') {
          return chartKitGridCompareRows;
        }
        if (displayType === 'area') {
          return chartKitGridStackRows;
        }

        return null;
      }
    });
  });
})(angular, CRM.$, CRM._);
