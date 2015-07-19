
injectUtils = window.md4mefiInjectUtils

QUnit.module("Bold/Italic")

testDomElements = $('#test-dom-elements')
boldItalic = $('<div>').addClass('bold-italic')
mdComment = $('<textarea>').addClass('md-comment')
boldItalic.append(mdComment)
testDomElements.append(boldItalic)

boldToItalic = (text) ->
  text.replace(/\*\*/g, "*").replace(/bold/g, "italic")

doTest = (test, boldOrItalic, text, selectedText, range, expectedResult, expectedSelected) ->
  mdComment.val(text)
  mdComment.selection 'setPos', range

  test.strictEqual(mdComment.selection('get'), selectedText)

  injectUtils.doBoldOrItalic(boldOrItalic, mdComment)

  actualResult = mdComment.val()
  test.strictEqual(actualResult, expectedResult)

  test.strictEqual(mdComment.selection('get'), expectedSelected)


doTestCase = (test, options) ->
  options.text   ?= throw new Error("Argument error: text not specified")
  options.bold   ?= throw new Error
  options.italic ?= boldToItalic(options.bold)

  if options.caretIsBefore?
    if options.selectionPos?
      # Can't specify both
      throw new Error
    # If match succeeds, get the index. Else, throw error
    options.selectionPos = options.text.match(options.caretIsBefore)?.index ? throw new Error

  if options.selectedText? && options.selectionPos?
    # Can't specify both selectedText and selectionPos
    throw new Error
  
  if !options.selectedText? && !options.selectionPos?
    # Neither specified, so select the entire text
    options.selectedText = options.text
  
  if options.selectedText? && !options.selectionPos?
    start = options.text.indexOf(options.selectedText)
    range =
      start: start
      end:   start + options.selectedText.length

    # Default the bold/italic selected text to the
    # text that's selected

    options.boldSelected   ?= options.selectedText
    options.italicSelected ?= boldToItalic(options.boldSelected)

  if !options.selectedText? && options.selectionPos?
    range =
      start: options.selectionPos
      end:   options.selectionPos

    # Default the bold/italic selected text to the filler copy that's
    # used with a zero-length selection
    options.boldSelected   ?= "bold text"
    options.italicSelected ?= "italic text"

    options.selectedText = ""

  test.expect 2 * 3
  doTest test, 'bold',   options.text, options.selectedText, range, options.bold,   options.boldSelected
  doTest test, 'italic', options.text, options.selectedText, range, options.italic, options.italicSelected


QUnit.test 'simple bolding', (test) ->
  doTestCase test,
    text: "One"
    bold: "**One**"

QUnit.test 'trailing newline', (test) ->
  doTestCase test,
    text: "One\n"
    bold: "**One**\n"
    boldSelected: "One"

QUnit.test 'two trailing newlines', (test) ->
  doTestCase test,
    text: "One\n\n"
    bold:   "**One**\n\n"
    boldSelected: "One"

QUnit.test 'three trailing newlines', (test) ->
  doTestCase test,
    text: "One\n\n\n"
    bold:  "**One**\n\n\n"  
    boldSelected: "One"

QUnit.test 'leading newline', (test) ->
  doTestCase test,
    text: "\nOne"
    bold: "\n**One**"
    boldSelected: "One"

QUnit.test 'two leading newlines', (test) ->
  doTestCase test,
    text: "\n\nOne"
    bold: "\n\n**One**"
    boldSelected: "One"

QUnit.test 'three leading newlines', (test) ->
  doTestCase test,
    text: "\n\n\nOne"
    bold: "\n\n\n**One**"
    boldSelected: "One"

QUnit.test 'two consecutive lines', (test) ->
  doTestCase test,
    text: "One\nTwo"
    bold: "**One**\n**Two**"
    boldSelected: "One**\n**Two"

QUnit.test 'three consecutive lines', (test) ->
  doTestCase test,
    text: "One\nTwo\nThree"
    bold: "**One**\n**Two**\n**Three**"
    boldSelected: "One**\n**Two**\n**Three"


