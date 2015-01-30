'use strict';

var markdown = require( "markdown" ).markdown;
var typogr = require('typogr');


function renderJsonML( jsonml, options ) {
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
}

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

// Do substitution after smartypants has run.
// Need to use named entities, because MeFi simply strips numeric entities.
function replaceNumericEntities(htmlText) {
	return htmlText.replace( /&#34;/g,		'&quot;' )
	    		   .replace( /&#39;/g,		'&apos;' )
	    		   .replace( /&#8211;/g,	'&ndash;' )
	    		   .replace( /&#8212;/g,	'&mdash;' )
	    		   .replace( /&#8216;/g,	'&lsquo;' )
	    		   .replace( /&#8217;/g,	'&rsquo;' )
	    		   .replace( /&#8220;/g,	'&ldquo;' )
	    		   .replace( /&#8221;/g,	'&rdquo;' )
	    		   .replace( /&#8230;/g,	'&hellip;')

}


exports.md2html = function(markdownText) {
	//return markdown.toHTML(markdownText);
	var markdownTree = markdown.parse(markdownText);
	var htmlTree = markdown.toHTMLTree(markdownTree);
	//console.log(htmlTree);
	var htmlText = renderJsonML(htmlTree);

	var smartHtmlText = typogr.smartypants(htmlText);
	smartHtmlText = replaceNumericEntities(smartHtmlText);

	return smartHtmlText;
}