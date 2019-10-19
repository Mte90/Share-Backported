/* global browser, console */

// call function which get the address bar color (toolbar_field)
getIconColour();

var sbId, sbPrevUrl;
// Create the window and save the tab id
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'share-backid') {
    browser.windows.create(request.data).then(function(tab) {
      sbId = tab.id;
      sbPrevUrl = request.data.url;
      return tab.id;
    });
  } else if (request.type === 'share-backid-container') {
    browser.tabs.create(request.data).then(function(tab) {
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
    browser.tabs.get(tabId, function(tabinfo) {
      if (sbPrevUrl !== tabinfo.url && tabinfo.url !== 'about:blank') {
        if (tabinfo.url.indexOf('dialog/close_window') > 0 || tabinfo.url.indexOf('latest_status_id=') > 0) {     
          browser.tabs.remove(tabId);
        }
      }
    });
  }
});
// Add pageaction
setPageActionIcon("light")

function getStyle(themeInfo)
{
  var rgb_list = ["rgb(71, 71, 73)", "rgb(50, 50, 52)"]; // list of RGB where icon_theme should be light
  if (themeInfo.colors)
  {
    var colour = "" + themeInfo.colors.toolbar_field;
    if (colour!="light")
    {
      if (!rgb_list.includes(colour))
        colour = "dark";
      else
        colour = "light";
    }
    setPageActionIcon(colour);
  }
}

async function getIconColour()
{
  var themeInfo = await browser.theme.getCurrent();
  getStyle(themeInfo);
}

function setPageActionIcon(colour) {
  var theme_colour_temp = "icon-" + colour + ".svg";
  browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    var getting = browser.storage.local.get('pageaction');
    getting.then(function (result) {
      var pageaction = result.pageaction;
      if (!pageaction) {
        if (tab.url.indexOf('about:') !== 0 && tab.url.indexOf('moz-extension:') !== 0) {
          browser.pageAction.setIcon({
            tabId: tab.id,
            path: theme_colour_temp
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
