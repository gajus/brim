/**
 * @version 1.0.3
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
        player = {},
        device,
        magicPixel = 1,
        viewport,
        eventEmitter;
    
    if (!(this instanceof Brim)) {
        return new Brim(config);
    }

    brim = this;

    if (!config.viewport || !(config.viewport instanceof gajus.Scream)) {
        throw new Error('Configuration property "viewport" must be an instance of Scream.');
    }

    viewport = config.viewport;

    brim._setupDOMEventListeners = function () {
        var ignoreResize;

        // Media matcher is the first to pick up the orientation change.
        global
            .matchMedia('(orientation: portrait)')
            .addListener(function (m) {
                if (viewport.isMinimalView() && !m.matches) {
                    // Ignoring the resize event when changing the orientation from portrait to landscape makes
                    // the transition smoother.
                    ignoreResize = true;
                }
            });

        viewport.on('orientationchangeend', function () {
            ignoreResize = false;

            brim._change('orientationchangeend');
        });

        // The resize event is triggered when page is loaded in MAH state with scroll offset greater than 0.
        global.addEventListener('resize', function () {
            if (!ignoreResize) {
                brim._change('resize');
            }
        });

        // Disable window scrolling when in MAH.
        // @see http://stackoverflow.com/a/26853900/368691
        (function () {
            var firstMove;

            global.document.addEventListener('touchstart', function (e) {
                firstMove = true;
            });

            global.document.addEventListener('touchmove', function (e) {
                if (viewport.isMinimalView() && firstMove) {
                    e.preventDefault();
                }

                firstMove = false;
            });
        } ());
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
    brim._treadmill = function () {
        var width = viewport.getViewportWidth(),
            height = viewport.getViewportHeight() * 2,
            scrollTo = 1,
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
    brim._mask = function () {
        if (viewport.isMinimalView()) {
            player.mask.style.display = 'none';
        } else {
            player.mask.style.display = 'block';

            player.mask.style.width = global.innerWidth + 'px';
            player.mask.style.height = global.innerHeight + 'px';
        }
    };

    /**
     * Sets the dimensions and position of the main player.
     *
     * The main element remains visible beneath the mask.
     */
    brim._main = function () {
        player.main.style.width = global.innerWidth + 'px';
        player.main.style.height = global.innerHeight + 'px';

        brim._repaintElement(player.main);
    };

    /**
     * @return {HTMLElement}
     */
    brim._makeTreadmill = function () {
        var treadmill = document.createElement('div');
        treadmill.id = 'brim-treadmill';

        document.body.appendChild(treadmill);

        treadmill.style.visibility = 'hidden';
        treadmill.style.position = 'relative';
        treadmill.style.zIndex = 10;
        treadmill.style.left = 0;

        return treadmill;
    };

    /**
     *
     */
    brim._makeMask = function () {
        var mask = document.querySelector('#brim-mask');

        mask.style.position = 'fixed';
        mask.style.zIndex = 30;

        mask.style.top = 0;
        mask.style.left = 0;

        return mask;
    };

    /**
     *
     */
    brim._makeMain = function () {
        var main = document.querySelector('#brim-main');

        main.style.position = 'fixed';
        main.style.zIndex = 20;

        main.style.top = 0;
        main.style.left = 0;

        return main;
    };

    /**
     * Fixed element is not visible outside of the chrome of the pre touch-drag state.
     * See ./.readme/element-fixed-bug.png as a reminder of the bug.
     *
     * @see http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes?lq=1
     */
    brim._repaintElement = function (element) {
        element.style.webkitTransform = 'translateZ(0)';

        element.style.display = 'none';
        element.offsetHeight;
        element.style.display = 'block';
    };

    /**
     * Fired when environment variables that affect the state of
     * the viewport change (e.g. orientation and window dimensions).
     *
     * @param {String} reason Reason for requesting the change.
     */
    brim._change = function (reason) {
        console.log('change', reason);

        brim._treadmill();
        brim._main();
        brim._mask();
    };

    eventEmitter = Sister();

    brim.on = eventEmitter.on;

    viewport.on('viewchange', function (e) {
        eventEmitter.trigger('viewchange', e);
    });

    player.treadmill = brim._makeTreadmill();
    player.mask = brim._makeMask();
    player.main = brim._makeMain();

    brim._setupDOMEventListeners();

    brim._change('The initial trigger is required to setup treadmill height and offset.');

    setTimeout(function () {
        brim._change('The subsequent trigger is required to get the correct dimensions.');
    }, 100);
};

global.gajus = global.gajus || {};
global.gajus.Brim = Brim;

module.exports = Brim;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"sister":1}]},{},[2])