md4mefi = window.md4mefi
#md4mefi = require('../lib/md4mefi')

# Test md4mefi.mdEndsInLinkReference()

QUnit.module("Ends in link reference")

doTestCase = (test, expectedValue, originalMd) ->
  # Check the text with various line endings
  mdTexts = [
    originalMd
    originalMd.replace(/\n/g, "\r\n")
    originalMd.replace(/\n/g, "\r")
  ]

  test.expect mdTexts.length

  mdTexts.forEach (md, idx) ->
    actualValue = md4mefi.mdEndsInLinkReference(md)
    test.strictEqual(expectedValue, actualValue, "Iteration #{idx}")
  #test.done()

QUnit.test 'text then link', (test) ->
  doTestCase test, true, 
    """
    blah blah blah blah

    [1]: http://google.com
    """

QUnit.test 'text then link then whitespace', (test) ->
  doTestCase test, true,
    """
    blah blah blah blah

    [1]: http://google.com



    """

QUnit.test 'so much whitespace in the reference', (test) ->
  doTestCase test, true, """
    blah blah blah blah


        [ 1  ]  : http://google.com



    """

QUnit.test 'two word link name', (test) ->
  doTestCase test, true, 
    """
    blah blah blah blah

        [  popular site ]  : http://google.com



    """

QUnit.test 'two links', (test) ->
  doTestCase test, true,
    """
    [1]: http://google.com
    [2]: http://amazon.com    
    """

QUnit.test 'hyphen in link name', (test) ->
  doTestCase test, true, 
    """
    [the-king]: http://elvis.info
    """

QUnit.test 'empty string', (test) ->
  doTestCase test, false, ""

QUnit.test 'just text', (test) ->
  doTestCase test, false, 
    """
    Blah blah blah
    """

QUnit.test 'missing a url', (test) ->
  doTestCase test, false, 
    """
    [one] : 
    """
QUnit.test 'not a url', (test) ->
  doTestCase test, false,
    """
    [1] : Is the lonliest number
    """

QUnit.test 'reference followed by more stuff', (test) ->
  doTestCase test, false, 
    """
    [1]: http://google.ca

    More stuff here
    """

QUnit.test 'reference with link title', (test) ->
  doTestCase test, true,
    """  
    I get 10 times more traffic from [Google][1] than from
    [Yahoo][2] or [MSN][3].

    [1]: http://google.com/        "Google"
    [2]: http://search.yahoo.com/  "Yahoo Search"
    [3]: http://search.msn.com/    "MSN Search"  
    """

QUnit.test 'newline between number and URL', (test) ->
  doTestCase test, true,
    """
     [foo]: 
      http://url.com  
    """

