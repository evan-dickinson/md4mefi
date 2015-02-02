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
* Hide the "Show HTML" button once it's in production

MeFi integration
================
* Check out creating a post in these sites
    - MeFi Music
    - IRL
* Make it work with the edit comment window
* Make it not barf on preview
    - Preview adds buttloads of <br> tags
* Can we add sanity checks, when MeFi has already populated the HTML comment form:
    - IF html comment already has text THEN check to see if the markdown compiles down to that html. IF NOT, THEN abort the markdown editing and revert to html editing mode.
        + There could be some weirdness r/e formatting of newlines. If we're looking for an exact match, there could be a lot of false positives.
    - Avoid a situation where we fail to recover the old markdown, or we unearth stale markdown, etc.
* With all the weird work-arounds, maybe there ought to be some safety valves that dump you back to HTML mode. Like "oops, stuff went wrong, here's your comment in HTML." Seems better than the comment falling into the void.
    - That might mean turning off smartypants. If you get dumped into HTML it's one thing to have a few tags here and there. It's another to have a bunch of HTML entities everywhere.

Visuals
=======
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
* Am I supposed to have a shutdown function, for when the user turns off the plugin?
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

