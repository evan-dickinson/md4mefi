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
* `cfx xpi --update-link https://github.com/evan-dickinson/md4mefi/releases/download/$TAG_NAME/md4mefi.xpi --update-url http://evan-dickinson.gitub.io/md4mefi/assets/md4mefi.update.rdf`
    - update-link is the uri for downloading the new verson
    - update-url is the uri with info about a new version's availability

Sign the extension:

* `unzip md4mefi.xpi install.rdf`
* Open the McCoy application
* Click on the md4mefi certificate
* Click Install button. Choose install.rdf
* Click Sign button. Choose md4mefi.update.rdf
* `zip md4mefi.xpi install.rdf`
* `rm install.rdf`

**Copy to Website**
* cd ..
* `grunt copy:copyExtensionsToWebsite`
* Update the URLs in index.html

**Commit changes**
* Git pull the gh-pages branch

* git: commit & push to github
* Github: 
    - Add a release
    - Upload the extension files

* `cd website`
* `grunt default gh-pages`

TODO: Push to GitHub
TODO: Add a release on GitHub

TODO: Test that the download links work
