# Common routines for the test cases.
# 
md4mefi = require('../lib/md4mefi')

exports['doTestCase'] = (test, markdown, expectedHtml) ->
  markdown = markdown.replace(/^INDENTFIX\s*\n/, '')
  actualHtml = md4mefi.md2html(markdown)
  test.equal(expectedHtml, actualHtml)
  test.done()