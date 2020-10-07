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
    if (sbPrevUrl !== undefined) {
      if (sbPrevUrl.indexOf('https://www.linkedin.com/shareArticle') >= 0 || sbPrevUrl.indexOf('https://reddit.com/') || sbPrevUrl.indexOf('shaarli') >= 0) {
        browser.tabs.insertCSS(tabId, {
          code: 'body { overflow: auto !important; }'
        });
      }
    }

    browser.tabs.get(tabId, function (tabinfo) {
      if (sbPrevUrl !== tabinfo.url && tabinfo.url !== 'about:blank') {
        if (tabinfo.url.indexOf('dialog/close_window') > 0 || tabinfo.url.indexOf('latest_status_id=') > 0) {
          browser.tabs.remove(tabId);
        }
      }
    });
  }
});

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
