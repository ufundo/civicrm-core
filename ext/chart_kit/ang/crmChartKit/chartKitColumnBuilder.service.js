(function (angular, $, _, d3) {
  "use strict";

  // Provides common "option group" info for chart admin components
  angular.module('crmChartKit').factory('chartKitColumnBuilder', (chartKitReduceTypes) => {

    /**
     * Get the reducer for a column, based on its reduceType key
     * ( defaults to returning the "list" reducer if reduceType isn't set )
     */
    const buildColumn = (col) => {
      // initialise the category list for categorical columns
      if (col.scaleType === 'categorical') {
        col.categories = [];
      }

      col.reducer = chartKitReduceTypes.find((type) => type.key === (col.reduceType ?? 'list'));

      col.getDataValue = (d) => {
        const stored = d.value[col.index] ?? null;
        if (stored === null) {
          return null;
        }
        return col.reducer.final(stored, col.total);
      };

      col.toDataValue = (v) => {
        switch (col.datePrecision) {
          case 'year':
            v = d3.timeYear.floor(Date.parse(v)).valueOf();
            break;
          case 'month':
            v = d3.timeMonth.floor(Date.parse(v)).valueOf();
            break;
          case 'week':
            v = d3.timeWeek.floor(Date.parse(v)).valueOf();
            break;
          case 'day':
            v = d3.timeDay.floor(Date.parse(v)).valueOf();
            break;
          case 'hour':
            v = d3.timeHour.floor(Date.parse(v)).valueOf();
            break;
        }

        switch (col.scaleType) {
          case 'categorical':
            const existingIndex = col.categories.indexOf(v);

            if (existingIndex < 0) {
              // if not found, add new category to our list
              col.categories.push(v);
              // we know this category is the last item in the category list
              return col.categories.length - 1;
            }

            return existingIndex;
          default:
            return v;
        }
      };

      col.fromDataValue = (v) => {
        switch (col.scaleType) {
          case 'categorical':
            // convert categorical indexes back to label
            v = col.categories[v];
            break;
        }
        // convert timestamp crossfilter back to date string
        switch (col.datePrecision) {
          case 'year':
            v = new Date(v).toLocaleString(undefined, { year: 'numeric' });
            break;
          case 'month':
            v = new Date(v).toLocaleString(undefined, { year: 'numeric', month: 'long' });
            break;
          case 'week':
            v = new Date(v).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            break;
          case 'day':
            v = new Date(v).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            break;
          case 'hour':
            v = new Date(v).toLocaleString();
            break;
        }
        return v;
      };

      col.applyFormatters = (v) => {
        switch (col.dataLabelFormatter) {
          case 'round':
            return v.toFixed(col.dataLabelDecimalPlaces);
          case 'formatMoney':
            return CRM.formatMoney(v, null, col.dataLabelMoneyFormatString);
          default:
            return v;
        }
      };

      col.renderUnreducedDataValue = (v) => {
        const parsedValue = col.fromDataValue(v);
        return col.applyFormatters(parsedValue);
      },

      col.renderDataValue = (v) => {
        if (!v && v !== 0) {
          return null;
        }
        if (col.reducer.render) {
          return col.reducer.render(v, (v) => col.renderUnreducedDataValue(v));
        } else {
          return col.renderUnreducedDataValue(v);
        }
      }

      /**
       * This combines getRawValue, parseRawValue, and any render from the reducer
       */
      col.getRenderedValue = (d) => {
        const v = col.getDataValue(d);
        return col.renderDataValue(v);
      };

      col.getRenderedLabel = (d) => {
        const v = col.getRenderedValue(d);

        if (col.dataLabelColumnPrefix) {
          return `${col.label}: ${v}`;
        }

        return v;
      };

      return col;
    };


    return (columnSettings, axisDefinition) => {
      // filter out any columns which haven't got a set key
      const setColumns = columnSettings.filter((col) => col.key);

      const columnsByAxis = {};

      Object.keys(axisDefinition).forEach((axisKey) => {

        // find all matching columns if multiColumn, or just pick first matching column if single
        columnsByAxis[axisKey] = axisDefinition[axisKey].multiColumn
          ? setColumns.filter((col) => col.axis === axisKey)
          : [setColumns.find((col) => col.axis === axisKey)];

        // build out the columns
        columnsByAxis[axisKey] = columnsByAxis[axisKey].map((col, index) => {
          // add getter/setters etc
          const builtCol = buildColumn(col);

          // set isDimension on the column based on axis defintion
          builtCol.isDimension = axisDefinition[axisKey].isDimension ?? false;

          // set its index in the columnsByAxis array
          builtCol.axisIndex = index;
          // set overall canonical indexes for each col
          // e.g. x_0, y_0, y_1, ...
          builtCol.index = `${axisKey}_${index}`;

          return builtCol;
        });
      });

      return columnsByAxis;
    };
  });
})(angular, CRM.$, CRM._, CRM.chart_kit.d3);
