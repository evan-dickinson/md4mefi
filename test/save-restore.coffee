md4mefi = require('../lib/md4mefi')
saveRestore = require('../lib/save-restore')

# Documentation of the various URLs in use. Partly for documentation completeness,
# partly for use by simulateSave
postUrls =
  meFi: # the blue
    hostname: 'www.metafilter.com'
    newPost: 'https://www.metafilter.com/contribute/post_good.mefi?pid=205463'
    postPreviewUrl: '/post_preview.mefi'    
    postPreviewPathname: '/post_preview.mefi'    
    postPreviewHash: ''

    #commentPreview: '/contribute/post_comment_preview.mefi#commentpreview'

    # path + hash
    commentPreviewUrl: '/contribute/post_comment_preview.mefi#commentpreview'

    commentPreviewPathname: '/contribute/post_comment_preview.mefi'
    commentPreviewHash: '#commentPreview'

  askMe: 
    newPost: 'https://ask.metafilter.com/contribute/post.cfm'
    postPreview: 'post_preview.cfm'
    commentPreview: '/contribute/post_comment_preview.mefi#commentpreview'
  fanFare:
    hostname: 'fanfare.metafilter.com'
    newPost: 'https://fanfare.metafilter.com/contribute/post.cfm'
    postPreviewUrl: '/post_preview.cfm'
    postPreviewPathname:'/post_preview.cfm'
    postPreviewhash: ''

    # Path + hash
    commentPreviewUrl: '/contribute/post_comment_preview.mefi#commentpreview'

    commentPreviewPathname: '/contribute/post_comment_preview.mefi'
    commentPreviewHash: '#commentpreview'

    threadPathname: '/2212/Forever-Hitler-on-the-Half-Shell'
    threadLinkId: 2122

simulateSave = (options) ->
  sessionStorage = options.sessionStorage ? throw new Error
  site           = options.site           ? throw new Error
  type           = options.type           ? throw new Error
  mdCommentText  = options.mdCommentText  ? null
  mdExtendedText = options.mdExtendedText ? null
  if (type != 'comment' && type != 'post') 
    throw new Error("Bad argument 'type': #{type}")

  # Simulate clicking the preview button
  saveRestore.saveMarkdownForPreview
    mdCommentText: mdCommentText
    mdExtendedText: mdExtendedText
    linkId: if (type == 'comment') then postUrls[site].threadLinkId else undefined
    # The URL we're going to, that previews the comment/post
    formSubmitUrl: 
      if (type == 'comment') then postUrls[site].commentPreviewUrl else postUrls[site].postPreviewUrl
    sessionStorage: options.sessionStorage
    location: makeLocation
      # Location of the comment thread
      hostname: postUrls[site].hostname
      pathname: postUrls[site].threadPathname

simulateLoad = (options) ->
  sessionStorage = options.sessionStorage ? throw new Error
  site           = options.site           ? throw new Error
  type           = options.type           ? throw new Error

  # We have one location object for both this page and the page after submitting
  # the preview form, since we're on a preview page. The preview page leads
  # back to itself.
  #
  # TODO: But that won't be true for all the test cases
  if (type == 'comment')
    location = makeLocation
      hostname: postUrls[site].hostname
      pathname: postUrls[site].commentPreviewPathname 
      hash:     postUrls[site].commentPreviewHash

    linkId = postUrls[site].threadLinkId
  else if (type == 'post')
    location = makeLocation
      hostname: postUrls[site].hostName
      pathname: postUrls[site].postPreviewPathname
      hash:     postUrls[site].postPreviewHash

    linkId = undefined
  else
    throw new Error("Bad argument 'type': #{type}")

  # Load the markdown on the preview page
  formSubmitUrl = location.pathname + location.hash
  savedDataJson = saveRestore.restoreMarkdown 
    linkId: linkId
    formSubmitUrl: formSubmitUrl
    sessionStorage: sessionStorage
    location: location

  return {
    storageKey: saveRestore.getSessionStorageKey 
      linkId: linkId 
      formSubmitUrl: formSubmitUrl
      location: location
    savedDataJson: savedDataJson
  }

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

# Create a mock window.location, with sensible MeFi defaults.
makeLocation = (location) ->
  location ?= {}

  # Abort if we accidentally used a camelcase name.
  ['hostName', 'pathName'].forEach (key) ->
    if location.hasOwnProperty(key) 
      throw new Error("makeLocation: Invalid location key: #{key}")

  location['protocol'] ?= "https:"
  location['hostname'] ?= "www.metafilter.com"
  location['pathname'] ?= "/"
  if !/^\//.test(location['pathname'])
    throw new Error("makeLocation: pathname needs to start with a slash: " +
      location['pathname'])
  if /#/.test(location['pathname'])
    throw new Error("makeLocation: Get that hash out of the pathname")

  location['hash'] ?= ''
  if !/(^$)|^#/.test(location['hash'])
    throw new Error("makeLocation: Hash needs to be empty string or start with #: " +
      location['hash'])

  location['href'] ?= location.protocol + location.hostname + location.pathname
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


