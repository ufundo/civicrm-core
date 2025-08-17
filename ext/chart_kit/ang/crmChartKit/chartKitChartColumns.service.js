(function (angular, $, _, d3, dc) {
  "use strict";

  /**
   * chartKitChartColumns service models chart columns
   *
   * A "chart column" is a search field from the SearchKit SavedSearch
   * plus settings like reduceType and scaleType which control how data
   * in that field is processed when it is included in the chart
   *
   * The service exposes the `buildColumn` constructor and the canonical
   * lists of config options
   *
   */
  angular.module('crmChartKit').factory('chartKitChartColumns', (chartKitReduceTypes) => {

    // TODO: other parsers?
    const datePrecisionParser = (v, options) => {
      const date = Date.parse(v);
      if (options.precision) {
        switch (options.precision) {
          case 'year':
            return d3.timeYear.floor(date).valueOf();
          case 'month':
            return d3.timeMonth.floor(date).valueOf();
          case 'week':
            return d3.timeWeek.floor(date).valueOf();
          case 'day':
            return d3.timeDay.floor(date).valueOf();
          case 'hour':
            return d3.timeHour.floor(date).valueOf();
        }
      }
      return date;
    };

    const dateFormatter = (v, options) => {
      const date = new Date(v);
      switch (options.precision) {
        case 'year':
          return date.toLocaleString(undefined, { year: 'numeric' });
        case 'month':
          return date.toLocaleString(undefined, { year: 'numeric', month: 'long' });
        case 'week':
          return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        case 'day':
          return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        case 'hour':
          return date.toLocaleString();
      }
      return date.toLocaleString();
    };

    /**
     * Canoncial options for configuring a chart kit column
     *
     * Some options may be constrained in specific contexts - e.g. a
     * particular axis may only allow some scaletypes
     */
    const configOptions = {
      reduceType: chartKitReduceTypes,
      scaleType: [
        {
          key: 'numeric',
          label: ts('Numeric'),
        },
        {
          key: 'categorical',
          label: ts('Categorical'),
        },
        {
          key: 'date',
          label: ts('Datetime'),
        },
      ],
      datePrecision: [
        {
          key: 'year',
          label: ts('Year'),
        },
        {
          key: 'month',
          label: ts('Month'),
        },
        {
          key: 'week',
          label: ts('Week'),
        },
        {
          key: 'day',
          label: ts('Day'),
        },
        {
          key: 'hour',
          label: ts('Hour'),
        },
      ],
      seriesType: [
        {
          key: 'bar',
          label: ts('Bar')
        },
        {
          key: 'line',
          label: ts('Line')
        },
        {
          key: 'area',
          label: ts('Area')
        },
      ],
      dataLabelType: [
        {
          key: "none",
          label: "None",
        },
        {
          key: "title",
          label: "On hover",
        },
        {
          key: "label",
          label: "Always show",
        }
      ],
      dataLabelFormatter: [
        {
          key: "none",
          label: "None",
        },
        {
          key: "round",
          label: "Round",
          apply: (v, options) => v.toFixed(options.decimalPlaces),
        },
        {
          key: "formatMoney",
          label: "Money formatter",
          apply: (v, options) => CRM.formatMoney(v, null, options.moneyFormatString),
        },
        // NOTE: this is currently used to render appropriately precise dates when using
        // the datePrecision options. expects date values to be stored as timestamps
        // TODO: allow configuring other date formats
        {
          key: "formatDate",
          label: "Date format",
          apply: dateFormatter
        }
      ],
    };

    /**
     * @return Object chart column with methods like valueAccessor, renderedValueAccessor etc
     */
    const buildColumn = (
      sourceKey,
      label,
      axis,
      axisIndex,
      isDimension,
      scaleType,
      reduceType = 'list',
      datePrecision = null,
      seriesType = null,
      dataLabelType = null,
      dataLabelFormatter = null,
      dataLabelColumnPrefix = false,
      dataLabelDecimalPlaces = null,
      dataLabelMoneyFormatString = null,
      useRightAxis = false,
      color = null
    ) => {

      // init object for the new col
      const col = {
        label: label,
        key: sourceKey,
        axis: axis,
        axisIndex: axisIndex,
        isDimension: isDimension,
        scaleType: scaleType,
        reduceType: reduceType,
        seriesType: seriesType,
        dataLabelType: dataLabelType,
        dataLabelColumnPrefix: dataLabelColumnPrefix,
        useRightAxis: useRightAxis,
        color: color,
        total: null,
      };

      // overall canonical indexes for each col
      // e.g. x_0, y_0, y_1, ...
      col.index = `${axis}_${axisIndex}`;

      col.reducer = chartKitReduceTypes.find((type) => type.key === (col.reduceType));

      col.parsers = [];
      col.formatters = [];

      if (col.scaleType === 'categorical') {
        // category columns create a category list and then
        // just use indexes from the list whilst processing data
        col.categories = [];

        // parser / formatter are unusual in that they rely on col.categories
        // from the col scope
        const categoryParser = (v, options) => {
          const existingIndex = col.categories.indexOf(v);

          if (existingIndex < 0) {
            // if not found, add new category to our list
            col.categories.push(v);
            // we know this category is the last item in the category list
            return col.categories.length - 1;
          }

          return existingIndex;
        }

        const categoryFormatter = (v, options) => {
          return col.categories[v];
        }

        col.parsers.unshift([categoryParser, {}]);
        col.formatters.push([categoryFormatter, {}]);
      }

      // the date precision argument sets a parser and formatter
      if (datePrecision) {
        col.parsers.unshift([datePrecisionParser, {precision: datePrecision}]);
        col.formatters.push([dateFormatter, {precision: datePrecision}]);
      }
      // add rounding or money format formatters
      // NOTE: these are mutually exclusive with date formatter and each other
      else if (dataLabelFormatter) {
        const formatter = configOptions.dataLabelFormatter.find((formatter) => formatter.key === dataLabelFormatter);

        if (formatter && formatter.apply) {
          // TODO: better way to provide these?
          const options = {
            decimalPlaces: dataLabelDecimalPlaces,
            moneyFormatString: dataLabelMoneyFormatString,
          };
          col.formatters.push([formatter.apply, options]);
        }
      }

      col.valueAccessor = (d) => {
        const stored = d.value[col.index] ?? null;
        if (stored === null) {
          return null;
        }
        return col.reducer.final(stored, col.total);
      };

      col.applyParsers = (v) => {
        col.parsers.forEach((parserWithOptions) => {
          const [parser, options] = parserWithOptions;
          v = parser(v, options);
        });
        return v;
      };

      col.applyFormatters = (v) => {
        col.formatters.forEach((formatterWithOptions) => {
          const [formatter, options] = formatterWithOptions;
          v = formatter(v, options);
        })
        return v;
      };

      col.renderValue = (v) => {
        if (!v && v !== 0) {
          return null;
        }
        if (col.reducer.render) {
          return col.reducer.render(v, (v) => col.applyFormatters(v));
        } else {
          return col.applyFormatters(v);
        }
      }

      col.renderedValueAccessor = (d) => {
        const v = col.valueAccessor(d);
        return col.renderValue(v);
      };

      col.getRenderedLabel = (d) => {
        const v = col.renderedValueAccessor(d);

        if (col.dataLabelColumnPrefix) {
          return `${col.label}: ${v}`;
        }

        return v;
      };

      return col;
    };


    return ({
      configOptions: configOptions,
      buildColumn: buildColumn,
    });
  });
})(angular, CRM.$, CRM._, CRM.chart_kit.d3, CRM.chart_kit.dc);
