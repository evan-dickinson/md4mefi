coffee = require 'gulp-coffee'
gulp = require 'gulp'
shell = require 'gulp-shell'
sass = require('gulp-sass')(require('sass'))
autoprefixer = require 'gulp-autoprefixer'
fs = require 'fs'
jshint = require 'gulp-jshint'
concat = require 'gulp-concat'
del = require 'del'
rename = require 'gulp-rename'
async = require 'async'
child_process = require 'child_process'
sourcemaps = require 'gulp-sourcemaps'
zip = require 'gulp-zip'
dot = require 'dot-component'
path = require 'path'
plumber = require 'gulp-plumber'
mergeStream = require 'merge-stream'
mustache = require 'gulp-mustache'
glob = require 'glob'

# Define script arrays first
contentScripts = [
  'node_modules/jquery/dist/jquery.js'
  'node_modules/jquery.selection/src/jquery.selection.js'
  'node_modules/jquery-color/jquery.color.js'
  'lib/save-restore.js'
  'lib/send-message.js'
  'lib/inject-utils.js'
  'lib/inject.js'
]

backgroundScripts = [
  'node_modules/marked/lib/marked.umd.js'
  'lib/md4mefi.js'
  'lib/receive-message.js' 
]

allScripts = []
allScripts = allScripts.concat contentScripts
allScripts = allScripts.concat backgroundScripts

# Helper functions
copyJson = (srcFilename, destFilename, fields, callback) ->
  srcPackageJson = require(srcFilename)
  destPackageJson = require(destFilename)

  # It turns out that we don't need to copy the dependencies into
  # Firefox's package.json
  for fieldName in fields
    destPackageJson[fieldName] = srcPackageJson[fieldName]

  fs.writeFile destFilename,
    JSON.stringify(destPackageJson, null, 2), 
    callback

stripPaths = (paths) -> 
  paths.map (filePath) -> 
    if typeof filePath == 'string'
      path.basename(filePath)
    else
      console.log 'Warning: non-string path:', filePath
      String(filePath)

# Task functions
clean = (cb) ->
  del [
    '.sass-cache'
    'chrome/*.{js,png,css,css.map}'
    'firefox/data/'
    'firefox/lib/'
    'firefox/node_modules'
    'firefox/bootstrap.js'
    'firefox/install.rdf'
    'firefox/*.xpi'
    'safari/md4mefi.safariextz'
    'safari/md4mefi.safariextension/*.{js,png,css,css.map,html}'
    'test/compiled/'
    ]
  cb()

testCoffeescript = () ->
  # Compile coffeescript
  return gulp.src('./test/*.coffee')
    .pipe plumber
      errorHandler: (error) ->
        console.log error.stack
    .pipe sourcemaps.init()
    .pipe(coffee({bare: true}))
    .pipe sourcemaps.write()
    .pipe(gulp.dest('./test/compiled/'))

individualTests = (callback) ->
  glob './test/compiled/*.js', (err, files) ->
    if err then callback(err)
    async.each files, (filename, cb) ->
      filename = path.basename filename
      mustacheData = 
        scriptFiles: [
          scriptFilename: filename
        ]
      gulp.src('./test/test-template.mustache')
        .pipe mustache mustacheData
        .pipe rename filename.replace(/js$/, 'html')
        .pipe gulp.dest './test/compiled/' 
    ,
      callback

allTests = (callback) ->
  glob './test/compiled/*.js', (err, files) ->
    if err then callback(err)
    scriptFiles = files
      .map path.basename
      .map (filename) -> { scriptFilename: filename }

    gulp.src('./test/test-template.mustache')
      .pipe mustache 
        scriptFiles: scriptFiles
      .pipe rename 'all-tests.html'
      .pipe gulp.dest './test/compiled/' 
    callback()

jsLint = () ->
  return gulp.src 'lib/*.js'
    .pipe jshint
      # Suppress warnings about multi-line strings.
      # That's an ES5 feature, so we're OK using it    
      '-W043': true

      # Suppress warnings about using foo['bar'] instead of foo.bar
      # That's a thing we do in the tests.
      #
      # To find warning codes, run grunt --verbose      
      '-W069': true
    .pipe jshint.reporter 'default'
    .pipe jshint.reporter 'fail'

jsSafari = () ->
  return gulp.src allScripts
    .pipe gulp.dest './safari/md4mefi.safariextension/'

jsChrome = () ->
  return gulp.src allScripts
    .pipe gulp.dest './chrome/'

# Copy JS files into place for Firefox
jsFirefox = () ->
  data = gulp.src [
      'lib/save-restore.js'
      'lib/send-message.js'
      'lib/inject-utils.js'
      'lib/inject.js'
    ]
    .pipe(gulp.dest('./firefox/data/'))

  # Copy the node modules that Firefox will need.
  modules = gulp.src [
      'node_modules/jquery/**'
      'node_modules/jquery.selection/**'
      'node_modules/jquery-color/**'
      'node_modules/marked/**'
    ],
    base: './node_modules'
  .pipe gulp.dest './firefox/node_modules'

  lib = gulp.src [
      'lib/firefox-main.js'
      'node_modules/marked/lib/marked.umd.js'
      'lib/md4mefi.js'
      'lib/receive-message.js'
    ]
    .pipe(gulp.dest('./firefox/lib/'))

  return mergeStream(data, modules, lib)

