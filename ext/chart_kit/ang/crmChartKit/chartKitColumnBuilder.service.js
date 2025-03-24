(function (angular, $, _) {
  "use strict";

  // Provides common "option group" info for chart admin components
  angular.module('crmChartKit').service('chartKitColumnBuilder', (chartKitReduceTypes) => {

    this.buildColumns = (columnSettings, axisDefinition) => {
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
          // set isDimension on the column based on axis defintion
          col.isDimension = axisDefinition[axisKey].isDimension ?? false;

          // set its index in the columnsByAxis array
          col.axisIndex = index;
          // set overall canonical indexes for each col
          // e.g. x_0, y_0, y_1, ...
          col.index = `${axisKey}_${index}`;


          // add getter/setters etc
          return this.buildColumn(col);
        });
      });

      return columnsByAxis;
    };

    /**
     * Get the reducer for a column, based on its reduceType key
     * ( defaults to returning the "list" reducer if reduceType isn't set )
     */
    this.buildColumn = (col) => {
      col.reducer = chartKitReduceTypes.find((type) => type.key === (col.reduceType ?? 'list'));

      col.getDataValue = (d) => col.isDimension ? d.value[col.index][0] : col.reducer.final(d.value[col.index], col.total);

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
            // initialise the category list for this column if it doesnt exist yet
            if (!col.categories) {
              col.categories = [];
            }

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
            v = col.categoryMap[v];
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
        }
      };

      col._renderDataValue = (v) => {
        const parsedValue = col.fromDataValue(v);
        return col.applyFormatters(parsedValue);
      },

      col.renderDataValue = (v) => {
        if (col.reducer.render) {
          return col.reducer.render(v, (v) => col._renderDataValue(v));
        } else {
          return col._renderDataValue(v);
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
        const value = col.getRenderedValue(d);

        if (!value && value !== 0) {
          return null;
        }

        if (col.dataLabelColumnPrefix) {
          return `${col.label}: ${value}`;
        }

        return value;
      };
    };
  });
})(angular, CRM.$, CRM._);
