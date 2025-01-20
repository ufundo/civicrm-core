(function (angular, $, _) {
  "use strict";

  // Provides pluggable chart types for use in the chart_kit display and admin components
  angular.module('crmChartKit').factory('chartKitChartTypes', (
    chartKitPie,
    chartKitRow,
    chartKitGridStackColumns,
    chartKitGridCompareColumns,
    chartKitGridCompareSeries
  ) => {

    const ts = CRM.ts('chart_kit');

    return [
      {
        key: 'pie',
        label: ts('Pie'),
        icon: 'fa-pie-chart',
        service: chartKitPie,
      },
      {
        key: 'row',
        label: ts('Row'),
        icon: 'fa-chart-bar',
        service: chartKitRow
      },
      {
        key: 'line',
        label: ts('Line'),
        icon: 'fa-line-chart',
        service: chartKitGridStackColumns
      },
      {
        key: 'bar',
        label: ts('Bar'),
        icon: 'fa-chart-column',
        service: chartKitGridStackColumns
      },
      {
        key: 'area',
        label: ts('Area'),
        icon: 'fa-chart-area',
        service: chartKitGridStackColumns
      },
      {
        key: 'compare-series',
        label: ts('Compare Series'),
        icon: 'fa-chart-gantt',
        service: chartKitGridCompareSeries
      },
      {
        key: 'compare-columns',
        label: ts('Compare Columns'),
        icon: 'fa-layer-group',
        service: chartKitGridCompareColumns
      },
    ];
  });
})(angular, CRM.$, CRM._);
