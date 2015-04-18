md4mefi = require('../lib/md4mefi')
testOneMarkdownText = require('../lib/test-utils').testOneMarkdownText

# These indentation tests are tricky to do with CoffeeScript's
# multiline string syntax. If all the lines in a string have the same
# indentation, then CS removes that indentation. To work around that,
# we start with an unindented INDENTFIX marker, that we then strip 
# out of the string.

exports['one indented line'] = (test) ->
  testOneMarkdownText test, 
    """
    INDENTFIX
        int x = 1;
    """,
    """
    <pre><code>int x = 1;
    </code></pre>
    """    

exports['two consecutive indented lines'] = (test) ->
  testOneMarkdownText test,
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
  testOneMarkdownText test, 
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
  testOneMarkdownText test,
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
  testOneMarkdownText test,
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
  testOneMarkdownText test,
    "orange `int x = 1` banana",
    "orange <code>int x = 1</code> banana"


exports["Inline backtick followed by para"] = (test) ->
  testOneMarkdownText test,
    """
    `foo(42)`

    Not code
    """,
    """
    <code>foo(42)</code>

    Not code
    """

exports["No formatting in code backticks"] = (test) ->
  testOneMarkdownText test,
    """
    blah `blah **not bold** blah` blah
    """,
    """
    blah <code>blah **not bold** blah</code> blah
    """

exports["No formatting in code block"] = (test) ->
  testOneMarkdownText test,
    """
    foo

        blah **not bold** blah
    """,
    """
    foo

    <pre><code>blah **not bold** blah
    </code></pre>
    """


#
# marked doesn't parse this as a list followed by a code block.
# Instead, it sees the code as an extension of the list. Which, sure,
# that's okay.

# exports['list then code'] = (test) ->
#   testOneMarkdownText test,
#     """
#     1. One
#     2. Two
#     3. Three

#         int x = 1;
#     """,
#     """
#     <ol>
#     <li>One</li>
#     <li>Two</li>
#     <li>Three</li>
#     </ol>

#     <pre><code>int x = 1;
#     </code></pre>
#     """

exports['code then list'] = (test) ->
  testOneMarkdownText test,
    """
        int x = 1;

    1. One
    2. Two
    3. Three
    """,
    """
    <pre><code>int x = 1;
    </code></pre>

    <ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    </ol>
    """

