# Brim

<!--[![Build Status](https://travis-ci.org/gajus/brim.png?branch=master)](https://travis-ci.org/gajus/brim)-->

[![NPM version](https://badge.fury.io/js/brim.svg)](http://badge.fury.io/js/brim)
[![Bower version](https://badge.fury.io/bo/brim.svg)](http://badge.fury.io/bo/brim)

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