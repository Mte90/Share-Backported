/* global browser */

function saveOptions (e) {
  e.preventDefault();
  browser.storage.local.set({
    facebook: document.querySelector('#facebook').checked,
    twitter: document.querySelector('#twitter').checked,
    google: document.querySelector('#google').checked,
    linkedin: document.querySelector('#linkedin').checked,
    tumblr: document.querySelector('#tumblr').checked,
    reddit: document.querySelector('#reddit').checked,
    telegram: document.querySelector('#telegram').checked,
    gmail: document.querySelector('#gmail').checked,
    diaspora: document.querySelector('#diaspora').checked,
    pageaction: document.querySelector('#pageaction').checked
  });
}

function restoreOptions () {
  var shares = ['facebook', 'twitter', 'google', 'linkedin', 'tumblr', 'reddit', 'telegram', 'gmail', 'diaspora', 'pageaction'];
  shares.forEach(function (item) {
    var getting = browser.storage.local.get(item);
    getting.then(function (result) {
      document.querySelector('#' + item).checked = result[Object.keys(result)[0]];
    }, function (error) {
      console.log(`Error: ${error}`);
    });
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
