(function (angular, $, _) {
  "use strict";

  // Provides pluggable chart types for use in the chart_kit display and admin components
  angular.module('crmChartKit').factory('chartKitChartTypes', (
    chartKitPie,
    chartKitRow,
    chartKitGridCompareColumns,
    chartKitGridStackColumns,
    chartKitGridCompareSeries,
    chartKitGridStackSeries,
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
        key: 'stack-series',
        label: ts('Stack Series'),
        icon: 'fa-layer-group',
        service: chartKitGridStackSeries,
      },
      {
        key: 'stack-columns',
        label: ts('Stack Columns'),
        icon: 'fa-layer-group',
        service: chartKitGridStackColumns
      },
      {
        key: 'compare-columns',
        label: ts('Compare Columns'),
        icon: 'fa-layer-group',
        service: chartKitGridCompareColumns
      },
      {
        key: 'compare-series',
        label: ts('Compare Series'),
        icon: 'fa-chart-gantt',
        service: chartKitGridCompareSeries
      },
    ];
  });
})(angular, CRM.$, CRM._);
