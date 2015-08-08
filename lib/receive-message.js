(function(args) {
  "use strict";
  var expose = args.expose;
  var md4mefi;

  if (typeof window !== 'undefined' && typeof window.md4mefi !== 'undefined') {
    // Chrome & Safari
    md4mefi = window.md4mefi;
  }
  else if (typeof require !== 'undefined') {
    // Firefox
    md4mefi = require('./md4mefi');
  }
  else {
    throw "No way to load md4mefi";
  }

  var messageHandlers = {
    md2html: function(message, callback) {
      var result = md4mefi.md2html(message.markdownTextA, message.markdownTextB);
      callback(result);      
    },
    nextLinkNumber: function(message, callback) {
      var markdownTextA = message.markdownTextA;
      var markdownTextB = message.markdownTextB;

      var result = {
        isExtended: message.isExtended,
        nextLinkNumber: md4mefi.nextLinkNumber(markdownTextA, markdownTextB),
        endsInLinkReference: md4mefi.mdEndsInLinkReference(markdownTextA),
      };
      callback(result);
    },
  };

  // Firefox needs to be passed in a worker object, so it gets
  // initialized by function call.
  expose.addFirefoxListener = function(worker) {
    Object.keys(messageHandlers).forEach(function (name) {
      worker.port.on(name, function(message) {
        var callback = function(result) {
          worker.port.emit(name, result);
        };

        var result = messageHandlers[name](message, callback);
      });
    });
  };

  // No function to call to initialize Safari and Chrome.
  if (typeof safari !== 'undefined') {
    safari.application.addEventListener("message", function(messageEvent) {
      var callback = function(result) {
        messageEvent.target.page.dispatchMessage(messageEvent.name, result);
      };
      messageHandlers[messageEvent.name](messageEvent.message, callback);
    },false);
  }
  else if (typeof chrome !== 'undefined') {
    chrome.runtime.onMessage.addListener(function(payload, sender, sendResponse) {
      messageHandlers[payload.name](payload.message, sendResponse);
    });
  }

})( (function() {
  if ( typeof exports === "undefined" ) {
    window.md4mefiReceiveMessage = {};
    return {
      expose: window.md4mefiReceiveMessage,
    };
  }
  else {
    return {
      expose: exports,
    };
  }
} )() );  