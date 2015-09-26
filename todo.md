Misc
====
* Write Comment -> Preview Button -> Back Button = Something went wrong under the hood.
    - Because there was HTML in the edit box, but we didn't have any Markdown to restore.
    - Then doing another preview leads to another "something went wrong" message...
    - Not sure we can fix this. But maybe make sure there's a test case that covers it, to ensure it happens?
    - The problem: The browser is populating the #comment box automatically. But it won't fill in the boxes that are created by javascript. 

* New post page -> Modern theme: "revert to HTML" message interferes w/ toolbar

Possible replacement markdown library
=====================================
https://github.com/markdown-it/markdown-it

Automagically reload Chrome extension
=====================================
http://qwan.org/2011/09/01/reloading-a-page-in-chrome-from-aquamacs/
https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid

Extensions Reloader is a plugin that will reload all unpacked extensions when visiting the URL http://reload.extensions. The AppleScript above will open or refresh a given URL. Combine them and, boom!, you have a way to trigger extension reloading from gulp.

To do later
===========
* Add the ace editor:
    - http://ace.c9.io/#nav=about
    - And make it do Markdown highlighting
    - BUT: Looks like it would need some tweaks to make it do Markdown highlighting as nicely as the Markdown mode in Sublime. E.g., out of the box it doesn't provide enough spans and classes to de-emphasize the formatting characters in things like **bold** or a [link](http://google.com). Making that happen would probably involve hacking away at Ace's Markdown mode.
    - 

* New jobs post: Toolbar shoots way far to the right

* Maybe trim whitespace from the selection before doing bold/italic/links. So " foo " becomes " *foo* ". Among other things, this could help an asterisk at the start of a line not be confused with a bullet. As in:
    1. Copy & paste another comment to quote. The paste has some leading whitespace
    2. Select the text
    3. Hit italic
* In the references section, add http:// to links that are missing them.

* Emoji support
    - Data table here:
    - https://github.com/iamcal/emoji-data

* Possible domain name: http://markdown.blue.

* Deploy new versions programatically
    - https://www.npmjs.com/package/grunt-github-releaser


Ideas for supporting the edit window
====================================
* When posting, save the hash of HTML content and the Markdown. If the HTML in the edit window is the same as what we hashed, that's the markdown for us.
    - Because we're looking at HTML in the text box (not the stuff that's been mangled server-side to add <br> and <p> tags), we ought to get back the same HTML we put in. But maybe check for things like < becoming &lt;.
    - Maybe give this a different key in session storage, to keep the cache of submitted HTML separate from the cache of previewed HTML
    - On page load, clear out anything that's over an hour old.
    - sessionStorage.key(n) can retrieve an arbitrary key, so we could use that to walk the cache.

* Find comment ID after posting:
    - When posting, save MD text in session storage under a temporary key
    - On page load after posting (you can tell, because page was loaded via POST) find the comment ID using the following steps:
        + Find link to user page in the "Posting as $USERNAME" field by the comment box. It's $('#commenttable .smallcopy a[href^="https://www.metafilter.com/user/')
        + Find the last $('div.comments a[href=$USER_PAGE_URL]')
        + The previous sibling of that div.comments will be an anchor, the anchor's name attribute is the comment ID
    - Move the MD text in session storage to a key that's based on the comment ID.
    - If we find ourselves on the edit page, look up the Markdown for that comment ID.
    - On page load, you'd probably also want to make sure you're on a thread page (and not the main page, profile page, mod contact form, etc. Probably a good thing to do in general...)



