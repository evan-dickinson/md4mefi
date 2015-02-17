md4mefi = require('../lib/md4mefi')

# Test md4mefi.mdEndsInLinkReference()

doTestCase = (test, expectedValue, originalMd) ->
  # Check the text with various line endings
  mdTexts = [
    originalMd
    originalMd.replace(/\n/g, "\r\n")
    originalMd.replace(/\n/g, "\r")
  ]

  mdTexts.forEach (md, idx) ->
    actualValue = md4mefi.mdEndsInLinkReference(md)
    test.strictEqual(expectedValue, actualValue, "Iteration #{idx}")
  test.done()

exports['text then link'] = (test) ->
  doTestCase test, true, 
    """
    blah blah blah blah

    [1]: http://google.com
    """

exports['text then link then whitespace'] = (test) ->
  doTestCase test, true,
    """
    blah blah blah blah

    [1]: http://google.com



    """

exports['so much whitespace in the reference'] = (test) ->
  doTestCase test, true, """
    blah blah blah blah


        [ 1  ]  : http://google.com



    """

exports['two word link name'] = (test) ->
  doTestCase test, true, 
    """
    blah blah blah blah

        [  popular site ]  : http://google.com



    """

exports['two links'] = (test) ->
  doTestCase test, true,
    """
    [1]: http://google.com
    [2]: http://amazon.com    
    """

exports['hyphen in link name'] = (test) ->
  doTestCase test, true, 
    """
    [the-king]: http://elvis.info
    """

exports['empty string'] = (test) ->
  doTestCase test, false, ""

exports['just text'] = (test) ->
  doTestCase test, false, 
    """
    Blah blah blah
    """

exports['missing a url'] = (test) ->
  doTestCase test, false, 
    """
    [one] : 
    """
exports['not a url'] = (test) ->
  doTestCase test, false,
    """
    [1] : Is the lonliest number
    """

exports['reference followed by more stuff'] = (test) ->
  doTestCase test, false, 
    """
    [1]: http://google.ca

    More stuff here
    """

exports['reference with link title'] = (test) ->
  doTestCase test, true,
    """  
    I get 10 times more traffic from [Google][1] than from
    [Yahoo][2] or [MSN][3].

    [1]: http://google.com/        "Google"
    [2]: http://search.yahoo.com/  "Yahoo Search"
    [3]: http://search.msn.com/    "MSN Search"  
    """

exports['newline between number and URL'] = (test) ->
  doTestCase test, true,
    """
     [foo]: 
      http://url.com  
    """

