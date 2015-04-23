(function(args) {
  'use strict';

  var expose = args.expose;
  var chromeCallbacks = {};

  expose.sendMessage = function(name, message) {
    if (typeof safari !== 'undefined') {
      safari.self.tab.dispatchMessage(name, message);
    }
    else if (typeof chrome !== 'undefined') {
      chrome.runtime.sendMessage(
        // Leave off the optional extension ID. That's only
        // for sending to other extensions.
        {
          name: name,
          message: message,
        },
        {}, // optional options
        function (response) {
          if (chrome.runtime.lastError) {
            throw chrome.runtime.lastError;
          }
          chromeCallbacks[name](response);
        }
      );
    }
    else if (typeof self !== 'undefined') {
      // Firefox
      self.port.emit(name, message);
    }
  };

  expose.addMessageListener = function(name, fn) {
    var callback;
    if (typeof safari !== 'undefined') {
      // Safari callbacks need to filter for the right message
      callback = function(messageEvent) {
        if (messageEvent.name === name) {
          fn(messageEvent.message);
        }
      };

      safari.self.addEventListener("message", callback, false);
    }
    else if (typeof chrome !== 'undefined') {
      chromeCallbacks[name] = fn;
    }
    else if (typeof self !== 'undefined') {
      // Firefox
      self.port.on(name, fn);
    }
  };

})( (function() {
  if ( typeof exports === "undefined" ) {
    window.md4mefiSendMessage = {};
    return {
      expose: window.md4mefiSendMessage,
    };
  }
  else {
    return {
      expose: exports,
    };
  }
} )() );  