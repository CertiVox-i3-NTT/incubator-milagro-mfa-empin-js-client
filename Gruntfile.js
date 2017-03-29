module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    settings: grunt.file.readJSON('settings.json'),

    clean: {
      tmp: ["tmp/**"],
      dist: ["dist/**", "!dist/index.html"],
    },

    sass: {
      compileMpin: {
        files: [{
          expand: true,
          cwd: 'tmp/sass',
          src: [
            'mpin.scss'
          ],
          dest: 'tmp/css',
          ext: '.css',
        }]
      }
    },
    cssmin: {
      target: {
        files: {
          'dist/css/mpin.min.css': [
            'tmp/css/mpin.css'
          ]
        }
      }
    },

    // todo: remove bootstrap css, js from mpin js
    concat: {
      buildMpinClientJS: {
        src: [
          'src/resource/lang/*.js',
          'src/header/mpin_common.js',
          'src/header/mpin_utility.js',
          'tmp/mpin_config.js',
          'src/header/mpin_logger.js',
          'src/header/mpin_storage.js',
          'src/header/mpin_core.js',
          'src/header/mpin_view_controller.js',
          'src/header/mpin_view_controller_manager.js',
          'src/view_controller/mpin_home_view_controller.js',
          'src/view_controller/mpin_install_view_controller.js',
          'src/view_controller/mpin_delete_view_controller.js',
          'src/view_controller/mpin_initial_view_controller.js',
          'src/view_controller/mpin_mobile_login_view_controller.js',
          'src/mpin_controller.js'
          ],
        dest: 'tmp/mpin_client.js',
      },
      buildMpinJS: {
        src: [
          'tmp/handlebars-v4.0.2.js',
          'tmp/mpin_lib.js',
          'tmp/mpin_view_template.js',
          'tmp/mpin_client.js',
          ],
        dest: 'dist/js/mpin.js',
      },
    },
    copy: {
      moveImage: {
        files: [
          {
            expand: true,
            cwd: 'src/img/',
            src: ['**'],
            dest: 'tmp/img/',
          },
        ],
      },
      moveLibraryJS: {
        files: [
          {
            expand: true,
            cwd: 'lib/',
            src: ['handlebars-v4.0.2.js'],
            dest: 'tmp/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'lib/dist/bootstrap/js/',
            src: ['bootstrap.min.js'],
            dest: 'dist/js/',
            filter: 'isFile'
          },
        ],
      },
      buildDemo: {
        files: [
          {
            expand: true,
            cwd: 'demo',
            src: ['index.html', 'home.html'],
            dest: 'dist/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'lib/dist/bootstrap/css',
            src: ['**'],
            dest: 'dist/css/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'lib/dist/',
            src: ['mootools-yui-compressed.js'],
            dest: 'dist/js',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'lib/dist/',
            src: ['jquery-1.11.3.js'],
            dest: 'dist/js',
            filter: 'isFile'
          },
        ],
      },
      sassMove: {
        files: [
          {
            expand: true,
            cwd: 'src/style/',
            src: ['*.scss'],
            dest: 'tmp/sass',
            filter: 'isFile'
          },
        ],
      },
      testBuild: {
        files: [
          {
            expand: true,
            src: ['test/**'],
            dest: 'dist/',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'lib/test',
            src: ['qunit-1.19.0.js'],
            dest: 'dist/js',
            filter: 'isFile'
          },
          {
            expand: true,
            cwd: 'lib/test',
            src: ['qunit-1.19.0.css'],
            dest: 'dist/css',
            filter: 'isFile'
          },
        ],
      },
    },

    handlebars: {
      compile: {
        options: {
          processName: function(filePath) {
            var name = filePath.replace(/src\/view\/(\w+)\.html/, '$1');
            return name;
          },
          namespace: function(filename) {
            return "Mpin.ViewManager.views";
          },
        },
        files: {
          "tmp/mpin_view_template.js": [
            "src/view/home.html",
            "src/view/install.html",
            "src/view/delete.html",
            "src/view/manager.html",
            "src/view/initial.html",
            "src/view/mobile_login.html"
          ]
        }
      }
    },
    replace: {
      baseUrl: {
        options: {
          patterns: [
            {
              match: 'IMAGE_BASE_URL',
              replacement: '<%= settings.imageBaseURL %>'
            },
            {
              match: 'RPA_BASE_URL',
              replacement: '<%= settings.rpaBaseURL %>'
            },
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['src/header/mpin_config.js'], dest: 'tmp/'}
        ]
      }
    },
    bgShell: {

      buildMpinLibraryJS: {
        cmd : 'cp lib/mpin/mpinjs.js tmp/mpin_lib.js',
        options: {
          stdout: true,
        },
      },
      mkdirDeployJS: {
        cmd: 'mkdir -p <%= settings.deployTargetDirJS %>',
        options: {
          stdout: true,
        },
      },
      mkdirDeployCSS: {
        cmd: 'mkdir -p <%= settings.deployTargetDirCSS %>',
        options: {
          stdout: true,
        },
      },
      mkdirDeployImage: {
        cmd: 'mkdir -p <%= settings.deployTargetDirImage %>',
        options: {
          stdout: true,
        },
      },
      deployJSToServer: {
        cmd: 'cp dist/js/mpin.js <%= settings.deployTargetDirJS %>',
        options: {
          stdout: true,
        },
      },
      deployCSSToServer: {
        cmd: 'cp dist/css/mpin.min.css <%= settings.deployTargetDirCSS %>',
        options: {
          stdout: true,
        },
      },
      deployImageToServer: {
        cmd: 'cp -r tmp/img/*.* <%= settings.deployTargetDirImage %>',
        options: {
          stdout: true,
        },
      },
    },

    jshint: {
      gruntFile: 'Gruntfile.js',
      tmp: 'src/**/*.js',
      options: {
        sub: true,
        laxbreak: true,
        loopfunc: true,
        expr: true,
        reporter: require('jshint-stylish')
      },
    },
    uglify: {
      js: {
        files: {
          'dist/js/mpin.min.js': 'dist/js/mpin.js'
        },
      },
    },

    qunit: {
      all: ['dist/test/**/*.html'],
      options: {
        timeout: 20000,
      },
    },

    connect: {
      server: {
        options: {
            hostname: '*',
            open: {
                target: 'http://127.0.0.1:9000'
            },
            port: 9000,
            base: 'dist',
        },
      },
    },
    watch: {
      options: {
        livereload: true
      },
      demo: {
        files: ['demo/*.*'],
        tasks: ['demo-build', 'deploy'],
      },
      html: {
        files: ['src/view/*.html'],
        tasks: ['js-build', 'deploy'],
      },
      js: {
        files: ['src/**/*.js', 'lib/mpin/**/*.js'],
        tasks: ['js-build', 'check', 'deploy'],
      },
      cssMpin: {
        files: [
          'src/style/mpin_variables.scss',
          'src/style/mpin.scss',
          'src/style/mpin_manager.scss',
          'src/style/mpin_content.scss',
          'src/style/mpin_select.scss',
          'src/style/mpin_button.scss',
          'src/style/mpin_input.scss',
          'src/style/mpin_message.scss',
          'src/style/mpin_link.scss'
          ],
        tasks: ['copy:sassMove', 'sass:compileMpin', 'cssmin', 'deploy'],
      },
      img: {
        files: ['src/img/*.*'],
        tasks: ['img-build', 'deploy'],
      },
      test: {
        files: ['test/**/*.*'],
        tasks: ['test'],
      },
    },
  });

  // plugin
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('grunt-replace');

  // task
  // TODO: Add deploy task
  grunt.registerTask('check', ['jshint']);

  // Run after grunt default
