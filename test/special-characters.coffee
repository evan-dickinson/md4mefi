md4mefi = require('../lib/md4mefi')
doTestCase = require('../lib/test-utils').doTestCase

exports['apostrophe replaced by &rsquo;'] = (test) ->
  doTestCase test,
    "I'm",
    "I&rsquo;m"

exports['double quotes'] = (test) ->
  doTestCase test,
    """
    "I am the walrus," said Paul.
    """,
    """
    &ldquo;I am the walrus,&rdquo; said Paul.
    """

# Ensure that the entity replacement happens more than once
# on a line. (i.e., that the regexp uses the /g flag)
exports['several replacements per line'] = (test) ->
  doTestCase test,
    """
    "Hello," I said, "How are you?"
    """,
    """
    &ldquo;Hello,&rdquo; I said, &ldquo;How are you?&rdquo;
    """

exports['single quotes'] = (test) ->
  doTestCase test,
    """
    'I am the walrus,' said Paul, using British quote marks.
    """,
    """
    &lsquo;I am the walrus,&rsquo; said Paul, using British quote marks.
    """

exports['apostrophe inside quote marks'] = (test) ->
  doTestCase test,
    """
    "I'm doin' fine," Tom said finely.
    """,
    """
    &ldquo;I&rsquo;m doin&rsquo; fine,&rdquo; Tom said finely.
    """

#
# Note: the smartypants with marked only supports mdash, and it uses two hyphens (--)
# as the shortcut.

# exports['ndash'] = (test) ->
#   doTestCase test,
#     'apple -- orange',
#     'apple &ndash; orange'

# exports['mdash'] = (test) ->
#   # Note: a bare "---" on a line will turn into <hr>. Add some other text to
#   # force it to be an mdash.
#   doTestCase test,
#    'apple --- orange',
#    'apple &mdash; orange'

exports['mdash'] = (test) ->
  doTestCase test,
    'apple -- orange',
    'apple &mdash; orange'

exports['ellipsis'] = (test) ->
  doTestCase test,
    'and then ...',
    'and then &hellip;'
      
