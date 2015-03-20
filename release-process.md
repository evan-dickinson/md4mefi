Releasing a new version
-----------------------
**Rebuild the app**
* `grunt default test`
* Update version number in package.json
* `grunt update-version`

**Build for Safari**

* Open Safari Extension Builder
* Click Bould

**Build for Firefox**

* cd to firefox addon sdk
* `source bin/activate`
* cd to md4mefi
* `grunt update-version`
* `cd firefox`
* `cfx xpi --update-link http://bitly.com/md4mefi-firefox --update-url http://evan-dickinson.gitub.io/md4mefi/assets/md4mefi.update.rdf`
    - update-link is the uri for downloading the new verson
    - update-url is the uri with info about a new version's availability

Sign the extension:

* `unzip md4mefi.xpi install.rdf`
* Open the McCoy application
* Click Install button. Choose install.rdf
* Click Sign button. Choose md4mefi.update.rdf
* `zip md4mefi.xpi install.rdf`
* `rm install.rdf`

**Copy to Website**
* cd ..
* `grunt copy:copyExtensionsToWebsite`

**Commit changes**
TODO: Checkin changes to git
TODO: Add a new tag

* `cd website`
* `grunt default gh-pages`

TODO: Push to GitHub
TODO: Add a release on GitHub
