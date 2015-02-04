md4mefi = require('../lib/md4mefi')
saveRestore = require('../lib/save-restore')

# Documentation of the various URLs in use. This is more for reference
# right now, than for use in code.
#
postUrls =
  meFi: # the blue
    newPost: 'https://www.metafilter.com/contribute/post_good.mefi?pid=205463'
    postPreview: 'post_preview.mefi'
    commentPreview: '/contribute/post_comment_preview.mefi#commentpreview'
  askMe: 
    newPost: 'https://ask.metafilter.com/contribute/post.cfm'
    postPreview: 'post_preview.cfm'
    commentPreview: '/contribute/post_comment_preview.mefi#commentpreview'




#doTestCase = require('../lib/test-utils').doTestCase

# Mock up a sessionStorage object for testing
#
# Adapted from: http://stackoverflow.com/a/11486338/939467
makeSessionStorage = (items) ->
  sessionStorage = 
    setItem: (key, value) ->
      this[key] = value + ''
    getItem: (key) ->
      if !this.hasOwnProperty(key)
        return null;
      return this[key]
    removeItem: (key) ->
      delete this[key]
  Object.defineProperty sessionStorage, 'length',
    get: () -> 
      # 3 for the 3 methods in the object
      Object.keys(this).length - 3
  # Add the initial items
  items = items || {}
  for own key, value of items
    key = saveRestore.getStorageKeyPrefix() + key
    sessionStorage.setItem(key, value)
  return sessionStorage

# Create a mock window.location, with
# sensible MeFi defaults.
makeLocation = (location) ->
  location ||= {}

  # Abort if we accidentally used a camelcase name.
  ['hostName', 'pathName'].forEach (key) ->
    if location.hasOwnProperty(key) 
      throw new Error("makeLocation: Invalid location key: #{key}")

  location['protocol'] ||= "https:"
  location['hostname'] ||= "www.metafilter.com"
  location['pathname'] ||= "/"
  if !/^\//.test(location['pathname'])
    throw new Error("makeLocation: pathname needs to start with a slash: " +
      location['pathname'])
  if /#/.test(location['pathname'])
    throw new Error("makeLocation: Get that hash out of the pathname")

  location['hash']     ||= ''
  if !/(^$)|^#/.test(location['hash'])
    throw new Error("makeLocation: Hash needs to be empty string or start with #: " +
      location['hash'])

  location['href']     ||= location.protocol + location.hostname + location.pathname
  return location

exports['test sessionStorage mock'] = (test) ->
  sessionStorage = makeSessionStorage()

  test.strictEqual(sessionStorage.length, 0, "session storage starts out empty")

  sessionStorage.setItem('alpha', 'one')
  test.strictEqual(sessionStorage.length, 1, "added one item")
  test.strictEqual(sessionStorage.getItem('alpha'), 'one', "retrieved an item");

  sessionStorage.setItem('beta', 'two')
  test.strictEqual(sessionStorage.length, 2, "added a second item")

  sessionStorage.setItem('beta', 'too')
  test.strictEqual(sessionStorage.length, 2, "replaced an item")
  test.strictEqual(sessionStorage.getItem('beta'), 'too', 'retrieve replaced item');

  sessionStorage.removeItem('beta')
  test.strictEqual(sessionStorage.length, 1, 'deleted an item')
  test.strictEqual(sessionStorage.getItem('beta'), null, "can't retrieve deleted item");

  test.done()



# Simulate doing one preview of a MeFi FPP
exports['preview mefi fpp'] = (test) ->
  sessionStorage = makeSessionStorage()

  # First page: Save the comment
  sr = saveRestore.makeSaveRestore
    sessionStorage: sessionStorage
    location: makeLocation
      pathname: "/contribute/post_good.mefi"
  saveOptions = 
    mdCommentText: "A comment"
    mdExtendedText: "More inside"
    linkId: null # no linkId for an FPP
    formSubmitUrl: "/post_preview.mefi"
  sr.saveMarkdownForPreview saveOptions

  test.strictEqual(sessionStorage.length, 1, "Data saved to session storage")

  # Second page: Load the comment
  sr = saveRestore.makeSaveRestore
    sessionStorage: sessionStorage
    location: makeLocation
      pathname: "/post_preview.mefi"

  savedDataJson = sr.restoreMarkdown 
    linkId: saveOptions.linkId
    formSubmitUrl: saveOptions.formSubmitUrl

  test.strictEqual(saveOptions.mdCommentText, savedDataJson.comment, "comment was restored correctly")
  test.strictEqual(saveOptions.mdExtendedText, savedDataJson.extended, "extended was restored correctly")

  storageKey = sr.getSessionStorageKey saveOptions.linkId, saveOptions.formSubmitUrl
  keyValue = sessionStorage.getItem(storageKey)
  test.strictEqual(keyValue, null, "Data was removed from session storage")
  test.strictEqual(sessionStorage.length, 0, "Nothing left in session storage")

  test.done()

