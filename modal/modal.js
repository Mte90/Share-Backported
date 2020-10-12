const defaultWidth = 700;
const defaultHeight = 340;

/* Autoresize the buttons based on preference */
function resize_buttons() {
  browser.storage.local
    .get('buttonsizes')
    .then(function (styles) {
      var shares = document.querySelectorAll('.share').length;
      var body = document.querySelector('body');

      if (shares === 0) {
        // If all of services are hidden, it shows a message
        body.innerHTML = "<div id='error_msg'>All services are hidden</span>";
        column = 3;
        return;
      }

      body.className = 'buttons-' + styles.buttonsizes;
    });
}

/* Open popup with sizes */
function open_popup(newurl, width, height) {
  if (Number.isNaN(width)) {
    width = defaultWidth;
  }
  if (Number.isNaN(height)) {
    height = defaultHeight;
  }
  browser.runtime.sendMessage({
    type: 'share-backid',
    data: {
      url: newurl,
      width: width,
      height: height,
      type: 'popup'
    }
  });
}

/* DO you want to open the url in a container? */
function open_container_tab(newurl, cookieStoreId) {
  browser.runtime.sendMessage({
    type: 'share-backid-container',
    data: {
      url: newurl,
      cookieStoreId
    }
  });
}

/* Support for Facebook Container extension */
function checkFacebookContainerExtension() {
  const extensionId = '@contain-facebook';
  const facebookContainerName = 'Facebook';
  return new Promise(function (resolve) {
    browser.management
      .get(extensionId)
      .then((addon) => {
        if (!addon.enabled) {
          resolve(null);
        }
        return browser.contextualIdentities.query({
          name: facebookContainerName
        });
      })
      .then((contexts) => {
        if (contexts.length > 0) {
          resolve(contexts[0].cookieStoreId);
        } else {
          resolve(null);
        }
      })
      .catch((e) => {
        resolve(null);
      });
  });
}

/* Support for Container feature of Firefox */
function checkContainerAssignment(url) {
  const extensionId = '@testpilot-containers';
  return new Promise((resolve) => {
    browser.management
      .get(extensionId)
      .then((addon) => {
        if (!addon.enabled) {
          resolve(null);
        }
        return browser.runtime.sendMessage(extensionId, {
          method: 'getAssignment',
          url
        });
      })
      .then(resolve)
      .catch((e) => {
        resolve(null);
      });
  });
}

/* Add events on the share window to the various button */
document.addEventListener('DOMContentLoaded', () => {
  var blockedUrlsPrefix = [
    'about:',
    'chrome:',
    'moz-extension:'
  ];

  browser.tabs.query(
    { active: true, windowId: browser.windows.WINDOW_ID_CURRENT },
    (tabs) => {
      var tab = tabs[0];
      // If Any prefix matches, return true
      var isBlockedUrl = blockedUrlsPrefix
        .map(function (prefix) {
          return tab.url.startsWith(prefix);
        })
        .reduce(function (upToNow, current) {
          return upToNow || current;
        }, false);

      if (isBlockedUrl) {
        showErrorMessage();
      } else {
        registerShareButtons(tab);
      }
    }
  );
});

function showErrorMessage() {
  var body = document.querySelector('body');
  body.innerHTML = "<span id='error_msg'>You can't share this tab!</span>";
}

function registerShareButtons(tab) {
  const buttons = Array.from(document.querySelectorAll('.share'));
  var promisedButtons = Promise.all(
    buttons.map(function (button) {
      var item = button.getAttribute('id');
      var getting = browser.storage.local.get(item);
      return getting.then(
        function (result) {
          var key = Object.keys(result)[0];
          removeUncheckedButton(result, key, item);

          button.addEventListener(
            'click',
            function (event) {
              onClick(event, this, tab);
            },
            false
          );

          return button;
        },
        function (error) {
          console.log(`Error: ${error}`);
        }
      );
    })
  );

  promisedButtons.then(function (buttons) {
    resize_buttons();
    var buttonsWithPriority = Promise.all(
      buttons.map(function (button) {
        var item = button.getAttribute('id');
        var priorityKey = item + '-priority';

        return browser.storage.local.get(priorityKey).then(function (result) {
          var priority, shareButton;

          if (priorityKey in result) {
            priority = parseInt(result[priorityKey], 10);
            shareButton = document.getElementById(item);
            if (shareButton) {
              return {
                el: shareButton,
                priority: priority
              };
            }
          }
          return {
            el: null,
            priority: priority
          };
        });
      })
    );

    buttonsWithPriority.then(function (pairs) {
      var grid = document.getElementById('share-directory-grid');
      var pairsWithElements = pairs.filter(function (pair) {
        // Filter for null
        return Boolean(pair.el);
      });

      // Nothing disabled, i.e. no need to touch the DOM.
      if (pairsWithElements.length === 0) {
        return;
      }

      pairsWithElements.sort(function (a, b) {
        // Sort descending
        var order = b.priority - a.priority;
        if (order < 0) {
          return -1;
        }
        if (order > 0) {
          return 1;
        }
        return 0;
      });

      pairsWithElements.reduce(function (before, current) {
        grid.insertBefore(current.el, before.el);
        return current;
      });
    });
  });
}

