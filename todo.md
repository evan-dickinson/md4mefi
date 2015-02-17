Markdown
========
* In an FPP, let the "above the fold" and the "below the fold" areas share link references.

Misc
====
* Maybe trim whitespace from the selection before doing bold/italic/links. So " foo " becomes " *foo* ". Among other things, this could help an asterisk at the start of a line not be confused with a bullet. As in:
    1. Copy & paste another comment to quote. The paste has some leading whitespace
    2. Select the text
    3. Hit italic
* Hide the "Show HTML" button once it's in production
* Add the ace editor:
    - http://ace.c9.io/#nav=about
    - And make it do Markdown highlighting
* In the references section, add http:// to links that are missing them.
* Make the "add links" button not add so much whitespace between links.

MeFi integration
================
* Check out creating a post in these sites
    - MeFi Music
    - IRL

Visuals
=======
* When making a post (at least on FanFare), there's some weird color changes that happen on focus.
* Dark mode colors ought to change across subsites
* New jobs post: Toolbar shoots way far to the right

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

