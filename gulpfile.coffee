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
    .pipe(coffee({bare: true}).on('error', gutil.log))
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

# Copy JS files into place for Chrome & Safari
gulp.task 'js-chrome-and-safari', () ->
  # Concat these to script.js
  gulp.src [
      'node_modules/jquery/dist/jquery.js'
      'node_modules/jquery.selection/src/jquery.selection.js'
      'node_modules/jquery-color/jquery.color.js'
      'lib/save-restore.js'
      'lib/send-message.js'
      'lib/inject-utils.js'
      'lib/inject.js'
    ]
    .pipe concat 'script.js',
      newLine: ';'
    .pipe(gulp.dest('./safari/md4mefi.safariextension/'))
    .pipe(gulp.dest('./chrome/'))

  # Concat these to global.js
  gulp.src [
      #'node_modules/marked/lib/marked.js'
      'lib/md4mefi.js'
      'lib/receive-message.js'
    ]
    .pipe concat 'global.js',
      newLine: ';'
    .pipe(gulp.dest('./safari/md4mefi.safariextension/'))
    .pipe(gulp.dest('./chrome/'))

# Copy JS files into place for Firefox
gulp.task 'js-firefox', () ->
  gulp.src [
      'lib/save-restore.js'
      'lib/send-message.js'
      'lib/inject-utils.js'
      'lib/inject.js'
    ]
    .pipe(gulp.dest('./firefox/data/'))

  # Copy the node modules that Firefox will need.
  gulp.src [
      'node_modules/jquery/**'
      'node_modules/jquery.selection/**'
      'node_modules/jquery-color/**'
      'node_modules/marked/**'
    ],
    base: './node_modules'
  .pipe gulp.dest './firefox/node_modules'


  gulp.src [
      'lib/firefox-main.js'
      'node_modules/marked/lib/marked.js'
      'lib/md4mefi.js'
      'lib/receive-message.js'
    ]
    .pipe(gulp.dest('./firefox/lib/'))

gulp.task 'css', () ->
  gulp.src 'scss/md4mefi.scss'
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
  async.parallel [
    (cb) -> modifyPlist 'safari/md4mefi.safariextension/Info.plist', [
        "Set CFBundleShortVersionString #{packageJson.version}"
        "Set CFBundleVersion #{packageJson.version}"
      ], cb
    (cb) -> modifyPlist 'website/app/assets/md4mefi.update.plist', [
        "Set \"Extension Updates:0:CFBundleShortVersionString\" #{packageJson.version}"
        "Set \"Extension Updates:0:CFBundleVersion\" #{packageJson.version}"
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

gulp.task 'chrome-json', (callback) ->
  copyJson './package.json',
    './chrome/manifest.json',
    ['version'],
    callback

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
  'safari-update-plists'
]

gulp.task 'chrome', [
  'common'
  'chrome-json'
]

gulp.task 'default', ['firefox', 'safari', 'chrome']

gulp.task 'ff-build', ['firefox'], () ->
  # .src '' starts up a pipe with nothing in it
  gulp.src ''
    # Path is relative to the cwd
    .pipe shell '../node_modules/jpm/bin/jpm xpi',
      cwd: './firefox'

gulp.task 'ff-run', ['firefox'], () ->
  binaryPath = '/Applications/Internet/Firefox.app'
  binaryFlag = 
    if fs.existsSync(binaryPath) then "--binary #{binaryPath}" else  ""

  command = """
    ../node_modules/jpm/bin/jpm run 
    #{binaryFlag}
    --profile ./.profile
  """.replace(/[\r\n]/g, " ")

  gulp.src ''
    .pipe shell command,
      cwd: './firefox'


