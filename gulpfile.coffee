coffee = require 'gulp-coffee'
gulp = require 'gulp'
gutil = require 'gulp-util'
shell = require 'gulp-shell'
sass = require 'gulp-sass'
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
watch = require 'gulp-watch'
plumber = require 'gulp-plumber'
mergeStream = require 'merge-stream'

gulp.task 'clean', (cb) ->
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
    'safari/md4mefi.safariextension/*.{js,png,css,css.map}'
    'test/compiled/'
    ], (err, paths) ->
      # Swallow any errors. We don't care if the files were missing;
      # as long as they end up deleted.

      cb()


gulp.task 'test', () ->
  # Compile coffeescript
  gulp.src('./test/*.coffee')
    .pipe plumber
      errorHandler: (error) ->
        console.log error.stack
    .pipe sourcemaps.init()
    .pipe(coffee({bare: true}))
    .pipe sourcemaps.write()
    .pipe(gulp.dest('./test/compiled/'))

gulp.task 'js-lint', () ->
  gulp.src 'lib/*.js'
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
  'node_modules/marked/lib/marked.js'
  'lib/md4mefi.js'
  'lib/receive-message.js' 
]

allScripts = []
allScripts = allScripts.concat contentScripts
allScripts = allScripts.concat backgroundScripts

gulp.task 'js-safari', () ->
  gulp.src allScripts
    .pipe gulp.dest './safari/md4mefi.safariextension/'

gulp.task 'js-chrome', () ->
  gulp.src allScripts
    .pipe gulp.dest './chrome/'

# Copy JS files into place for Firefox
gulp.task 'js-firefox', () ->
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
      'node_modules/marked/lib/marked.js'
      'lib/md4mefi.js'
      'lib/receive-message.js'
    ]
    .pipe(gulp.dest('./firefox/lib/'))

  return mergeStream(data, modules, lib)

gulp.task 'css', () ->
  gulp.src 'scss/md4mefi.scss'
    .pipe plumber
      errorHandler: (error) ->
        console.log error.message
        this.emit 'end'
    .pipe(sass())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('chrome/'))
    .pipe(gulp.dest('safari/md4mefi.safariextension/'))
    .pipe(gulp.dest('firefox/data'))

gulp.task 'icon', () ->
  gulp.src 'icon/markdown-mark_48x48.png'
    # Capitalize for Safari
    .pipe rename 'Icon.png'
    .pipe gulp.dest 'safari/md4mefi.safariextension/'
    # Lower case for other browsers
    .pipe rename 'icon.png'
    .pipe gulp.dest 'firefox/data/'
    .pipe gulp.dest 'chrome/'

  gulp.src 'icon/markdown-mark_64x64.png'
    .pipe rename 'Icon-64.png'
    .pipe gulp.dest 'safari/md4mefi.safariextension/'
    .pipe rename 'icon-64.png'
    .pipe gulp.dest 'firefox/data/'
    .pipe gulp.dest 'chrome/'

  gulp.src 'icon/markdown-mark_128x128.png'
    .pipe rename 'icon-128.png'
    .pipe gulp.dest 'chrome/'


gulp.task 'copy-safari-extension-to-website', () ->
  gulp.src 'safari/md4mefi.safariextz'
    .pipe gulp.dest 'website/app/assets/'

modifyPlist = (filename, commands, callback) ->
  args = []
  for command in commands
    args.push '-c'
    args.push command
  args.push filename

  plistBuddy = child_process.spawn '/usr/libexec/PlistBuddy', args
  plistBuddy.on 'close', (code) ->
    callback()

gulp.task 'safari-update-plists', (callback) ->
  packageJson = require('./package.json')

  infoPlistCommands = [
    "Set CFBundleShortVersionString #{packageJson.version}"
    "Set CFBundleVersion #{packageJson.version}"
    "Delete Content:Scripts:Start"
    # need to add it as an array, otherwise we'll default to adding it as a dict
    "Add Content:Scripts:Start array"
  ]
  for scriptFilename, scriptIdx in stripPaths(contentScripts)
    infoPlistCommands.push """
      Add Content:Scripts:Start:#{scriptIdx} string #{scriptFilename}
      """

  async.parallel [
    (cb) -> modifyPlist 'safari/md4mefi.safariextension/Info.plist', 
      infoPlistCommands, cb

    (cb) -> modifyPlist 'website/app/assets/md4mefi.update.plist', [
        "Set \"Extension Updates:0:CFBundleShortVersionString\" #{packageJson.version}"
        "Set \"Extension Updates:0:CFBundleVersion\" #{packageJson.version}"
        "Set \"Extension Updates:0:URL\" https://github.com/evan-dickinson/md4mefi/releases/download/v#{packageJson.version}/md4mefi.safariextz"
      ], cb
    ], callback

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

gulp.task 'firefox-json', (callback) ->
  copyJson './package.json',
    './firefox/package.json',
    ['author', 'description', 'homepage', 'license', 
    'name', 'version'],
    callback

stripPaths = (paths) -> paths.map path.basename

gulp.task 'chrome-json', (callback) ->
  async.series [
    (cb) -> copyJson './package.json',
      './chrome/manifest.json',
      ['version'],
      cb

    (cb) -> 
      manifest = require('./chrome/manifest.json')
      dot.set manifest, 'background.scripts',   stripPaths(backgroundScripts)
      dot.set manifest, 'content_scripts.0.js', stripPaths(contentScripts)
      fs.writeFile './chrome/manifest.json',
        JSON.stringify(manifest, null, 2)
        cb

  ], callback

gulp.task 'chrome-zip', ['common', 'js-chrome', 'chrome-json'], () ->
  gulp.src 'chrome/*'
    .pipe zip('chrome.zip')
    .pipe gulp.dest('.')

gulp.task 'common', [
  'css'
  'js-lint'
  'icon'
]

gulp.task 'firefox', [
  'common'
  'js-firefox'
  'firefox-json'
]

gulp.task 'safari', [
  'common'
  'js-safari'
  'safari-update-plists'
]

gulp.task 'chrome', [
  'chrome-zip'
]

gulp.task 'default', ['firefox', 'safari', 'chrome']

gulp.task 'watch', () ->
  gulp.watch 'test/*.coffee', ['test']
  gulp.watch 'scss/*.scss', ['css']
  gulp.watch 'lib/*.js', ['js-safari', 'js-chrome', 'js-firefox']

gulp.task 'ff-build', ['firefox'], () ->
  # .src '' starts up a pipe with nothing in it
  gulp.src ''
    # Path is relative to the cwd
    .pipe shell '../node_modules/jpm/bin/jpm xpi',
      cwd: './firefox'

dosify = (path) ->
  if process.platform == 'win32'
    path.replace /\//g, '\\'
  else
    path

gulp.task 'ff-run', ['firefox'], (callback) ->
  # If the directory already exists, that's OK
  try 
    fs.mkdirSync './firefox/.profile'

  binaryPath = '/Applications/Internet/Firefox.app'
  command = 'node'

  args = []
  args.push dosify '../node_modules/jpm/bin/jpm'
  args.push 'run'
  if fs.existsSync(binaryPath)
    args.push '--binary'
    args.push binaryPath
  args.push '--profile'
  args.push dosify './.profile'
  args.push '--no-copy'

  ps = child_process.spawn command, args, 
    cwd: './firefox'
    # Use same stdin/stdout as the console
    stdio: 'inherit'

  ps.on 'close', (exitCode) -> callback()

