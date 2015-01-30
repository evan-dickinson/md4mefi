'use strict';

var md4mefi = require('../lib/md4mefi');

function doTestCases(test, testCases) {
	testCases.forEach(function(testCase) {
		var mdText = testCase[0];
		var htmlText = testCase[1];

		test.equal(md4mefi.md2html(mdText), htmlText);
	});
}

exports['strip p tags'] = function(test) {
	var testCases = [
		// Don't surround plain text (no newlines) in <p> tags.
		[
			'Twenty bucks, same as in town.',
			'Twenty bucks, same as in town.'
		],

		// Single newlines are retained.
		// MeFi will convert them into <br> tags.
		[
			"Hi.\nI'm Lenny.\nThis is Carl and Homer.",
			"Hi.\nI&apos;m Lenny.\nThis is Carl and Homer."
		],

		// Double newlines are retained.
		// MeFi will convert them into <br><br>
		[
			"I like cheese.\n\nI do not like ice cream.",
			"I like cheese.\n\nI do not like ice cream."
		],

		// Test complex paras w/ embedded tags
		[
			"Hello, *Wilbur*, I'm so happy to **see you**.\n\nHow's the wife?",
			"Hello, <em>Wilbur</em>, I&apos;m so happy to <strong>see you</strong>.\n\nHow&apos;s the wife?"
		]
	];
	doTestCases(test, testCases);

	test.done();
};

exports['blockquote'] = function(test) {
	var testCases = [
		// Simple blockquote
		[
			'> Hello',
			'<blockquote>Hello</blockquote>'
		],
		// Ensure that two blockquotes produce one HTML blockquote tag
		[
			"> Hello\n\n> I like cheese.",
			"<blockquote>Hello\n\nI like cheese.</blockquote>"
		],
		// 3 blockquotes!
		[
			"> Hello\n\n>I like cheese.\n\n>I do not like ice cream.",
			"<blockquote>Hello\n\nI like cheese.\n\nI do not like ice cream.</blockquote>"
		],
	];

	doTestCases(test, testCases);
	test.done();
};

exports['bullet list'] = function(test) {
	var testCases = [
		[
			'* One',
			'<ul><li>One</li></ul>'
		],
		[
			'* One\n* Two',
			'<ul><li>One</li><li>Two</li></ul>'
		]
	];

	doTestCases(test, testCases);
	test.done();	
};


exports['number list'] = function(test) {
	var testCases = [
		[
			'1. One',
			'<ol><li>One</li></ol>'
		],
		[
			'1. One\n1. Two',
			'<ol><li>One</li><li>Two</li></ol>'
		]
	];

	doTestCases(test, testCases);
	test.done();	
};


exports['special characters'] = function(test) {
	var testCases = [
		[
			"I'm",
			"I&apos;m"
		],

	];

	doTestCases(test, testCases);
	test.done();	
};

