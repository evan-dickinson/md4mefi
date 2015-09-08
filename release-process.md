Testing a new version
---------------------
**Rebuild the app**
* Update version number in package.json
* Mac: `gulp default test`
* Windows: `gulp firefox  chrome test`

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

Releasing a new version
-----------------------
**Build for Safari & update website**
* If needed: `gulp safari`

* Open Safari Extension Builder
* Click Build Package
    - Save as: safari/md4mefi.safariextz

* `gulp copy-safari-extension-to-website`
* Update the Safari URLs in website/app/index.html
    - In 2 places

**Build for Firefox**
* `gulp ff-build`
* Upload to Firefox development console. Check for problems.
    - https://addons.mozilla.org/en-US/firefox/

**Build for Chrome**
* `gulp chrome`
* Upload to the Chrome web store developer dashboard

**Commit changes**
TAG_NAME = "v" + version number (e.g., v0.1.0)

* Make sure that gh-pages doesn't need to pull anything in

* git: commit & push to github
* Github: 
    - Add a release
    - Upload safari/md4mefi.safariextz

* `cd website`
* `grunt default gh-pages`

Update this repo w/ github's latest gh-pages
* `cd ..`
* `git push . origin/gh-pages:gh-pages`

TODO: Test that the download links work

Note: Sometimes, Safari won't update until you quit and open it again. That's normal.

Safari download count
---------------------
Latest version: 
curl -i https://api.github.com/repos/evan-dickinson/md4mefi/releases/latest


All versions:
curl -i https://api.github.com/repos/evan-dickinson/md4mefi/releases | grep download_count



