document.addEventListener("DOMContentLoaded", function (event) {
  var buttons = document.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
	var self = buttons[i];
	self.addEventListener('click', function (event) {
	  event.preventDefault();
	  var share = this.getAttribute('data-share');
	  browser.tabs.query({'active': true, 'windowId': browser.windows.WINDOW_ID_CURRENT},
			  function (tabs) {
				share = share.replace('{url}', tabs[0].url);
				share = share.replace('{text}', tabs[0].title);
				if (window.open(share, 'share-backported', "resizable,scrollbars=yes,width=700,height=350") === null) {
				  browser.windows.create({
					url: share,
					width:700,
					height:350,
					type: "popup",
				  });
				}
			  }
	  );
	}, false);
  }
});