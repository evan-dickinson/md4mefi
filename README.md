Markdown for MeFi
=================
A browser plugin that lets you use Markdown in your comments and posts on Metafilter.com.


Releasing a new version
-----------------------
**Build for Safari**

TODO

**Build for Firefox**

* cd to firefox addon sdk
* `source bin/activate`
* cd to md4mefi
* `grunt update-version`
* `cd firefox`
* `cfx xpi`

**Update Website**
* `grunt copy:copyExtensionsToWebsite`
* `cd website`
* `grunt default gh-pages`
