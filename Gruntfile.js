module.exports = function(grunt) {
  "use strict";
  var autoprefixer = require('autoprefixer-core');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        separator: ';',
      },
      safari: {
        src: ['node_modules/marked/lib/marked.js',
              'node_modules/jquery/dist/jquery.js',
              'node_modules/jquery.selection/src/jquery.selection.js',
              'node_modules/jquery-color/jquery.color.js',
              'lib/md4mefi.js',
              'lib/save-restore.js',
              'lib/inject.js'],
        dest: 'safari/md4mefi.safariextension/script.js',
        nonull: true, // warn if a file is missing or invalid
      },
    },

    copy: {

      // Generate scripts and CSS for Safari, then
      // copy them over to Firefox.
      safariToFirefox: {
        files: [
          // includes files within path

          {expand: false, src: ['lib/inject.js'], dest: 'firefox/data/inject.js'},
          {expand: false, src: ['lib/md4mefi.js'], dest: 'firefox/data/md4mefi.js'},
          {expand: false, src: ['lib/save-restore.js'], dest: 'firefox/data/save-restore.js'},

          {expand: false, src: ['node_modules/marked/lib/marked.js'], dest: 'firefox/data/dependencies/marked.js'},
          {expand: false, src: ['node_modules/jquery/dist/jquery.js'], dest: 'firefox/data/dependencies/jquery.js'},
          {expand: false, src: ['node_modules/jquery.selection/src/jquery.selection.js'], dest: 'firefox/data/dependencies/jquery.selection.js'},
          {expand: false, src: ['node_modules/jquery-color/jquery.color.js'], dest: 'firefox/data/dependencies/jquery.color.js'},

          // includes files within path and its sub-directories
          {flatten: true, src: ['safari/md4mefi.safariextension/md4mefi.css'], dest: 'firefox/data/md4mefi.css'},
        ],
      },

      // Copy generated extension files to the website
      copyExtensionsToWebsite: {
        files: [
            { src: ['safari/md4mefi.safariextz'],  dest: 'website/app/assets/md4mefi.safariextz', nonull: true },
            { src: ['firefox/md4mefi.xpi'],        dest: 'website/app/assets/md4mefi.xpi', nonull: true },
            { src: ['firefox/md4mefi.update.rdf'], dest: 'website/app/assets/md4mefi.update.rdf',  nonull: true },  
        ],
      },

      icons: {
        files: [
          {src: ['icon/markdown-mark_48x48.png'], dest: 'safari/md4mefi.safariextension/Icon.png'},
          {src: ['icon/markdown-mark_64x64.png'], dest: 'safari/md4mefi.safariextension/Icon-64.png'},

          {src: ['icon/markdown-mark_48x48.png'], dest: 'firefox/data/icon.png'},
          {src: ['icon/markdown-mark_64x64.png'], dest: 'firefox/data/icon-64.png'},
        ],
      },
    },

    // Update the Safari extension version number in the plist file
    run: {
      updateSafariVersion: {
        cmd: '/usr/libexec/PlistBuddy',
        //cmd: 'echo',
        args: [
          '-c',
          'Set CFBundleShortVersionString <%= pkg.version %>',
          '-c',
          'Set CFBundleVersion <%= pkg.version %>',
          '-c',
          'Set Website <%= pkg.homepage %>',
          'safari/md4mefi.safariextension/Info.plist',
        ],
      },

      updateSafariVersion2: {
        cmd: '/usr/libexec/PlistBuddy',
        args: [
          '-c',
          'Set "Extension Updates:0:CFBundleShortVersionString" <%= pkg.version %>',
          '-c',
          'Set "Extension Updates:0:CFBundleVersion" <%= pkg.version %>',
          'website/app/assets/md4mefi.update.plist',
        ],
      },
    },

    // Update the Firefox extension version number in the JSON file
    update_json: {
      options: {
        indent: '  ',
      },
      firefox: {
        src: 'package.json',
        dest: 'firefox/package.json',
        fields: 'author, description, homepage, license, name, version',
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
        options: {
          sourceMap: true,
        },
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
            cwd:    'test',
            src:    ['**/*.coffee'],
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

  grunt.registerTask('test', ['coffee', 'jshint', 'nodeunit']);
  grunt.registerTask('default', [
    'coffee', 
    'jshint', 
    'sass', 
    'postcss', 
    'concat', 
    'copy:safariToFirefox',
    'copy:icons',
  ]);
  grunt.registerTask('update-version', [
    'update_json:firefox', 
    'run:updateSafariVersion', 
    'run:updateSafariVersion2'
  ]);

  require('load-grunt-tasks')(grunt); // load all grunt tasks. Done!  
};