(() ->
  md4mefi = window.md4mefi
  testOneMarkdownText = window.md4mefiTestUtils.testOneMarkdownText

  QUnit.module("Lists")

  #####################################
  # ul tests

  QUnit.test 'ul - one item', (test) ->
    testOneMarkdownText test,
      "* One",
      """
      <ul>
      <li>One</li>
      </ul>
      """

  QUnit.test 'ul - two items', (test) ->
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

  QUnit.test 'ol - one item', (test) ->
    testOneMarkdownText test,
      "1. One",
      """
      <ol>
      <li>One</li>
      </ol>
      """

  QUnit.test 'ol - two items', (test) ->
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

  QUnit.test 'para before ul', (test) ->
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


  QUnit.test 'para after ul', (test) ->
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

  QUnit.test 'para before ol', (test) ->
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
    
  QUnit.test 'para after ol', (test) ->
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

)()


