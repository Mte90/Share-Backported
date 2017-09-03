# Share Backported

Firefox Nightly 57 will [remove](https://bugzilla.mozilla.org/show_bug.cgi?id=1388902) the share feature because was using a non official Social API included in Firefox itself.  
The Firefox Share implementation was a modal view to share the tab opened to different social networks.   
This extension reimplement the feature with the same previous icon with the various social icons that open a modal or a tab for Facebook, Twitter, Google+, Linkedin social networks.  
Use a modal if the browser support, seems that Firefox 57 doesn't work so open a new tab.

![](screenshot.png)