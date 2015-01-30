'use strict';

var markdown = require( "markdown" ).markdown;
var typogr = require('typogr');
var renderJsonML = require('./renderJsonML');



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
	var htmlText = renderJsonML.renderJsonML(htmlTree);

	var smartHtmlText = typogr.smartypants(htmlText);
	smartHtmlText = replaceNumericEntities(smartHtmlText);

	return smartHtmlText;
}