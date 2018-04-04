/* global browser, URL, document, console */

function resize_modal() {
  var shares = document.querySelectorAll('.share').length;
  var row = 0;
  // Set the height of the modal
  row = Math.ceil(shares / 4);
  document.querySelector('html').classList.add('lines-' + row);
  document.querySelector('body').classList.add('lines-' + row);
}

function open_popup(newurl, width, height) {
  if (isNaN(width)) {
    width = 700;
  }
  if (isNaN(height)) {
    height = 340;
  }
  browser.runtime.sendMessage({
    type: 'share-backid',
    data: {
      url: newurl,
      width,
      height,
      type: 'popup'
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  var width = 700;
  var height = 340;
  const buttons = document.querySelectorAll('.share');

  Array.from(buttons).forEach(function(button, index) {
    // Hide the share
    var item = button.getAttribute('id');
    var getting = browser.storage.local.get(item);
    getting.then(function(result) {
      if (result[Object.keys(result)[0]] && document.querySelector('#' + item + ':not(.customurl)') !== null) {
        document.querySelector('#' + item).remove();
        resize_modal();
        return;
      }
      // Simple trick to check custom share that doesn't have a boolean value
      if (typeof result[Object.keys(result)[0]] !== "undefined" && result[Object.keys(result)[0]].length > 6) {
        document.querySelector('#' + item + '.customurl').dataset.share = result[Object.keys(result)[0]];
      } else {
        if (document.querySelector('#' + item + '.customurl') !== null) {
          document.querySelector('#' + item + '.customurl').remove();
          resize_modal();
          return;
        }
      }
      // Add click event
      button.addEventListener('click', function(event) {
        event.preventDefault();
        const url = new URL(this.dataset.share);
        browser.tabs.query({
          active: true,
          windowId: browser.windows.WINDOW_ID_CURRENT
        },
          tabs => {
            if (url.searchParams.has('u')) {
              url.searchParams.set('u', tabs[0].url);
            } else if (url.searchParams.has('url')) {
              url.searchParams.set('url', tabs[0].url);
            } else if (url.searchParams.has('canonicalUrl')) {
              url.searchParams.set('canonicalUrl', tabs[0].url);
            } else if (url.searchParams.has('body')) {
              url.searchParams.set('body', tabs[0].url);
            } else if (url.searchParams.has('post')) {
              url.searchParams.set('post', tabs[0].url);
            }
			
            if (url.searchParams.has('text')) {
              url.searchParams.set('text', tabs[0].title);
            } else if (url.searchParams.has('title')) {
              url.searchParams.set('title', tabs[0].title);
            } else if (url.searchParams.has('su')) {
              url.searchParams.set('su', tabs[0].title);
            } else if (url.searchParams.has('description')) {
              url.searchParams.set('description', tabs[0].title);
            } else if (url.searchParams.has('subject')) {
              url.searchParams.set('subject', tabs[0].title);
            }

            var newurl = url.toString();
            if (item === 'diaspora') {
              newurl = url.toString();
              newurl = newurl.replace(/\+/gi, ' ');
            }
			
			if (item === 'mastodon') {
			  url.searchParams.set('text', tabs[0].title + ' ' + tabs[0].url);
			}
			
            browser.storage.local.get([this.id + "-width", this.id + "-height"]).then(function(items) {
              width = parseInt(items[item + "-width"]);
              height = parseInt(items[item + "-height"]);
              open_popup(newurl, width, height);
            }, function(error) {
              open_popup(newurl, width, height);
            });
          });
      }, false);
    }, function(error) {
      console.log(`Error: ${error}`);
    });
    resize_modal();
  });
});
