(function(jQuery) {
	var $ = jQuery;

  if (window.top !== window) {
    // Don't run in iframes
    return;
  }

  $(document).ready(function() {
    alert("Hello");
  });

// noConflict(true) will revert both $ and jQuery, making
// it possible to use this plugin in combination w/ other
// versions of jQuery. 
//
// See: http://stackoverflow.com/a/7882550/939467
})(jQuery.noConflict(true));