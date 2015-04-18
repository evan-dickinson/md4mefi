// Utility function for running tests

(function() {
  "use strict";

  var md4mefi = require('./md4mefi');

  var doIndentFix = function(markdownText) {
    // INDENTFIX has to do with dealing w/ how coffeescript's string
    // literals deal with whitespace. See code.coffee for examples
    // of how it's used.
    return markdownText.replace(/^INDENTFIX\s*\n/, '');
  };

  exports['testOneMarkdownText'] = function(test, markdown, expectedHtml) {
    markdown = doIndentFix(markdown);
    var actualHtml = md4mefi.md2html(markdown, null).htmlA;
    test.equal(expectedHtml, actualHtml);
    test.done();
  };

  exports['testTwoMarkdownTexts'] = function(test, markdownA, markdownB, expectedHtmlA, expectedHtmlB) {
    markdownA = doIndentFix(markdownA);
    markdownB = doIndentFix(markdownB);
    var result = md4mefi.md2html(markdownA, markdownB);
    test.equal(expectedHtmlA, result.htmlA);
    test.equal(expectedHtmlB, result.htmlB);
    test.done();
  };

})();  