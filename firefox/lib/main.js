// Import the page-mod API
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

// Create a page mod
// It will run a script whenever a ".org" URL is loaded
// The script replaces the page contents with a message
pageMod.PageMod({
	// Here, the star will match either http:// or https://
  include: "*.music.metafilter.com",
  contentScriptFile: [self.data.url('app.js')],
});
