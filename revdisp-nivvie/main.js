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

  var axes = [{
    count: 50,
    max: 80000,
    min: 0,
    name: 'sali'
  }];

  if (queryString.simulate_url) { // jshint ignore:line
    $.ajax({
      type: 'POST',
      url: queryString.simulate_url, // jshint ignore:line
      data: {
        axes: JSON.stringify(axes),
        decomposition: JSON.stringify([
          {code: 'nivvie'},
          {code: 'sali'},
          {code: 'revdisp'},
        ]),
      }
    })
    .then(function (data) {
      var parsedData = [];

      var nivvieObj = data.value[0];
      var revdispObj = data.value[2];
      var saliObj = data.value[1];

      var revdispMinValue = d3.min(revdispObj.values);

      parsedData.push({
        key: 'Revenu disponible',
        values: [],
        bar: true,
        color: '#ccf',
      });
      _.each(revdispObj.values, function (val, i) {
        parsedData[0].values.push([saliObj.values[i]]);
        parsedData[0].values[i].push(val);
      });

      parsedData.push({
        key: 'Niveau de vie',
        values: [],
        color: '#ccf',
      });
      _.each(nivvieObj.values, function (val, i) {
        parsedData[1].values.push([saliObj.values[i]]);
        parsedData[1].values[i].push(val);
      });


      nv.addGraph(function() {
        var chart = nv.models.linePlusBarChart()
          .margin({top: 30, right: 80, bottom: 50, left: 70})
          //We can set x data accessor to use index. Reason? So the bars all appear evenly spaced.
          .x(function(d, i) { return i; })
          .y(function(d) {return d[1]; });

        chart.xAxis.tickFormat(function(d) {
          d = d / 49 * 80000;
          return d3.format('f')(d)+ '€';
        });
        chart.y1Axis.tickFormat(d3.format(',f'));
        chart.y2Axis.tickFormat(function(d) { return d3.format(',f')(d) + '€'; });
        var actualYScale = chart.y2Axis.scale(),
            actualYScaleDomain = actualYScale.domain();
        actualYScale.domain([revdispMinValue, actualYScaleDomain[1]]);
        chart.y2Axis.scale(actualYScale);
        chart.bars.forceY([0]);

        container.text('').append('svg')
          .attr('id', 'chart')
          .datum(parsedData)
          .transition()
          .duration(0)
          .call(chart);

        nv.utils.windowResize(chart.update);

        $('.nv-bars').attr('display', 'none');

        return chart;
      });
    });
  } else {
    container.text('"simulate_url" GET parameter is missing.');
  }

});
