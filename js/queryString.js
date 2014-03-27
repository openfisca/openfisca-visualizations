define([], function() {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  'use strict';
  // jshint nonstandard:true
  var queryString = {};
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split('=');
    // If first entry with this name
    if (typeof queryString[pair[0]] === 'undefined') {
      queryString[pair[0]] = unescape(pair[1]);
      // If second entry with this name
    } else if (typeof queryString[pair[0]] === 'string') {
      var arr = [ queryString[pair[0]], pair[1] ];
      queryString[pair[0]] = unescape(arr);
      // If third or later entry with this name
    } else {
      queryString[pair[0]].push(unescape(pair[1]));
    }
  }
  return queryString;
});