QUnit.test 'two consecutive lines with double newlines', (test) ->
  doTestCase test,
    text: "One\n\nTwo"
    bold: "**One**\n\n**Two**"
    boldSelected: "One**\n\n**Two"

QUnit.test 'three consecutive lines with double newlines', (test) ->
  doTestCase test,
    text: """
    One

    Two

    Three
    """
    bold: """
    **One**

    **Two**

    **Three**
    """
    boldSelected: """
    One**

    **Two**

    **Three
    """

QUnit.test 'empty string', (test) ->
  doTestCase test,
    text: ""
    bold: "**bold text**"
    boldSelected: "bold text"

QUnit.test 'only newlines - one', (test) ->
  doTestCase test,
    text: "\n"
    bold: "\n**bold text**"
    boldSelected: "bold text"
    # Leave the entire text selected

QUnit.test 'only newlines - two', (test) ->
  doTestCase test,
    text: "\n\n"
    bold: "\n\n**bold text**"
    boldSelected: "bold text"
    # Leave the entire text selected



QUnit.test "slected text at start of string, before newline", (test) ->
  doTestCase test,
    text: """
    One
    Two
    """
    selectedText: "One"
    bold: """
    **One**
    Two
    """

QUnit.test "slected text at start of string, includes newline", (test) ->
  doTestCase test,
    text: """
    One
    Two
    """
    selectedText: "One\n"
    bold: """
    **One**
    Two
    """
    boldSelected: "One" # After bold, selection won't include newline


QUnit.test "selected text preceded by newlines", (test) ->
  doTestCase test,
    text: """


    One
    Two
    """
    selectedText: "One"
    bold: """


    **One**
    Two
    """


QUnit.test "selected text includes preceding newlines", (test) ->
  doTestCase test,
    text: """


    One
    Two
    """
    selectedText: "\n\nOne"
    bold: """


    **One**
    Two
    """
    boldSelected: "One" # After trim, won't include newlines

QUnit.test "multi-line selection - two paragraphs", (test) ->
  doTestCase test,
    text: """

    one two three

    four five six

    seven eight nine
    """
    selectedText: """

    one two three

    four five six

    """
    bold: """

    **one two three**

    **four five six**

    seven eight nine
    """
    boldSelected: """
    one two three**

    **four five six
    """


QUnit.test "multi-line selection - three paragraphs", (test) ->
  doTestCase test,
    text: """

    one two three

    four five six

    seven eight nine

    ten eleven twelve
    """
    selectedText: """

    one two three

    four five six

    seven eight nine

    """
    bold: """

    **one two three**

    **four five six**

    **seven eight nine**

    ten eleven twelve
    """
    boldSelected: """
    one two three**

    **four five six**

    **seven eight nine
    """

QUnit.test "no selection - empty string", (test) ->
  doTestCase test,
    text: ""
    caretIsBefore: /^/
    bold: "**bold text**"
    italic: "*italic text*"


QUnit.test "no selection - start of text", (test) ->
  doTestCase test,
    text: "Hello"
    caretIsBefore: /^/
    bold: "**bold text**Hello"
    italic: "*italic text*Hello"

QUnit.test "no selection - end of text", (test) ->
  doTestCase test,
    text: "Hello"
    caretIsBefore: /$/
    bold: "Hello**bold text**"
    italic: "Hello*italic text*"

QUnit.test "no selection - middle of text", (test) ->
  doTestCase test,
    text: "Hello"
    caretIsBefore: "lo"
    bold: "Hel**bold text**lo"
    italic: "Hel*italic text*lo"

QUnit.test "no selection - between lines", (test) ->
  doTestCase test,
    text: """
    One two three
    Four five six
    """
    caretIsBefore: "Four"
    bold: """
    One two three
    **bold text**Four five six
    """,
    italic: """
    One two three
    *italic text*Four five six
    """

QUnit.test "no selection - between paragraphs", (test) ->
  doTestCase test,
    text: """
    One two three

    Four five six
    """
    caretIsBefore: "\nFour"
    bold: """
    One two three
    **bold text**
    Four five six
    """,
    italic: """
    One two three
    *italic text*
    Four five six
    """

