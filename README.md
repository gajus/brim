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

Brim needs three elements:

| ID | Function |
| --- | --- |
| "brim-treadmill" | Treadmill element is used to give user space to scroll. The element is generated in the background without you having to do anything. It is invisible to the user the entire time. |
| "brim-mask" | Mask element is displayed to the user when device is not in minimal-ui state. The role of the element is to instruct user to enter the minimal-ui. You have to have this element as a direct descendant of `<body>`. |
| "brim-main" | Main element is where your app resides. This element is shown when mask is hidden. You have to have this element as a direct descendant of `<body>`. |

* Treadmill – 

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