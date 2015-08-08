// Utility function for running tests

(function(args) {
  "use strict";

  var md4mefi = args.md4mefi;
  var exports = args.exports;

  //var md4mefi = require('./md4mefi');

  var doIndentFix = function(markdownText) {
    // INDENTFIX has to do with dealing w/ how coffeescript's string
    // literals deal with whitespace. See code.coffee for examples
    // of how it's used.
    return markdownText.replace(/^INDENTFIX\s*\n/, '');
  };

  exports['testOneMarkdownText'] = function(test, markdown, expectedHtml) {
    test.expect(1);
    markdown = doIndentFix(markdown);
    var actualHtml = md4mefi.md2html(markdown, null).htmlA;
    test.strictEqual(actualHtml, expectedHtml);
    //test.done();
  };

  exports['testTwoMarkdownTexts'] = function(test, markdownA, markdownB, expectedHtmlA, expectedHtmlB) {
    test.expect(2);
    markdownA = doIndentFix(markdownA);
    markdownB = doIndentFix(markdownB);
    var result = md4mefi.md2html(markdownA, markdownB);
    test.strictEqual(result.htmlA, expectedHtmlA);
    test.strictEqual(result.htmlB, expectedHtmlB);
    //test.done();
  };

})((function() {
  if ( typeof exports === "undefined" ) {
    window.md4mefiTestUtils = {};
    return {
      exports: window.md4mefiTestUtils,
      md4mefi: window.md4mefi,
    };
  }
  else {
    return {
      exports: exports,
      md4mefi: require('md4mefi'),
    };
  }
} )() );

