(function(args) {
	'use strict';

	var expose = args.expose;
	var marked = args.marked;

	// When one blockquote contains several paragraph tags,
	// wrap each paragraph in its own blockquote.
	// 
	// Do this because in an FPP, the consecutive paragraphs
	// would all get smashed together.
	var makeOneBlockquotePerPara = function(tokens) {
		var newTokens = [];
		var isInBlockquote = false;

		tokens.forEach(function(currToken, currTokenIdx) {
			newTokens.push(currToken);

			if (currTokenIdx >= tokens.length - 1) {
				return;
			}
			var nextToken = tokens[currTokenIdx + 1];

			if (currToken.type === 'blockquote_start') {
				isInBlockquote = true;
			}
			else if (currToken.type === 'blockquote_end') {
				isInBlockquote = false;
			}

			var isSubsequentParaInBlockquote =
				isInBlockquote &&
				currToken.type === 'paragraph' &&
				nextToken.type === 'paragraph';
			if (isSubsequentParaInBlockquote) {
				newTokens.push({
					type: 'blockquote_end'
				});
				newTokens.push({
					type: 'blockquote_start'
				});
			}
		});

		newTokens.links = tokens.links;
		return newTokens;
	};

	expose.mangleTokenNewlines = function(tokens) {
		var rules = [
			// if currToken...	is followed by nextToken, then add a newline
			['paragraph', 		'paragraph'],
			['paragraph',		'blockquote_start'],
			['paragraph', 		'list_start'],
			// TODO: does list_end even have a text node? 
			// get rid of this entry?
			['list_end',		'paragraph'],
			['code',			'paragraph'],
			['code',			'list_start'],
			['paragraph',		'code'],
		];
		var currTokenIdx, currToken, nextToken;
		tokens.forEach(function(currToken, currTokenIdx) {
			if (currTokenIdx >= tokens.length - 1) {
				return;
			}
			nextToken = tokens[currTokenIdx + 1];

			rules.forEach(function(rule) {
				if (currToken.type === rule[0] && nextToken.type === rule[1]) {
					//console.log("Mangling: " + rule[0] + "\t" + rule[1]);
					currToken.text += "\n\n";
				}
			});
		});

		return tokens;
	};

	var makeRenderer = function() {
		var renderer = new marked.Renderer();
		var wrappedRenderer = new marked.Renderer();

		renderer.paragraph = function(text) {
			// Return bare text, no surrounding <p> tags
			// This works because we've mangled the tokens
			// to add newlines.

			text = undoEntities(text);
			return text;
		};

		renderer.code = function(code, language, escaped) {
			var endsInNewline = false;
			if (code.search(/\n\n$/) !== -1){
				code = code.replace(/\n\n$/, '');
				endsInNewline = true;
			}

			var output = wrappedRenderer.code(code, language, escaped);
			output = undoEntities(output);
			if (endsInNewline) {
				output += "\n\n";
			}

			return output;
		};

		renderer.list = function(body, ordered) {
			// Lists should have two trailing newlines, not just one
			var html = wrappedRenderer.list(body, ordered);
			return html + "\n";
		};

		renderer.listitem = function(text) {
			text = undoEntities(text);
			return "<li>" + text + "</li>\n";
		};

		renderer.blockquote = function(quote) {
			// The blockquote ends in one newlines, we want it to
			// end in two.
			var html = wrappedRenderer.blockquote(quote);
			return html + "\n";
		};

		return renderer;
	};

	var mergeLinkReferences = function(linksFrom, linksTo) {
		Object.keys(linksFrom)
			.filter(function(linkName) {
				// Skip over keys that are already in tokensTo
				return !linksTo.hasOwnProperty(linkName);
			})
			.forEach(function(linkName) {
				linksTo[linkName] = linksFrom[linkName];
			});
	};

	// Convert Markdown text to MeFi-style HTML
	//
	// For comments, there's only one text box (markdownTextA), and 
	// so markdownTextB is null. For posts, markdownTextA is what's
	// above the fold, and markdownTextB is below the fold (the more 
	// inside).
	expose.md2html = function(markdownTextA, markdownTextB) {
		var tokensA = marked.lexer(markdownTextA);
		var tokensB = (markdownTextB !== undefined && markdownTextB !== null) ?
			marked.lexer(markdownTextB) : null;

		// console.log();
		// console.log("Before merge:");
		// console.log(tokensA);	
		// console.log(tokensB);

		if (tokensB !== null) {
			mergeLinkReferences(tokensA.links, tokensB.links);
			mergeLinkReferences(tokensB.links, tokensA.links);
		}

		// console.log();
		// console.log("Merged tokens:");
		// console.log(tokensA);	
		// console.log(tokensB);

		tokensA = makeOneBlockquotePerPara(tokensA);	
		tokensA = expose.mangleTokenNewlines(tokensA);
		if (tokensB !== null) {
			tokensB = makeOneBlockquotePerPara(tokensB);
			tokensB = expose.mangleTokenNewlines(tokensB);
		}

		// console.log("After mangling:");
		// console.log(tokensA);

		var renderer = makeRenderer();
		var parserOptions = {
			renderer: renderer,
			//smartypants: true,
			smartypants: false,
			gfm: true,
		};
		var parser = new marked.Parser(parserOptions);
		var htmlTextA = parser.parse(tokensA);
		var htmlTextB = tokensB !== null ?
			parser.parse(tokensB) : ""; // empty string, not null

		// console.log();
		// console.log("------");
		// console.log(parsed);		
		// console.log("------");

		// Remove any trailing double newlines.
		htmlTextA = htmlTextA.replace(/\n\n$/, "");
		if (htmlTextB !== null) {
			htmlTextB = htmlTextB.replace(/\n\n$/, "");
		}

		//return htmlTextA;
		//var encodedHtml = encodeSmartypants(htmlText);
		//var encodedHtml = nameNumericEntities(htmlText);
		//return encodedHtml;

		return {
			htmlA: htmlTextA,
			htmlB: htmlTextB,
		};
	};

	// marked does its smartypants substitution with unicode
	// characters. Turn those into HTML entities.
	//
	// Not currently used, because we turned off smartypants.
	function encodeSmartypants(htmlText) {
		return htmlText.replace(/\u2018/g, '&lsquo;')
					   .replace(/\u2019/g, '&rsquo;')
					   .replace(/\u201C/g, '&ldquo;')
					   .replace(/\u201D/g, '&rdquo;')
					   .replace(/\u2013/g, '&ndash;')
					   .replace(/\u2014/g, '&mdash;')
					   .replace(/\u2026/g, '&hellip;');
	}

	// function nameNumericEntities(htmlText) {
	// 	// For some reason, marked uses &#39; instead of &apos;
	// 	// But is uses named entities for all the other things (&quot;,
	// 	// &gt;, etc.). So this is all we need to fix up.
	// 	return htmlText.replace(/&#39;/g, '&apos;');
	// }

	function undoEntities(htmlText) {
		// marked uses &#39; instead of &apos;
		// It does everything else w/ named entities
		return htmlText.replace(/&#39;/g,  '\'')
					   .replace(/&apos;/g, '\'')
					   .replace(/&quot;/g, '\"')
					   .replace(/&lt;/g,   '<')
					   .replace(/&gt;/g,   '>');
	}

	// Return the number of the next link reference.
	// Use this for the auto-numbering links, that are
	// generated by the Link button.
	expose.nextLinkNumber = function(markdownTextA, markdownTextB) {
		var tokensA = marked.lexer(markdownTextA);
		if (markdownTextB !== undefined && markdownTextB !== null) {
			var tokensB = marked.lexer(markdownTextB);
			// from, to
			mergeLinkReferences(tokensB.links, tokensA.links);
		}

		//console.log(tokensA);

		var linkNumbers =
			Object.keys(tokensA.links)
			.map(function(linkNumber) { 
				// Convert everything to base 10 integers,
				// so leading zeroes don't get treated as octal.
				return parseInt(linkNumber, 10); 
			})
			.filter(function(linkNumber) { 
				// Non-numeric link titles became NaN after parseInt()
				return !isNaN(linkNumber); 
			});
		var maxLinkNumber = Math.max.apply(null, linkNumbers);

		// If there are no numeric references, max() returns -Infinity.
		if (maxLinkNumber < 1) {
			return 1;
		}
		else {
			return maxLinkNumber + 1;
		}
	};

	// Return true if the last (nonblank) line in markdownText is 
	// a link reference.
	expose.mdEndsInLinkReference = function(markdownText) {
		// Hacky way to simulate an extended regex
		var linkRegex = [
			// Start of string or start of line
			/(^|[\n\r])/,

			// Optional leading whitespace
			/\s*/,

			// Brackets surrounding a link reference
			/\[\s*/, 
			/[A-Za-z0-9_\- ]+/,
			/\s*\]/,

			// Colon
			/\s*:\s*/,

			// Something link-like. Don't bother checking the whole URL (& optional link title).
			// Just see if it starts with a protocol.
			/(http|https|mailto|ftp)/,

			// Anything goes for the rest of the line
			/[^\r\n]*/,

			// End of string ONLY -- don't just match end of line. 
			// Newlines at the end of the string have been trimmed
			/$/
		// Concatenate all those regexes into one
		].reduce(function(a, b) { return new RegExp(a.source + b.source); });

		// Trim the text before testing, to remove any whitespace from the end.
		// And .trim() does indeed remove newlines
		markdownText = markdownText.trim();

		return linkRegex.test(markdownText);
	};

})( (function() {
  if ( typeof exports === "undefined" ) {
    window.md4mefi = {};
    return {
    	expose: window.md4mefi,
    	marked: window.marked,
    };
  }
  else {
    return {
    	expose: exports,
    	marked: require('marked'),
    };
  }
} )() );