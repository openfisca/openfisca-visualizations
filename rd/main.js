require([
  'domReady',
  'jquery',
  'nvd3',
  'underscore',

  'queryString'
], function(domReady, $, nv, _, queryString) {
  'use strict';
  var axes = [{
    count: 50,
    max: 80000,
    min: 0,
    name: "sali"
      }];
  $.ajax({
    type: "POST",
    url: queryString.simulateUrl,
    data: {
      decomposition: JSON.stringify([
                       {code: 'nivvie'},
                       {code: 'sali'},
                       {code: 'revdisp'}
                       ]),
      axes: JSON.stringify(axes),
    }
  })
  .then(function (data) {
    console.log(data);
    var data = data;

    var parsedData = [];

    var nivvieObj = data.value[0];
    var revdispObj = data.value[2];
    var saliObj = data.value[1];

    var revdispMinValue = d3.min(revdispObj.values);
    // console.log();

    /* Add sal datas */
    //
    // _.each(nivvieObj.values, function (val) {

    // });
    parsedData.push({
      key: 'Revenu disponible',
      values: [],
      bar: true,
      color: "#ccf",
    });
    _.each(revdispObj.values, function (val, i) {
      // debugger;
      parsedData[0].values.push([saliObj.values[i]]);
      parsedData[0].values[i].push(val);
    });

    parsedData.push({
      key: 'Niveau de vie',
      values: [],
      color: "#ccf",
    });
    _.each(nivvieObj.values, function (val, i) {
      parsedData[1].values.push([saliObj.values[i]]);
      parsedData[1].values[i].push(val);
    });


    nv.addGraph(function() {
      var chart = nv.models.linePlusBarChart()
      .margin({top: 30, right: 80, bottom: 50, left: 70})
      //We can set x data accessor to use index. Reason? So the bars all appear evenly spaced.
      .x(function(d,i) { return i })
      .y(function(d,i) {return d[1] });

    chart.xAxis.tickFormat(function(d) {
      // console.log(d);

      d = d / 49 * 80000;
      return d3.format('f')(d)+ '€';
    });

    chart.y1Axis
      .tickFormat(d3.format(',f'));

    chart.y2Axis
      .tickFormat(function(d) { return d3.format(',f')(d)+ '€' });

    chart.bars.forceY([0]);

    d3.select('#chart')
      .datum(parsedData)
      .transition()
      .duration(0)
      .call(chart);

    var actualYScale = chart.y2Axis.scale(),
        actualYScaleDomain = actualYScale.domain();

    actualYScale.domain([revdispMinValue, actualYScaleDomain[1]]);
    chart.y2Axis.scale(actualYScale);

    nv.utils.windowResize(chart.update);

    $('.nv-bars').attr('display', 'none');

    return chart;
    });
  });
});



