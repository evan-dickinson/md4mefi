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

  // TODO: Clicking bold a 2nd time should turn off bold.
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

    updateHtmlFromMd(event);    
  };

  var doItalic = function(event) {
    doBoldOrItalic('italic', event);
  };

  var doBold = function(event) {
    doBoldOrItalic('bold', event);
  };

  var doLink = function(event) {
    var mdComment = event.data.mdComment;    
    var selection = mdComment.selection();
    var mdText = mdComment.val();
    var nextLinkNumber = md4mefi.nextLinkNumber(mdText);
    var linkText, linkUrl, caretPos;

    // TODO: Get this dynamically
    linkUrl = "http://google.com";

    if (selection === "") {
      // Nothing selected, insert a link with placeholder text
      caretPos = mdComment.selection('getPos');

      var placeholderText = 'link text';
      linkText = "[" + placeholderText + "][" + nextLinkNumber + "]";
      mdComment.selection('insert', {text: linkText, mode: 'before'});

      // Highlight the placeholder text
      caretPos.start += 1; // move past the opening bracket
      caretPos.end = caretPos.start + placeholderText.length;
      mdComment.selection('setPos', caretPos);
    }
    else {
      // Wrap the selected text in a link

      mdComment.selection('insert', {text: '[', mode: 'before'});

      linkText = "][" + nextLinkNumber + "]";
      mdComment.selection('insert', {text: linkText, mode: 'after'});
    }

    // Insert the reference at the end of the text.
    caretPos = mdComment.selection('getPos');
    mdText = mdComment.val() + "\n\n[" + nextLinkNumber + "]: " + linkUrl + "\n";
    mdComment.val(mdText);    
    // Inserting the text changed the selection. Move it back.
    mdComment.selection('setPos', caretPos);

    updateHtmlFromMd(event);
  };

  $(document).ready(function() {
    // Todo: Abort if the body doesn't have a class of .thread
    var commentTd = $('body.thread #commenttd');
    var htmlComment = commentTd.find('#comment');
    // TODO: Get rows and cols from the other text area
    var mdComment = $('<textarea>')
      .attr('rows', 8)
      .attr('cols', 60);
      //.css('background-color', '#f3f0f0');

    htmlComment.attr('readonly', true);

    var showHtmlLabel = $('<label class="md4mefi-label"><input type=checkbox> Show HTML</label>')
      .prop('checked', false);
    var showHtml = showHtmlLabel.find('input');
    
    var boldButton = $('<div class="md4mefi-button md4mefi-bold">         \
                          <span class="md4mefi-button-prefix">**</span>   \
                          <span class="md4mefi-button-text">Bold</span>   \
                          <span class="md4mefi-button-suffix">**</span>   \
                        </div>                                            \
                       ');
    var italicButton  = $('<div class="md4mefi-button md4mefi-italic">      \
                            <span class="md4mefi-button-prefix">*</span>   \
                            <span class="md4mefi-button-text">Italic</span> \
                            <span class="md4mefi-button-suffix">*</span>   \
                          </div>                                            \
                        ');
    var linkButton  = $('<div class="md4mefi-button md4mefi-link">          \
                            <span class="md4mefi-button-prefix">[</span>   \
                            <span class="md4mefi-button-text">Link</span>   \
                            <span class="md4mefi-button-suffix">][1]</span>   \
                          </div>                                            \
                        ');
    var buttonbar   = $('<div class="md4mefi-buttonbar"></div>"');
    var label       = $('<div class="md4mefi-label">Markdown for MeFi</div>');
    var toolbar     = $('<div class="md4mefi-toolbar"></div>');

    buttonbar
      .append(boldButton)
      .append(italicButton)
      .append(linkButton);
    toolbar
      .append(label)
      .append(buttonbar);

    commentTd.prepend(toolbar);
    commentTd.prepend(mdComment);
    htmlComment.hide();


    replaceHelpLink();

    // Hide the formatting toolbar (B, I, link)
    var mefiToolbar = $('#toolbar');
    var mefiToolbarParentTr = mefiToolbar.closest('tr');
    mefiToolbarParentTr.hide();

    // Set up event handlers
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
    linkButton.click(eventData, doLink);
  });

// noConflict(true) will revert both $ and jQuery, making
// it possible to use this plugin in combination w/ other
// versions of jQuery. Maybe this isn't necessary b/c
// Safari protects plugins from conflicts w/ the page's
// Javascript, but it makes me feel safer.
//
// See: http://stackoverflow.com/a/7882550/939467
})(jQuery.noConflict(true));