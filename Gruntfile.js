module.exports = function(grunt) {

  // grunt.initConfig({
  //   jshint: {
  //     files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
  //     options: {
  //       globals: {
  //         jQuery: true
  //       }
  //     }
  //   },
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
  });

  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('default', ['concat']);

};