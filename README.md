# Brim

<!--[![Build Status](https://travis-ci.org/gajus/brim.png?branch=master)](https://travis-ci.org/gajus/brim)-->

[![NPM version](https://badge.fury.io/js/brim.svg)](http://badge.fury.io/js/brim)
[![Bower version](https://badge.fury.io/bo/brim.svg)](http://badge.fury.io/bo/brim)

## Setup

Initialize [Scream](#scream).

If you are using a module loader, load "scream":

```js
var Scream = require('scream');
```

If you are not using a module loader, include the script file. In this case, Scream is available under the "gajus" namespace:

```html
<script src="./bower_components/scream.js"></script>
<script>
var Scream = gajus.Scream;
</script>
```

Setup the viewport:

```js
scream = Scream({
    width: {
        portrait: 320,
        landscape: 640
    }
});
```

Explore [Scream](https://github.com/gajus/scream) documentation to learn about all of the configuration parameters.

Load Brim either as a module or including the script (follow earlier guidance for Scream).

Initialise Brim with an instance of Scream as a `viewport` configuration property:

```js
brim = Brim({
    viewport: scream
});
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