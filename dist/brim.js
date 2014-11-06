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
        device;

    if (!(this instanceof Brim)) {
        return new Brim(config);
    }

    brim = this;

    /**
     * Get device and the associated dimensions.
     * 
     * @return {Object} device
     * @return {String} device.name
     * @return {Number} device.maximumAvailableHeight
     */
    brim.getDevice = function () {
        var screenWidth = window.screen.availWidth,
            screenHeight = window.screen.availHeight,
            device = {};


        if (screenWidth == 320 && screenHeight == 548) {
            device.name = 'iphone-5s';
            // Upon loading the page it is 460
            // Upon exiting the MAH it is 461
            device.maximumAvailableHeight = 529;
        } else {
            throw new Error('Not iOS device.');
        }

        return device;
    };
  
    /**
     * Is window height the Maximum Available Height (MAH).
     * 
     * @return {Boolean}
     */
    brim.isMAH = function () {
        var windowHeight = window.innerHeight;

        if (window.orientation === 0) {
            return device.maximumAvailableHeight == windowHeight;
        }
        
        throw new Error('Orientation not implemented.');
    };

    /**
     * Sets the dimensions of the treadmill element and adjusts the position of the scroll
     * depending on the state of the windowHeight.
     * 
     * If window is not in MAH, then treadmill height is set to 3 times the size of the MAH;
     * the window is scrolled to the offset of one MAH. 3 times and the scroll offset,
     * is because user cannot scroll more than one MAH with a single touch-drag gesture.
     *
     * If window is in MAH, then treadmill height is set to 1 MAH and scroll offset to 0.
     * This restricts the ongoing touch-drag downwards event.
     */
    brim.treadmill = function () {
        if (!config.debug) {
            player.treadmill.style.visibility = 'hidden';
        }

        if (brim.isMAH()) {
            player.treadmill.style.width = config.viewportWidth + 'px';
            player.treadmill.style.height = device.maximumAvailableHeight + 'px';

            brim._scrollY(0);
        } else {
            player.treadmill.style.width = config.viewportWidth + 'px';
            player.treadmill.style.height = (device.maximumAvailableHeight * 3) + 'px';

            brim._scrollY(device.maximumAvailableHeight);
        }
    };

    /**
     * A convenience wrapper for debugging.
     *
     * @param {Number} y Window offset from the top.
     */
    brim._scrollY = function (y) {
        if (config.debug) {
            console.log('scrollY', y);
        }

        global.scrollTo(0, y);
    };

    /**
     * Sets the dimensions and positioning of the mask. The mask is just an overlay on top
     * of the treadmill and the main content. It does respond to the touch events. The mask
     * is visible when window is not in MAH.
     */
    brim.mask = function () {
        if (brim.isMAH()) {
            player.mask.style.display = 'none';
        } else {
            player.mask.style.display = 'block';

            player.mask.style.position = 'fixed';
        
            player.mask.style.top = 0;
            player.mask.style.left = 0;
            player.mask.style.width = config.viewportWidth + 'px';
            player.mask.style.height = device.maximumAvailableHeight + 'px';
            player.mask.style.pointerEvents = 'none';
        }
    };

    config = config || {};

    if (!config.viewportWidth) {
        throw new Error('Unknown viewport width.');
    }

    config.debug = config.debug || false;

    sister = Sister();
    player.treadmill = document.querySelector('#treadmill');
    player.main = document.querySelector('#main');
    player.mask = document.querySelector('#mask');
    device = brim.getDevice();

    // On page load, isMAH is always false. This makes the documentHeight scrollable.
    brim.treadmill();
    // Show mask on page load.
    // This can cause flickering.
    // There is no way to know if the resize event will be triggered.
    brim.mask();

    // The resize event is triggered when page is loaded in MAH state.
    global.addEventListener('resize', function () {
        brim.treadmill();
        brim.mask();
    });
    

    //sister.trigger('change');

    /*

    //sister.on('scroll', function () {
    //    console.log('scroll', 'MAH:', brim.isMAH());

    //    brim.mask();
    //});

    
    //sister.trigger('scroll');

    setTimeout(function () {
        // Do not trigger the change event twice upon loading the page.
        // This is relevant when the initial scroll offset is not 0.
        

        global.addEventListener('scroll', function () {
            sister.trigger('scroll');
        });

        //sister.trigger('change');
        //sister.trigger('scroll');
    }, 10);*/

    global.addEventListener('touchstart', function (e) {
        // Disable window scrolling when in MAH.
        if (brim.isMAH()) {
            e.preventDefault();
        }
    });

    global.addEventListener('touchend', function (e) {
        // Make sure that user cannot scroll to the top of the treadmill.
        brim.treadmill();
    });
};


global.gajus = global.gajus || {};
global.gajus.Brim = Brim;

module.exports = Brim;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"sister":1}]},{},[2])