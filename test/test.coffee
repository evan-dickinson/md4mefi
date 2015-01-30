# The test cases are in CoffeeScript, because it has better support for multi-line strings


md4mefi = require('../lib/md4mefi')

doTestCases = (test, testCases) ->
  testCases.forEach (testCase) ->
    markdown = testCase.m
    expectedHtml = testCase.h
    actualHtml   = md4mefi.md2html(markdown)
    test.equal(expectedHtml, actualHtml, testCase.c)
  test.done()

exports['unordered list'] = (test) ->
  doTestCases test, [
    c: "One item"
    m: "* One"
    h: "<ul><li>One</li></ul>"
  ,
    c: "Two items"
    m: """
    * One
    * Two
    """
    h: "<ul><li>One</li><li>Two</li></ul>"
  ]

exports['ordered list'] = (test) ->
  doTestCases test, [
    c: "One item"
    m: "1. One"
    h: "<ol><li>One</li></ol>"
  ,
    c: "Two items"
    m: """
    1. One
    2. Two
    """
    h: "<ol><li>One</li><li>Two</li></ol>"
  ]

exports['paragraphs and lists'] = (test) ->
  doTestCases test, [
    c: """
    Check newlines when para comes before a <ul>
    And check that no trailing slashes are after the <ul>
    """

    m: """
    Before

    * One
    * Two
    * Three
    """
    h: """
    Before

    <ul><li>One</li><li>Two</li><li>Three</li></ul>
    """
  ,

    c: "Check newlines when a para comes after a <ul>"

    m: """
    * One
    * Two
    * Three

    After
    """
    h: """
    <ul><li>One</li><li>Two</li><li>Three</li></ul>

    After
    """
  ,

    c: "Check newlines when para comes before an <ol>"

    m: """
    Before

    1. One
    2. Two
    3. Three
    """
    h: """
    Before

    <ol><li>One</li><li>Two</li><li>Three</li></ol>
    """
  ,

    c: "Check newlines when a para comes after an <ol>"

    m: """
    1. One
    2. Two
    3. Three

    After
    """
    h: """
    <ol><li>One</li><li>Two</li><li>Three</li></ol>

    After
    """
  ,
  ]
 
exports['code'] = (test) ->
  # These indentation tests are tricky to do with CoffeeScript's
  # multiline string syntax. If all the lines in a string have the same
  # indentation, then CS removes that indentation. To work around that,
  # we start with an unindented @ sign, that we then strip out of the string.
  doTestCases test, [
    c: "One indented line"
    m: """
    @
        int x = 1;
    """.replace(/^@/, '')
    h: """
    <pre><code>int x = 1;</code></pre>
    """
  ,

    c: "Two consecutive indented lines"
    m: """
    @
        int x = 1;
        int x = 2;
    """.replace(/^@/, '')
    h: """
    <pre><code>int x = 1;
    int x = 2;</code></pre>
    """
  ,

    c: "Two indented lines, separated by nonindented line"
    m: """
    @
        int x = 1;

        int y = 2;
    """.replace(/^@/, '')
    h: """
    <pre><code>int x = 1;

    int y = 2;</code></pre>
    """
  ,

    c: "Code followed by paragraph"
    m: """
        int x = 1;

    Plain text
    """
    h: """
    <pre><code>int x = 1;</code></pre>

    Plain text
    """
  ,

    c: "Inline backtick"
    m: "orange `int x = 1` banana"
    h: "orange <code>int x = 1</code> banana"
  ,


    c: "Inline backtick followed by para"
    m: """
    `foo(42)`

    Not code
    """
    h: """
    <code>foo(42)</code>

    Not code
    """
  ,

  ]


  