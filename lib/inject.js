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
  // Save markdown across server-side previews
  var getSessionStorageKey = function(form) {
    var linkIdInput = form.find('input[name="link_ID"]');
    var storageKeyPrefix = "md4mefi-";

    // Pages for making a new post have forms that
    // lead to one of these two pages. Use regex to avoid
    // worrying if the path has a leading slash, or a hostname,
    // or any other weird stuff.
    var isNewPostPage = 
      /post_preview.mefi$/.test(form.attr('action')) ||
      /post_preview.cfm$/.test(form.attr('action'));

    if (linkIdInput.length > 0) {
      // This is a comment thread
      return storageKeyPrefix + linkIdInput.val();
    }
    else if (isNewPostPage) {
      // Store up to one new post for each site.
      return storageKeyPrefix + '-new-post-' + window.location.hostname;
    }
    else {
      return null;
    }
  };

  var saveMarkdownForPreview = function(event) {
    var mdComment = event.data.mdComment;  
    var mdExtended = event.data.mdExtended;
    var form = mdComment.closest('form');
    var storageKey = getSessionStorageKey(form);

    if (storageKey === null) {
      return;
    }

    var savedDataJson = {
      comment: mdComment.val(),
      extended: (mdExtended !== null) ? mdExtended.val() : "",
      url: window.location.href,
    };
    var savedDataString = JSON.stringify(savedDataJson);

    window.sessionStorage.setItem(storageKey, savedDataString);
  };

  // Get the saved markdown for this session. 
  var restoreMarkdown = function(form) {
    // Only restore markdown if we're doing a preview. If we just, say, opened
    // a second browser tab to the thread's page, then don't restore.
    //
    // If we're at one of the following paths, we're okay.
    var allowedPaths = [
      // Preview a comment
      '/contribute/post_comment_preview.mefi',

      // MeFi FPP
      '/post_preview.mefi', 

      // AskMe Question
      // FanFare post
      // MeFi projects
      // MeTa post
      '/post_preview.cfm',
      '/contribute/post_preview.cfm'

      // TODO:
      // - Check the other subsites (IRL, jobs, music)
      // - Verify that all the sites go to the same comment preview page
    ];
    var isAllowedPath = allowedPaths.some(function(path) {
      return path === window.location.pathname;
    });
    if (!isAllowedPath) {
      return null;
    }

    var storageKey = getSessionStorageKey(form);
    if (storageKey === null) {
      return null;
    }

    var savedDataString = window.sessionStorage.getItem(storageKey);
    if (savedDataString === null) {
      return null;
    }
    window.sessionStorage.removeItem(storageKey);

    var savedDataJson = JSON.parse(savedDataString);
    return savedDataJson;
  };

  var deleteMarkdownForPreview = function(event) {
    var form = event.data.form;
    var storageKey = getSessionStorageKey(form);
    if (storageKey === null) {
      return;
    }
    window.sessionStorage.removeItem(storageKey);
  };

  /////////////////////////////////////////////////
  //
  // DOM manipulation

  var hideMeFiToolbar = function(htmlComment, commentTable) {
    // Hide MeFi's built-in formatting toolbar (B, I, link)
    // On the new post form, each textarea has its own
    // toolbar, both id'd #toolbar. So start searching
    // from the containing table.
    var mefiToolbar = commentTable.find('#toolbar');
    var mefiToolbarParentTr = mefiToolbar.closest('tr');

    // If the toolbar and the htmlComment are both 
    // in the same tr. This can happen when doing
    // a server-side preview.
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

  // Replace the HTML Help link with a Markdown Help link.
  var replaceHelpLink = function() {
    var anchor = $('#commentform a[href$="//faq.metafilter.com/tags/html"]');
    anchor.attr('href', 'http://daringfireball.net/projects/markdown/basics');
    anchor.html('(Markdown help)');

    // Normal MeFi has target = self. I don't like that; open in a new tab.
    anchor.attr('target', '_blank');
  };

  // Add the Markdown comment box and (optionally) toolbar
  var setupMarkdown = function(htmlComment, includeToolbar) { 
    // On a thread page, this is a td with id #commenttd.
    // But on an FPP page, the containing td is not named.
    var commentTd = htmlComment.closest('td');
    var commentTable = commentTd.closest('table');

    var mdComment = $('<textarea>')
      .attr('rows', htmlComment.attr('rows'))
      .attr('cols', htmlComment.attr('cols'))
      .css('width', htmlComment.css('width'))
      .css('height', htmlComment.css('height'));

    //htmlComment.attr('readonly', true);

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
    }

    return mdComment;
  };

  $(document).ready(function() {
    var htmlComment = $('#comment');
    var htmlExtended = $('#extended');
    var mdComment, mdExtended;

    if (htmlComment.length === 0) {
      // No text entry on this page
      return;
    }
    else if (htmlExtended.length === 0) {
      // No textarea for extended text.
      // Must be a comment page.
      mdComment = setupMarkdown(htmlComment, true);
      mdExtended = null;
    }
    else {
      // Both comment & extended
      mdComment = setupMarkdown(htmlComment, false);
      mdExtended = setupMarkdown(htmlExtended, true);
    }

    // Restore saved markdown (for server-side preview)
    var form = mdComment.closest('form');
    var storedJson = restoreMarkdown(form);
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

    // Comment form
    var previewButton = form.find('#previewButton');
    // First time visiting a new post page
    if (previewButton.length === 0) {
      previewButton = form.find('input[type="submit"][value="Step 2: Preview Your Post"]');
    }
    // Second time visiting a new post page
    if (previewButton.length === 0) {
      previewButton = form.find('input[type="submit"][value="Preview"]');
    }

    // We can't use .on('submit'), because there's no way to
    // tell if the submission is for a preview or a post.
    // Use click handlers, instead.
    // http://stackoverflow.com/a/13202018/939467
    var eventData = {
      mdComment: mdComment,
      mdExtended: mdExtended,
    };
    previewButton.click(eventData, saveMarkdownForPreview);  
    postButton.click(eventData, deleteMarkdownForPreview);

    //form.submit(function(event) { event.preventDefault(); });        
  });

// noConflict(true) will revert both $ and jQuery, making
// it possible to use this plugin in combination w/ other
// versions of jQuery. Maybe this isn't necessary b/c
// Safari protects plugins from conflicts w/ the page's
// Javascript, but it makes me feel safer.
//
// See: http://stackoverflow.com/a/7882550/939467
})(jQuery.noConflict(true));