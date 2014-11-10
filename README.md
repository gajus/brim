# Brim

[![NPM version](https://badge.fury.io/js/brim.svg)](http://badge.fury.io/js/brim)
[![Bower version](https://badge.fury.io/bo/brim.svg)](http://badge.fury.io/bo/brim)

Brim enables minimal-ui for the iOS 8.

## The Issue & The Solution

In [iOS 7.1](https://developer.apple.com/library/ios/releasenotes/General/RN-iOSSDK-7.1/index.html), a property, minimal-ui, has been added for the viewport meta tag key that allows minimizing the top and bottom bars on the [iOS] as the page loads. While on a page using minimal-ui, tapping the top bar brings the bars back. Tapping back in the content dismisses them again.

The minimal-ui viewport property is [no longer supported](https://developer.apple.com/library/ios/releasenotes/General/RN-iOSSDK-8.0/) in iOS 8. However, the minimal-ui itself is not gone. User can enter the minimal-ui with a "touch-drag down" gesture. There are several pre-conditions, such as there has to be enough content to enable user to scroll.

## The Underlying Implementation



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