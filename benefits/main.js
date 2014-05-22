require([
  'domReady',
  'jquery',
  'underscore',
  'd3',
  'nvd3',

  'queryString'
], function(domReady, $, _, d3, nv, queryString) {
  'use strict';

  nv.debug = false;

  var container = d3.select('.container');

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
      var salbrut;
      var valueIndex = 0;
      var createNodes = function(node, nodes, baseValue) {
        if (_.isUndefined(nodes)) {
          nodes = [];
        }
        if (_.isUndefined(baseValue)) {
          baseValue = 0;
        }
        if (node.code === 'salbrut') {
          salbrut = node.values;
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

      return _.filter(_.map(nodes, function(node) {
        if (node.values[0] < 0) {
          return {
            label: node.name,
            value: node.values[0]
          };
        }
      }), function(item) {
        return (!_.isUndefined(item));
      });
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error('Fetch API data error : ', jqXHR, textStatus, errorThrown);
    })
    .then(function(data) {
      nv.addGraph(function() {
        var chart = nv.models.pieChart()
        .x(function(d) { return d.label; })
        .y(function(d) { return d.value; })
        .showLabels(true)
        .labelThreshold(0.05)
        .labelType('percent')
        .donut(true)
        .donutRatio(0.35);

        container.text('').append('svg')
          .attr('id', 'chart')
          .datum(data)
          .transition().duration(350)
          .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });
    });
  } else {
    container.text('"test_case_url" GET parameter is missing.');
  }

});
