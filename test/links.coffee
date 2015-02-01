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

     