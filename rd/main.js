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
      min: 0,
      name: "sali"
  }];
  $.ajax({
      type: "POST",
      url: queryString.simulateUrl,
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
      var nodes = createNodes(data.output.value);

      var rd;
      _.each(nodes, function(node) {
          if (_.isUndefined(rd)) {
            rd = _.map(node.values, function(value, idx) {
              return {
                x: xAxis[idx],
                y: value
              };
            });
          } else {
            _.each(node.values, function(value, idx) {
              rd[idx] = {
                x: xAxis[idx],
                y: rd[idx].y + value
              };
            });
          }
      });
      return [{
        values: rd,
        key: "Revenue disponible",
        color: '#ff7f0e'
        }];
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
      console.error('Fetch API data error : ', jqXHR, textStatus, errorThrown);
  })
  .then(function(data) {
    nv.addGraph(function() {
      var chart = nv.models.lineChart()
      .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
      .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
      .transitionDuration(350)  //how fast do you want the lines to transition?
      .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
      .showYAxis(true)        //Show the y-axis
      .showXAxis(true)        //Show the x-axis
      ;

    chart.xAxis     //Chart x-axis settings
      .axisLabel('Salaire imposable')
      .tickFormat(d3.format(',r'));

    chart.yAxis     //Chart y-axis settings
      .axisLabel('Revenue disponible')
      .tickFormat(d3.format('.02f'));

    console.log(data);
    d3.select('#chart')    //Select the <svg> element you want to render the chart in.   
      .datum(data)         //Populate the <svg> element with chart data...
      .call(chart);          //Finally, render the chart!
    });
  });
});
