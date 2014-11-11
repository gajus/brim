# Brim

[![NPM version](https://badge.fury.io/js/brim.svg)](http://badge.fury.io/js/brim)
[![Bower version](https://badge.fury.io/bo/brim.svg)](http://badge.fury.io/bo/brim)

Brim [enables minimal-ui](#the-solution) for the iOS 8.

## Minimal-UI

In [iOS 7.1](https://developer.apple.com/library/ios/releasenotes/General/RN-iOSSDK-7.1/index.html), a property, minimal-ui, has been added for the viewport meta tag key that allows minimizing the top and bottom bars in Safari as the page loads. While on a page using minimal-ui, tapping the top bar brings the bars back. Tapping back in the content dismisses them again.

## The Issue

The minimal-ui viewport property is [no longer supported](https://developer.apple.com/library/ios/releasenotes/General/RN-iOSSDK-8.0/) in iOS 8.

## The Solution

The minimal-ui itself is not gone. User can enter the minimal-ui with a "touch-drag down" gesture.

There are several pre-conditions, such as that there has to be enough content to enable user to scroll. Furthermore, [there is no way of calculating the dimensions of the minimal-ui](http://stackoverflow.com/questions/26801943/how-to-get-the-window-size-of-fullscreen-view-when-not-in-fullscreen) using the `screen` variables, and thus no way of telling when user is in the minimal-ui.

Brim tackles all of the issues associated with determining when user is in the minimal-ui, a method of instructing user to enter the minimal-ui, and a mechanism to lock user in the minimal-ui following the spec defined in the iOS 7.1.

## The Underlying Implementation

There are three element required to make Brim work:

* Treadmill. Treadmill element is used to give user space to scroll. The element is dynamically created without you having to do anything. It is invisible to the user the entire time. This element has ID `brim-treadmill`.
* Mask element. It is displayed to the user when device is not in the minimal-ui state. The role of the element is to instruct user to enter the minimal-ui. You have to have this element as a direct descendant of `<body>`. It has to have ID `brim-mask` and no styling that would affect the position or the dimensions of the element.
* Main element. This element is shown when mask is hidden. You have to have this element as a direct descendant of `<body>`. It has to have ID `brim-main` and no styling that would affect the position or the dimensions of the element.

When page is loaded, Brim will create a treadmill. The role of treadmill is to make sure that the page content height is always greater than the viewport height. This ensures that user can enter the viewport and viewport continues to persist if you reload the page.

Upon loading the page or after changing the orientation, Brim is using [Scream](https://github.com/gajus/scream) (developed as part of this project) to detect if page is in the minimal-ui view (page that has been previously in minimal-ui and has been reloaded will remain in the minimal-ui if content height is greater than the viewport height).

For documentation purposes it is worth noting that you cannot use Scream to detect if device is in minimal-ui straight after the [orientationchange](https://developer.mozilla.org/en-US/docs/Web/Events/orientationchange) event because `window` dimensions do not reflect the new orientation until the rotation animation has ended. You have to attach a listener to the [orientationchangeend](https://github.com/gajus/orientationchangeend) (developed as part of this project) event.

When page is in the minimal-ui, Brim will disable scrolling of the document (it does this in a [safe way](http://stackoverflow.com/a/26853900/368691) that does not affect the contents of the main element). Disabling document scrolling prevents accidentally leaving the minimal-ui when scrolling upwards. As per the original iOS 7.1 spec, tapping the top bar brings back the rest of the chrome.

When page is in the full view, Brim will show the mask element.

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
    <script src="./bower_components/scream/dist/scream.js"></script>
    <script src="./bower_components/brim/dist/brim.js"></script>
    <script>
    window.addEventListener('DOMContentLoaded', function () {
        var scream,
            brim;

        scream = gajus.Scream({
            width: {
                portrait: 320,
                landscape: 640
            }
        });

        brim = gajus.Brim({
            viewport: scream
        });
    });
    </script>
</head>
<body>
    <div id="brim-mask">
        <!-- Content displayed to the user when in full view. -->
    </div>
    <div id="brim-main">
        <!-- Content displayed to the user when in minimal view.  -->
    </div>
</body>
</html>
```

## Events

```js
brim.on('viewchange', function (e) {
    // Invoked when view changes.

    // @var {String} 'full', 'minimal'
    e.viewName;
});
```

## Download

Using [Bower](http://bower.io/):

```sh
bower install brim
```

Using [NPM](https://www.npmjs.org/):

```sh
npm install brim
```

The old-fashioned way, download either of the following files:

* https://raw.githubusercontent.com/gajus/brim/master/dist/brim.js
* https://raw.githubusercontent.com/gajus/brim/master/dist/brim.min.js