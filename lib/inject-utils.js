// Utility functions to support inject.js
//
// Functions in this file can be unit tested.

(function(args) {
  'use strict';

  var exports = args.exports;

  // find: argument 1 to String.replace().
  // replaceFxn: A function that takes the string ('*' or '**')
  // and returns the 2nd argument to String.replace().
  var boldItalicRegexes = [
    // Start of string
    { 
      find: /^(?=[^\r\n])/mg, 
      replaceFxn: function(replaceStr) { return replaceStr; },
    },
    // End of string
    { 
      find: /([^\r\n])$/mg, 
      replaceFxn: function(replaceStr) {
        // No lookbehinds in javascript, so be sure to include
        // the parenthesized text in the replacement
        return '$1' + replaceStr;
      }
    },
    // Empty text
    // {
    //   find: /^(?=[\r\n]*$)/g,
    //   // Double up on replaceStr since, unlike others, we're matching both the
    //   // "before" and "after" here.
    //   replaceFxn: function(replaceStr) { return replaceStr + replaceStr; },
    // },
  ];

  exports.doBoldOrItalic = function(boldOrItalic, mdComment) {
    var caretPos;

    var wrapperChar, placeholderText;
    if (boldOrItalic === 'bold') {
      wrapperChar = '**';
      placeholderText = '**bold text**';
    }
    else {
      wrapperChar = '*';
      placeholderText = "*italic text*";
    }

    mdComment.selection('trim');
    if (mdComment.selection('get') === "") {
      caretPos = mdComment.selection('getPos');

      mdComment.selection('insert', {text: placeholderText, mode: 'before'});

      // skip past the first wrapper char
      caretPos.start += wrapperChar.length; 
      // Highlight all of placeholderText, except the wrapper chars
      caretPos.end = caretPos.start + placeholderText.length - (2 * wrapperChar.length);
      mdComment.selection('setPos', caretPos);
    }
    else {
      boldItalicRegexes.forEach(function(config){
        mdComment.selection('replaceRegexp', {
          find: config.find,
          replace: config.replaceFxn(wrapperChar)
        });
      });

      // Remove wrapperChar from both ends of the selection
      caretPos = mdComment.selection('getPos');
      caretPos.start += wrapperChar.length;
      caretPos.end   -= wrapperChar.length;
      mdComment.selection('setPos', caretPos);
    }  
  };


})( (function() {
  if ( typeof exports === "undefined" ) {
    window.md4mefiInjectUtils = {};
    return {
      exports: window.md4mefiInjectUtils,
    };
  }
  else {
    return {
      exports: exports,
    };
  }
} )() );    