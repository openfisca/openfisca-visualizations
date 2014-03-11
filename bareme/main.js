require([
  'domReady',
  'jquery',
  'nvd3',
  'underscore',

  'queryString'
], function(domReady, $, nv, _, queryString) {

  var axes = [{
      count: 20,
      max: 40000,
      min: 2000,
      name: "sali"
      }];
  var simulationData;
  $.ajax({
      type: "POST",
      url: queryString.simulationUrl,
      data: {
          axes: JSON.stringify(axes)
      }
  })
  .then(function(data) {
      var xAxis;
      var value_index = 0;
      var create_nodes = function(node, nodes, base_value = 0) {
          if (typeof nodes === 'undefined' || nodes === null) {
              nodes = [];
          }
          if (node.code === 'sal') {
              xAxis = node.values;
          }
          var children = node.children;
          if (children) {
              var child_base_value = base_value;
              _.each(node.children, function (child) {
                  nodes.concat(create_nodes(child, nodes, child_base_value));
                  child_base_value += child.values[value_index]
              });
          }

          value = node.values[value_index]
          if ( ! children && _.filter(node.values, function(n) { return n != 0; } ).length > 0) {
              var column = {
                  base_value: base_value,
                  code: value.code,
                  };
              _.extend(column, node);
              nodes.push(column);
          }
          return nodes
      };
      var nodes = create_nodes(data.output.value);

      var data = [];
      _.each(nodes, function(node) {
          data.push({
              key: node.name,
              values: _.zip(xAxis, node.values || [])
          });
      });
      return data;
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
      console.error('Fetch API data error : ', jqXHR, textStatus, errorThrown);
  })
  .then(function(data) {
      //an example of harmonizing colors between visualizations
      //observe that Consumer Discretionary and Consumer Staples have
      //been flipped in the second chart
      var colors = d3.scale.category20();
      keyColor = function(d, i) {return colors(d.key)};

      nv.debug = false;

      var chart;
      nv.addGraph(function() {
        chart = nv.models.stackedAreaChart()
                     // .width(600).height(500)
                      .useInteractiveGuideline(true)
                      .x(function(d) { return d[0] })
                      .y(function(d) { return d[1] })
                      .color(keyColor)
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
                  })
                }, 0)
            })
        nv.utils.windowResize(chart.update);

        return chart;
      });
  });

});
