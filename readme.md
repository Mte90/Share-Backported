# Share Backported
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FMte90%2FShare-Backported.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FMte90%2FShare-Backported?ref=badge_shield)[![Codacy Badge](https://app.codacy.com/project/badge/Grade/e09f8a89a54e42189761908c2a7bad45)](https://www.codacy.com/manual/mte90/Share-Backported/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Mte90/Share-Backported&amp;utm_campaign=Badge_Grade)

Firefox Nightly 57 [removed](https://bugzilla.mozilla.org/show_bug.cgi?id=1388902) the share feature because it was using a non-official API.

This extension reimplement the feature, basically a modal window (that is opened in your Firefox toolbar) that let you share to ook, Twitter, LinkedIn, Reddit, Tumblr, GMail, Diaspora, Telegram, VKontakte, Outlook, Pinboard, Yahoo! Mail, Weibo, Shaarli, Mastodon, MeWe, Skype, WhatsApp, Pinterest, Instapaper, Evernote, Scoop.it, Google Translate (Auto>EN), Bing Translator, Viber, Line, KakaoTalk, Internet Wayback Machine, Friendica, Feedly, Parler social networks.

<img src="screenshot.png" alt="Screenshot of Share Backported in action" />

## About Chrome support

This extension cannot be released on Chrome webstore because of the [Spam Policy](https://developer.chrome.com/docs/webstore/program_policies/#spam).  
Specifically this rule was mentioned during the review: `Functionality: Do not post an extension with a single purpose of installing or launching another app, theme, webpage, or extension. Extensions with broken functionality—such as dead sites or non-functioning features—are not allowed.`

### Options

#### Services
You can hide some services/icons just put a check in the relevant field in the “Services” section of the extension.

In the same section, you can also change width and height of the share window (for every service), so the windows opened when you click on the relevant icon, and you can change the position/order of services too.

#### Keyboard shortcut
The PageAction can be triggered via <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>y</kbd> (resp. <kbd>Cmd</kbd> on macOS) from keyboard.
Think of the share icon. The modifier keys prevent collisions.

## Authors

* [Daniele Scasciafratte](https://github.com/Mte90/) - Creator and Maintaner
* [Chris Zuber](https://github.com/shgysk8zer0) - Contributor
* [Arnaud Jacquemin](https://github.com/arnaud-jacquemin) - Contributor
* [Indrashish Ghosh](https://github.com/ghosh) - Contributor
* [Sergey Ivanov](https://github.com/ufocoder) - Contributor
* [Arrizal Amin](https://github.com/arrizalamin) - Contributor
* [Saverio Morelli](https://github.com/Sav22999) - Contributor
* [André Jaenisch](https://github.com/Ryuno-Ki) - Contributor
* [Lorenzo Millucci](https://github.com/lmillucci) - Contributor


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FMte90%2FShare-Backported.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FMte90%2FShare-Backported?ref=badge_large)
