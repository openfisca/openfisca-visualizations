require([
  'domReady',
  'jquery',
  'nvd3',
  'underscore',

  'queryString'
], function(domReady, $, nv, _, queryString) {
  'use strict';

  var axes = [{
      count: 20,
      max: 40000,
      min: 2000,
      name: "sali"
  }];
  $.ajax({
      type: "POST",
      url: queryString.simulate_url,
      data: {
          axes: JSON.stringify(axes)
      }
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

      nv.debug = false;

      var chart;
      nv.addGraph(function() {
        chart = nv.models.stackedAreaChart()
                     // .width(600).height(500)
                      .useInteractiveGuideline(true)
                      .x(function(d) { return d[0]; })
                      .y(function(d) { return d[1]; })
                      .color(function (d) { return colors(d.key); })
                      .transitionDuration(300);
                      //.clipEdge(true);

        chart.xAxis
            .tickFormat(d3.format(',.2f'));

        chart.yAxis
            .tickFormat(d3.format(',.2f'));

        d3.select('#chart')
          .datum(data)
          .transition().duration(1000)
          .call(chart)
          // .transition().duration(0)
          .each('start', function() {
              setTimeout(function() {
                  d3.selectAll('#chart *').each(function() {
                    // while(this.__transition__)
                    if(this.__transition__)
                      this.__transition__.duration = 1;
                  });
                }, 0);
            });
        nv.utils.windowResize(chart.update);

        return chart;
      });
  });

});
