md4mefi = require('../lib/md4mefi')
doTestCase = require('../lib/test-utils').doTestCase

exports['inline paren'] = (test) ->
  doTestCase test,
    """
    Hello, [world](http://world.com).
    """,
    """
    Hello, <a href="http://world.com">world</a>.
    """

# Clean up whitespace left after removing link from the text
exports['remove space between text and link ref'] = (test) ->
  doTestCase test,
    """
    Hello, [world][1].



    [1]: http://world.com
    """,
    """
    Hello, <a href="http://world.com">world</a>.
    """    


# Clean up whitespace left after removing link from the text
exports['link ref before text'] = (test) ->
  doTestCase test,
    """
    [1]: http://world.com


    Hello, [world][1].
    """,
    """
    Hello, <a href="http://world.com">world</a>.
    """    

# Clean up the whitespace left after pulling the link out of the text.
exports['link ref between paras'] = (test) ->
  doTestCase test,
    """
    Hello, [world][1].

    [1]: http://world.com

    Goodnight, moon.
    """,
    """
    Hello, <a href="http://world.com">world</a>.

    Goodnight, moon.
    """    

exports['bare urls'] = (test) -> 
  doTestCase test,
    """
    I like http://cat-scan.com
    """,
    """
    I like <a href="http://cat-scan.com">http://cat-scan.com</a>
    """

# Don't auto-convert URLs that don't begin with http://
exports['bare URLs need leading http://'] = (test) ->
  doTestCase test,
    """
    cat-scan.com is the strangest site I have seen in some time.
    """,
    """
    cat-scan.com is the strangest site I have seen in some time.
    """


exports['self-named references'] = (test) ->
  doTestCase test,
    """
    I searched on [Google][], [Bing][], and [Ask Jeeves][].

    [google]: http://google.com
    [bing]: http://bing.com
    [ask jeeves]: http://askjeeves.com
    """,
    """
    I searched on <a href="http://google.com">Google</a>, <a href="http://bing.com">Bing</a>, and <a href="http://askjeeves.com">Ask Jeeves</a>.
    """