# Simulate doing one preview of a MeFi FPP
exports['preview mefi fpp'] = (test) ->
  sessionStorage = makeSessionStorage()

  mdCommentText  = "A comment"
  mdExtendedText = "More inside"

  simulateSave
    sessionStorage: sessionStorage
    site: 'meFi'
    type: 'post'
    mdCommentText: mdCommentText
    mdExtendedText: mdExtendedText

  test.strictEqual(sessionStorage.length, 1, "Data saved to session storage")

  loadResults = simulateLoad
    sessionStorage: sessionStorage
    site: 'meFi'
    type: 'post'
  storageKey    = loadResults.storageKey
  savedDataJson = loadResults.savedDataJson

  test.strictEqual(mdCommentText,  savedDataJson.comment,  "comment was restored correctly")
  test.strictEqual(mdExtendedText, savedDataJson.extended, "extended was restored correctly")

  keyValue = sessionStorage.getItem(storageKey)
  test.strictEqual(keyValue, null, "Data was removed from session storage")
  test.strictEqual(sessionStorage.length, 0, "Nothing left in session storage")

  test.done()

exports['submitting an FPP cleans up stray storage for that FPP'] = (test) ->
  sessionStorage = makeSessionStorage()

  test.strictEqual(sessionStorage.length, 0, "session starts out empty")

  mdCommentText = "Blah blah blah, cats, scanners, etc."
  mdExtendedText = "Does anyone read the comments down here?"

  simulateSave
    sessionStorage: sessionStorage
    site: 'meFi'
    type: 'post'
    mdCommentText: mdCommentText
    mdExtendedText: mdExtendedText

  test.strictEqual(sessionStorage.length, 1, "Comment was saved")

  # Simulate a failure to delete when reloading the page, for whatever reason.
  # So don't call getSessionStorageKey.

  # deleteMarkdownForPreview is called when posting the FPP
  saveRestore.deleteMarkdownForPreview
    sessionStorage: sessionStorage
    linkId: null
    formSubmitUrl: "/post_preview.mefi" 
    location:
      makeLocation
        pathname: "/post_preview.mefi"

  test.strictEqual(sessionStorage.length, 0, "Comment was deleted")
  test.done()


# Simulate previewing a comment on the server side
exports['simulate server-side preview of a comment'] = (test) ->
  sessionStorage = makeSessionStorage()

  mdCommentText = "I really liked this show and/or movie!"
  simulateSave
    sessionStorage: sessionStorage
    site: 'fanFare'
    type: 'comment'
    mdCommentText: mdCommentText

  test.strictEqual(sessionStorage.length, 1, "Comment was saved")

  loadResults = simulateLoad
    sessionStorage: sessionStorage
    site: 'fanFare'
    type: 'comment'
  savedDataJson = loadResults.savedDataJson
  storageKey    = loadResults.storageKey

  test.strictEqual(mdCommentText, savedDataJson.comment, "comment was restored correctly")
  test.strictEqual(null,          savedDataJson.extended, "extended was restored correctly")

  storedItem = sessionStorage.getItem(storageKey)
  test.strictEqual(storedItem, null, "Data was removed from session storage")
  test.strictEqual(sessionStorage.length, 0, "Nothing left in session storage")  

  test.done()

exports['abort on missing markdown'] = (test) ->
  sessionStorage = makeSessionStorage()

  # Don't save any markdown to the session storage.
  # But do try to restore.
  stuff = simulateLoad
    sessionStorage: sessionStorage
    site: 'fanFare'
    type: 'comment'

  savedDataJson = stuff.savedDataJson

  test.strictEqual(null, savedDataJson, "Nothing to restore")

  isStale = saveRestore.isRestoredMarkdownStale("Hello, world", null, savedDataJson)

  test.strictEqual(true, isStale, "Data is stale")

  test.done()


exports['abort on missing extended comment'] = (test) ->
  sessionStorage = makeSessionStorage()

  # Save something with only a comment, nothing in extended
  # TODO: For veracity, this sould be a post, not a comment
  mdCommentText = "I really liked this show and/or movie!"
  simulateSave
    sessionStorage: sessionStorage
    site: 'fanFare'
    type: 'post'
    mdCommentText: mdCommentText
    mdExtendedText: null

  # Restore the comment
  stuff = simulateLoad
    sessionStorage: sessionStorage
    site: 'fanFare'
    type: 'post'
  savedDataJson = stuff.savedDataJson

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


