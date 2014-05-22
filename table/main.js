require([
  'domReady',
  'jquery',
  'underscore',

  'queryString',
  'hbs!table'
], function(domReady, $, _, queryString, tableTemplate) {
  'use strict';

  var $container = $('.container');
  if (queryString.test_case_url) { // jshint ignore:line
    $.ajax({
      type: 'GET',
      url: queryString.test_case_url, // jshint ignore:line
      xhrFields: {
        withCredentials: true,
      },
    })
    .then(function(testCase) {
      var data = {
        context: Date.now().toString(),
        scenarios: [
          {
            legislation_url: queryString.legislation_url, // jshint ignore:line
            test_case: testCase, // jshint ignore:line
            year: parseInt(queryString.year),
          },
        ],
      };
      return $.ajax({
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'json',
        type: 'POST',
        url: 'http://api.openfisca.fr/api/1/simulate',
        xhrFields: {
          withCredentials: true,
        },
      });
    })
    .then(function(data) {
      var xAxis;
      var valueIndex = 0;
      var createNodes = function(node, nodes, baseValue) {
        if (_.isUndefined(nodes)) {
          nodes = [];
        }
        if (_.isUndefined(baseValue)) {
          baseValue = 0;
        }
        if (node.code === 'sal') {
          xAxis = node.values;
        }
        var children = node.children;
        if (children) {
          var childBaseValue = baseValue;
          _.each(node.children, function (child) {
            nodes.concat(createNodes(child, nodes, childBaseValue));
            childBaseValue += child.values[valueIndex];
          });
        }

        var value = node.values[valueIndex];
        if ( ! children && _.filter(node.values, function(n) { return n !== 0; } ).length > 0) {
          var column = {
            baseValue: baseValue,
            code: value.code,
          };
          _.extend(column, node);
          nodes.push(column);
        }
        return nodes;
      };
      var nodes = createNodes(data.value);

      return nodes;
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error('Fetch API data error : ', jqXHR, textStatus, errorThrown);
    })
    .then(function(data) {
      var context = {
        data: _.map(data, function (item) {
          return {
            name: item.name,
            values: _.map(item.values, function (value) {
              return {
                tdClass: function(value) {
                  if (value === 0) {
                    return '';
                  } else {
                    return value > 0 ? 'success' : 'danger';
                  }
                }(value),
                value: value.toFixed(2)
              };
            })
          };
        }),
      };
      $container.html(tableTemplate(context));
    });
  } else {
    $container.html('"test_case_url" GET parameter is missing.');
  }

});
