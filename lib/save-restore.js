(function(args) {
  'use strict';

  var expose = args.expose;


  expose.getStorageKeyPrefix = function() {
    return "md4mefi-";
  };
  expose.makeSaveRestore = function(options) {
    var location = options.location;
    var sessionStorage = options.sessionStorage;

    return {
      // Return true if this is a page for previewing a new
      // post (e.g., an FPP, a question on Ask)
      isPostPreviewPage: function(url) {
        // Pages for making a new post have forms that
        // lead to one of these two pages. Use regex to avoid
        // worrying if the path has a leading slash, or a hostname,
        // or any other weird stuff.
        return /post_preview.mefi$/.test(url) ||
               /post_preview.cfm$/.test(url);
      },

      isCommentPreviewPage: function(url) {
        // I haven't actually seen the .cfm path in use yet,
        // but include it to be safe.
        return /post_comment_preview.mefi$/.test(url) ||
               /post_comment_preview.cfm$/.test(url);
      },

      getSessionStorageKey: function(linkId, formSubmitUrl) {
        var storageKeyPrefix = expose.getStorageKeyPrefix();

        if (linkId !== null) {
          // This is a comment thread
          return storageKeyPrefix + linkId;
        }
        else if (isPostPreviewPage(formSubmitUrl)) {
          // Store up to one new post for each site.
          return storageKeyPrefix + 'new-post-' + window.location.hostname;
        }
        else {
          return null;
        }
      },

      saveMarkdownForPreview: function(options) {
        var mdCommentText = options.mdCommentText;  
        var mdExtendedText= options.mdExtendedText;
        var storageKey = this.getSessionStorageKey(options.linkId,
                                                   options.formSubmitUrl);

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
      },

      // Get the saved markdown for this session. 
      //restoreMarkdown: function(linkId, formSubmitUrl, location) {
      restoreMarkdown: function(options) {
        var linkId = options.linkId;
        var formSubmitUrl = options.formSubmitUrl;

        // Only restore markdown if we're doing a preview. If we just, say, opened
        // a second browser tab to the thread's page, then don't restore.
        var isAllowedPath = 
          this.isPostPreviewPage(location.pathname) ||
          this.isCommentPreviewPage(location.pathname);
        if (!isAllowedPath) {
          console.log("Path disallowed: %j", location);
          return null;
        }

        var storageKey = this.getSessionStorageKey(linkId, formSubmitUrl);
        if (storageKey === null) {
          console.log("No storage key");
          return null;
        }

        var savedDataString = sessionStorage.getItem(storageKey);
        if (savedDataString === null) {
          console.log("Nothing returned from storage");
          return null;
        }
        sessionStorage.removeItem(storageKey);

        //console.log("Restored data for preview. Key = " + storageKey + ". Value = " + savedDataString);

        var savedDataJson = JSON.parse(savedDataString);
        return savedDataJson;
      },

      deleteMarkdownForPreview: function(event) {
        var form = event.data.form;
        var storageKey = getSessionStorageKey(form);
        if (storageKey === null) {
          return;
        }
        window.sessionStorage.removeItem(storageKey);
      },
    };
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