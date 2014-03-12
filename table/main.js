require([
  'domReady',
  'jquery',
  'underscore',

  'queryString'
], function(domReady, $, _, queryString) {

    $.ajax({
      type: "GET",
      url: queryString.simulationUrl,
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
      var $columnValuesHeader = $('#openfisca-table').find('th').last();
      var $tableBody = $('#openfisca-table').find('tbody');
      _.each(data, function(item) {
        if ($columnValuesHeader.attr('colspan') > item.values.length) {
          $columnValuesHeader.attr('colspan', item.values.length);
        }
        var $tr = $('<tr>');
        $tr.append($('<td>').html(item.name));
        _.each(item.values, function(value) {
          $tr.append($('<td>', {'class': value > 0 ? 'success' : 'danger'}).html(value.toFixed(2)));
        });
      $tableBody.append($tr);
      });
    });

  });
