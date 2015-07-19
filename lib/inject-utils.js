// Utility functions to support inject.js
//
// Functions in this file can be unit tested.

(function(args) {
  'use strict';

  var exports = args.exports;

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
      // Add wrapperChar at the start of lines
      mdComment.selection('replaceRegexp', {
        find: /^(?=[^\r\n])/mg,
        replace: wrapperChar
      });
      //... and at the end of lines.
      mdComment.selection('replaceRegexp', {
        find: /([^\r\n])$/mg,
        // No lookbehinds in javascript, so be sure to include
        // the parenthesized text in the replacement
        replace: '$1' + wrapperChar
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