var sbId, sbPrevUrl;
// Create the window and save the tab id
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'share-backid') {
    browser.windows.create(request.data).then(function (tab) {
      sbId = tab.id;
      sbPrevUrl = request.data.url;
      return tab.id;
    });
  } else if (request.type === 'share-backid-container') {
    browser.tabs.create(request.data).then(function (tab) {
      sbId = tab.id;
      sbPrevUrl = request.data.url;
      return tab.id;
    });
  }
});

// Autoclose the window when the url change
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (sbId === tab.windowId) {
    const cssInjectionsFor = [
      'https://www.linkedin.com/shareArticle',
      'https://www.reddit.com/',
      'shaarli'
    ];

    if (sbPrevUrl !== undefined) {
      // True if any of the listed links show up
      const shallInjectCss = cssInjectionsFor.some(function (urlPart) {
        return sbPrevUrl.includes(urlPart);
      });

      if (shallInjectCss) {
        browser.tabs.insertCSS(tabId, {
          code: 'body { overflow: auto !important; }'
        });
      }
    }

    urlChangeStrategy(tabId, sbPrevUrl);
  }
});

function urlChangeStrategy(tabId, sbPrevUrl) {
  const closeWhen = ['dialog/close_window', 'latest_status_id='];

  const closeCarefullyWhen = [
    'reddit\.com\/user\/.+\/comments\/.+\/',
    'reddit\.com\/r\/.+\/comments\/.+\/',
    'twitter\.com\/home'
  ];

  browser.tabs.get(tabId, function (tabinfo) {
    const modalUrl = tabinfo.url;

    if (sbPrevUrl !== modalUrl && modalUrl !== 'about:blank') {
      // True if any of above parts are part of the modal URL
      var shallClose = closeWhen.some(function (urlPart) {
        return modalUrl.includes(urlPart);
      });

      if (!shallClose) {
        shallClose = closeCarefullyWhen.some(function (regex) {
          var testUrl = RegExp(regex, 'g');

          return testUrl.test(modalUrl);
        });
      }

      if (shallClose) {
        browser.tabs.remove(tabId);
      }
    }
  });
}
