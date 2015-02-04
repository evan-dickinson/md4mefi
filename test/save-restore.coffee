md4mefi = require('../lib/md4mefi')
saveRestore = require('../lib/save-restore')

#doTestCase = require('../lib/test-utils').doTestCase

# Mock up a sessionStorage object for testing
#
# Adapted from: http://stackoverflow.com/a/11486338/939467
makeSessionStorage = (items) ->
	sessionStorage = 
		setItem: (key, value) ->
			this[key] = value + ''
		getItem: (key) ->
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
			throw "makeLocation: Invalid location key: #{key}"
	location['protocol'] ||= "https:"
	location['hostname'] ||= "www.metafilter.com"
	location['pathname'] ||= "/"
	location['href']     ||= location.protocol + location.hostname + location.pathname
	return location

exports['test sessionStorage mock'] = (test) ->
	sessionStorage = makeSessionStorage()

	test.equal(sessionStorage.length, 0, "session storage starts out empty")

	sessionStorage.setItem('alpha', 'one')
	test.equal(sessionStorage.length, 1, "added one item")
	test.equal(sessionStorage.getItem('alpha'), 'one', "retrieved an item");

	sessionStorage.setItem('beta', 'two')
	test.equal(sessionStorage.length, 2, "added a second item")

	sessionStorage.setItem('beta', 'too')
	test.equal(sessionStorage.length, 2, "replaced an item")
	test.equal(sessionStorage.getItem('beta'), 'too', 'retrieve replaced item');

	sessionStorage.removeItem('beta')
	test.equal(sessionStorage.length, 1, 'deleted an item')
	test.equal(typeof(sessionStorage.getItem('beta')), 'undefined', "can't retrieve deleted item");

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
		formSubmitUrl: "post_preview.mefi"
	sr.saveMarkdownForPreview saveOptions

	test.equals(sessionStorage.length, 1, "Data saved to session storage")

	# Second page: Load the comment
	sr = saveRestore.makeSaveRestore
		sessionStorage: sessionStorage
		location: makeLocation
			pathname: "post_preview.mefi"

	savedDataJson = sr.restoreMarkdown 
		linkId: saveOptions.linkId
		formSubmitUrl: saveOptions.formSubmitUrl

	test.equals(saveOptions.mdCommentText, savedDataJson.comment, "comment was restored correctly")
	test.equals(saveOptions.mdExtendedText, savedDataJson.extended, "extended was restored correctly")

	storageKey = sr.getSessionStorageKey saveOptions.linkId, saveOptions.formSubmitUrl
	keyValue = sessionStorage.getItem(storageKey)
	test.equals(typeof(keyValue), "undefined", "Data was removed from session storage")
	test.equals(sessionStorage.length, 0, "Nothing left in session storage")

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
		formSubmitUrl: "post_preview.mefi"


	test.equals(sessionStorage.length, 1, "Comment was saved")

	# Simulate a failure to delete when reloading the page, for whatever reason.
	# So don't call getSessionStorageKey.


	# deleteMarkdownForPreview is called when posting the FPP
	sr = saveRestore.makeSaveRestore
		sessionStorage: sessionStorage
		location: makeLocation
			pathname: "post_preview.mefi"

	sr.deleteMarkdownForPreview
		linkId: null
		formSubmitUrl: "post_preview.mefi"

	test.equals(sessionStorage.length, 0, "Comment was deleted")
	test.done()





# Tests to write:
# - Submitting a comment cleans up stray storage
# - Simulate doing one preview of a comment
# - Simulate doing two previews of comments / posts
# - Ensure that mdCommentText and mdExtendedText get sanitized to "", even if they were null or undefined
# - Stale markdown: If the page gave us HTML, do we have markdown to match it?
#   + Looks like I accidentally deleted the implementation, with some Git foolishness
# - Nothing happens when calling from unsupported URLs




