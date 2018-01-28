/* global browser, document, console */

function saveOptions(e) {
  e.preventDefault();
  var parameters = {};
  document.querySelectorAll('input[id]').forEach(function(item) {
    if (item.type === 'checked') {
      parameters[item.id] = item.checked;
    } else {
      parameters[item.id] = item.value;
    }
  });
  console.log(parameters)
  browser.storage.local.set(parameters);
}

function restoreOptions() {
  var shares = ['facebook', 'twitter', 'google', 'linkedin', 'tumblr', 'reddit', 'telegram', 'gmail', 'diaspora', 'vkontakte', 'yahoo', 'pinboard', 'outlook', 'pageaction'];
  shares.forEach(function(item) {
    var getting = browser.storage.local.get(item);
    getting.then(function(result) {
      document.querySelector('#' + item).checked = result[Object.keys(result)[0]];
    }, function(error) {
      console.log(`Error: ${error}`);
    });
  });
  var shares = ['shaarli'];
  shares.forEach(function(item) {
    var getting = browser.storage.local.get(item);
    getting.then(function(result) {
      if (result[Object.keys(result)[0]] !== undefined) {
        document.querySelector('#' + item).value = result[Object.keys(result)[0]];
      }
    }, function(error) {
      console.log(`Error: ${error}`);
    });
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