function removeUncheckedButton(result, key, item) {
  if (
    result[key] &&
    document.querySelector('#' + item + ':not(.customurl)') !== null
  ) {
    document.querySelector('#' + item).remove();
    return;
  }

  // Simple trick to check custom share that doesn't have a boolean value
  if (typeof result[key] !== 'undefined' && result[key].length > 6) {
    document.querySelector('#' + item + '.customurl').dataset.share =
      result[key];
  } else {
    if (document.querySelector('#' + item + '.customurl') !== null) {
      document.querySelector('#' + item + '.customurl').remove();
    }
  }
}

function onClick(event, item, tab) {
  event.preventDefault();

  browser.storage.local.get('share-format').then(function (fetched) {
    var format = fetched['share-format'];
    var service = item.getAttribute('id');
    var urlshare = item.dataset.share;
    if (service === 'wayback') {
      urlshare = 'https://web.archive.org/save/';
    }

    const url = new URL(urlshare);
    let newUrl;
    var tabTitle = tab.title;
    var url_encoded = encodeURI(tab.url);

    switch (true) {
      case url.searchParams.has('u'):
        url.searchParams.set('u', url_encoded);
        break;
      case url.searchParams.has('url'):
        url.searchParams.set('url', url_encoded);
        break;
      case url.searchParams.has('link'):
        url.searchParams.set('link', url_encoded);
        break;
      case url.searchParams.has('canonicalUrl'):
        url.searchParams.set('canonicalUrl', url_encoded);
        break;
      case url.searchParams.has('body'):
        url.searchParams.set('body', url_encoded);
        break;
      case url.searchParams.has('post'):
        url.searchParams.set('post', url_encoded);
        break;
      case url.searchParams.has('a'):
        url.searchParams.set('a', url_encoded);
        break;
    }

    switch (true) {
      case url.searchParams.has('text'):
        url.searchParams.set('text', tabTitle);
        break;
      case url.searchParams.has('title'):
        url.searchParams.set('title', tabTitle);
        break;
      case url.searchParams.has('su'):
        url.searchParams.set('su', tabTitle);
        break;
      case url.searchParams.has('description'):
        url.searchParams.set('description', tabTitle);
        break;
      case url.searchParams.has('subject'):
        url.searchParams.set('subject', tabTitle);
        break;
      case url.searchParams.has('message'):
        url.searchParams.set('message', tabTitle);
        break;
    }

    if (format) {
      var newText = format
        .replace('{title}', tabTitle)
        .replace('{url}', url_encoded);
      url.searchParams.set('text', newText);
    }

    newUrl = url.toString();

    switch (service) {
      case 'diaspora':
        newUrl = newUrl.replace(/\+/gi, ' ');
        break;
      case 'mastodon':
      case 'whatsapp':
        url.searchParams.set('text', tabTitle + ' - ' + url_encoded);
        break;
      case 'wayback':
      case 'feedly':
        newUrl = newUrl + url_encoded;
        break;
    }

    newUrl = url.toString();

    Promise.all([
      checkContainerAssignment(newUrl),
      checkFacebookContainerExtension()
    ]).then(([assignment, facebookCookieStoreId]) => {
      if (assignment) {
        const cookieStoreId =
          'firefox-container-' + assignment.userContextId;
        open_container_tab(newUrl, cookieStoreId);
      } else if (item.id === 'facebook' && facebookCookieStoreId !== null) {
        open_container_tab(newUrl, facebookCookieStoreId);
      } else {
        browser.storage.local
          .get([item.id + '-width', item.id + '-height'])
          .then(
            function (items) {
              let width = parseInt(items[item.id + '-width'], 10);
              let height = parseInt(items[item.id + '-height'], 10);
              open_popup(newUrl, width, height);
            },
            function (error) {
              console.error(error);
              open_popup(newUrl, defaultWidth, defaultHeight);
            }
          );
      }
    });
  });
}