css = () ->
  return gulp.src 'scss/md4mefi.scss'
    .pipe plumber
      errorHandler: (error) ->
        console.log error.message
        this.emit 'end'
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('chrome/'))
    .pipe(gulp.dest('safari/md4mefi.safariextension/'))
    .pipe(gulp.dest('firefox/data'))

icon = (done) ->
  stream1 = gulp.src 'icon/markdown-mark_48x48.png'
    # Capitalize for Safari
    .pipe rename 'Icon.png'
    .pipe gulp.dest 'safari/md4mefi.safariextension/'
    # Lower case for other browsers
    .pipe rename 'icon.png'
    .pipe gulp.dest 'firefox/data/'
    .pipe gulp.dest 'chrome/'

  stream2 = gulp.src 'icon/markdown-mark_64x64.png'
    .pipe rename 'Icon-64.png'
    .pipe gulp.dest 'safari/md4mefi.safariextension/'
    .pipe rename 'icon-64.png'
    .pipe gulp.dest 'firefox/data/'
    .pipe gulp.dest 'chrome/'

  stream3 = gulp.src 'icon/markdown-mark_128x128.png'
    .pipe rename 'icon-128.png'
    .pipe gulp.dest 'chrome/'

  merged = mergeStream(stream1, stream2, stream3)
  merged.on 'end', done
  return merged

firefoxJson = (callback) ->
  copyJson './package.json',
    './firefox/package.json',
    ['author', 'description', 'homepage', 'license', 
    'name', 'version'],
    callback

# Updated chrome-json task to use manifest v3 format
chromeJson = (callback) ->
  async.series [
    (cb) -> copyJson './package.json',
      './chrome/manifest.json',
      ['version'],
      cb

    (cb) -> 
      # Clear require cache to get fresh manifest
      manifestPath = path.resolve('./chrome/manifest.json')
      delete require.cache[manifestPath]
      
      manifest = require('./chrome/manifest.json')
      
      # For Manifest V3, we need to handle background scripts differently
      # Create a service worker that imports all the background scripts
      backgroundContent = '''
// Service workers don't have window object, so we create a compatibility layer
self.window = self;

// Import all background scripts

'''
      
      for script in backgroundScripts
        scriptName = path.basename(script)
        backgroundContent += "importScripts('#{scriptName}');\n"
      
      # Write the background service worker
      fs.writeFileSync './chrome/background.js', backgroundContent
      
      # Update manifest to use service worker instead of scripts array
      manifest.background = { service_worker: 'background.js' }
      manifest.manifest_version = 3
      
      # Update content scripts paths
      if manifest.content_scripts and manifest.content_scripts[0] and manifest.content_scripts[0].js
        manifest.content_scripts[0].js = stripPaths(contentScripts)
      else
        console.log 'Warning: content_scripts not found in manifest'
      
      # Add host permissions for manifest v3
      if manifest.content_scripts and manifest.content_scripts[0] and manifest.content_scripts[0].matches
        manifest.host_permissions = manifest.content_scripts[0].matches
      
      fs.writeFile './chrome/manifest.json',
        JSON.stringify(manifest, null, 2),
        cb

  ], callback

chromeZip = () ->
  return gulp.src 'chrome/*'
    .pipe zip('chrome.zip')
    .pipe gulp.dest('.')

# Composite tasks
test = gulp.series(testCoffeescript, gulp.parallel(individualTests, allTests))
common = gulp.parallel(css, jsLint, icon)
firefox = gulp.series(common, jsFirefox, firefoxJson)
chrome = gulp.series(common, jsChrome, chromeJson, chromeZip)
defaultTask = gulp.parallel(firefox, chrome)

watchTask = () ->
  gulp.watch ['test/*.coffee', 'test/*.mustache'], test
  gulp.watch 'scss/*.scss', css
  gulp.watch 'lib/*.js', gulp.parallel(jsSafari, jsChrome, jsFirefox)

# Export tasks
gulp.task 'clean', clean
gulp.task 'test-coffeescript', testCoffeescript
gulp.task 'individual-tests', gulp.series(testCoffeescript, individualTests)
gulp.task 'all-tests', gulp.series(testCoffeescript, allTests)
gulp.task 'test', test
gulp.task 'js-lint', jsLint
gulp.task 'js-safari', jsSafari
gulp.task 'js-chrome', jsChrome
gulp.task 'js-firefox', jsFirefox
gulp.task 'css', css
gulp.task 'icon', icon
gulp.task 'firefox-json', firefoxJson
gulp.task 'chrome-json', chromeJson
gulp.task 'chrome-zip', chromeZip
gulp.task 'common', common
gulp.task 'firefox', firefox
gulp.task 'chrome', chrome
gulp.task 'default', defaultTask
gulp.task 'watch', watchTask