// Import the page-mod API
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

var md4mefiReceiveMessage = require('./receive-message');

pageMod.PageMod({
	// Here, the star will match either http:// or https://
  include: "*.metafilter.com",
  contentScriptFile: [
  	'../node_modules/jquery/dist/jquery.js',
  	'../node_modules/jquery.selection/src/jquery.selection.js',
  	'../node_modules/jquery-color/jquery.color.js',

    'send-message.js',
  	'save-restore.js',
    'inject-utils.js',
	  'inject.js',
  ].map(function(filename) { return self.data.url(filename); }),

  contentStyleFile: self.data.url("md4mefi.css"),

  onAttach: function(worker) {
    md4mefiReceiveMessage.addFirefoxListener(worker);
  },
});
