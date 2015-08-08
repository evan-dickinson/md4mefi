(() ->

  md4mefi = window.md4mefi
  testUtils = window.md4mefiTestUtils

  testOneMarkdownText = testUtils.testOneMarkdownText
  testTwoMarkdownTexts = testUtils.testTwoMarkdownTexts

  QUnit.module "Links"

  QUnit.test 'inline paren', (test) ->
    testOneMarkdownText test,
      """
      Hello, [world](http://world.com).
      """,
      """
      Hello, <a href="http://world.com">world</a>.
      """

  # Clean up whitespace left after removing link from the text
  QUnit.test 'remove space between text and link ref', (test) ->
    testOneMarkdownText test,
      """
      Hello, [world][1].



      [1]: http://world.com
      """,
      """
      Hello, <a href="http://world.com">world</a>.
      """    


  # Clean up whitespace left after removing link from the text
  QUnit.test 'link ref before text', (test) ->
    testOneMarkdownText test,
      """
      [1]: http://world.com


      Hello, [world][1].
      """,
      """
      Hello, <a href="http://world.com">world</a>.
      """    

  # Clean up the whitespace left after pulling the link out of the text.
  QUnit.test 'link ref between paras', (test) ->
    testOneMarkdownText test,
      """
      Hello, [world][1].

      [1]: http://world.com

      Goodnight, moon.
      """,
      """
      Hello, <a href="http://world.com">world</a>.

      Goodnight, moon.
      """    

  QUnit.test 'bare urls', (test) -> 
    testOneMarkdownText test,
      """
      I like http://cat-scan.com
      """,
      """
      I like <a href="http://cat-scan.com">http://cat-scan.com</a>
      """

  # Don't auto-convert URLs that don't begin with http://
  QUnit.test 'bare URLs need leading http://', (test) ->
    testOneMarkdownText test,
      """
      cat-scan.com is the strangest site I have seen in some time.
      """,
      """
      cat-scan.com is the strangest site I have seen in some time.
      """


  QUnit.test 'self-named references', (test) ->
    testOneMarkdownText test,
      """
      I searched on [Google][], [Bing][], and [Ask Jeeves][].

      [google]: http://google.com
      [bing]: http://bing.com
      [ask jeeves]: http://askjeeves.com
      """,
      """
      I searched on <a href="http://google.com">Google</a>, <a href="http://bing.com">Bing</a>, and <a href="http://askjeeves.com">Ask Jeeves</a>.
      """

  # Mostly a test to make sure that URL fragments are OK to use in other test cases.
  # Writing out full URLs is tedious.
  QUnit.test 'url fragment', (test) ->
    testOneMarkdownText test,
      """
      [foo][]

      [foo]: #foo
      """,
      """
      <a href="#foo">foo</a>
      """


  QUnit.test 'numbered reference given below the fold', (test) ->
    testTwoMarkdownTexts test,
      """
      I found a [great site][1].
      """,
      """
      It was on the Internet!

      [1]: http://www.cat-scan.com
      """,
      """
      I found a <a href="http://www.cat-scan.com">great site</a>.
      """,
      """
      It was on the Internet!
      """

  QUnit.test 'numbered reference given above the fold', (test) ->
    testTwoMarkdownTexts test,
      """
      I used [Google][2] to find a great site.

      [1]: http://www.cat-scan.com
      [2]: http://www.google.com
      """,
      """
      It's about [cats wedged into scanners][1].
      """,
      """
      I used <a href="http://www.google.com">Google</a> to find a great site.
      """,
      """
      It's about <a href="http://www.cat-scan.com">cats wedged into scanners</a>.
      """

  QUnit.test 'conflicting numbered references', (test) ->
    testTwoMarkdownTexts test,
      """
      Here are some [cats][1].

      [1]: http://www.cat-scan.com
      """,
      """
      Here are some [kittens][1].

      [1]: http://placekitten.com
      """,
      """
      Here are some <a href="http://www.cat-scan.com">cats</a>.
      """,
      """
      Here are some <a href="http://placekitten.com">kittens</a>.
      """

  # Define 'conflict' as a reference above & below the fold. Make sure it
  # comes through okay.
  QUnit.test 'mix of conflicting and non-conflicting references', (test) ->
    testTwoMarkdownTexts test,
      """
      One [fish][above-only], two [fish][conflict]

      [above-only]: #above
      [conflict]: #c-above
      """
      """
      Red [fish][below-only], blue [fish][conflict]
      
      [below-only]: #below
      [conflict]: #c-below
      """,
      """
      One <a href="#above">fish</a>, two <a href="#c-above">fish</a>
      """,
      """
      Red <a href="#below">fish</a>, blue <a href="#c-below">fish</a>
      """
)()