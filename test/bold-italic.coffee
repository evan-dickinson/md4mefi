md4mefi = require('../lib/md4mefi')
saveRestore = require('../lib/save-restore')

testAllRegexes = (test, before, after, wrapperStr, name) ->
  text = before
  saveRestore.boldItalicRegexes.forEach (regex) ->
    text = text.replace(regex.find, regex.replaceFxn(wrapperStr))
  test.strictEqual(text, after, name)  

doTestCase = (test, before, bold, italic) ->
  testAllRegexes(test, before, italic, '*', 'unix newlines')
  testAllRegexes(test, before, bold, '**', 'unix newlines')

  mungedBefore = before.replace('\n', '\r\n')
  testAllRegexes(test, before.replace('\n', '\r\n'), italic.replace('\n', '\r\n'), '*',  'Windows newlines')
  testAllRegexes(test, before.replace('\n', '\r\n'), bold.replace('\n', '\r\n'),   '**', 'Windows newlines')

  test.done()

exports['simple bolding'] = (test) ->
  before = "One"
  bold   = "**One**"
  italic = "*One*"
  doTestCase test, before, bold, italic

exports['trailing newline'] = (test) ->
  before = "One\n"
  bold   = "**One**\n"
  italic = "*One*\n"
  doTestCase test, before, bold, italic

exports['two trailing newlines'] = (test) ->
  before = "One\n\n"
  bold   = "**One**\n\n"
  italic = "*One*\n\n"
  doTestCase test, before, bold, italic

exports['three trailing newlines'] = (test) ->
  before = "One\n\n\n"
  bold   = "**One**\n\n\n"
  italic = "*One*\n\n\n"
  doTestCase test, before, bold, italic

exports['leading newline'] = (test) ->
  before = "\nOne"
  bold   = "\n**One**"
  italic = "\n*One*"
  doTestCase test, before, bold, italic

exports['two leading newlines'] = (test) ->
  before = "\n\nOne"
  bold   = "\n\n**One**"
  italic = "\n\n*One*"
  doTestCase test, before, bold, italic

exports['three leading newlines'] = (test) ->
  before = "\n\n\nOne"
  bold   = "\n\n\n**One**"
  italic = "\n\n\n*One*"
  doTestCase test, before, bold, italic

exports['two consecutive lines'] = (test) ->
  before = "One\nTwo"
  bold   = "**One**\n**Two**"
  italic = "*One*\n*Two*"
  doTestCase test, before, bold, italic

exports['three consecutive lines'] = (test) ->
  before = "One\nTwo\nThree"
  bold   = "**One**\n**Two**\n**Three**"
  italic = "*One*\n*Two*\n*Three*"
  doTestCase test, before, bold, italic

exports['two consecutive lines with double newlines'] = (test) ->
  before = "One\n\nTwo"
  bold   = "**One**\n\n**Two**"
  italic = "*One*\n\n*Two*"
  doTestCase test, before, bold, italic

exports['three consecutive lines with double newlines'] = (test) ->
  before = "One\n\nTwo\n\nThree"
  bold   = "**One**\n\n**Two**\n\n**Three**"
  italic = "*One*\n\n*Two*\n\n*Three*"
  doTestCase test, before, bold, italic

exports['empty string'] = (test) ->
  before = ""
  bold   = "****"
  italic = "**"
  doTestCase test, before, bold, italic


exports['only newlines - one'] = (test) ->
  before = "\n"
  bold   = "****\n"
  italic = "**\n"
  doTestCase test, before, bold, italic  



