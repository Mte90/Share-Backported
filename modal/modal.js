/* global browser, URL */

document.addEventListener('DOMContentLoaded', () => {
  const width = 700
  const height = 340
  const config = `resizable,scrollbars=yes,width=${width},height=${height}`
  const buttons = document.querySelectorAll('.share')

  var shares = 0
  Array.from(buttons).forEach(function (button, index) {
    // Hide the share
    var item = button.getAttribute('id')
    var getting = browser.storage.local.get(item)
    getting.then(function (result) {
      if (result[Object.keys(result)[0]]) {
        document.querySelector('#' + item).remove()
      } else {
        shares++
        // Add click event
        button.addEventListener('click', function (event) {
          event.preventDefault()
          const url = new URL(this.dataset.share)
          browser.tabs.query({
            active: true,
            windowId: browser.windows.WINDOW_ID_CURRENT
          },
                  tabs => {
                    if (url.searchParams.has('u')) {
                      url.searchParams.set('u', tabs[0].url)
                    } else if (url.searchParams.has('url')) {
                      url.searchParams.set('url', tabs[0].url)
                    } else if (url.searchParams.has('canonicalUrl')) {
                      url.searchParams.set('canonicalUrl', tabs[0].url)
                    } else if (url.searchParams.has('body')) {
                      url.searchParams.set('body', tabs[0].url)
                    }

                    if (url.searchParams.has('text')) {
                      url.searchParams.set('text', tabs[0].title)
                    } else if (url.searchParams.has('title')) {
                      url.searchParams.set('title', tabs[0].title)
                    } else if (url.searchParams.has('su')) {
                      url.searchParams.set('su', tabs[0].title)
                    }

                    browser.runtime.sendMessage({
                      type: 'share-backid',
                      data: {
                        url: url.toString(),
                        width,
                        height,
                        type: 'popup'
                      }
                    })
                  }
          )
        }, false)
      }

      if (index === (buttons.length - 1)) {
        // Set the height of the modal
        if (shares <= 4) {
          document.querySelector('html').classList.add('lines-1')
          document.querySelector('body').classList.add('lines-1')
        } else if (shares <= 8) {
          document.querySelector('html').classList.add('lines-2')
          document.querySelector('body').classList.add('lines-2')
        }
      }
    }, function (error) {
      console.log(`Error: ${error}`)
    })
  })
})
