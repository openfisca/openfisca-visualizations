require.config({
  urlArgs: 'bust=' + Math.random(),
  paths: {
    d3: '/bower_components/d3/d3',
    domReady: '/bower_components/requirejs-domready/domReady',
    hbs: '/bower_components/require-handlebars-plugin/hbs',
    jquery: '/bower_components/jquery/dist/jquery',
    nvd3: '/bower_components/nvd3/nv.d3',
    queryString: '/js/queryString',
    underscore: '/bower_components/underscore/underscore'
  },
  shim: {
    d3: {exports: 'd3'},
    jquery: {exports: '$'},
    nvd3: {exports: 'nv', deps: ['d3']},
    underscore: {exports: '_'}
  }


});
