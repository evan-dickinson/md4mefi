# The test cases are in CoffeeScript, because it has better support for multi-line strings
#
# Structure of a test case:
# c: comment / name of the test
# m: The markdown to convert to HTML
# h: The expected HTML
#
# The test passes when m generates the HTML specified in h.


md4mefi = require('../lib/md4mefi')

doTestCases = (test, testCases) ->
  testCases.forEach (testCase) ->
    markdown = testCase.m
    expectedHtml = testCase.h
    actualHtml   = md4mefi.md2html(markdown)
    test.equal(expectedHtml, actualHtml, testCase.c)
  test.done()

exports['whitespace'] = (test) ->
  doTestCases test, [
    c: "Empty string"
    m: ""
    h: ""
  ]

exports['strip p tags'] = (test) ->
  doTestCases test, [
    c: "Don't surround plain text (w/o newlines) in <p> tags"
    m: "Twenty bucks, same as in town."
    h: "Twenty bucks, same as in town."
  ,

    c: "Retain single newlines."
    # MeFi turns single newlines into BR tags.
    m: """
    Hi.
    I am Lenny.
    This is Carl and Homer.
    """
    h: """
    Hi.
    I am Lenny.
    This is Carl and Homer.
    """
  ,

    c: "Retain double newlines"
    m: """
    I like cheese.

    I do not like ice cream.
    """
    h: """
    I like cheese.

    I do not like ice cream.
    """
  ,

    c: "Test complex paragraphs with embedded tags"
    m: """
    Hello, *Wilbur*, I am so happy to **see you**.

    How is the wife?
    """
    h: """
    Hello, <em>Wilbur</em>, I am so happy to <strong>see you</strong>.

    How is the wife?
    """

  ]




  