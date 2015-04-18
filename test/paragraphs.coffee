md4mefi = require('../lib/md4mefi')
testOneMarkdownText = require('../lib/test-utils').testOneMarkdownText

exports['empty string'] = (test) ->
  testOneMarkdownText test, "", ""

exports['no newline after a one-line string'] = (test) ->
  testOneMarkdownText test,
    "Twenty bucks, same as in town.",
    "Twenty bucks, same as in town."

exports['retain single newlines'] = (test) ->
  # MeFi turns single newlines into BR tags.
  testOneMarkdownText test,
    """
    Hi.
    I am Lenny.
    This is Carl and Homer.
    """,
    """
    Hi.
    I am Lenny.
    This is Carl and Homer.
    """
  
exports['retain double newlines'] = (test) ->
  testOneMarkdownText test,
    """
    I like cheese.

    I do not like ice cream.
    """,
    """
    I like cheese.

    I do not like ice cream.
    """

exports['paras with embedded markdown'] = (test) ->
  testOneMarkdownText test,
    """
    Hello, *Wilbur*, I am so happy to **see you**.

    How is the wife?
    """,
    """
    Hello, <em>Wilbur</em>, I am so happy to <strong>see you</strong>.

    How is the wife?
    """

exports['bold italic'] = (test) ->
  testOneMarkdownText test,
    """
    ***Bold Italic***
    """,
    """
    <strong><em>Bold Italic</em></strong>
    """

exports['para with embedded small tag'] = (test) ->
  testOneMarkdownText test,
    """
    Hello <small>world</small>.
    """,
    """
    Hello <small>world</small>.
    """

exports['para with embedded anchor tag'] = (test) ->
  testOneMarkdownText test,
    """
    I have no idea <a href="http://cat-scan.com">how these people 
    got their cats wedged into their scanners</a> or why.
    """,
    """
    I have no idea <a href="http://cat-scan.com">how these people 
    got their cats wedged into their scanners</a> or why.
    """

exports['strikethrough'] = (test) ->
  testOneMarkdownText test,
    """
    I had a ~~great~~ horriffic time.
    """,
    """
    I had a <del>great</del> horriffic time.
    """

# Ensure that you can make non-bold stars by quoting them with backslashes
exports['backslash stars'] = (test) ->
  testOneMarkdownText test,
    """
    \\*looks around\\*
    """,
    """
    *looks around*
    """

# KNOWN BUG: The Marked parser doesn't handle this correctly
#  
# exports['stars inside italics'] = (test) ->
#   testOneMarkdownText test,
#     """
#     *one two \\*three\\* four*
#     """,
#     """
#     <em>one two *three* four</em>
#     """

exports['stars inside bold'] = (test) ->
  testOneMarkdownText test,
    """
    **one two \\*three\\* four**
    """,
    """
    <strong>one two *three* four</strong>
    """


# Obscure Markdown rule: A line ending in two spaces forces a <br> tag
exports['br tags'] = (test) ->
  testOneMarkdownText test,
    "Hello  \nWorld",
    "Hello<br>World"
