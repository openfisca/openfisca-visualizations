require([
  'domReady',
  'jquery',
  'underscore',

  'queryString',
  'hbs!table'
], function(domReady, $, _, queryString, tableTemplate) {

  var $container = $('.container');

  if (queryString.simulate_url) {
    $.ajax({
      type: "GET",
      url: queryString.simulate_url,
    })
    .then(function(data) {
      var xAxis;
      var value_index = 0;
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
      var nodes = createNodes(data.output.value);

      return nodes;
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error('Fetch API data error : ', jqXHR, textStatus, errorThrown);
    })
    .then(function(data) {
      var context = {
        data: _.map(data, function (item) {
          return {
            name: item.name,
            values: _.map(item.values, function (value) {
              return {
                tdClass: function(value) {
                  if (value === 0) {
                    return '';
                  } else {
                    return value > 0 ? 'success' : 'danger';
                  }
                }(value),
                value: value.toFixed(2)
              };
            })
          };
        }),
        valuesColspan: _.max(_.map(data, function (item) { return item.values.length; })),
      };
      $container.html(tableTemplate(context));
    });
  } else {
    $container.html('"simulate_url" GET parameter is missing.');
  }

});
