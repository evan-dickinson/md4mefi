'use strict';

var md4mefi = require('../lib/md4mefi');

// exports['plain text'] = function(test) {
// 	test.equal(md4mefi.md2html("moo"), "moo");
// 	test.done();
// }

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
	testCases.forEach(function(testCase) {
		var mdText = testCase[0];
		var htmlText = testCase[1];

		test.equal(md4mefi.md2html(mdText), htmlText);
	});


	test.done();
}
