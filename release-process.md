Releasing a new version
-----------------------
**Rebuild the app**
* `grunt default test`
* Update version number in package.json
* `grunt update-version`

TAG_NAME = "v" + version number (e.g., v0.1.0)

**Build for Safari**

* Open website/app/assets/md4mefi.update.plist. 
* Change the update URL
    - https://github.com/evan-dickinson/md4mefi/releases/download/$TAG_NAME/md4mefi.safariextz

* Open Safari Extension Builder
* Click Build Package
    - Save as: safari/md4mefi.safariextz

**Build for Firefox**

* cd to firefox addon sdk
* `source bin/activate`
* cd to md4mefi
* `grunt update-version`
* `cd firefox`
* `cfx xpi`

Update MaxVersion:
    @@@ Turns out, you can do this more easily from the Firefox add-ons site.
* `unzip md4mefi.xpi install.rdf`
* Go here, find the biggest Firefox version number:
    - https://addons.mozilla.org/en-US/firefox/pages/appversions/
    - TODO: Or is this done automatically? It's confusing...
* Edit that version number in install.rdf
* Min version: 36.0
* `zip md4mefi.xpi install.rdf`
* `rm install.rdf`


* Upload to Firefox development console. Check for problems.

**Build for Chrome**
* `zip -r chrome.zip chrome`
* Upload to the Chrome web store developer dashboard

**Copy to Website**
* cd ..
* `grunt copy:copyExtensionsToWebsite`
* Update the Safari URLs in index.html
    - In 2 places

**Commit changes**
* Make sure that gh-pages doesn't need to pull anything in

* git: commit & push to github
* Github: 
    - Add a release
    - Upload the extension files

* `cd website`
* `grunt default gh-pages`

Update this repo w/ github's latest gh-pages
* `cd ..`
* `git push . origin/gh-pages:gh-pages`

TODO: Test that the download links work

Note: Sometimes, Safari won't update until you quit and open it again. That's normal.
