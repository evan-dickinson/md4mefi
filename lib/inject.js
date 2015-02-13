(function(jQuery) {
  "use strict";

  var $ = jQuery;

  if (window.top !== window) {
    // Don't run in iframes
    return;
  }

  /////////////////////////////////////////////////
  //
  // Utility functions

  // Adds http:// to a URL, if it's needed.
  // Returns false if the string is empty, null, etc.
  var verifyAndFixUrl = function(url) {
    // window.prompt returns null on some browsers,
    // empty string on others.
    if (typeof(url) === 'undefined' || 
        url === null || 
        url.trim() === "") {

      return false;
    }

    var hasProtocol = /^http(s)?:\/\//.test(url);
    if (!hasProtocol) {
      return "http://" + url;
    }
    else {
      return url;
    }
  };

  /////////////////////////////////////////////////
  //
  // Preview & parsing of Markdown

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


    // TODO: Add error handling, for if we can't find the dom node.
    var htmlCommentDomNode = event.data.htmlComment.get(0);
    htmlCommentDomNode.onfocus();    
  };

  var turnOffLivePreview = function(event) {
    // Turn off live preview, by running the kill_lp function,
    // which is the onBlur handler.

    var htmlCommentDomNode = event.data.htmlComment.get(0);
    htmlCommentDomNode.onblur();          
  };

  /////////////////////////////////////////////////
  //
  // Event handlers

  var showHideHtml = function(event) {
    var htmlComment = event.data.htmlComment;
    var otherHtmlComment = event.data.otherHtmlComment;
    var showHtml = event.data.showHtml;

    var isShow = showHtml.prop('checked');

    var animationOptions = {
      duration: 200,
      //easing: 'easeOut',
    };

    if (isShow) {
      htmlComment.show(animationOptions);
      if (otherHtmlComment !== null){
        otherHtmlComment.show(animationOptions);
      }
    }
    else {
      htmlComment.hide(animationOptions);
      if (otherHtmlComment !== null){
        otherHtmlComment.hide(animationOptions);
      }      
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

    linkUrl = window.prompt("Please enter the site you'd like to link.", "http://");
    console.log(linkUrl);
    linkUrl = verifyAndFixUrl(linkUrl);
    if (linkUrl === false) {
      return;
    }

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

  /////////////////////////////////////////////////
  //
  // DOM manipulation

  // Hide MeFi's built-in formatting toolbar (B, I, link)
  var hideMeFiToolbar = function(htmlComment, commentTable) {
    // On the new post form, each textarea has its own
    // toolbar, both id'd #toolbar. So start searching
    // from the containing table.
    var mefiToolbar = commentTable.find('#toolbar');
    var mefiToolbarParentTr = mefiToolbar.closest('tr');

    // If the toolbar and the htmlComment are both 
    // in the same tr. This can happen when doing
    // a server-side preview of a comment.
    if (mefiToolbarParentTr.has(htmlComment).length > 0) {
      mefiToolbar.hide();
    }
    else {
      // tooolbar and htmlComment are in different tr's.
      // Hide the whole tr containing the mefi toolbar,
      // to avoid taking up that vertical space.
      mefiToolbarParentTr.hide();         
    } 
  };

  // Add the "Editing in HTML" message to the MeFi toolbar.
  var addMessageToMeFiToolbar = function(htmlComment) {
    var commentTable = htmlComment.closest('table');    
    var mefiToolbar = commentTable.find('#toolbar'); 

    // Create a wrapper div to hold both the toolbar & the message.
    var wrapper = $('<div>')
      .addClass('md4mefi-mefi-toolbar-wrapper')
      // Copy positioning from the toolbar
      .css({
        'margin-top': mefiToolbar.css('margin-top'),
        'margin-right': mefiToolbar.css('margin-right'),
        'margin-bottom': mefiToolbar.css('margin-bottom'),
        'margin-left': mefiToolbar.css('margin-left'),
        'position':    mefiToolbar.css('position'),
        'top': mefiToolbar.css('top'),
        'right': mefiToolbar.css('right'),
        'bottom': mefiToolbar.css('bottom'),
        'left': mefiToolbar.css('left'),     
      });

    mefiToolbar.wrap(wrapper);

    var message = $('<div>')
      .addClass('md4mefi-mefi-toolbar-message')
      .addClass('smallcopy')
      .text("Editing in HTML");

    message.insertBefore(mefiToolbar);

    // Clear out the positioning from the toolbar, now that
    // it's in the wrapper.
    mefiToolbar.css({
      'margin-top': 0,
      'margin-right': 0,
      'margin-bottom': 0,
      'margin-left': 0,

      'position': 'static',
    });
  };

  // Add a message about reverting to HTML
  var addRevertToHtmlMessage = function(htmlComment) {
    var messageArea = $('<div>')
      .addClass('md4mefi-error');

    var title = $('<div>')
      .addClass('md4mefi-error-title')
      .text("Markdown for MeFi");

    var close = $('<div>')
      .addClass('md4mefi-error-close')
      .html("&times;");

    var message = $('<div>')
      .addClass('md4mefi-error-message')
      .text("Something went wrong under the hood. Switching back to HTML (classic MeFi editing).");

    //message.prepend(close);

    messageArea.append(title).append(close).append(message);

    close.click(function() {
      messageArea.hide({
        duration: 200,
      });
    });

    messageArea.insertBefore(htmlComment);
  };

  // Replace the HTML Help link with a Markdown Help link.
  var replaceHelpLink = function() {
    var anchor = $('#commentform a[href$="//faq.metafilter.com/tags/html"]');
    anchor.attr('href', 'http://daringfireball.net/projects/markdown/basics');
    anchor.html('(Markdown help)');

    // Normal MeFi has target = self. I don't like that; open in a new tab.
    anchor.attr('target', '_blank');
  };

  // Add the Markdown comment box and (optionally) toolbar
  var setupMarkdown = function(htmlComment, otherHtmlComment, includeToolbar) { 
    // On a thread page, this is a td with id #commenttd.
    // But on an FPP page, the containing td is not named.
    var commentTd = htmlComment.closest('td');
    var commentTable = commentTd.closest('table');

    var mdComment = $('<textarea>')
      .attr('rows', htmlComment.attr('rows'))
      .attr('cols', htmlComment.attr('cols'))
      .css('width', htmlComment.css('width'))
      .css('height', htmlComment.css('height'));

    htmlComment.attr('readonly', true);

    var showHtmlLabel = $('<label class="md4mefi-label md4mefi-show-html"><input type=checkbox> Show HTML</label>')
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
    var title       = $('<div class="md4mefi-title">Markdown for MeFi</div>');
    var toolbar     = $('<div class="md4mefi-toolbar"></div>');

    buttonbar
      .append(boldButton)
      .append(italicButton)
      .append(linkButton);
    toolbar
      .append(showHtmlLabel)
      .append(title)
      .append(buttonbar);

    if (includeToolbar) {
      commentTd.prepend(toolbar);
    }
    commentTd.prepend(mdComment);
    htmlComment.hide();

    replaceHelpLink();
    hideMeFiToolbar(htmlComment, commentTable);

    // Set up event handlers
    var eventData = {
      htmlComment: htmlComment,
      otherHtmlComment: otherHtmlComment,
      mdComment: mdComment,
      showHtml: showHtml,
    };
    mdComment.on('input', eventData, updateHtmlFromMd);
    mdComment.on('focus', eventData, turnOnLivePreview);
    mdComment.on('blur',  eventData, turnOffLivePreview);

    showHtml.on('change', eventData, showHideHtml);

    if (includeToolbar) {
      italicButton.click(eventData, doItalic);
      boldButton.click(eventData, doBold);
      linkButton.click(eventData, doLink);
      mdComment.keydown(eventData, function(event) {
        // ASCII codes
        var upperB = 66, lowerB = 98;
        var upperI = 73, lowerI = 105;
        var upperU = 85, lowerU = 117;

        // Modifier: Command on Mac; Control everywhere else.
        var isMac = /Macintosh/.test(window.navigator.userAgent);
        var modifierIsPressed = isMac ? event.metaKey : event.ctrlKey;

        if (modifierIsPressed && (event.which === upperB || event.which === lowerB)) {     
          event.preventDefault();
          doBold(event);
        }
        else if (modifierIsPressed && (event.which === upperI || event.which === lowerI)) {
          event.preventDefault();
          doItalic(event);
        }
        else if (modifierIsPressed && (event.which === upperU || event.which === lowerU)) {
          // I don't know why ctrl-U is the MeFi shortcut for inserting a link, but that's
          // what they use, so follow their lead.
          event.preventDefault();
          doLink(event);
        }
      });
    }

    return mdComment;
  };

  $(document).ready(function() {
    var saveRestore = window.md4mefiSaveRestore;

    var htmlComment = $('#comment');
    // The "more inside" area of a front-page post
    var htmlExtended = $('#extended');
    var mdComment, mdExtended;


    // Restore saved markdown (for server-side preview)
    var form = htmlComment.closest('form');
    var formSubmitUrl = form.attr('action');

    // A hidden input field that contains the thread number.
    var linkIdInput = form.find('input[name="link_ID"]');
    var linkId = (linkIdInput.length > 0) ? linkIdInput.val() : null;

    var storedJson = saveRestore.restoreMarkdown({
      formSubmitUrl: formSubmitUrl,
      linkId: linkId,
      location: window.location,
      sessionStorage: window.sessionStorage,
    });

    // Do a sanity check: Is there text in the html text areas,
    // but no recovered markdown? If so, abort back to
    // HTML mode.
    if (saveRestore.isRestoredMarkdownStale(htmlComment.val(), 
                                htmlExtended.val(), 
                                storedJson)) {

      console.log("Restored markdown is stale. Aborting.");

      addRevertToHtmlMessage(htmlComment);
      addMessageToMeFiToolbar(htmlComment);

      return;
    }

    if (htmlComment.length === 0) {
      // No text entry on this page
      return;
    }
    else if (htmlExtended.length === 0) {
      // No textarea for extended text.
      // Must be a comment page.
      mdComment = setupMarkdown(htmlComment, null, true);
      mdExtended = null;
    }
    else {
      // Both comment & extended
      mdComment = setupMarkdown(htmlComment, null, false);
      mdExtended = setupMarkdown(htmlExtended, htmlComment, true);
    }

    if (storedJson !== null) {
      if (storedJson.hasOwnProperty('comment')) {
        mdComment.val(storedJson.comment);
      }

      if (storedJson.hasOwnProperty('extended') &&
        mdExtended !== null) {
        mdExtended.val(storedJson.extended);
      }
    }

    // There are lots of different ways the preview
    // and post buttons are represented. Hunt for
    // whatever is on this page.

    // Coment form
    var postButton = form.find("#postButton");
    // Second time visiting a new post page.
    // (First time, all you can do is preview.)
    if (postButton.length === 0) {
      postButton = form.find('input[type="submit"][value="Post"]');
    }

    // Find preview button 
    var previewButton;
    var previewButtonSelectors = [
      '#previewButton',
      'input[type="submit"][value^="Step 2:"]',
      'input[type="submit"][value="Preview"]',
      'input[type="submit"][value="Preview the Post"]',
    ];
    do {
      var currSelector = previewButtonSelectors.pop();
      previewButton = form.find(currSelector);
    } while (previewButton.length === 0);


    // We can't use .on('submit'), because there's no way to
    // tell if the submission is for a preview or a post.
    // Use click handlers, instead.
    // http://stackoverflow.com/a/13202018/939467

    previewButton.click(function(event) {
      saveRestore.saveMarkdownForPreview({
        mdCommentText:  mdComment.val(),
        mdExtendedText: (mdExtended !== null) ? mdExtended.val() : "",
        linkId:         linkId,
        formSubmitUrl:  formSubmitUrl,
        sessionStorage: window.sessionStorage,
        location:       window.location,
      });
    });

    postButton.click(function(event) {
      saveRestore.deleteMarkdownForPreview({
        sessionStorage: window.sessionStorage,
        location:       window.location,
        linkId:         linkId,
        formSubmitUrl:  formSubmitUrl,

      });
    });
  });

// noConflict(true) will revert both $ and jQuery, making
// it possible to use this plugin in combination w/ other
// versions of jQuery. Maybe this isn't necessary b/c
// Safari protects plugins from conflicts w/ the page's
// Javascript, but it makes me feel safer.
//
// See: http://stackoverflow.com/a/7882550/939467
})(jQuery.noConflict(true));