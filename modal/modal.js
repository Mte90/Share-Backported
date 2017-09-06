document.addEventListener('DOMContentLoaded', () => {
	const width     = 700;
	const height    = 340;
	const config    = `resizable,scrollbars=yes,width=${width},height=${height}`;
	const buttons   = document.querySelectorAll('[data-share]');

	Array.from(buttons).forEach(button => {
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
						url.searchParams.set('url', tabs[0].url)
					} else if (url.searchParams.has('canonicalUrl')) {
						url.searchParams.set('canonicalUrl', tabs[0].url);
					} else if (url.searchParams.has('body')) {
						url.searchParams.set('body', tabs[0].url)
					}

					if (url.searchParams.has('text')) {
						url.searchParams.set('text', tabs[0].title);
					} else if (url.searchParams.has('title')) {
						url.searchParams.set('title', tabs[0].title);
					} else if (url.searchParams.has('su')) {
						url.searchParams.set('su', tabs[0].title);
					}

					if (window.open(url, 'share-backported', config) === null) {
						browser.windows.create({
							url: url.toString(),
							width,
							height,
							type: 'popup'
						});
					}
				}
			);
		}, false);
	});
});
