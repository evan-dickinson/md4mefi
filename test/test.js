'use strict';

var md4mefi = require('../lib/md4mefi');

// exports['plain text'] = function(test) {
// 	test.equal(md4mefi.md2html("moo"), "moo");
// 	test.done();
// }

exports['strip p tags'] = function(test) {
	var testCases = [
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
