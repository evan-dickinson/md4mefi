// Import the page-mod API
var pageMod = require("sdk/page-mod");
var self = require("sdk/self");

pageMod.PageMod({
	// Here, the star will match either http:// or https://
  include: "*.metafilter.com",
  contentScriptFile: [self.data.url('script.js')],
  contentStyleFile: self.data.url("md4mefi.css"),
});
