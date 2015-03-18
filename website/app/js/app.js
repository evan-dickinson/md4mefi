// Foundation JavaScript
// Documentation can be found at: http://foundation.zurb.com/docs
$(document).foundation();

$(document).ready(function() {
	// Foundation's built-in handlers for revealing a modal would suppress
	// the download. So roll our own handlers.
	$('.safari-download-button').click(function(event) {
		$('#safari-install-modal').foundation('reveal', 'open');
	});

	$('.firefox-download-button').click(function(event) {
		$('#firefox-install-modal').foundation('reveal', 'open');
	});	
});