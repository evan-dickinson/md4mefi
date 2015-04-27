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

  // Given a list of selectors, find the first thing that
  // matches one of the selectors.
  var findByMultipleSelectors = function(root, selectors) {
    var idx, currSelector, item;
    for (idx = 0; idx < selectors.length; idx++) {
      currSelector = selectors[idx];
      item = root.find(currSelector);      
      if (item.length > 0) {
        return item;
      }
    }

    // Return the last thing found, even if it's not a match.
    // That way, you can still call jQuery functions on it.
    return item;
  };

  var findMefiToolbar = function(commentTable) {
    return findByMultipleSelectors(
      commentTable, [
        '#toolbar',                // Classic toolbar
        '.html-shortcuts-toolbar', // modern theme toolbar
      ]);
  };

  // Trigger an event, to execute a callback function in MeFi's JavaScript
  var triggerFakeEvent = function(type, targetDomNode) {
    var eventName = "on" + type;

    if (targetDomNode === undefined) {
      return;
    }

    if (targetDomNode[eventName] !== null) {
      // The easy way: Safari and Firefox let us trigger events directly.

      // We can't use jQuery's .trigger('focus')
      // function. That will actually switch focus to the
      // htmlComment textarea. Therefore, run
      // the onfocus handler that's set through plain ol'
      // DOM manipulation.
      targetDomNode[eventName]();
    }
    else if (typeof FocusEvent !== 'undefined' && typeof KeyboardEvent !== 'undefined') {
      // The hard way: Chrome makes us simulate an event

      var fakeEvent;
      switch (type) {
        case 'focus':
          // W3C spec for focus events: 
          // https://dvcs.w3.org/hg/dom3events/raw-file/tip/html/DOM3-Events.html#interface-FocusEvent
          fakeEvent = new FocusEvent('focus', {
            // Event target gaining focus
            target: targetDomNode,
            view: window,
            detail: 0,
            // Event target losing focus (if any)
            relatedTarget: null
          });
          break;

        case 'blur':
          fakeEvent = new FocusEvent('blur', {
            // Event target losing focus
            target: targetDomNode,
            view: window,
            detail: 0,
            // Event target gaining focus
            relatedTarget: null,
          });
          break;    

        case 'keyup':
          fakeEvent = new KeyboardEvent('keyup', {
            // All the paramaters in the constructor are optional.
            // And MeFi's prev() function doesn't check paramaters,
            // so just leave them out.
          });
          break;
      }

      targetDomNode.dispatchEvent(fakeEvent);
    }
    // Else: It's a scary new future where our browser has stopped supporting
    // all our tricks.
  };


  /////////////////////////////////////////////////
  //
  // Preview & parsing of Markdown

  var htmlUpdateTimeoutId;

  // Do the updates on a timer, so they don't happen on literally
  // every keystroke.  
  var triggerHtmlUpdate = function(event) {
    if (typeof htmlUpdateTimeoutId === 'undefined') {
      // No timer running. Start one.

      // Firefox issues a security warning if argument 1 is a varible.
      // So pass in a function that calls updateHtmlFromMd.      
      htmlUpdateTimeoutId = window.setTimeout(function() {
        updateHtmlFromMd();
      }, 250);
    }
    // Else: There's already a timer running to trigger an HTML update.
    // When that timer fires, it will capture the state of the text boxes
    // that includes these changes. So there's no need to do anything.
  };

  // When the Markdown has changed, generate new HTML.
  var updateHtmlFromMd = function() {
    var mdComment  = $('.md4mefi-comment');
    var mdExtended = $('.md4mefi-extended');

    var mdCommentText  = mdComment.val();
    var mdExtendedText = mdExtended.val();

    md4mefiSendMessage.sendMessage('md2html', {
      markdownTextA: mdCommentText,
      markdownTextB: mdExtendedText,
    });
    htmlUpdateTimeoutId = undefined;
  };

  var receiveUpdatedHtml = function(result) {
    var htmlA = result.htmlA;
    var htmlB = result.htmlB;

    var htmlComment = $('#comment');
    var htmlExtended = $('#extended');

    htmlComment.val(htmlA);
    htmlExtended.val(htmlB !== null ? htmlB : "");

    // The keyup event is the listener for 
    // refreshing the live preview. It calls
    // the prev() function in the MeFi code.
    triggerFakeEvent('keyup', htmlComment.get(0));
    triggerFakeEvent('keyup', htmlExtended.get(0));  
  };
  md4mefiSendMessage.addMessageListener('md2html', receiveUpdatedHtml);

  // Turn on the task that updates the live preview
  var turnOnLivePreview = function(event) {
    // Turn on live preview, by running the init_lp function.
    // That function is assigned to the onfocus handler.

    triggerFakeEvent('focus', event.data.htmlComment.get(0));
    if (event.data.htmlExtended !== null) {
      triggerFakeEvent('focus', event.data.htmlExtended.get(0));
    }
  };

  var turnOffLivePreview = function(event) {
    // Turn off live preview, by running the kill_lp function,
    // which is the onBlur handler.

    triggerFakeEvent('blur', event.data.htmlComment.get(0));
    if (event.data.htmlExtended !== null) {
      triggerFakeEvent('blur', event.data.htmlExtended.get(0));
    }
  };

  /////////////////////////////////////////////////
  //
  // Event handlers

  var showHideHtml = function(event) {
    var htmlComment = event.data.htmlComment;
    var htmlExtended = event.data.htmlExtended;
    var showHtml = event.data.showHtml;

    var isShow = showHtml.prop('checked');

    var animationOptions = {
      duration: 200,
      //easing: 'easeOut',
    };

    if (isShow) {
      htmlComment.show(animationOptions);
      if (htmlExtended !== null){
        htmlExtended.show(animationOptions);
      }
    }
    else {
      htmlComment.hide(animationOptions);
      if (htmlExtended !== null){
        htmlExtended.hide(animationOptions);
      }      
    }
  };

  var doBoldOrItalic = function(boldOrItalic, event) {
    // comment or extended, whichever one this box is
    var mdComment = event.data.thisMd; 
    var caretPos;

    var wrapperChar, placeholderText;
    if (boldOrItalic === 'bold') {
      wrapperChar = '**';
      placeholderText = '**bold text**';
    }
    else {
      wrapperChar = '*';
      placeholderText = "*italic text*";
    }

    mdComment.selection('trim');
    if (mdComment.selection('get') === "") {
      caretPos = mdComment.selection('getPos');

      mdComment.selection('insert', {text: placeholderText, mode: 'before'});

      // skip past the first wrapper char
      caretPos.start += wrapperChar.length; 
      // Highlight all of placeholderText, except the wrapper chars
      caretPos.end = caretPos.start + placeholderText.length - (2 * wrapperChar.length);
      mdComment.selection('setPos', caretPos);
    }
    else {
      mdComment.selection('insert', {text: wrapperChar, mode: 'before' });
      mdComment.selection('insert', {text: wrapperChar, mode: 'after' });      
    }

    updateHtmlFromMd();
  };

  var doItalic = function(event) {
    doBoldOrItalic('italic', event);
  };

  var doBold = function(event) {
    doBoldOrItalic('bold', event);
  };

  var doLink = function(event) {
    var mdComment = event.data.thisMd;    
    var mdText = mdComment.val();
    var otherMdText = event.data.otherMd !== null ? 
      event.data.otherMd.val() : null;
    //var nextLinkNumber = md4mefi.nextLinkNumber(mdText, otherMdText);

    md4mefiSendMessage.sendMessage('nextLinkNumber', {
      markdownTextA: mdText,
      markdownTextB: otherMdText,
      isExtended:    event.data.isExtended,
    });
  };

  // Callback that finishes doLink
  var receiveNextLinkNumber = function(result) {
    var mdText, linkText, linkUrl, caretPos, newlines;

    var nextLinkNumber = result.nextLinkNumber;
    var isExtended = result.isExtended;
    var endsInLinkReference = result.endsInLinkReference;
    var mdComment = isExtended ? $('.md4mefi-extended') : $('.md4mefi-comment');

    linkUrl = window.prompt("Please enter the site you'd like to link.", "http://");
    linkUrl = verifyAndFixUrl(linkUrl);
    if (linkUrl === false) {
      return;
    }

    mdComment.selection('trim');
    if (mdComment.selection('get') === "") {
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
    // Put two newlines betwen text and the first reference.
    // One newline between subsequent references.
    newlines = endsInLinkReference ? "\n" : "\n\n";
    mdText = mdComment.val() + newlines + "[" + nextLinkNumber + "]: " + linkUrl; 
    mdComment.val(mdText);    
    // Inserting the text changed the selection. Move it back.
    mdComment.selection('setPos', caretPos);

    updateHtmlFromMd();
  };
  md4mefiSendMessage.addMessageListener('nextLinkNumber', receiveNextLinkNumber);

  /////////////////////////////////////////////////
  //
  // DOM manipulation

  // Add to the body, to flag what kind of color scheme we have
  var addClassForColorScheme = function() {
    var body = $('body');

    var bodyBgColor = body.css('background-color');
    var bgIsWhite = jQuery.Color(bodyBgColor).toHexString() === '#ffffff';

    // The background color is set differently in the modern dark theme, than for all
    // the others.
    //
    // Classic theme:         Has light or dark backgrounds. BG color set on the body element.
    // Plain theme:           Has light backgrounds only. BG color set on the body element.
    // Modern (light) theme:  Has light backgrounds only. BG color set on the body element.
    // Modern (dark) theme:   Has dark backgrounds only. BG color *NOT* set on the body element.
    //
    // So, check to see if the dark mode class is set OR if the body element's BG color is white.
    if (body.hasClass('dark-mode') || !bgIsWhite) {
      body.addClass('md4mefi-dark-bgcolor');
    }
    else {
      body.addClass('md4mefi-light-bgcolor');
    }
  };

  // Hide MeFi's built-in formatting toolbar (B, I, link)
  var hideMeFiToolbar = function(htmlComment, commentTable) {
    var mefiToolbar = findMefiToolbar(commentTable);
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

  // In the dark modern theme, the toolbar color depends on the
  // subsite: blue for MeFi, green for ask, etc.
  // Copy the colors from the MeFi toolbar.
  var colorizeMd4MefiToolbar = function(commentTable, md4mefiToolbar) {
    var mefiToolbar = findMefiToolbar(commentTable);

    if (mefiToolbar.hasClass('html-shortcuts-toolbar')) {
      var toolbarBgColor = mefiToolbar.css('background-color');
      md4mefiToolbar.find('.md4mefi-button').css('background-color', toolbarBgColor);          
    }
  };

  // Add the "Editing in HTML" message to the MeFi toolbar.
  var addMessageToMeFiToolbar = function(htmlComment) {
    var commentTable = htmlComment.closest('table');    
    //var mefiToolbar = commentTable.find('#toolbar'); 
    var mefiToolbar = findMefiToolbar(commentTable);

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
  var addRevertToHtmlMessage = function(htmlComment, isError, text) {    
    var messageArea = $('<div>')
      .addClass('md4mefi-message');
    if (isError) {
      messageArea.addClass('md4mefi-error');
    }

    var title = $('<div>')
      .addClass('md4mefi-message-title')
      .text("Markdown for MeFi");

    var close = $('<div>')
      .addClass('md4mefi-message-close')
        .html("&times;");

    var message = $('<div>')
      .addClass('md4mefi-message-message')
      .text(text)
      .prepend(title);

    messageArea.append(message).append(close);

    // For some reason, the other stuff in the containing block is
    // right aligned. When the message is wide, and makes the
    // container wide, the comment box shoots over to the right.
    // So don't be wider than the comment box.
    messageArea.css('max-width', htmlComment.css('width'));

    close.click(function() {
      messageArea.hide({
        duration: 200,
      });
    });

    // Does this page have the new style toolbar?
    var hasNewToolbar = $(document).find('.html-shortcuts-toolbar').length !== 0;

    // Place this message either before or after the comment box, whichever
    // way won't be between the comment box and the toolbar.
    if (hasNewToolbar) {
      messageArea.insertAfter(htmlComment);
    }
    else {
      messageArea.insertBefore(htmlComment);
    }
  };

  // Replace the HTML Help link with a Markdown Help link.
  var replaceHelpLink = function() {
    var anchor = $('#commentform a[href$="//faq.metafilter.com/tags/html"]');
    anchor.attr('href', 'http://evan-dickinson.github.io/md4mefi/#howto');
    anchor.html('(Markdown help)');

    // Normal MeFi has target = self. I don't like that; open in a new tab.
    anchor.attr('target', '_blank');
  };

  // Add the Markdown comment box and (optionally) toolbar
  var setupMarkdown = function(htmlComment, otherHtmlComment, mdComment, otherMdComment, isExtended) { 
    // On a thread page, this is a td with id #commenttd.
    // But on an FPP page, the containing td is not named.
    var commentTd = htmlComment.closest('td');
    var commentTable = commentTd.closest('table');

    mdComment
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

    colorizeMd4MefiToolbar(commentTable, toolbar);
    commentTd.prepend(toolbar);
    commentTd.prepend(mdComment);
    htmlComment.hide();

    replaceHelpLink();
    hideMeFiToolbar(htmlComment, commentTable);

    /////////////////
    // Set up event handlers
    var eventData = {
      // For handlers that need to know "this" and "other"
      thisMd: mdComment,
      otherMd: otherMdComment,

      // For handlers that need to know comment & extended
      mdComment: !isExtended ? mdComment : otherMdComment,
      mdExtended: !isExtended ? otherMdComment : mdComment,

      htmlComment: !isExtended ? htmlComment : otherHtmlComment,
      htmlExtended: !isExtended ? otherHtmlComment : htmlComment,

      //htmlComment: htmlComment,
      //otherHtmlComment: otherHtmlComment,
      //mdComment: mdComment,
      //otherMdComment: otherMdComment,
      showHtml: showHtml,

      isExtended: isExtended,
    };
    mdComment.on('input', eventData, triggerHtmlUpdate);
    mdComment.on('focus', eventData, turnOnLivePreview);
    mdComment.on('blur',  eventData, turnOffLivePreview);

    showHtml.on('change', eventData, showHideHtml);

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
  };

  $(document).ready(function() {
    var saveRestore = window.md4mefiSaveRestore;

    addClassForColorScheme();

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

    // No support for the edit window
    var isEditPage = /edit-comment.mefi$/.test(location.pathname);
    if (isEditPage) {
      addRevertToHtmlMessage(htmlComment, false, // not an error
        "Sorry, Markdown doesn't work in the edit window. " +
        "Switching back to HTML (clasic MeFi editing).");
      addMessageToMeFiToolbar(htmlComment);
      return;
    }

    // Do a sanity check: Is there text in the html text areas,
    // but no recovered markdown? If so, abort back to
    // HTML mode.
    if (saveRestore.isRestoredMarkdownStale(htmlComment.val(), 
                                htmlExtended.val(), 
                                storedJson)) {

      addRevertToHtmlMessage(htmlComment, true, // is an error
        "Something went wrong under the hood. Switching back to HTML (classic MeFi editing).");
      addMessageToMeFiToolbar(htmlComment);

      return;
    }

    if (htmlComment.length === 1 && htmlExtended.length === 0) {
      // No textarea for extended text.
      // Must be a comment page.
      mdComment = $('<textarea>').addClass('md4mefi-markdown-entry').addClass('md4mefi-comment');
      mdExtended = null;
      setupMarkdown(htmlComment, null, mdComment, mdExtended, false);
    }
    else if (htmlComment.length === 1 && htmlExtended.length === 1) {
      // Both comment & extended
      mdComment = $('<textarea>').addClass('md4mefi-markdown-entry').addClass('md4mefi-comment');
      mdExtended = $('<textarea>').addClass('md4mefi-markdown-entry').addClass('md4mefi-extended');
      setupMarkdown(htmlComment, htmlExtended, mdComment, mdExtended, false);
      setupMarkdown(htmlExtended, htmlComment, mdExtended, mdComment, true);
    }
    else {
      // Probably means there's no text entry on this page.
      return;
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

    // Find post button
    var postButtonSelectors = [
      '#postButton',
      'input[type="submit"][value^="Post"]'
    ];
    var postButton = findByMultipleSelectors(form, postButtonSelectors);

    // Find preview button 
    var previewButtonSelectors = [
      '#previewButton',
      'input[type="submit"][value^="Step 2:"]',
      'input[type="submit"][value^="Preview"]',
    ];
    var previewButton = findByMultipleSelectors(form, previewButtonSelectors);

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