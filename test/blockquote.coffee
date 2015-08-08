(() ->

  md4mefi = window.md4mefi
  testOneMarkdownText = window.md4mefiTestUtils.testOneMarkdownText

  QUnit.module("Blockquote")

  QUnit.test 'simple blockquote', (test) ->
    testOneMarkdownText test,
      """
      > Hello
      """,
      """
      <blockquote>
      Hello</blockquote>
      """


  QUnit.test 'two adjacent blockquotes', (test) ->
    testOneMarkdownText test,
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

  QUnit.test 'three adjacent blockquotes', (test) ->
    testOneMarkdownText test,
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

  QUnit.test 'four adjacent blockquotes', (test) ->
    testOneMarkdownText test,
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

  QUnit.test 'para then blockquote', (test) ->
    testOneMarkdownText test,
      """
      Hello

      > A quote
      """,
      """
      Hello

      <blockquote>
      A quote</blockquote>
      """

  QUnit.test 'blockquote then para', (test) ->
    testOneMarkdownText test,
      """
      > A quote

      Hello
      """,
      """
      <blockquote>
      A quote</blockquote>

      Hello
      """

  QUnit.test 'list then blockquote', (test) ->
    testOneMarkdownText test,
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

  QUnit.test 'blockquote then list', (test) ->
    testOneMarkdownText test,
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


  QUnit.test 'link in a blockquote', (test) =>
    testOneMarkdownText test,
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

)()