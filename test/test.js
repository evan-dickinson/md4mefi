(function() {
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
        "Hi.\nI&rsquo;m Lenny.\nThis is Carl and Homer."
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
        "Hello, <em>Wilbur</em>, I&rsquo;m so happy to <strong>see you</strong>.\n\nHow&rsquo;s the wife?"
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

  exports['paragraphs and lists'] = function(test) {
    var testCases = [
      [
        // Ensure newlines when there's a paragraph before a ul list.
        // And that there is no trailing newlines after the list.
        'Before\n\n* One\n* Two\n* Three',
        'Before\n\n<ul><li>One</li><li>Two</li><li>Three</li></ul>'
      ],
      [
        // Ensure newlines when there's a paragraph after a ul list.
        '* One\n* Two\n* Three\n\nAfter',
        '<ul><li>One</li><li>Two</li><li>Three</li></ul>\n\nAfter'
      ],      

      [
        // Ensure newlines when there's a paragraph before a ol list.
        // And that there is no trailing newlines after the list.
        'Before\n\n1. One\n2. Two\n3. Three',
        'Before\n\n<ol><li>One</li><li>Two</li><li>Three</li></ol>'
      ],
      [
        // Ensure newlines when there's a paragraph after a ol list.
        '1. One\n2. Two\n3. Three\n\nAfter',
        '<ol><li>One</li><li>Two</li><li>Three</li></ol>\n\nAfter'
      ],          
    ];


    doTestCases(test, testCases);
    test.done();      
  };


  exports['special characters'] = function(test) {
    var testCases = [
      // Apostrophe replaced by &rsquo;
      [
        "I'm",
        "I&rsquo;m"
      ],

      // Left & right double quotes
      [
        '"I am the walrus," said Paul.',
        "&ldquo;I am the walrus,&rdquo; said Paul."
      ],

      // Single quotes. Note that typogr makes the first quote an rsquo instead of an lsquo
      [
        "'I am the walrus,' said Paul, using British quote marks.",
        "&rsquo;I am the walrus,&rsquo; said Paul, using British quote marks."
      ],

      // Apostrophe inside of a quotation.
      [
        '"I\'m doin\' fine," Tom said finely.',
        '&ldquo;I&rsquo;m doin&rsquo; fine,&rdquo; Tom said finely.'
      ],

      // ndash
      [
        'apple -- orange',
        'apple &ndash; orange'
      ],

      // mdash.
      // Note: a bare "---" on a line will turn into <hr>. Add some other text to
      // force it to be an mdash.
      [
        'apple --- orange',
        'apple &mdash; orange'
      ],

      // ellipsis
      [
        'and then ...',
        'and then &hellip;'
      ],
    ];

    doTestCases(test, testCases);
    test.done();  
  };


  exports['code'] = function(test) {
    var testCases = [
      [
        '    int x = 1;',
        '<pre><code>int x = 1;</code></pre>'
      ],
      [
        '    int x = 1;\n    int y = 2;',
        '<pre><code>int x = 1;\nint y = 2;</code></pre>'
      ],
      [
        '    int x = 1;\n\n    int y = 2;',
        '<pre><code>int x = 1;\n\nint y = 2;</code></pre>'
      ],
      [
        'orange `int x = 1` banana',
        'orange <code>int x = 1</code> banana'
      ],
    ];

    doTestCases(test, testCases);
    test.done();  
  };

})();