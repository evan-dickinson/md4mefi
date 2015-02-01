module.exports = function(grunt) {
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
      firefox: {
        src: ['safari/md4mefi.safariextension/script.js'],
        dest: 'firefox/data/app.js'
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'lib/**/*.js'],
      options: {
        // Suppress warnings about using foo['bar'] instead of foo.bar
        // That's a thing we do in the tests.
        //
        // To find warning codes, run grunt --verbose
         '-W069': true,
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
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'concat']
    }    

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');  

  grunt.registerTask('test', ['coffee', 'nodeunit']);
  grunt.registerTask('default', ['jshint', 'concat']);

};