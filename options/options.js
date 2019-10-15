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
  document.querySelectorAll('input[id]').forEach(function(el) {
    var item = el.id;
    getting = browser.storage.local.get(item);
    getting.then(function(result) {
      value = result[Object.keys(result)[0]];
      var isInt = Number.isInteger(parseInt(value, 10));
      var isUrl = el.type === 'url';
      if (isInt || isUrl) {
        if(value !== undefined) {
          el.value = value;
        }
      } else {
        el.checked = value;
      }
    }, function(error) {
      console.log(`Error: ${error}`);
    });

    if (item.endsWith('priority')) {
      el.addEventListener('change', onChange);
    }
  });
}

function onChange(event) {
  var change = getChange(event.target);
  updateDOM(change);
}

function getChange(changedShareOption) {
  var targetShareOption = changedShareOption.parentElement.parentElement.parentElement;
  var newPosition = parseInt(changedShareOption.value, 10);

  return {
    el: targetShareOption,
    to: newPosition
  };
}

function updateDOM (change) {
  move(change);
  updateState(change);
}

function move (change) {
  var refNode, nextSibling, row;

  var parentNode = change.el.parentElement;
  var rows = Array.from(parentNode.children);

  if (change.to <= 0) {
    // Do nothing. Alternatively, move to first position?
    return;
  } else if (change.to >= rows.length) {
    // Move to end, but keep in mind other form elements!
    var numberOfOptions = parentNode.querySelectorAll('[id$="priority"]').length;

    nextSibling = parentNode.querySelector([`[id$="priority"][value="${numberOfOptions}"]`]);
    row = nextSibling.parentElement.parentElement.parentElement; // Up to .row, i.e. same level as change.el
    refNode = row.nextElementSibling;
  } else {
    nextSibling = parentNode.querySelector([`[id$="priority"][value="${change.to}"]`]);
    row = nextSibling.parentElement.parentElement.parentElement; // Up to .row, i.e. same level as change.el

    var indexTargetOption  = rows.findIndex(function(el) { return el === row; });
    var indexChangedOption = rows.findIndex(function(el) { return el === change.el; });

    // indexTargetOption > indexChangedOption => downwards
    // indexTargetOption < indexChangedOption => upwards
    refNode = indexTargetOption > indexChangedOption ? row.nextElementSibling : row;
  }

  parentNode.insertBefore(change.el, refNode);
}

function updateState (change) {
  var allShareOptions = document.querySelectorAll('[id$="priority"]');
  allShareOptions.forEach(function(option, index) {
    var newValue = index + 1;  // Arrays start with 0
    option.setAttribute('value', newValue);
    option.value = newValue;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
