md4mefi = require('../lib/md4mefi')
doTestCase = require('../lib/test-utils').doTestCase


exports['simple blockquote'] = (test) ->
  doTestCase test,
    """
    > Hello
    """,
    """
    <blockquote>
    Hello</blockquote>
    """


exports['two adjacent blockquotes'] = (test) ->
  doTestCase test,
    """
    > Hello

    > I like cheese.
    """,
    """
    <blockquote>
    Hello</blockquote>

    <blockquote>
    I like cheese.</blockquote>
    """

exports['three adjacent blockquotes'] = (test) ->
  doTestCase test,
    """
    > Hello

    > I like cheese.

    > I do not like ice cream.
    """,
    """
    <blockquote>
    Hello</blockquote>

    <blockquote>
    I like cheese.</blockquote>

    <blockquote>
    I do not like ice cream.</blockquote>
    """

exports['four adjacent blockquotes'] = (test) ->
  doTestCase test,
    """
    > Hello

    > I like cheese.

    > I do not like ice cream.

    > I quite enjoy green eggs and ham.
    """,
    """
    <blockquote>
    Hello</blockquote>

    <blockquote>
    I like cheese.</blockquote>

    <blockquote>
    I do not like ice cream.</blockquote>

    <blockquote>
    I quite enjoy green eggs and ham.</blockquote>
    """

exports['para then blockquote'] = (test) ->
  doTestCase test,
    """
    Hello

    > A quote
    """,
    """
    Hello

    <blockquote>
    A quote</blockquote>
    """

exports['blockquote then para'] = (test) ->
  doTestCase test,
    """
    > A quote

    Hello
    """,
    """
    <blockquote>
    A quote</blockquote>

    Hello
    """

exports['list then blockquote'] = (test) ->
  doTestCase test,
    """
    1. One
    2. Two
    3. Three

    > Blockquote
    """,
    """
    <ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    </ol>

    <blockquote>
    Blockquote</blockquote>
    """

exports['blockquote then list'] = (test) ->
  doTestCase test,
    """
    > Blockquote

    1. One
    2. Two
    3. Three
    """,
    """
    <blockquote>
    Blockquote</blockquote>

    <ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    </ol>
    """


exports['link in a blockquote'] = (test) =>
  doTestCase test,
    """
    > Blah blah, [woof woof][woof].

    A paragraph.

    [woof]: http://woof.dog
    """,
    """
    <blockquote>
    Blah blah, <a href="http://woof.dog">woof woof</a>.</blockquote>

    A paragraph.
    """

