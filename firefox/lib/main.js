// Import the page-mod API
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

pageMod.PageMod({
	// Here, the star will match either http:// or https://
  include: "*.metafilter.com",
  contentScriptFile: [
  	'dependencies/marked.js',
  	'dependencies/jquery.js',
  	'dependencies/jquery.selection.js',
  	'dependencies/jquery.color.js',

  	'md4mefi.js',
  	'save-restore.js',
	'inject.js',
  ].map(function(filename) { return self.data.url(filename); }),

  contentStyleFile: self.data.url("md4mefi.css"),
});