exports['submitting an FPP cleans up stray storage for that FPP'] = (test) ->
  sessionStorage = makeSessionStorage()

  mdCommentText = "Blah blah blah, cats, scanners, etc."
  mdExtendedText = "Does anyone read the comments down here?"

  # Save as if for previewing a post
  sr = saveRestore.makeSaveRestore
    sessionStorage: sessionStorage
    location: makeLocation
      pathname: "/contribute/post_good.mefi"
  sr.saveMarkdownForPreview
    mdCommentText: mdCommentText
    mdExtendedText: mdExtendedText
    linkId: null # no link ID for new post page
    formSubmitUrl: "/post_preview.mefi"


  test.strictEqual(sessionStorage.length, 1, "Comment was saved")

  # Simulate a failure to delete when reloading the page, for whatever reason.
  # So don't call getSessionStorageKey.

  # deleteMarkdownForPreview is called when posting the FPP
  sr = saveRestore.makeSaveRestore
    sessionStorage: sessionStorage
    location: makeLocation
      pathname: "/post_preview.mefi"

  sr.deleteMarkdownForPreview
    linkId: null
    formSubmitUrl: "/post_preview.mefi"

  test.strictEqual(sessionStorage.length, 0, "Comment was deleted")
  test.done()


# Simulate previewing a comment on the server side
#
# URL we're commenting on: https://fanfare.metafilter.com/2212/Forever-Hitler-on-the-Half-Shell
exports['simulate server-side preview of a comment'] = (test) ->
  sessionStorage = makeSessionStorage()

  sr = saveRestore.makeSaveRestore
    sessionStorage: sessionStorage
    location: makeLocation
      hostname: 'fanfare.metafilter.com'
      pathname: '/2212/Forever-Hitler-on-the-Half-Shell'

  # Simulate clicking the preview button
  mdCommentText = "I really liked this show and/or movie!"
  linkId = 2212
  sr.saveMarkdownForPreview
    mdCommentText: mdCommentText
    mdExtendedText: null
    linkId: linkId
    formSubmitUrl: '/contribute/post_comment_preview.mefi#commentpreview'

  test.strictEqual(sessionStorage.length, 1, "Comment was saved")


  # Load the markdown on the preview page
  sr = saveRestore.makeSaveRestore
    sessionStorage: sessionStorage
    location: makeLocation
      hostname: 'fanfare.metafilter.com'
      pathname: '/contribute/post_comment_preview.mefi'
      hash:     '#commentpreview'


  savedDataJson = sr.restoreMarkdown 
    linkId: linkId
    formSubmitUrl: 'post_comment_preview.mefi#commentpreview'


  test.strictEqual(mdCommentText, savedDataJson.comment, "comment was restored correctly")
  test.strictEqual(null,          savedDataJson.extended, "extended was restored correctly")

  storageKey = sr.getSessionStorageKey linkId, 'post_comment_preview.mefi#commentpreview'
  keyValue = sessionStorage.getItem(storageKey)
  test.strictEqual(keyValue, null, "Data was removed from session storage")
  test.strictEqual(sessionStorage.length, 0, "Nothing left in session storage")  

  test.done()

