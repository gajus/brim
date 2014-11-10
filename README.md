# Brim

<!--[![Build Status](https://travis-ci.org/gajus/brim.png?branch=master)](https://travis-ci.org/gajus/brim)-->

[![NPM version](https://badge.fury.io/js/brim.svg)](http://badge.fury.io/js/brim)
[![Bower version](https://badge.fury.io/bo/brim.svg)](http://badge.fury.io/bo/brim)

## Usage

Setup the viewport using Scream (see [dependencies](#dependencies)):

```js
var scream;

scream = Scream({
    width: {
        portrait: 320,
        landscape: 640
    }
});
```

Initialise Brim with an instance of Scream as a `viewport` configuration property:

```js
var brim;

brim = Brim({
    viewport: scream
});
```

Document must have exactly two descendants `brim-main` and `brim-mask`.

### Quick Start

```html
<!DOCTYPE html>
<html>
<head>
    
</head>
<body>
    <div id="brim-mask">
        <!-- Content displayed to the user when not in minimal view. -->
    </div>
    <div id="brim-main">
        <!-- Content displayed to the user when in minimal view.  -->
    </div>

    <script src="./bower_components/scream/dist/scream.js"></script>
    <script src="./bower_components/brim/dist/brim.js"></script>
    <script>
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
    </script>
</body>
</html>
```

## Dependencies

### Scream

> Dynamic viewport management for mobile. Manage viewport in different states of device orientation. Scale document to fit viewport. Calculate the dimensions of the "minimal" iOS 8 view relative to your viewport width.

An instance of [Scream](https://github.com/gajus/scream) is part of the [Brim initialization](#setup) configuration.

## Namespace

There is no namespace if you are loading `./src/` to build a package using a module loader such as [RequireJS](http://requirejs.org/) or [Browserify](http://browserify.org/).

If you are using the `./dist/` release, then all of the module objects are available under the `gajus.Brim` namespace.

## Usage

You will need two elements:

```html
<div id="brim-main"></div>
<div id="brim-mask"></div>
```

* `brim-mask` is visible to the end user when window is not in fullscreen.
* `brim-main` is visible to the end user when window is in fullscreen.

You must set the viewport `width` property:

```html
<meta name="viewport" content="width=320">
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