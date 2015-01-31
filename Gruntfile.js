module.exports = function(grunt) {

  // grunt.initConfig({


  // });

  // grunt.loadNpmTasks('grunt-contrib-jshint');


  grunt.initConfig({
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['node_modules/markdown/lib/markdown.js',
              'node_modules/typogr/typogr.js',
              'node_modules/jquery/dist/jquery.js',
              'node_modules/jquery.selection/src/jquery.selection.js',
              'lib/renderJsonML.js', 
              'lib/md4mefi.js',
              'lib/inject.js'],
        dest: 'safari/md4mefi.safariextension/script.js',
        nonull: true, // warn if a file is missing or invalid
      },
    },

    jshint: {
      files: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'],
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
        files: {
          'test/coffeetest.js': 'test/test.coffee', 
          'test/link-number.js': 'test/link-number.coffee',
          'test/marked.js': 'test/marked.coffee',
          'test/mangleNewlines.js': 'test/mangleNewlines.coffee',
          'test/code.js': 'test/code.coffee',
          'test/lists.js': 'test/lists.coffee',
        }
      },      
    },

    nodeunit: {
      all: ['test/*.js'],
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