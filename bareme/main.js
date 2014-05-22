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

  var axes = [{
    count: 20,
    max: 40000,
    min: 2000,
    name: 'sali'
  }];

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
            axes: axes,
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

      return _.map(nodes, function(node) {
        return {
          key: node.name,
          values: _.zip(xAxis, node.values || [])
        };
      });
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error('Fetch API data error : ', jqXHR, textStatus, errorThrown);
    })
    .then(function(data) {
      //an example of harmonizing colors between visualizations
      //observe that Consumer Discretionary and Consumer Staples have
      //been flipped in the second chart
      var colors = d3.scale.category20();

      var chart;
      nv.addGraph(function() {
        chart = nv.models.stackedAreaChart()
                     // .width(600).height(500)
                      .useInteractiveGuideline(true)
                      .x(function(d) { return d[0]; })
                      .y(function(d) { return d[1]; })
                      .color(function (d) { return colors(d.key); })
                      .transitionDuration(100);
                      //.clipEdge(true);

        chart.xAxis.tickFormat(d3.format(',.2f'));
        chart.yAxis.tickFormat(d3.format(',.2f'));

        container.text('').append('svg')
          .attr('id', 'chart')
          .datum(data)
          .transition().duration(100)
          .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
      });
    });
  } else {
    container.text('"test_case_url" GET parameter is missing.');
  }

});
