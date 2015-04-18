md4mefi = require('../lib/md4mefi')
testOneMarkdownText = require('../lib/test-utils').testOneMarkdownText

#####################################
# ul tests

exports['ul - one item'] = (test) ->
  testOneMarkdownText test,
    "* One",
    """
    <ul>
    <li>One</li>
    </ul>
    """

exports['ul - two items'] = (test) ->
  testOneMarkdownText test,
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
  testOneMarkdownText test,
    "1. One",
    """
    <ol>
    <li>One</li>
    </ol>
    """

exports['ol - two items'] = (test) ->
  testOneMarkdownText test, 
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
  testOneMarkdownText test,
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
  testOneMarkdownText test,
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
  testOneMarkdownText test,
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
  testOneMarkdownText test,
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




