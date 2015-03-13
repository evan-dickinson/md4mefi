Misc
====
* Write a proper README.md
* When reverting back to HTML in modern theme and in the edit window, we show the old-style toolbar

Visuals
=======
* When making a post (at least on FanFare), there's some weird color changes that happen on focus.
* Dark mode colors ought to change across subsites
* New jobs post: Toolbar shoots way far to the right
* Edit window: Injecting the message causes the input box to shoot over to the right

Help
====
* Change the "Markdown help" link to point to MeFi specific docs
* "Markdown for MeFi" should be a link to a project page

Firefox
=======
* The docs recommended something about compiling the Javascript for better performance. Look into that.
* There was also some advice about delaying the start of the script. How to do that?

Safari
======
* Update the info in the properties file
* Figure out update issues 
    - How to change ownership in the future
    - Security implications of disclosing my developer ID in the Github repo

Chrome
======
* Do everything

Site
====
* Help & intro to the plugin
* Download links
* Analytics to track downloads
* Privacy policy
* Maybe a blog?
* Look into this:
    - https://www.npmjs.com/package/grunt-gh-pages
    - With that, we can build the site in a directory on the master branch, do all the compilation stuff, and shove it into the gh-pages branch.

Automation
==========
* Deploy new versions programatically
    - https://www.npmjs.com/package/grunt-github-releaser




To do later
===========
* Add the ace editor:
    - http://ace.c9.io/#nav=about
    - And make it do Markdown highlighting
    - BUT: Looks like it would need some tweaks to make it do Markdown highlighting as nicely as the Markdown mode in Sublime. E.g., out of the box it doesn't provide enough spans and classes to de-emphasize the formatting characters in things like **bold** or a [link](http://google.com). Making that happen would probably involve hacking away at Ace's Markdown mode.
    - 
* In an FPP, let the "above the fold" and the "below the fold" areas share link references.

* Maybe trim whitespace from the selection before doing bold/italic/links. So " foo " becomes " *foo* ". Among other things, this could help an asterisk at the start of a line not be confused with a bullet. As in:
    1. Copy & paste another comment to quote. The paste has some leading whitespace
    2. Select the text
    3. Hit italic
* In the references section, add http:// to links that are missing them.





