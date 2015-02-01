// Utility function for running tests

(function() {
  "use strict";

  var md4mefi = require('./md4mefi');

  exports['doTestCase'] = function(test, markdown, expectedHtml) {
    // INDENTFIX has to do with dealing w/ how coffeescript's string
    // literals deal with whitespace. See code.coffee for examples
    // of how it's used.
    markdown = markdown.replace(/^INDENTFIX\s*\n/, '');
    var actualHtml = md4mefi.md2html(markdown);
    test.equal(expectedHtml, actualHtml);
    test.done();
  };

})();  