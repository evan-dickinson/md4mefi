module.exports = function(grunt) {

  // grunt.initConfig({

  //   watch: {
  //     files: ['<%= jshint.files %>'],
  //     tasks: ['jshint']
  //   }
  // });

  // grunt.loadNpmTasks('grunt-contrib-jshint');
  // grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['node_modules/markdown/lib/markdown.js',
              'node_modules/typogr/typogr.js',
              'lib/renderJsonML.js', 
              'lib/md4mefi.js'],
        dest: 'dist/built.js',
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

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint', 'concat']);

};