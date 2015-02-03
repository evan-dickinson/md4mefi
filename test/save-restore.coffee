md4mefi = require('../lib/md4mefi')
saveRestore = require('../lib/save-restore')

#doTestCase = require('../lib/test-utils').doTestCase

# Mock up a sessionStorage object for testing
#
# Adapted from: http://stackoverflow.com/a/11486338/939467
makeSessionStorage = (items) ->
	sessionStorage = {}
	sessionStorage.setItem = (key, value) ->
		this[key] = value + ''
	sessionStorage.getItem = (key) ->
		return this[key]
	sessionStorage.removeItem = (key) ->
		delete this[key]
	Object.defineProperty sessionStorage, 'length',
		get: () -> Object.keys(this).length - 2
	# Add the initial items
	items = items || {}
	for own key, value of items
		key = saveRestore.getStorageKeyPrefix() + key
		sessionStorage.setItem(key, value)
	sessionStorage

# Create a mock window.location, with
# sensible MeFi defaults.
makeLocation = (location) ->
	['hostName', 'pathName'].forEach (key) ->
		if location.hasOwnProperty(key) 
			throw "Invalid location key: #{key}"
	location ||= {}
	location['protocol'] ||= "https:"
	location['hostname'] ||= "www.metafilter.com"
	location['pathname'] ||= "/"
	location['href']     ||= location.protocol + location.hostname + location.pathname
	location

exports['preview mefi fpp'] = (test) ->
	sessionStorage = makeSessionStorage()
	sr = saveRestore.makeSaveRestore
		sessionStorage: sessionStorage
		location: makeLocation
			pathname: "/contribute/post_good.mefi"

	saveOptions = 
		mdCommentText: "A comment"
		mdExtendedText: "More inside"
		linkId: 42
		formSubmitUrl: "post_preview.mefi"
	sr.saveMarkdownForPreview saveOptions

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

	test.done()

