Misc
====
* When doing bold, select the inside of "**bold text**". Same for italics.
  - Like what happens when you make a new link 
* Add class to the comment text areas
* in triggerHtmlUpdate, shouldn't timeoutId go outside the function?



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


