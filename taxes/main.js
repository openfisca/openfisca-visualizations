require([
  'domReady',
  'jquery',
  'nvd3',
  'underscore',

  'queryString'
], function(domReady, $, nv, _, queryString) {

  $.ajax({
      type: "GET",
      url: queryString.simulate_url,
  })
  .then(function(data) {
      var salbrut;
      var value_index = 0;
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
                  childBaseValue += child.values[value_index];
              });
          }

          var value = node.values[value_index];
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
                value: - node.values[0]
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
      console.log(data);
      //Donut chart example
      nv.addGraph(function() {
        var chart = nv.models.pieChart()
        .x(function(d) { return d.label; })
        .y(function(d) { return d.value; })
        .showLabels(true) //Display pie labels
        .labelThreshold(0.05) //Configure the minimum slice size for labels to show up
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
