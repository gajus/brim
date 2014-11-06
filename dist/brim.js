/**
 * @version 1.0.0
 * @link https://github.com/gajus/brim for the canonical source repository
 * @license https://github.com/gajus/brim/blob/master/LICENSE BSD 3-Clause
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/**
* @link https://github.com/gajus/sister for the canonical source repository
* @license https://github.com/gajus/sister/blob/master/LICENSE BSD 3-Clause
*/
function Sister () {
    var sister = {},
        events = {};

    /**
     * @name handler
     * @function
     * @param {Object} data Event data.
     */

    /**
     * @param {String} name Event name.
     * @param {handler} handler
     * @return {listener}
     */
    sister.on = function (name, handler) {
        var listener = {name: name, handler: handler};
        events[name] = events[name] || [];
        events[name].unshift(listener);
        return listener;
    };

    /**
     * @param {listener}
     */
    sister.off = function (listener) {
        var index = events[listener.name].indexOf(listener);

        if (index != -1) {
            events[listener.name].splice(index, 1);
        }
    };

    /**
     * @param {String} name Event name.
     * @param {Object} data Event data.
     */
    sister.trigger = function (name, data) {
        var listeners = events[name],
            i;

        if (listeners) {
            i = listeners.length;
            while (i--) {
                listeners[i].handler(data);
            }
        }
    };

    return sister;
}

global.gajus = global.gajus || {};
global.gajus.Sister = Sister;

