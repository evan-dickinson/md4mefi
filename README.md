Markdown for MeFi
=================
A browser plugin that lets you use Markdown in your comments and posts on Metafilter.com. More info, and installation, on the [Markdown for MeFi site][md4mefi].

Development
===========
If you just want to use the plugin, see the link above. If you want to change the source code, follow these instructions.

You'll need to install [npm][], [bower][], and [gulp][] first. Run `npm install` and `bower install` to install the dependencies. After that, run `gulp default` to build the extensions. (There's also `gulp watch` to rebuild automatically.)

Cross-platform source code is in the lib directory (this is most of the code), with a little bit of browser-specific code in the firefox and safari directories.

Most of the packages are installed through npm. We use bower for [qunit][], because the qunit that comes with npm doesn't include CSS files.

[md4mefi]: http://evan-dickinson.github.io/md4mefi/
[npm]: https://www.npmjs.com
[gulp]: http://gulpjs.com
[bower]: http://bower.io
[qunit]: http://qunitjs.com



