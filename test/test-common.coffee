# Common routines for the test cases.
# 
md4mefi = require('../lib/md4mefi')

exports['doTestCase'] = (test, markdown, expectedHtml) ->
  # INDENTFIX has to do with dealing w/ how coffeescript's string
  # literals deal with whitespace. See code.coffee for examples
  # of how it's used.
  markdown = markdown.replace(/^INDENTFIX\s*\n/, '')
  actualHtml = md4mefi.md2html(markdown)
  test.equal(expectedHtml, actualHtml)
  test.done()