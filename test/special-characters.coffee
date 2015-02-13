md4mefi = require('../lib/md4mefi')
doTestCase = require('../lib/test-utils').doTestCase

# These tests were originally written for SmartyPants. But now we've turned
# SmartyPants off, so we're testing that SmartyPants *doesn't* happen.
# 
# There's still testing to be done, to ensure that we're not using
# numeric entities, which MeFi would ignore.
#
# It's okay to have HTML entities for &quot; and &apos;, because MeFi turns
# those into the ASCII characters on the server side. They shouldn't show up
# as named entities in an edit window.


exports['apostrophe replaced by &rsquo;'] = (test) ->
  doTestCase test,
    "I'm",
    #"I&rsquo;m"
    "I'm"

exports['double quotes'] = (test) ->
  doTestCase test,
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
exports['several replacements per line'] = (test) ->
  doTestCase test,
    """
    "Hello," I said, "How are you?"
    """,
    # """
    # &ldquo;Hello,&rdquo; I said, &ldquo;How are you?&rdquo;
    # """
    """
    "Hello," I said, "How are you?"
    """    

exports['single quotes'] = (test) ->
  doTestCase test,
    """
    'I am the walrus,' said Paul, using British quote marks.
    """,
    # """
    # &lsquo;I am the walrus,&rsquo; said Paul, using British quote marks.
    # """
    """
    'I am the walrus,' said Paul, using British quote marks.
    """

exports['apostrophe inside quote marks'] = (test) ->
  doTestCase test,
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

exports['mdash'] = (test) ->
  doTestCase test,
    'apple -- orange',
    #'apple &mdash; orange'
    'apple -- orange'

exports['ellipsis'] = (test) ->
  doTestCase test,
    'and then ...',
    #'and then &hellip;'
    'and then ...'
      

exports['quote marks in bullet list'] = (test) ->
  doTestCase test,
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

exports['quote marks in blockquote'] = (test) ->
  doTestCase test,
    """
    > "I am," I said.
    """,
    """
    <blockquote>
    "I am," I said.</blockquote>
    """

# I made an executive decision not to undo HTML entities in code blocks.
# Doing so looks pretty tricky.

# exports['quote marks in code'] = (test) ->
#   doTestCase test,
#     """
#     INDENTFIX
#         char* x = "Hello, world.";
#     """,
#     """
#     <pre><code>
#     char* x = "Hello, world.";</code></pre>
#     """
