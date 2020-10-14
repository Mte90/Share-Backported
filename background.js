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
browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (sbId === tab.windowId) {
    const cssInjectionsFor = [
      'https://www.linkedin.com/shareArticle',
      'https://reddit.com/',
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

    if (shallObserveTitle(sbPrevUrl)) {
      titleChangeStrategy(tabId);
    } else {
      urlChangeStrategy(tabId, sbPrevUrl);
    }
 }
});

function shallObserveTitle (shareUrl) {
  // TODO: Shared data with modal.html
  const urls = [
    'https://reddit.com/submit',
  ];

  return urls.some((url) => shareUrl.startsWith(url));
}

function titleChangeStrategy (tabId) {
  const closeWhen = [
    // FIXME: Replace with meaningful heuristic!
    'Log in'
  ];

  browser.tabs.get(tabId, function (tabinfo) {
    const modalTitle = tabinfo.title;

    // True if any of above parts are part of the modal URL
    const shallClose = closeWhen.some(function (titlePart) {
      return modalTitle.includes(titlePart);
    });

    if (shallClose) {
      browser.tabs.remove(tabId);
    }
  });
}

function urlChangeStrategy (tabId, sbPrevUrl) {
  const closeWhen = [
    'dialog/close_window',
    'latest_status_id='
  ];

  browser.tabs.get(tabId, function (tabinfo) {
    const modalUrl = tabinfo.url;

    if (sbPrevUrl !== modalUrl && modalUrl !== 'about:blank') {
      // True if any of above parts are part of the modal URL
      const shallClose = closeWhen.some(function (urlPart) {
        return modalUrl.includes(urlPart);
      });

      if (shallClose) {
        browser.tabs.remove(tabId);
      }
    }
  });
}

// call function which get the address bar color (toolbar_field)
setPageActionIcon();

async function setPageActionIcon () {
  var themeInfo = await browser.theme.getCurrent();
  let color = 'light';
  var rgb_list = ['rgb(71, 71, 73)', 'rgb(50, 50, 52)']; // list of RGB where icon_theme should be light
  if (themeInfo.colors && themeInfo.colors.toolbar_field) {
    if (!rgb_list.includes(themeInfo.colors.toolbar_field.toString())) {
      color = 'dark';
    }
  }
  setPageAction(color);
}

function setPageAction (color) {
  var ext_icon = 'icon-' + color + '.svg';
  browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var getting = browser.storage.local.get('pageaction');
    getting.then(function (result) {
      var pageaction = result.pageaction;
      if (!pageaction) {
        if (tab.url.indexOf('about:') !== 0 && tab.url.indexOf('moz-extension:') !== 0) {
          browser.pageAction.setIcon({
            tabId: tab.id,
            path: ext_icon
          });

          browser.pageAction.setTitle({
            tabId: tab.id,
            title: 'Share'
          });

          browser.pageAction.show(tab.id);
          browser.pageAction.setPopup({
            tabId,
            popup: '/modal/modal.html'
          });
        }
      }
    }, function (error) {
      console.log(`Error: ${error}`);
    });
  });
}