//  grunt.registerTask('test', ['copy:testBuild', 'qunit']);
  grunt.registerTask('test', ['copy:testBuild']); // don't use qunit task

  grunt.registerTask('js-preprocess', ['replace']);
  grunt.registerTask('js-view-build', ['handlebars']);
  grunt.registerTask('js-controller-build', ['concat:buildMpinClientJS']);
  grunt.registerTask('js-library-build', ['bgShell:buildMpinLibraryJS', 'copy:moveLibraryJS']);
  grunt.registerTask('js-mpin-build', ['concat:buildMpinJS', 'uglify']);
  grunt.registerTask('js-build', ['js-preprocess',
                                  'js-view-build',
                                  'js-controller-build',
                                  'js-library-build',
                                  'js-mpin-build']
  );

  grunt.registerTask('css-build', ['copy:sassMove', 'sass:compileMpin', 'cssmin']);

  grunt.registerTask('img-build', ['copy:moveImage']);

  grunt.registerTask('demo-build', ['copy:buildDemo']);

  grunt.registerTask('build', ['js-build', 'css-build', 'img-build', 'demo-build']);

  grunt.registerTask('deploy', ['bgShell:mkdirDeployJS',
                                'bgShell:mkdirDeployCSS',
                                'bgShell:mkdirDeployImage',
                                'bgShell:deployJSToServer',
                                'bgShell:deployCSSToServer',
                                'bgShell:deployImageToServer']
  );

  grunt.registerTask('debug', ['clean', 'check', 'build', 'deploy', 'connect', 'watch']);

  grunt.registerTask('default', ['clean', 'build', 'deploy']);
};
