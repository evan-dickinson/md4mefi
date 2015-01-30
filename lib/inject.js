(function(jQuery) {
  var $ = jQuery;

  if (window.top !== window) {
    // Don't run in iframes
    return;
  }

  $(document).ready(function() {
    var commentTd = $('body.thread #commenttd');
    var htmlComment = commentTd.find('#comment');
    var mdComment = $('<textarea>')
      .attr('rows', 20)
      .attr('cols', 8)
      .css('background-color', '#f0f0f0');
    commentTd.append(mdComment);


    var updateHtmlFromMd = function() {
      var mdText = mdComment.val();
      var htmlText = md4mefi.md2html(mdText);
      htmlComment.val(htmlText);

      htmlComment.trigger('keyup');
    };
    mdComment.on('input', updateHtmlFromMd);

    mdComment.on('focus', function() { 
      // Turn on live preview, by running the init_lp function.
      // That function is assigned to the onfocus handler.
      //
      // However, if we run jQuery's .trigger('focus')
      // function, we'll actually switch focus to the
      // htmlComment textarea. Therefore, run
      // the onfocus handler that's set through plain ol'
      // DOM manipulation.

      var htmlCommentDomNode = htmlComment.get(0);
      htmlCommentDomNode.onfocus();
    });

    mdComment.on('blur', function() {
      // Turn off live preview, by running the kill_lp function,
      // which is the onBlur handler.

      var htmlCommentDomNode = htmlComment.get(0);
      htmlCommentDomNode.onblur();      
    });

  });

// noConflict(true) will revert both $ and jQuery, making
// it possible to use this plugin in combination w/ other
// versions of jQuery. 
//
// See: http://stackoverflow.com/a/7882550/939467
})(jQuery.noConflict(true));