md4mefi = require('../lib/md4mefi')

# Unlike other test suites, we're not checking markdown against compiled HTML.
# Instead, we're testing the return value of nextLinkNumber().

exports['single link'] = (test) ->
  md = """
  [Hello][1]

  [1]: http://google.com
  """
  next = md4mefi.nextLinkNumber(md, null)
  test.strictEqual(next, 2)
  test.done()

exports['two links'] = (test) ->
  md = """
  [Hello][1], [Dave][2]

  [1]: http://google.com
  [2]: http://hal9000.biz
  """
  next = md4mefi.nextLinkNumber(md, null)
  test.strictEqual(next, 3)
  test.done()

exports['one text link'] = (test) ->
  md = """
  I'd like a [good pizza][pizza], please.

  [pizza]: http://freshslice.ca
  """
  next = md4mefi.nextLinkNumber(md, null)
  test.strictEqual(next, 1)
  test.done()

exports['two text links'] = (test) ->
  md = """
  I'd like a [good pizza][pizza] and a [stale croissant][tims], please.

  [pizza]: http://freshslice.ca
  [tims]: http://timhortons.ca
  """
  next = md4mefi.nextLinkNumber(md, null)
  test.strictEqual(next, 1)
  test.done()

exports['text and numeric links'] = (test) ->
  md = """
  I'd like a [good pizza][pizza] and a [stale croissant][1], please.

  [pizza]: http://freshslice.ca
  [1]: http://timhortons.ca
  """
  next = md4mefi.nextLinkNumber(md, null)
  test.strictEqual(next, 2)
  test.done()

exports['gaps in number sequence'] = (test) ->
  md = """
  I'd like a [good pizza][4] and a [stale croissant][1], please.

  [4]: http://freshslice.ca
  [1]: http://timhortons.ca
  """
  next = md4mefi.nextLinkNumber(md, null)
  test.strictEqual(next, 5)
  test.done()  

exports['no links'] = (test) ->
  md = """
  Hello, Dave
  """
  next = md4mefi.nextLinkNumber(md, null)
  test.strictEqual(next, 1)
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
  next = md4mefi.nextLinkNumber(md, null)
  test.strictEqual(next, 13)
  test.done()

exports['numbers above and below the fold'] = (test) ->
  mdA = """
  [1]: #one
  [2]: #two
  """
  mdB = """
  [3]: #three
  """
  next = md4mefi.nextLinkNumber(mdA, mdB)
  test.strictEqual(next, 4)
  test.done()

exports['numbers above the fold only'] = (test) ->
  mdA = """
  [1]: #one
  """
  mdB = """
  blah blah blah  
  """
  next = md4mefi.nextLinkNumber(mdA, mdB)
  test.strictEqual(next, 2)
  test.done()

exports['numbers below the fold only'] = (test) ->
  mdA = """
  blah blah blah
  """
  mdB = """
  [1]: #one
  [2]: #two
  """
  next = md4mefi.nextLinkNumber(mdA, mdB)
  test.strictEqual(next, 3)
  test.done()

exports['no links above or below the fold'] = (test) ->
  mdA = """
  blah blah blah
  """
  mdB = """
  woof woof woof
  """
  next = md4mefi.nextLinkNumber(mdA, mdB)
  test.strictEqual(next, 1)
  test.done()


exports['text references above the fold, numbers below'] = (test) ->
  mdA = """
  blah [blah][yadda] blah

  [yadda]: #yadda
  """
  mdB = """
  woof [woof][1] woof

  [1]: #woof
  """
  next = md4mefi.nextLinkNumber(mdA, mdB)
  test.strictEqual(next, 2)
  test.done()

exports['number references above the fold, text refs below'] = (test) ->
  mdA = """
  blah [blah][8] blah

  [8]: #blah
  """
  mdB = """
  woof [woof][] woof

  [woof]: #woof
  """
  next = md4mefi.nextLinkNumber(mdA, mdB)
  test.strictEqual(next, 9)
  test.done()

exports['conflicting numeric references - higher number above'] = (test) ->
  mdA = """
  [blah][1] [blah][2] [blah][3]

  [1]: #blah1
  [2]: #blah2
  [3]: #blah3
  """
  mdB = """
  [woof][1] [woof][2] woof

  [1]: #woof1
  [2]: #woof2
  """
  next = md4mefi.nextLinkNumber(mdA, mdB)
  test.strictEqual(next, 4)
  test.done()  

exports['conflicting numeric references - higher number below'] = (test) ->
  mdA = """
  [blah][1] [blah][2] blah

  [1]: #blah1
  [2]: #blah2
  """
  mdB = """
  [woof][1] [woof][2] [woof][3]

  [1]: #woof1
  [2]: #woof2
  [3]: #woof3
  """
  next = md4mefi.nextLinkNumber(mdA, mdB)
  test.strictEqual(next, 4)
  test.done()  

