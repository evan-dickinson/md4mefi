(() ->

  md4mefi = window.md4mefi

  QUnit.module("Link number")

  # Unlike other test suites, we're not checking markdown against compiled HTML.
  # Instead, we're testing the return value of nextLinkNumber().

  QUnit.test 'single link', (test) ->
    md = """
    [Hello][1]

    [1]: http://google.com
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(md, null)
    test.strictEqual(next, 2)


  QUnit.test 'two links', (test) -> 
    md = """
    [Hello][1], [Dave][2]

    [1]: http://google.com
    [2]: http://hal9000.biz
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(md, null)
    test.strictEqual(next, 3)

  QUnit.test 'one text link', (test) -> 
    md = """
    I'd like a [good pizza][pizza], please.

    [pizza]: http://freshslice.ca
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(md, null)
    test.strictEqual(next, 1)

  QUnit.test 'two text links', (test) -> 
    md = """
    I'd like a [good pizza][pizza] and a [stale croissant][tims], please.

    [pizza]: http://freshslice.ca
    [tims]: http://timhortons.ca
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(md, null)
    test.strictEqual(next, 1)

  QUnit.test 'text and numeric links', (test) -> 
    md = """
    I'd like a [good pizza][pizza] and a [stale croissant][1], please.

    [pizza]: http://freshslice.ca
    [1]: http://timhortons.ca
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(md, null)
    test.strictEqual(next, 2)

  QUnit.test 'gaps in number sequence', (test) -> 
    md = """
    I'd like a [good pizza][4] and a [stale croissant][1], please.

    [4]: http://freshslice.ca
    [1]: http://timhortons.ca
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(md, null)
    test.strictEqual(next, 5)

  QUnit.test 'no links', (test) ->
    md = """
    Hello, Dave
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(md, null)
    test.strictEqual(next, 1)

  QUnit.test 'leading zeroes aren not octal', (test) -> 
    md = """
    [Thing one][010]
    [Thing two][011]
    [Thing three][012]

    [010]: http://google.ca
    [011]: http://google.com
    [012]: http://google.co.uk
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(md, null)
    test.strictEqual(next, 13)

  QUnit.test 'numbers above and below the fold', (test) -> 
    mdA = """
    [1]: #one
    [2]: #two
    """
    mdB = """
    [3]: #three
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(mdA, mdB)
    test.strictEqual(next, 4)

  QUnit.test 'numbers above the fold only', (test) -> 
    mdA = """
    [1]: #one
    """
    mdB = """
    blah blah blah  
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(mdA, mdB)
    test.strictEqual(next, 2)

  QUnit.test 'numbers below the fold only', (test) -> 
    mdA = """
    blah blah blah
    """
    mdB = """
    [1]: #one
    [2]: #two
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(mdA, mdB)
    test.strictEqual(next, 3)

  QUnit.test 'no links above or below the fold', (test) -> 
    mdA = """
    blah blah blah
    """
    mdB = """
    woof woof woof
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(mdA, mdB)
    test.strictEqual(next, 1)


  QUnit.test 'text references above the fold, numbers below', (test) -> 
    mdA = """
    blah [blah][yadda] blah

    [yadda]: #yadda
    """
    mdB = """
    woof [woof][1] woof

    [1]: #woof
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(mdA, mdB)
    test.strictEqual(next, 2)

  QUnit.test 'number references above the fold, text refs below', (test) -> 
    mdA = """
    blah [blah][8] blah

    [8]: #blah
    """
    mdB = """
    woof [woof][] woof

    [woof]: #woof
    """
    test.expect(1)
    next = md4mefi.nextLinkNumber(mdA, mdB)
    test.strictEqual(next, 9)

  QUnit.test 'conflicting numeric references - higher number above', (test) -> 
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
    test.expect(1)
    next = md4mefi.nextLinkNumber(mdA, mdB)
    test.strictEqual(next, 4)

  QUnit.test 'conflicting numeric references - higher number below', (test) -> 
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
    test.expect(1)
    next = md4mefi.nextLinkNumber(mdA, mdB)
    test.strictEqual(next, 4)
)()
