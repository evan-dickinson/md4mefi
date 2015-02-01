Markdown
========
* If there are two generated paragraphs worth of blockquotes, does it show up OK in an FPP above the fold?
    - We might need to generate <bloqckquote>thing 1</blockquote><blockquote>thing 2</blockquote>, instead of just one blockquote
* In an FPP, let the "above the fold" and the "below the fold" areas share link references.


Misc
====
* Maybe trim whitespace from the selection before doing bold/italic/links. So " foo " becomes " *foo* ". Among other things, this could help an asterisk at the start of a line not be confused with a bullet. As in:
    1. Copy & paste another comment to quote. The paste has some leading whitespace
    2. Select the text
    3. Hit italic
* Do we need to re-parse the markdown on every keypress. Can we run it periodically on a timer or something?
* The link button should ask the user for a URL
    - Default to a URL on the clipboard
* Hide the "Show HTML" button once it's in production

MeFi integration
================
* Add code to abort early if we're not on a page with a comment box
* Support post pages:
    - MeFi FPP
    - Ask Question
    - MeTa post
    - etc.

Visuals
=======
* Make it look better in the dark theme
* How does it look in the classic & professional themes?
* Get the dimensions for the new textarea (rows & cols) from the old textarea
* When making a post (at least on FanFare), there's some weird color changes that happen on focus.

Help
====
* Change the "Markdown help" link to point to MeFi specific docs
* "Markdown for MeFi" should be a link to a project page

Firefox
=======
* Generate the package.json dynamically.
  - Or, failing that, at least put sensible values in there
* The docs recommended something about compiling the Javascript for better performance. Look into that.
* There was also some advice about delaying the start of the script. How to do that?
* Figure out what's up with the unit tests

Safari
======
* It's bad to load all of everything into the injected script. Move the modules into another file, per the docs.

Chrome
======
* Do everything
