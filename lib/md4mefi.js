
(function(args) {
	'use strict';

	var expose = args.expose;
	var markdown = args.markdown;
	var typogr = args.typogr;
	var renderJsonML = args.renderJsonML;

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
		    		   .replace( /&#8230;/g,	'&hellip;');

	}

	expose.md2html = function(markdownText) {
		var markdownTree = markdown.parse(markdownText);
		var htmlTree = markdown.toHTMLTree(markdownTree);
		//console.log(htmlTree);
		var htmlText = renderJsonML.renderJsonML(htmlTree);

		var smartHtmlText = typogr.smartypants(htmlText);
		smartHtmlText = replaceNumericEntities(smartHtmlText);

		return smartHtmlText;
	};

})( (function() {
  if ( typeof exports === "undefined" ) {
    window.md4mefi = {};
    return {
    	expose: window.md4mefi,
    	markdown: window.markdown,
    	typogr: window.typogr,
    	renderJsonML: window.renderJsonML,
    };
  }
  else {
    return {
    	expose: exports,
    	// When used through npm, markdown adds another layer of indirection, 
    	// hence the .markdown at the end.
		markdown: require( "markdown" ).markdown,
		typogr: require('typogr'),
		renderJsonML: require('./renderJsonML'),
    };
  }
} )() );