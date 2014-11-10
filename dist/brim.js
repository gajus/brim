/**
 * @version 1.0.2
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
        magicPixel = 1;
    
    if (!(this instanceof Brim)) {
        return new Brim(config);
    }

    brim = this;

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
            if (device.isMAH()) {
                e.preventDefault();
            }
        });
    };

    /**
     * Sets the dimensions of the treadmill player and adjusts the window scroll offset.
     * Treadmill height is set to 2 times the size of the screen height; device.chromeHeight.
     * 
     * Treadmill larger than the screen height allows user to scroll downwards to enable the fullscreen.
     * 2 times the size of screen height, allows the maximum scrolling distance that can be achieved
     * with a single touch-drag gesture.
     * 
     * The purpose of the scroll offset is to overcome a bug in Safari.
     * Setting the offset ensures that "resize" event is triggered upon loading the page.
     * After the resize event we can calculate the true window height.
     *
     * @see http://stackoverflow.com/questions/26784456/how-to-get-window-height-when-in-fullscreen
     */
    brim.treadmill = function () {
        var width = device.getViewportWidth(),
            height = device.getViewportHeight() * 2,
            scrollTo = device.getChromeHeight(),
            pts = player.treadmill.style;

        // console.log('treadmill', 'dimensions:', [width, height], 'scrollTo:', scrollTo);

        pts.width = width + 'px';
        pts.height = height + 'px';

        global.scrollTo(0, scrollTo);
    };

    /**
     * Sets the dimensions and position of the drag mask player. The mask is an overlay on top
     * of the treadmill and the main content. It does not respond to the touch events.
     *
     * The mask is visible when window is not in MAH.
     */
    brim.mask = function () {
        var width,
            height,
            pms = player.mask.style;

        if (device.isMAH()) {
            pms.display = 'none';
        } else {
            width = device.getViewportWidth();
            height = device.getMAH();

            //console.log('mask', 'dimensions:', [width, height]);

            pms.display = 'block';

            pms.pointerEvents = 'none';

            pms.position = 'fixed';
            pms.zIndex = 30;

            // Force repaint of the element.
            // Fixed element is not visible outside of the chrome of the pre touch-drag state.
            // See ./.readme/element-fixed-bug.png as a reminder of the bug.
            // http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes?lq=1
            pms.webkitTransform = 'scale(1)';

            pms.top = 0;
            pms.left = 0;
            pms.width = width + 'px';
            pms.height = height + 'px';
        }
    };

    /**
     * Sets the dimensions and position of the main player.
     *
     * The main element remains visible beneath the mask.
     */
    brim.main = function () {
        var pms = player.main.style;

        width = device.getViewportWidth();
        height = device.getMAH();

        // console.log('main', 'dimensions:', [width, height]);

        pms.position = 'fixed';
        pms.zIndex = 20;
        pms.webkitTransform = 'scale(1)';
        pms.top = 0;
        pms.left = 0;
        pms.width = width + 'px';
        pms.height = height + 'px';
    };

    /**
     * @return {HTMLElement}
     */
    brim.makeTreadmill = function () {
        var treadmill = document.createElement('div');
        treadmill.id = 'brim-treadmill';

        document.body.appendChild(treadmill);

        treadmill.style.visibility = 'hidden';
        treadmill.style.position = 'relative';
        treadmill.style.zIndex = 10;
        treadmill.style.left = 0;

        return treadmill;
    };

    brim.setupDOMEventListeners();

    player.treadmill = brim.makeTreadmill();

    sister = Sister();
    device = Device();

    player.main = document.querySelector('#brim-main');
    player.mask = document.querySelector('#brim-mask');

    sister.on('change', function () {
        brim.treadmill();
        brim.main();
        brim.mask();
    });

    // The initial trigger is required to setup treadmill height and offset.
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