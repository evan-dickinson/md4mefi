md4mefi = require('../lib/md4mefi')

# Unlike other test suites, we're not checking markdown against compiled HTML.
# Instead, we're testing the return value of nextLinkNumber().

exports['single link'] = (test) ->
  md = """
  [Hello][1]

  [1]: http://google.com
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 2)
  test.done()

exports['two links'] = (test) ->
  md = """
  [Hello][1], [Dave][2]

  [1]: http://google.com
  [2]: http://hal9000.biz
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 3)
  test.done()

exports['one text link'] = (test) ->
  md = """
  I'd like a [good pizza][pizza], please.

  [pizza]: http://freshslice.ca
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 1)
  test.done()

exports['two text links'] = (test) ->
  md = """
  I'd like a [good pizza][pizza] and a [stale croissant][tims], please.

  [pizza]: http://freshslice.ca
  [tims]: http://timhortons.ca
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 1)
  test.done()

exports['text and numeric links'] = (test) ->
  md = """
  I'd like a [good pizza][pizza] and a [stale croissant][1], please.

  [pizza]: http://freshslice.ca
  [1]: http://timhortons.ca
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 2)
  test.done()

exports['gaps in number sequence'] = (test) ->
  md = """
  I'd like a [good pizza][4] and a [stale croissant][1], please.

  [4]: http://freshslice.ca
  [1]: http://timhortons.ca
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 5)
  test.done()  

exports['no links'] = (test) ->
  md = """
  Hello, Dave
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 1)
  test.done()

exports['leading zeroes aren not octal'] = (test) ->
  md = """
  [Thing one][010]
  [Thing two][011]
  [Thing three][012]

  [010]: http://google.ca
  [011]: http://google.com
  [012]: http://google.co.uk
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 13)
  test.done()