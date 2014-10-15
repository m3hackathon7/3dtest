'use strict';
// Gruntfile.js
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  //grunt.loadNpmTasks('grunt-bower-task');

  // Configurable paths for the application
  var appConfig = {
    app: './',
    appjs: './js',
    appcss: './css',
    apphtml: './',
    test: 'test/js'
  };


  grunt.initConfig({
    appConfig: appConfig,

    bower: {
      install: {
        options: {
          targetDir: '<%= appConfig.appjs %>/vendor',
          layout: 'byComponent',
          install: true,
          verbose: false,
          cleanTargetDir: true,
          cleanBowerDir: true
        }
      }
    },

    watch: {
      js: {
        files: ['<%= appConfig.appjs %>/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: [
          '<%= appConfig.test %>/spec/{,*/}*.js',
          '<%= appConfig.appjs %>/{,*/}*.js'
        ],
        tasks: ['newer:jshint:test', 'karma']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= appConfig.test %>/{,*/}*.html',
          '<%= appConfig.apphtml %>/{,*/}{,*/}*.html.ssp',
          '<%= appConfig.appjs %>/{,*/}*.js',
          '<%= appConfig.appcss %>/{,*/}*.css'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              // connect.static('.tmp'),
              //connect().use(
              //  '/bower_components',
              //  connect.static('./bower_components')
              //),
              connect.static(appConfig.test),
              connect.static(appConfig.app)
            ];
          }
        }
      }
    },

    // javascript 静的解析
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= appConfig.appjs %>/{,*/}*.js'
        ]
      },
      jenkins: {
        options: {
          reporter: require('jshint-junit-reporter'),
          reporterOutput: 'target/javascript/junit-output.xml'
        },
        src: [
          'Gruntfile.js',
          '<%= appConfig.appjs %>/{,*/}*.js'
        ]
      },
      test: {
        options: {
          jshintrc: '<%= appConfig.test %>/.jshintrc'
        },
        src: ['<%= appConfig.test %>/spec/{,*/}*.js']
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: '<%= appConfig.test %>/karma.conf.js',
        singleRun: true
      }
    }

  });

  grunt.registerTask('live', [
    'connect:livereload',
    //'watch:livereload'
    'watch'
  ]);

  grunt.registerTask('test', [
    'jshint',
    'karma'
  ]);

  grunt.registerTask('testJenkins', [
    'jshint:jenkins',
    'karma'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'test'
  ]);
};
