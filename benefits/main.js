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

  if (queryString.simulate_url) { // jshint ignore:line
    $.ajax({
      type: 'GET',
      url: queryString.simulate_url, // jshint ignore:line
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

        container.append('svg')
          .attr('id', 'chart')
          .datum(data)
          .transition().duration(350)
          .call(chart);

        return chart;
      });
    });
  } else {
    container.text('"simulate_url" GET parameter is missing.');
  }

});
