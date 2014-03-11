require([
  'domReady',
  'jquery',
  'nvd3',
  'underscore',

  'queryString'
], function(domReady, $, nv, _, queryString) {

  var simulationData;
  $.ajax({
      type: "GET",
      url: queryString.simulationUrl,
  })
  .then(function(data) {
      var salbrut;
      var value_index = 0;
      var create_nodes = function(node, nodes, base_value = 0) {
          if (typeof nodes === 'undefined' || nodes === null) {
              nodes = [];
          }
          if (node.code === 'salbrut') {
              salbrut = node.values;
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
      debugger
      var nodes = create_nodes(data.output.value);

      var data = [];
      _.each(nodes, function(node) {
          if (node.values[0] > 0) {
            data.push({
                label: node.name,
                value: node.values[0]
            });
          }
      });
      return data;
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
      console.error('Fetch API data error : ', jqXHR, textStatus, errorThrown);
  })
  .then(function(data) {
      //Donut chart example
      nv.addGraph(function() {
        var chart = nv.models.pieChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .showLabels(true) //Display pie labels
        .labelThreshold(.05) //Configure the minimum slice size for labels to show up
        .labelType("percent") //Configure what type of data to show in the label. Can be "key", "value" or "percent"
        .donut(true) //Turn on Donut mode. Makes pie chart look tasty!
        .donutRatio(0.35) //Configure how big you want the donut hole size to be.
        ;

      d3.select("#chart")
        .datum(data)
        .transition().duration(350)
        .call(chart);

      return chart;
      });



  });

});
