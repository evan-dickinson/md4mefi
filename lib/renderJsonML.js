
// We've had to modify the JsonML -> HTML stage from markdown.js
// This file encapsulates all of those changes.

(function(expose) {
  'use strict';
  exports.renderJsonML = function( jsonml, options ) {
    options = options || {};
    // include the root element in the rendered output?
    options.root = options.root || false;

    var content = [];

    if ( options.root ) {
      content.push( render_tree( jsonml ) );
    }
    else {
      jsonml.shift(); // get rid of the tag
      if ( jsonml.length && typeof jsonml[ 0 ] === "object" && !( jsonml[ 0 ] instanceof Array ) ) {
        jsonml.shift(); // get rid of the attributes
      }

      while ( jsonml.length ) {
        content.push( render_tree( jsonml.shift() ) );
      }
    }

    // Remove any trailing linebreaks that arose from <p> tags.
    content = content.join('');
    return content.replace(/\n\n$/, '');
  };

  // This is the escapeHTML function within render_tree. We do other escaping later on inthe
  // process, too.
  function escapeHTML( text ) {
    return text.replace( /&/g, "&amp;" )
               .replace( /</g, "&lt;" )
               .replace( />/g, "&gt;" );

               // quotes & apostrophies will be handled later, by smartypants
               //.replace( /"/g, "&quot;" )
               //.replace( /'/g, "&apos;" );
  }

  function render_tree( jsonml ) {
    // basic case
    if ( typeof jsonml === "string" ) {
      return escapeHTML( jsonml );
    }

    var tag = jsonml.shift(),
        attributes = {},
        content = [];

    if ( jsonml.length && typeof jsonml[ 0 ] === "object" && !( jsonml[ 0 ] instanceof Array ) ) {
      attributes = jsonml.shift();
    }

    while ( jsonml.length ) {
      content.push( render_tree( jsonml.shift() ) );
    }

    var tag_attrs = "";
    for ( var a in attributes ) {
      tag_attrs += " " + a + '="' + escapeHTML( attributes[ a ] ) + '"';
    }

    // be careful about adding whitespace here for inline elements
    if ( tag == "img" || tag == "br" || tag == "hr" ) {
      return "<"+ tag + tag_attrs + "/>";
    }
    else if (tag == 'p') {
    	// MeFi doesn't use P tags in its HTML. Follow with double linebreaks, instead.
    	return content.join("") + "\n\n";
    }
    else {
    	// Remove any trailing double linebreaks that arose from <p> tags.
    	content = content.join("")
    		.replace(/\n\n$/, "");
    	return "<"+ tag + tag_attrs + ">" + content + "</" + tag + ">";
    }
  }
} ) ( (function() {
  if ( typeof exports === "undefined" ) {
    window.renderJsonML = {};
    return window.renderJsonML;
  }
  else {
    return exports;
  }
} )() );

