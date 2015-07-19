md4mefi = window.md4mefi
testOneMarkdownText = window.md4mefiTestUtils.testOneMarkdownText

QUnit.module("Special characters")


# These tests were originally written for SmartyPants. But now we've turned
# SmartyPants off, so we're testing that SmartyPants *doesn't* happen.
# 
# There's still testing to be done, to ensure that we're not using
# numeric entities, which MeFi would ignore.
#
# It's okay to have HTML entities for &quot; and &apos;, because MeFi turns
# those into the ASCII characters on the server side. They shouldn't show up
# as named entities in an edit window.


QUnit.test 'apostrophe replaced by &rsquo;', (test) ->
  testOneMarkdownText test,
    "I'm",
    #"I&rsquo;m"
    "I'm"

QUnit.test 'double quotes', (test) ->
  testOneMarkdownText test,
    """
    "I am the walrus," said Paul.
    """,
    # """
    # &ldquo;I am the walrus,&rdquo; said Paul.
    # """
    """
    "I am the walrus," said Paul.
    """

# Ensure that the entity replacement happens more than once
# on a line. (i.e., that the regexp uses the /g flag)
QUnit.test 'several replacements per line', (test) ->
  testOneMarkdownText test,
    """
    "Hello," I said, "How are you?"
    """,
    # """
    # &ldquo;Hello,&rdquo; I said, &ldquo;How are you?&rdquo;
    # """
    """
    "Hello," I said, "How are you?"
    """    

QUnit.test 'single quotes', (test) ->
  testOneMarkdownText test,
    """
    'I am the walrus,' said Paul, using British quote marks.
    """,
    # """
    # &lsquo;I am the walrus,&rsquo; said Paul, using British quote marks.
    # """
    """
    'I am the walrus,' said Paul, using British quote marks.
    """

QUnit.test 'apostrophe inside quote marks', (test) ->
  testOneMarkdownText test,
    """
    "I'm doin' fine," Tom said finely.
    """,
    # """
    # &ldquo;I&rsquo;m doin&rsquo; fine,&rdquo; Tom said finely.
    # """
    """
    "I'm doin' fine," Tom said finely.
    """

#
# Note: the smartypants with marked only supports mdash, and it uses two hyphens (--)
# as the shortcut.

QUnit.test 'mdash', (test) ->
  testOneMarkdownText test,
    'apple -- orange',
    #'apple &mdash; orange'
    'apple -- orange'

QUnit.test 'ellipsis', (test) ->
  testOneMarkdownText test,
    'and then ...',
    #'and then &hellip;'
    'and then ...'
      

QUnit.test 'quote marks in bullet list', (test) ->
  testOneMarkdownText test,
    """
    * "Once upon a midnight dreary..."
    * "Two roads diverged in a snowy wood..."
    """,
    """
    <ul>
    <li>"Once upon a midnight dreary..."</li>
    <li>"Two roads diverged in a snowy wood..."</li>
    </ul>
    """

QUnit.test 'quote marks in blockquote', (test) ->
  testOneMarkdownText test,
    """
    > "I am," I said.
    """,
    """
    <blockquote>
    "I am," I said.</blockquote>
    """

# I made an executive decision not to undo HTML entities in code blocks.
# Doing so looks pretty tricky.

# QUnit.test 'quote marks in code', (test) ->
#   testOneMarkdownText test,
#     """
#     INDENTFIX
#         char* x = "Hello, world.";
#     """,
#     """
#     <pre><code>
#     char* x = "Hello, world.";</code></pre>
#     """
