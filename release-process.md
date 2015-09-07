Releasing a new version
-----------------------
**Rebuild the app**
* Update version number in package.json
* `gulp default test`

**Run unit tests**
Run test/do-test.html in:
1. Safari for Mac
2. Firefox for Mac
3. Chrome for Mac
4. Firefox for Windows
5. Chrome for Windows

**Test in Firefox**
`gulp ff-run`

**Test in Chrome**
* If needed: `gulp chrome`. But this is part of `gulp default` so you probably just ran it.
* Now install from Chrome's developer menu


TAG_NAME = "v" + version number (e.g., v0.1.0)

**Build for Safari**

* Open website/app/assets/md4mefi.update.plist. 
* Change the update URL
    - https://github.com/evan-dickinson/md4mefi/releases/download/$TAG_NAME/md4mefi.safariextz

* Open Safari Extension Builder
* Click Build Package
    - Save as: safari/md4mefi.safariextz

**Build for Firefox**
* `gulp firefox`
* Upload to Firefox development console. Check for problems.

**Build for Chrome**
* `gulp chrome`
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
