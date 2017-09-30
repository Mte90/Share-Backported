/* global browser */

var sb_id, sb_prev_url
// Create the window and save the tab id
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'share-backid') {
    browser.windows.create(request.data).then(function (tab) {
      sb_id = tab.id
      sb_prev_url = request.data.url
      return tab.id
    })
  }
})
// Autoclose the iwndow when the url change
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (sb_id === tab.windowId) {
    if (sb_prev_url.indexOf('https://www.linkedin.com/shareArticle') >= 0 || sb_prev_url.indexOf('https://plus.google.com/share') >= 0 || sb_prev_url.indexOf('https://reddit.com/') >= 0) {
      browser.tabs.insertCSS(tabId, {code: 'body { overflow: auto !important; }'})
    }
    browser.tabs.get(tabId, function (tabinfo) {
      if (sb_prev_url !== tabinfo.url) {
        var close = false
        if (tabinfo.url.indexOf('dialog/return/close#_=_') > 0 || tabinfo.url.indexOf('latest_status_id=') > 0 || tabinfo.url === 'https://plus.google.com/') {
          close = true
        }
        if (close === true) {
          browser.tabs.remove(tabId)
        }
      }
    })
  }
})
// Add pageaction
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  var getting = browser.storage.local.get('pageaction')
  getting.then(function (result) {
    if (typeof result.pagection === 'undefined') {
      if (tab.url.indexOf('about:') !== 0 && tab.url.indexOf('moz-extension:') !== 0) {
        browser.pageAction.setIcon({tabId: tab.id, path: 'icon.svg'})
        browser.pageAction.setTitle({tabId: tab.id, title: 'Share'})
        browser.pageAction.show(tab.id)
        browser.pageAction.setPopup({
          tabId,
          popup: '/modal/modal.html'
        })
      }
    }
  })
})
