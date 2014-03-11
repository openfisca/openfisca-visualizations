require([
  'domReady',
  'jquery',
  'underscore',

  'queryString'
], function(domReady, $, _, queryString) {

    var simulationData;
    $.ajax({
      type: "GET",
      url: queryString.simulationUrl,
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

      return nodes
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error('Fetch API data error : ', jqXHR, textStatus, errorThrown);
    })
    .then(function(data) {
      $columnValuesHeader = $('#openfisca-table').find('th').last();
      $tableBody = $('#openfisca-table').find('tbody');
      _.each(data, function(item) {
        if ($columnValuesHeader.attr('colspan') > item.values.length) {
          $columnValuesHeader.attr('colspan', item.values.length)
        }
        $tr = $('<tr>');
        $tr.append($('<td>').html(item.name))
        _.each(item.values, function(value) {
          $tr.append($('<td>', {'class': value > 0 ? 'success' : 'danger'}).html(value.toFixed(2)));
        });
      $tableBody.append($tr);
      });
    });

  });
