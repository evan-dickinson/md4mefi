(function(jQuery) {
  "use strict";

  var $ = jQuery;

  if (window.top !== window) {
    // Don't run in iframes
    return;
  }


  // Replace the HTML Help link with a Markdown Help link.
  var replaceHelpLink = function() {
    var anchor = $('#commentform a[href$="//faq.metafilter.com/tags/html"]');
    anchor.attr('href', 'http://daringfireball.net/projects/markdown/basics');
    anchor.html('(Markdown help)');

    // Normal MeFi has target = self. I don't like that; open in a new tab.
    anchor.attr('target', '_blank');
  };


  // When the Markdown has changed, generate
  // new HTML.
  var updateHtmlFromMd = function(event) {
    var mdComment = event.data.mdComment;
    var htmlComment = event.data.htmlComment;

    var mdText = mdComment.val();
    var htmlText = md4mefi.md2html(mdText);
    htmlComment.val(htmlText);

    // The keyup event is the listener for 
    // refreshing the live preview.
    htmlComment.trigger('keyup');    
  };

  // Turn on the task that updates the live preview
  var turnOnLivePreview = function(event) {
    // Turn on live preview, by running the init_lp function.
    // That function is assigned to the onfocus handler.
    //
    // However, if we run jQuery's .trigger('focus')
    // function, we'll actually switch focus to the
    // htmlComment textarea. Therefore, run
    // the onfocus handler that's set through plain ol'
    // DOM manipulation.

    var htmlCommentDomNode = event.data.htmlComment.get(0);
    htmlCommentDomNode.onfocus();    
  };

  var turnOffLivePreview = function(event) {
    // Turn off live preview, by running the kill_lp function,
    // which is the onBlur handler.

    var htmlCommentDomNode = event.data.htmlComment.get(0);
    htmlCommentDomNode.onblur();          
  };

  var showHideHtml = function(event) {
    var htmlComment = event.data.htmlComment;
    var showHtml = event.data.showHtml;

    var isShow = showHtml.prop('checked');

    var animationOptions = {
      duration: 200,
      //easing: 'easeOut',
    };

    if (isShow) {
      htmlComment.show(animationOptions);
    }
    else {
      htmlComment.hide(animationOptions);
    }
  };

  var doBoldOrItalic = function(boldOrItalic, event) {
    var mdComment = event.data.mdComment;    
    var selection = mdComment.selection();

    var wrapperChar, placeholderText;
    if (boldOrItalic === 'bold') {
      wrapperChar = '**';
      placeholderText = '**bold text**';
    }
    else {
      wrapperChar = '*';
      placeholderText = "*italic text*";
    }

    if (selection === "") {
      mdComment.selection('insert', {text: placeholderText, mode: 'before'});
    }
    else {
      mdComment.selection('insert', {text: wrapperChar, mode: 'before' });
      mdComment.selection('insert', {text: wrapperChar, mode: 'after' });      
    }

    mdComment.trigger('focus');
    updateHtmlFromMd(event);    
  };

  var doItalic = function(event) {
    doBoldOrItalic('italic', event);
  };

  var doBold = function(event) {
    doBoldOrItalic('bold', event);
  };

  $(document).ready(function() {
    // Todo: Abort if the body doesn't have a class of .thread
    var commentTd = $('body.thread #commenttd');
    var htmlComment = commentTd.find('#comment');
    var mdComment = $('<textarea>')
      .attr('rows', 8)
      .attr('cols', 60)
      .css('background-color', '#f3f0f0');

    var showHtmlLabel = $('<label><input type=checkbox> Show HTML</label>')
      .prop('checked', false);
    var showHtml = showHtmlLabel.find('input');

    var italicButton = $('<button type="button">Italic</button>');
    var boldButton   = $('<button type="button">Bold</button>');


    commentTd.prepend(boldButton);
    commentTd.prepend(italicButton);
    commentTd.prepend(showHtmlLabel);
    commentTd.prepend(mdComment);
    htmlComment.hide();


    replaceHelpLink();

    // Hide the formatting toolbar (B, I, link)
    var toolbar = $('#toolbar');
    var toolbarParentTr = toolbar.closest('tr');
    toolbarParentTr.hide();

    var eventData = {
      htmlComment: htmlComment,
      mdComment: mdComment,
      showHtml: showHtml,
    };
    mdComment.on('input', eventData, updateHtmlFromMd);
    mdComment.on('focus', eventData, turnOnLivePreview);
    mdComment.on('blur',  eventData, turnOffLivePreview);

    showHtml.on('change', eventData, showHideHtml);

    italicButton.click(eventData, doItalic);
    boldButton.click(eventData, doBold);
  });

// noConflict(true) will revert both $ and jQuery, making
// it possible to use this plugin in combination w/ other
// versions of jQuery. Maybe this isn't necessary b/c
// Safari protects plugins from conflicts w/ the page's
// Javascript, but it makes me feel safer.
//
// See: http://stackoverflow.com/a/7882550/939467
})(jQuery.noConflict(true));