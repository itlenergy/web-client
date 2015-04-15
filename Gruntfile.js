
var path = require('path');
var version = require('./package.json').version;

var browserifyFiles = {
  'static/app-<%= pkg.version %>.js': ['src/client/index.es6']
};

var browserifyOptions = {
  extensions: ['.html', '.es6'],
  "transform": [
    "browserify-shim",
    [
      "babelify",
      {
        "loose": true,
        "optional": [
          "runtime"
        ],
        "experimental": true,
        "ignore": /node_modules/
      }
    ],
    "ractivate"
  ]
};

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    browserify: {
      dev: {
        files: browserifyFiles,
        options: {
          browserifyOptions: browserifyOptions
        }
      },
      
      watch: {
        files: browserifyFiles,
        options: {
          browserifyOptions: browserifyOptions,
          watch: true,
          keepAlive: true
        }
      }
    },
    
    copy: {
      main: {
        files: [
          {expand: true, flatten: true, src: ['node_modules/dist/css/bootstrap.min.css'],
            dest: 'static/'},
          {expand: true, flatten: true, src: ['src/client/app.css'], dest: 'static/'},
          {expand: true, flatten: true, src: ['src/logo.png'], dest: 'static/'}
        ]
      }
    },
    
    notify_hooks: {
      options: {
        enabled: true,
        success: true
      }
    },
    
    clean: {
      release: [
        'static/*'
      ]
    }
  });
  
  grunt.task.run('notify_hooks');
  
  grunt.registerTask('default', [
    'browserify:dev',
    'copy'
  ]);
};