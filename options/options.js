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
      // Why not using the argument of forEach here instead of querying the DOM?
      var isUrl = document.querySelector('#' + item).type === 'url';
      if (isInt || isUrl) {
        if(value !== undefined) {
          // Why not using the argument of forEach here instead of querying the DOM?
          document.querySelector('#' + item).value = value;
        }
      } else {
        // Why not using the argument of forEach here instead of querying the DOM?
        document.querySelector('#' + item).checked = value;
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
  var targetShareOption = changedShareOption.parentElement.parentElement.parentElement;;
  var oldPosition = parseInt(targetShareOption.dataset.order, 10)
  var newPosition = parseInt(changedShareOption.value, 10);

  return {
    el: targetShareOption,
    from: oldPosition,
    to: newPosition
  };
}

function updateDOM (change) {
  var orderMap = getShareOptions();
  move(change, orderMap);
  updateState(change, orderMap);
}

function getShareOptions() {
  var orderMap = {};
  var allShareOptions = document.querySelectorAll('[data-order]');
  orderMap.length = allShareOptions.length;
  allShareOptions.forEach(function(option) {
    var position = parseInt(option.dataset.order, 10);
    orderMap[position] = option;
  });
  return orderMap;
}

function move (change, orderMap) {
  var refNode, parentNode;

  if (change.to >= orderMap.length) {
    // Move to end
    refNode = orderMap[orderMap.length];
    parentNode = refNode.parentElement;
    parentNode.insertBefore(null, change.el);
  } else {
    refNode = orderMap[change.to];
    parentNode = refNode.parentElement;
    parentNode.insertBefore(refNode, change.el);
  }
}

function updateState (change, orderMap) {
  Object.keys(orderMap)
    .filter(function (order) {
      var position = parseInt(order, 10);
      return position <= change.to;
    })
    .forEach(function (order) {
      var position = parseInt(order, 10);
      if (position !== change.from) {
	var newValue = position - 1;
        var el = orderMap[order];
        var priority = el.querySelector('[id$=priority]');
        priority.setAttribute('value', newValue);
        priority.value = newValue;
      }
    });

  // Cast NodeList to Array
  var allShareOptions = [].slice(document.querySelectorAll('[data-order]'));
  allShareOptions.forEach(function (el) {
    var newValue = el.querySelector('[id$=priority]').value;
    // Padding with leading zero
    el.dataset.order = ("0" + newValue).substr(-2);
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
