module.exports = function(grunt) {
  var autoprefixer = require('autoprefixer-core');

  grunt.initConfig({
    concat: {
      options: {
        separator: ';',
      },
      safari: {
        src: ['node_modules/marked/lib/marked.js',
              'node_modules/jquery/dist/jquery.js',
              'node_modules/jquery.selection/src/jquery.selection.js',
              'lib/md4mefi.js',
              'lib/inject.js'],
        dest: 'safari/md4mefi.safariextension/script.js',
        nonull: true, // warn if a file is missing or invalid
      },
    },

    // Generate scripts and CSS for Safari, then
    // copy them over to Firefox.
    copy: {
      safariToFirefox: {
        files: [
          // includes files within path
          {expand: false, src: ['safari/md4mefi.safariextension/script.js'], dest: 'firefox/data/script.js', filter: 'isFile'},

          // includes files within path and its sub-directories
          {flatten: true, src: ['safari/md4mefi.safariextension/md4mefi.css'], dest: 'firefox/data/md4mefi.css'},
        ],
      },
    },

    jshint: {
      files: ['Gruntfile.js', 'lib/**/*.js'],
      options: {
        // Suppress warnings about using foo['bar'] instead of foo.bar
        // That's a thing we do in the tests.
        //
        // To find warning codes, run grunt --verbose
         '-W069': true,

         // Suppress warnings about multi-line strings.
         // That's an ES5 feature, so we're OK using it
         '-W043': true,
      }
    },    

    coffee: {
      compile: {
        files: [
          {
            expand: true,     // Enable dynamic expansion.
            cwd: 'test/',      // Src matches are relative to this path.
            src: ['**/*.coffee'], // Actual pattern(s) to match.
            dest: 'test-compiled/',   // Destination path prefix.
            ext: '.js',   // Dest filepaths will have this extension.
            extDot: 'first'   // Extensions in filenames begin after the first dot
          },
        ],
      },      
    },

    sass: {
      dist: {
        files: {
          'safari/md4mefi.safariextension/md4mefi.css': 'scss/md4mefi.scss',
        }
      }
    },

    postcss: {
      options: {
        processors: [
          autoprefixer({ browsers: ['last 2 version'] }).postcss
        ]
      },
      dist: { src: 'safari/md4mefi.safariextension/*.css' }
    },


    nodeunit: {
      all: {
        files: [
          {
            expand: true,
            cwd:    'test-compiled',
            src:    ['**/*.js'],
          }
        ],
      },
      options: {
        // reporter: 'junit',
        // reporterOptions: {
        //   output: 'outputdir'
        // }
        reporter: 'grunt',
      },
    },

    watch: {
      files: ['<%= jshint.files %>', 'scss/**/*.scss'],
      tasks: ['default']
    }    

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');  
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-postcss');


  grunt.registerTask('test', ['coffee', 'jshint', 'nodeunit']);
  grunt.registerTask('default', ['coffee', 'jshint', 'sass', 'postcss', 'concat', 'copy']);

};