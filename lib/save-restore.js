(function(args) {
  'use strict';

  var expose = args.expose;

  expose.getStorageKeyPrefix = function() {
    return "md4mefi-";
  };

  // Return true if this is a page for previewing a new
  // post (e.g., an FPP, a question on Ask)
  expose.isPostPreviewPage = function(url) {
    // Pages for making a new post have forms that
    // lead to one of these pages. Use regex to avoid
    // worrying if the path has a leading slash, or a hostname,
    // or any other weird stuff.

    // Strip the hash off the end
    url = url.replace(/#.*$/, ''); 
    return /post_preview\.(mefi|cfm)$/.test(url) ||
           /post-talk_preview\.(mefi|cfm)$/.test(url);
  };

  expose.isCommentPreviewPage = function(url) {
    // I haven't actually seen the .cfm path in use yet,
    // but include it to be safe.

    url = url.replace(/#.*$/, '');     
    return /post_comment_preview\.mefi$/.test(url) ||
           /post_comment_preview\.cfm$/.test(url);
  };

  // In a server-side preview, the server has populated
  // the comment form(s) with some HTML. See if the
  // markdown we restored is out of date, w/r/t the
  // HTML.
  //
  // Right now, we're just testing for gross failures.
  // Would be nicer to do a more thourough check
  // in the future.

  expose.isRestoredMarkdownStale = function(options) {
    var htmlCommentText = options.htmlCommentText;
    var htmlExtendedText = options.htmlExtendedText;
    var storedJson = options.storedJson;
    var draftId = options.draftId;

    var hasHtmlComment = 
      typeof(htmlCommentText) !== 'undefined' &&
      htmlCommentText !== null &&
      htmlCommentText !== "";
    var hasHtmlExtended = 
      typeof(htmlExtendedText) !== 'undefined' &&
      htmlExtendedText !== null &&
      htmlExtendedText !== "";      
    var hasDraftId =
      typeof(draftId) !== 'undefined' &&
      draftId !== null &&
      draftId !== "";

    if (typeof storedJson === 'undefined' || storedJson === null) {
      // We didn't restore any old JSON data

      if (hasHtmlComment || hasHtmlExtended) {
        // But we *DID* get comments from the server. That's bad. Abort.
        return {
          isStale: true,
          reason: hasDraftId ? 'draft' : 'other',
        };
      }
      else {
        // Nothing saved, nothing from the server. This must be
        // a brand new comment. No need to abort.
        return {
          isStale: false,
          reason: null,
        };
      }
    }

    // We *did* restore saved comments. Compare them to
    // the comments the server provided.
    var hasMdComment = 
      storedJson.hasOwnProperty('comment') &&
      storedJson.comment !== null &&
      storedJson.comment !== "";

    var hasMdExtended = 
      storedJson.hasOwnProperty('extended') &&
      storedJson.extended !== null &&
      storedJson.extended !== "";

    // Abort if we got text in the HTML areas,
    // but the markdown we recovered was just
    // the empty string.
    var isStale =  hasHtmlComment  && !hasMdComment ||
               hasHtmlExtended && !hasMdExtended;
    return {
      isStale: isStale,
      // Don't return 'draft' as a reason here. If we were able to restore
      // saved JSON, then that JSON should match. Any problems we encounter here
      // are *not* simply due to the fact that we're restoring a draft.
      reason: isStale ? 'other' : null,
    };
  };

  //expose.getSessionStorageKey: function(linkId, formSubmitUrl) {
  expose.getSessionStorageKey = function(options) {
    var linkId = options.linkId;
    var formSubmitUrl = options.formSubmitUrl;
    var location = options.location;

    var storageKeyPrefix = expose.getStorageKeyPrefix();

    if (typeof linkId !== 'undefined' && linkId !== null) {
      // This is a comment thread
      return storageKeyPrefix + linkId;
    }
    else if (expose.isPostPreviewPage(formSubmitUrl)) {
      // Store up to one new post for each site.
      return storageKeyPrefix + 'new-post-' + location.hostname;
    }
    else {
      return null;
    }
  };

  expose.saveMarkdownForPreview = function(options) {
    var mdCommentText = options.mdCommentText;  
    var mdExtendedText= options.mdExtendedText;
    var sessionStorage = options.sessionStorage;
    var location = options.location;
    var storageKey = expose.getSessionStorageKey({
      linkId: options.linkId,
      formSubmitUrl: options.formSubmitUrl,
      location: location,
    });

    if (storageKey === null) {
      return;
    }

    var savedDataJson = {
      comment: mdCommentText,
      extended: mdExtendedText,
      url: location.href,
    };
    var savedDataString = JSON.stringify(savedDataJson);

    //console.log("Saving data for preview. Key = " + storageKey + ". Value = " + savedDataString);

    sessionStorage.setItem(storageKey, savedDataString);
  };

  // Get the saved markdown for this session. 
  //restoreMarkdown: function(linkId, formSubmitUrl, location) {
  expose.restoreMarkdown = function(options) {
    var linkId = options.linkId;
    var formSubmitUrl = options.formSubmitUrl;
    var location = options.location;
    var sessionStorage = options.sessionStorage;

    // Only restore markdown if we're doing a preview. If we just, say, opened
    // a second browser tab to the thread's page, then don't restore.
    var isAllowedPath = 
      this.isPostPreviewPage(location.pathname) ||
      this.isCommentPreviewPage(location.pathname);
    if (!isAllowedPath) {
      //console.log("Path disallowed: %j", location);
      return null;
    }

    var storageKey = this.getSessionStorageKey({
      linkId: linkId, 
      formSubmitUrl: formSubmitUrl,
      location: location
    });
    if (storageKey === null) {
      //console.log("No storage key");
      return null;
    }

    var savedDataString = sessionStorage.getItem(storageKey);
    if (savedDataString === null) {
      //console.log("Nothing returned from storage");
      return null;
    }
    sessionStorage.removeItem(storageKey);

    //console.log("Restored data for preview. Key = " + storageKey + ". Value = " + savedDataString);

    var savedDataJson = JSON.parse(savedDataString);
    return savedDataJson;
  };

  expose.deleteMarkdownForPreview = function(options) {
    var sessionStorage = options.sessionStorage;
    var storageKey = expose.getSessionStorageKey({
      linkId: options.linkId,
      formSubmitUrl: options.formSubmitUrl,
      location: options.location,
    });
    if (storageKey === null) {
      return;
    }
    sessionStorage.removeItem(storageKey);
  };

})( (function() {
  if ( typeof exports === "undefined" ) {
    window.md4mefiSaveRestore = {};
    return {
      expose: window.md4mefiSaveRestore,
    };
  }
  else {
    return {
      expose: exports,
    };
  }
} )() );