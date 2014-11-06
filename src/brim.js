var Brim,
    Sister = require('sister');

Brim = function Brim (config) {
    var brim,
        sister,
        player = {},
        device,
        magicOffset = 1;

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
    brim.getViewPortWidth = function () {
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
     * @return {Number} device.maximumAvailableHeightVertical
     * @return {Number} device.maximumAvailableHeightHorizontal
     */
    brim.getDevice = function () {
        var screenWidth = global.screen.availWidth,
            screenHeight = global.screen.availHeight,
            device = {};


        if (screenWidth == 320 && screenHeight == 548) {
            device.name = 'iphone-5s';
            // Upon loading the page it is 460
            // Upon exiting the MAH it is 461
            device.maximumAvailableHeightVertical = 529;
            device.maximumAvailableHeightHorizontal = 180;
        } else {
            throw new Error('Not iOS device.');
        }

        device.maximumAvailableHeight = global.orientation === 0 ? device.maximumAvailableHeightVertical : device.maximumAvailableHeightHorizontal;

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
     * Treadmill height is set to 2 times the size of the MAH; offset magicOffset.
     * 
     * Treadmill larger than the MAH allows user to scroll downwards to enable the fullscreen.
     * 2 times the size of MAH, allows the maximum scrolling distance that can be achieved
     * with a single touch-drag gesture.
     * 
     * The purpose of the magicOffset is to ensure that part of the document is not in the view.
     * Forcing the document body out of the view, ensures that fullscreen persists.
     * In addition, magicOffset is used to prevent user scrolling to the of the page using the
     * tap-navigation gesture (see "scroll" event).
     */
    brim.treadmill = function () {
        var treadmillStyle = player.treadmill.style;

        if (!config.debug) {
            treadmillStyle.visibility = 'hidden';
        }

        treadmillStyle.width = config.viewportWidth + 'px';
        treadmillStyle.height = (device.maximumAvailableHeight * 2) + 'px';

        brim._scrollY(magicOffset);
    };

    brim.setupEventListeners = function () {
        var touchStart = false;

        global.addEventListener('orientationchange', function () {
            // Device properties are global.orientation sensitive.
            brim.main();
        });

        // The resize event is triggered when page is loaded in MAH state.
        global.addEventListener('resize', function () {
            brim.debug('resize');

            brim.treadmill();
            brim.mask();
        });

        global.addEventListener('touchstart', function (e) {
            brim.debug('touchstart');

            touchStart = true;

            // Disable window scrolling when in MAH.
            if (brim.isMAH()) {
                e.preventDefault();
            }
        });

        global.addEventListener('touchend', function (e) {
            // Make sure that user cannot scroll to the top of the treadmill.
            brim.treadmill();

            touchStart = false;
        });

        // This is to safe guard against a special case. When mask is visible,
        // user can click the navigation to scroll to the top of the page.
        // The touchStart is there to prevent unnecessary jitter when
        // user is doing the touch-drag. 
        global.addEventListener('scroll', function () {
            if (!touchStart) {
                brim.treadmill();
            }
        });
    }

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
     * Sets the dimensions and positioning of the mask player. The mask is just an overlay on top
     * of the treadmill and the main content. It does respond to the touch events. The mask
     * is visible when window is not in MAH.
     */
    brim.mask = function () {
        var maskStyle = player.mask.style;

        if (brim.isMAH()) {
            maskStyle.display = 'none';
        } else {
            maskStyle.display = 'block';

            maskStyle.position = 'absolute';
            maskStyle.zIndex = 20;
        
            maskStyle.top = window.scrollY + 'px';
            maskStyle.left = 0;
            maskStyle.width = config.viewportWidth + 'px';
            maskStyle.height = device.maximumAvailableHeight + 'px';
            maskStyle.pointerEvents = 'none';
        }
    };

    /**
     * Sets the dimensions and positioning of the main player. The main element is always visible.
     */
    brim.main = function () {
        var mainStyle = player.main.style;

        device = brim.getDevice();

        mainStyle.position = 'absolute';
        mainStyle.zIndex = 10;
    
        mainStyle.top = (window.scrollY + magicOffset) + 'px';
        mainStyle.left = 0;
        mainStyle.width = config.viewportWidth + 'px';
        mainStyle.height = device.maximumAvailableHeight + 'px';
    };

    config = config || {};

    config.viewportWidth = brim.getViewPortWidth();

    if (!config.viewportWidth) {
        throw new Error('Unknown viewport width.');
    }

    config.debug = config.debug || false;

    sister = Sister();
    player.treadmill = document.querySelector('#brim-treadmill');
    player.main = document.querySelector('#brim-main');
    player.mask = document.querySelector('#brim-mask');
    
    brim.main();

    // On page load, isMAH is always false. This makes the documentHeight scrollable.
    brim.treadmill();
    // Show mask on page load.
    // This will cause flickering if page is loaded in MAH.
    // There is no way to know if the page is loaded in MAH until the resize event.
    // There is no way to know if the resize event will fire (Catch-22).
    // If brim.mask() invocation is wrapped in setImmediate(), then flickering
    // will be as issue when page is loaded not in MAH.
    brim.mask();

    brim.debug('load');

    brim.setupEventListeners();
};


global.gajus = global.gajus || {};
global.gajus.Brim = Brim;

module.exports = Brim;