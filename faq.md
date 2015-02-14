



FAQ
===

What caveats should I know about?
---------------------------------
It's still beta software, so there are almost certainly bugs. 

When trouble occurs, Markdown for MeFi will attempt to save your work by switching back to editing in HTML (the classic MeFi way). But if you're writing a massive treatise, maybe copy and paste a backup to another app, just in case.

Markdown does not yet work in the edit window; you always switch back to HTML there.

What kinds of formatting can I do?
----------------------------------
Everything you could already do on MeFi, but easier. Links, bold, italic, block quotes, numbered lists, etc. See the formatting guide for more.

Markdown doesn't, however, let you do formatting that you couldn't already do on Metafilter. So no tables, headings, or blink tags.

Does it do nice typography, like curly quotes and proper hyphens?
-----------------------------------------------------------------
Not yet. 

The edit window switches you back to HTML editing (the classic MeFi way). When that happens, it's a hassle to have a bunch of HTML codes show up for every quotation mark and every apostrophe. 

What variety of Markdown do you use?
------------------------------------
[Github-Flavoured Markdown][gfm], more or less. Under the hood, parsing is handled by [marked][]. Marked does support much of Github-Flavoured Markdown, but not all of it. Emoji, sadly, did not make the cut.

[gfm]: https://help.github.com/articles/github-flavored-markdown/
[marked]: https://github.com/chjj/marked

Formatting Your Text
====================
Surround a word or phrase in asterisks to *make italics*.

Two asterisks makes **bold**.

Three makes ***bold italics***.

---

To surround a phrase in actual asterisks, use backslashes.

\*looks around\*

---

Small text uses the &lt;small&gt; tag.

<small>Just making a minor point.</small>

---

Make a bulleted list with asterisks (or hyphens, or plus signs).

* First thing
* Second thing
* Third thing

---

Make a numbered list with numbers followed by periods, then spaces. 

1. First thing
2. Second thing
3. Third thing
3. Last-minute addition. (Your numbers don't have to be in order.)
4. Fourth thing

---

Make a block quote by beginning a paragraph with >

*The Lottery*, by Shirley Jackson, begins:

> The morning of June 27th was clear and sunny, with the fresh warmth of a full-summer day; the flowers were blossoming profusely and the grass was richly green.


---

Use brackets to make links. The first pair of brackets is the text to turn into a link; the second pair of brackets refers to a footnote where you give the address to link to.

[Cat-Scan.com][1] is one of the strangest sites I've seen in some time.

[1]: http://cat-scan.com

---

You can also name your links, which is helpful if you have a lot of them.

[How to Cook Vegetables][cook]. [How to Flavor with Spices][spices]. [How to Flavor with Fresh Herbs][herbs]. [How to Maximize Flavor using the Flavor Star][flavor star]. [An international guide to Aromatics][aromatics].

[cook]: http://www.cooksmarts.com/cooking-school-101/how-to-cook-vegetables/
[spices]: http://www.cooksmarts.com/cooking-school-101/guide-to-flavoring-spices/
[herbs]: http://www.cooksmarts.com/cooking-school-101/guide-herbs/
[flavor star]: http://www.cooksmarts.com/cooking-school-101/study-flavor-profiles/
[aromatics]: http://www.cooksmarts.com/cooking-school-101/build-flavor-cooking-aromatics/

via storybored. https://www.metafilter.com/144308/Cooking-101-An-Infographic-is-worth-a-thousand-recipes

---

You can also leave the second bracket in a link empty, to use the text as the name of the link.


Never had an Indian mom? You poor, deprived wretch! Meet [Manjula][]. 

She'll be happy to teach you to make [Naan][], [Rotis][], [Pani Puri][], ...

[manjula]: http://www.manjulaskitchen.com/
[naan]: http://www.youtube.com/watch?v=vow-kxTPatc
[rotis]: http://www.youtube.com/watch?v=jD4o_Lmy6bU
[pani puri]: http://www.youtube.com/watch?v=OBUM86Q87HA

Via: Ambrosia Voyeur. https://www.metafilter.com/77218/Namaste-Welcome-to-my-kitchen






