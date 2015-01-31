md4mefi = require('../lib/md4mefi')

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

exports['text links only'] = (test) ->
  md = """
  I'd like a [pizza][pizza], please.

  [pizza]: http://freshslice.ca
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 1)
  test.done()

exports['no links'] = (test) ->
  md = """
  Hello, Dave
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 1)
  test.done()

exports['leading zeroes'] = (test) ->
  md = """
  [Thing one][001]
  [Thing two][002]
  [Thing three][003]

  [001]: http://google.ca
  [002]: http://google.com
  [003]: http://google.co.uk
  """
  next = md4mefi.nextLinkNumber(md)
  test.equals(next, 4)
  test.done()