exports['categorize urls'] = (test) ->
  testCases = [
    # The new post page isn't a preview page (its preview is at a separate URL)
    url: 'https://www.metafilter.com/contribute/post_good.mefi?pid=205463'
    isPostPreview: false
    isCommentPreview: false
  ,
    # form submit URL for the MeFi FPP page
    url: 'post_preview.mefi'
    isPostPreview: true
    isCommentPreview: false
  , 
    # MeFi FPP preview with a hash. I haven't seen one of these
    # in the wild, but we should be prepared for it.
    url: 'post_preview.mefi#foobar'
    isPostPreview: true
    isCommentPreview: false
  ,

    # The FanFare new post page. Not a preview page.
    url: 'https://fanfare.metafilter.com/contribute/post.cfm'
    isPostPreview: false
    isCommentPreview: false
  ,

    # FanFare post preview page. Its URL ends in .cfm,
    # wereas the corresponding page on the blue ends in
    # .mefi
    url: 'post_preview.cfm'    
    isPostPreview: true
    isCommentPreview: false
  ,

    # Again, match up the .cfm URL with a hash.
    # Haven't seen one in the wild, but be prepared
    # for one to exist.
    url: 'post_preview.cfm#foobar'    
    isPostPreview: true
    isCommentPreview: false
  ,

    # MeFi comment preview page
    url: '/contribute/post_comment_preview.mefi#commentpreview'
    isPostPreview: false
    isCommentPreview: true
  ,

    # MeFi comment preview w/o the hash.
    # Haven't seen one in the wild.
    url: '/contribute/post_comment_preview.mefi'
    isPostPreview: false
    isCommentPreview: true
  ]

  testCases.forEach (testCase) ->
    test.strictEqual(testCase.isPostPreview,    
                    saveRestore.isPostPreviewPage(testCase.url), 
                    testCase.url)
    test.strictEqual(testCase.isCommentPreview, 
                    saveRestore.isCommentPreviewPage(testCase.url), 
                    testCase.url)

  test.done()

exports['abort on missing markdown'] = (test) ->
  sessionStorage = makeSessionStorage()

  # Don't save any markdown to the session storage

  # But do try to restore
  sr = saveRestore.makeSaveRestore
    sessionStorage: sessionStorage
    location: makeLocation
      hostname: 'fanfare.metafilter.com'
      pathname: '/contribute/post_comment_preview.mefi'
      hash:     '#commentpreview'
  savedDataJson = sr.restoreMarkdown 
    linkId: 42
    formSubmitUrl: 'post_comment_preview.mefi#commentpreview'


  test.strictEqual(null, savedDataJson, "Nothing to restore")

  isStale = saveRestore.isRestoredMarkdownStale("Hello, world", null, savedDataJson)

  test.strictEqual(true, isStale, "Data is stale")

  test.done()


exports['abort on missing extended comment'] = (test) ->
  sessionStorage = makeSessionStorage()

  # Save something with only a comment, nothing in extended
  # TODO: For veracity, this sould be a post, not a comment
  sr = saveRestore.makeSaveRestore
    sessionStorage: sessionStorage
    location: makeLocation
      hostname: 'fanfare.metafilter.com'
      pathname: '/2212/Forever-Hitler-on-the-Half-Shell'

  # Simulate clicking the preview button
  mdCommentText = "I really liked this show and/or movie!"
  linkId = 2212
  sr.saveMarkdownForPreview
    mdCommentText: mdCommentText
    mdExtendedText: null
    linkId: linkId
    formSubmitUrl: '/contribute/post_comment_preview.mefi#commentpreview'


  # Restore the comment
  sr = saveRestore.makeSaveRestore
    sessionStorage: sessionStorage
    location: makeLocation
      hostname: 'fanfare.metafilter.com'
      pathname: '/contribute/post_comment_preview.mefi'
      hash:     '#commentpreview'
  savedDataJson = sr.restoreMarkdown 
    linkId: 42
    formSubmitUrl: 'post_comment_preview.mefi#commentpreview'


  # Simulate getting something in the extended area, too
  isStale = saveRestore.isRestoredMarkdownStale(mdCommentText, "the 'more inside' copy", savedDataJson)
  test.strictEqual(true, isStale)
  test.done()


# Tests to write:
# - Submitting a comment cleans up stray storage
# - Simulate doing two previews of comments / posts
# - Ensure that mdCommentText and mdExtendedText get sanitized to "", even if they were null or undefined
# - Stale markdown: If the page gave us HTML, do we have markdown to match it?
# - Nothing happens when calling from unsupported URLs
# - Add URL queries to 'categorize urls'
#   + Even though in the wild they're only accessed via POST, not GET, it would
#     be good future-proofing.


