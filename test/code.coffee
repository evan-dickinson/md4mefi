md4mefi = require('../lib/md4mefi')
doTestCase = require('../lib/test-utils').doTestCase

# These indentation tests are tricky to do with CoffeeScript's
# multiline string syntax. If all the lines in a string have the same
# indentation, then CS removes that indentation. To work around that,
# we start with an unindented INDENTFIX marker, that we then strip 
# out of the string.

exports['one indented line'] = (test) ->
  doTestCase test, 
    """
    INDENTFIX
        int x = 1;
    """,
    """
    <pre><code>int x = 1;
    </code></pre>
    """    

exports['two consecutive indented lines'] = (test) ->
  doTestCase test,
    """
    INDENTFIX
        int x = 1;
        int x = 2;
    """,
    """
    <pre><code>int x = 1;
    int x = 2;
    </code></pre>
    """

exports["Two indented lines, separated by nonindented line"] = (test) ->
  doTestCase test, 
    """
    INDENTFIX
        int x = 1;

        int y = 2;
    """,
    """
    <pre><code>int x = 1;

    int y = 2;
    </code></pre>
    """


exports["Code followed by paragraph"] = (test) ->
  doTestCase test,
    """
        int x = 1;

    Plain text
    """,
    """
    <pre><code>int x = 1;
    </code></pre>

    Plain text
    """

exports["Paragraph followed by code"] = (test) ->
  doTestCase test,
    """
    Plain text

        int x = 1;
    """,
    """
    Plain text

    <pre><code>int x = 1;
    </code></pre>
    """

exports["Inline backtick"] = (test) ->
  doTestCase test,
    "orange `int x = 1` banana",
    "orange <code>int x = 1</code> banana"


exports["Inline backtick followed by para"] = (test) ->
  doTestCase test,
    """
    `foo(42)`

    Not code
    """,
    """
    <code>foo(42)</code>

    Not code
    """

exports["No formatting in code backticks"] = (test) ->
  doTestCase test,
    """
    blah `blah **not bold** blah` blah
    """,
    """
    blah <code>blah **not bold** blah</code> blah
    """

exports["No formatting in code block"] = (test) ->
  doTestCase test,
    """
    foo

        blah **not bold** blah
    """,
    """
    foo

    <pre><code>blah **not bold** blah
    </code></pre>
    """
