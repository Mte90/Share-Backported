/* global browser, document, console */

function saveOptions(e) {
  e.preventDefault();
  var parameters = {};
  document.querySelectorAll('input[id]').forEach(function(item) {
    if (item.type === 'checkbox') {
      parameters[item.id] = item.checked;
    } else {
      parameters[item.id] = item.value;
    }
  });
  browser.storage.local.set(parameters);
}

function restoreOptions() {
  var value = '';
  var getting = '';
  document.querySelectorAll('input[id]').forEach(function(item) {
    item = item.id;
    getting = browser.storage.local.get(item);
    getting.then(function(result) {
      value = result[Object.keys(result)[0]];
      if (Number.isInteger(parseInt(value))) {
        document.querySelector('#' + item).value = value;
      } else {
        document.querySelector('#' + item).checked = value;
      }
    }, function(error) {
      console.log(`Error: ${error}`);
    });
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