module.exports = Sister;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
(function (global){
var Brim,
    Sister = require('sister');

Brim = function Brim (config) {
    var brim,
        sister,
        player = {},
        device,
        magicOffsetScroll = 1;
    
    if (!(this instanceof Brim)) {
        return new Brim(config);
    }

    brim = this;

    /**
     * When config.debug is true, logs the current state variables.
     */
    brim.debug = function (eventName) {
        if (config.debug) {
            console.log(
                JSON.stringify({
                    name: eventName,
                    orientation: global.orientation === 0 ? 'vertical' : 'horizontal',
                    innerHeight: global.innerHeight,
                    treadmillHeight: player.treadmill.clientHeight,
                    maximumAvailableHeight: device.maximumAvailableHeight,
                    isMAH: brim.isMAH()
                })
            );
        }
    };

    /**
     * Parse the <meta> tag to learn the viewport width.
     * 
     * @see http://stackoverflow.com/questions/26779744/how-to-read-the-property-values-of-the-viewport-meta-tag
     * @return {Number}
     */
    brim.getViewportWidth = function () {
        var viewportElement = document.querySelector('meta[name="viewport"]'),
            viewPort = {};

        if (!viewportElement) {
            return null;
        }
        
        viewportElement.content.split(',').forEach(function (property) {
            property = property.split('=');
            viewPort[property[0]] = property[1];
        });

        if (!viewPort.width) {
            return null;
        }

        return parseInt(viewPort.width, 10);
    };

    /**
     * Get device and the associated dimensions.
     * 
     * @return {Object} device
     * @return {String} device.name
     * @return {Number} device.maximumAvailableHeight
     * @return {Number} device.maximumAvailableHeightVertical
     * @return {Number} device.maximumAvailableHeightHorizontal
     * @return {Number} device.screenWidth
     * @return {Number} device.screenHeight
     * @return {Number} device.chromeHeight
     */
    brim.getDevice = function () {
        var device = {};

        device.screenWidth = global.screen.availWidth;
        device.screenHeight = global.screen.availHeight;

        if (device.screenWidth == 320 && device.screenHeight == 548) {
            device.name = 'iphone-5s';
            // Upon loading the page it is 460
            // Upon exiting the MAH it is 461
            device.maximumAvailableHeightVertical = 529;
            device.maximumAvailableHeightHorizontal = 180;
        } else {
            throw new Error('Not iOS device.');
        }

        device.maximumAvailableHeight = global.orientation === 0 ?
            device.maximumAvailableHeightVertical :
            device.maximumAvailableHeightHorizontal;

        // screen.availHeight is the height the browser's window can have if it is maximized.
        // screen.height is the number of pixels the screen can display.
        device.chromeHeight = global.screen.height - global.screen.availHeight;

        return device;
    };
  
    /**
     * Is window height the Maximum Available Height (MAH).
     * 
     * @return {Boolean}
     */
    brim.isMAH = function () {
        return device.maximumAvailableHeight == global.innerHeight;
    };

    /**
     * Sets the dimensions of the treadmill player and adjusts the window scroll offset.
     * Treadmill height is set to 2 times the size of the MAH; device.chromeHeight.
     * 
     * Treadmill larger than the MAH allows user to scroll downwards to enable the fullscreen.
     * 2 times the size of MAH, allows the maximum scrolling distance that can be achieved
     * with a single touch-drag gesture.
     * 
     * The purpose of the scroll offset is to overcome a bug in Safari.
     * Setting the offset ensures that "resize" event is triggered upon loading the page.
     * After the resize event we can calculate the true window height.
     *
     * @see http://stackoverflow.com/questions/26784456/how-to-get-window-height-when-in-fullscreen
     */
    brim.treadmill = function () {
        var treadmillStyle = player.treadmill.style;

        if (!config.debug) {
            treadmillStyle.visibility = 'hidden';
        }

        treadmillStyle.position = 'relative';
        treadmillStyle.zIndex = 10;
        treadmillStyle.width = config.viewportWidth + 'px';       
        treadmillStyle.height = (device.maximumAvailableHeight * 2) + 'px';

        global.scrollTo(0, device.chromeHeight);
    };

    /**
     * 
     */
    brim.setupDOMEventListeners = function () {
        global.addEventListener('orientationchange', function () {
            sister.trigger('change');
        });

        // The resize event is triggered when page is loaded in MAH state with scroll offset greater than 0.
        global.addEventListener('resize', function () {
            sister.trigger('change');
        });

        global.addEventListener('touchstart', function (e) {
            // Disable window scrolling when in MAH.
            if (brim.isMAH()) {
                e.preventDefault();
            }
        });
    }

    /**
     * Sets the dimensions and position of the drag mask player. The mask is an overlay on top
     * of the treadmill and the main content. It does not respond to the touch events.
     *
     * The mask is visible when window is not in MAH.
     */
    brim.mask = function () {
        var maskStyle = player.mask.style;

        if (brim.isMAH()) {
            maskStyle.display = 'none';
        } else {
            maskStyle.display = 'block';

            maskStyle.pointerEvents = 'none';

            // Cannot use position fixed because fixed element is not visible outside of the
            // chrome of the pre touch-drag state. There is a visual reminder in
            // ./.readme/element-fixed-bug.png

            // Can use position fixed if forcing repaint of the element.
            // http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes?lq=1

            maskStyle.position = 'fixed';
            maskStyle.zIndex = 30;
            maskStyle.webkitTransform = 'scale(1)';
            maskStyle.top = 0;
            maskStyle.left = 0;
            maskStyle.width = config.viewportWidth + 'px';
            maskStyle.height = device.maximumAvailableHeight + 'px';
        }
    };

    /**
     * Sets the dimensions and position of the main player.
     *
     * The main element remains visible beneath the mask.
     */
    brim.main = function () {
        var mainStyle = player.main.style;

        mainStyle.position = 'fixed';
        mainStyle.zIndex = 20;
        mainStyle.webkitTransform = 'scale(1)';
        mainStyle.top = 0;
        mainStyle.left = 0;
        mainStyle.width = config.viewportWidth + 'px';
        mainStyle.height = device.maximumAvailableHeight + 'px';
    };

    config = config || {};

    config.viewportWidth = brim.getViewportWidth();

    if (!config.viewportWidth) {
        throw new Error('Unknown viewport width.');
    }

    config.debug = config.debug || false;

    sister = Sister();
    
    player.treadmill = document.createElement('div');
    //player.treadmill.id = 'brim-treadmill';
    document.body.appendChild(player.treadmill);

    player.main = document.querySelector('#brim-main');
    player.mask = document.querySelector('#brim-mask');

    sister.on('change', function () {
        // Device properties are relative to global.orientation.
        device = brim.getDevice();

        brim.treadmill();
        brim.main();

        
        brim.mask();
    });

    brim.setupDOMEventListeners();

    // The initial trigger is required to ensure that element height is set.
    sister.trigger('change');

    // The subsequent trigger is required to get the correct dimensions.
    setTimeout(function () {
        sister.trigger('change');
    }, 100);
};


global.gajus = global.gajus || {};
global.gajus.Brim = Brim;

module.exports = Brim;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"sister":1}]},{},[2])