Markdown for MeFi
=================
A browser plugin that lets you use Markdown in your comments and posts on Metafilter.com. More info, and installation, on the [Markdown for MeFi site][md4mefi].

Development
===========
If you just want to use the plugin, see the link above. If you want to change the source code, follow these instructions.

You'll need to install [npm][] and [grunt][] first. Run `npm install` to install the dependencies. After that, run `grunt default` to build the extensions. (There's also `grunt watch` to rebuild automatically.)

Cross-platform source code is in the lib directory (this is most of the code), with a little bit of browser-specific code in the firefox and safari directories.

[md4mefi]: http://evan-dickinson.github.io/md4mefi/
[npm]: https://www.npmjs.com
[grunt]: http://gruntjs.com





