md4mefi = require('../lib/md4mefi')

doTestCase = (test, markdown, expectedHtml) ->
  markdown = markdown.replace(/^INDENTFIX\s*\n/, '')
  actualHtml = md4mefi.md2html(markdown)
  test.equal(expectedHtml, actualHtml)
  test.done()


#####################################
# ul tests

exports['ul - one item'] = (test) ->
  doTestCase test,
    "* One",
    """
    <ul>
    <li>One</li>
    </ul>
    """

exports['ul - two items'] = (test) ->
  doTestCase test,
    """
    * One
    * Two
    """,
    """
    <ul>
    <li>One</li>
    <li>Two</li>
    </ul>
    """

#####################################
# ol tests

exports['ol - one item'] = (test) ->
  doTestCase test,
    "1. One",
    """
    <ol>
    <li>One</li>
    </ol>
    """

exports['ol - two items'] = (test) ->
  doTestCase test, 
    """
    1. One
    2. Two
    """,
    """
    <ol>
    <li>One</li>
    <li>Two</li>
    </ol>
    """


#####################################
# lists and paragraphs

exports['para before ul'] = (test) ->
  doTestCase test,
    """
    Before

    * One
    * Two
    * Three
    """,
    """
    Before

    <ul>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    </ul>
    """


exports['para after ul'] = (test) ->
  doTestCase test,
   """
    * One
    * Two
    * Three

    After
    """,
    """
    <ul>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    </ul>

    After
    """

exports['para before ol'] = (test) ->
  doTestCase test,
    """
    Before

    1. One
    2. Two
    3. Three
    """,
    """
    Before

    <ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    </ol>
    """
  
exports['para after ol'] = (test) ->
  doTestCase test,
    """
    1. One
    2. Two
    3. Three

    After
    """,
    """
    <ol>
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
    </ol>

    After
    """




