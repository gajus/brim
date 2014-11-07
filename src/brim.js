var Brim,
    Device,
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

Device = function Device () {
    var device,
        viewport,
        MAHL,
        MAHP,
        screenWidth,
        screenHeight;

    if (!(this instanceof Device)) {
        return new Device();
    }

    device = this;

    /**
     * Parse the <meta> tag to learn the viewport width/height.
     *
     * @see http://stackoverflow.com/questions/26779744/how-to-read-the-property-values-of-the-viewport-meta-tag
     * @return {Object}
     */
    device.readViewportMeta = function () {
        var viewportElement = document.querySelector('meta[name="viewport"]'),
            viewportElementProperties = {},
            viewport = {};

        if (!viewportElement) {
            return viewport;
        }

        viewportElement.content.split(',').forEach(function (property) {
            property = property.split('=');
            viewportElementProperties[property[0]] = property[1];
        });

        if (viewportElementProperties.width && viewportElementProperties.width !== 'device-width') {
            viewport.width = parseInt(viewportElementProperties.width, 10);
        }

        if (viewportElementProperties.height && viewportElementProperties.height !== 'device-height') {
            viewport.height = parseInt(viewportElementProperties.height, 10);
        }

        return viewport;
    };

    /**
     * @return {Number}
     */
    device.getViewportWidth = function () {
        var viewport = device.readViewportMeta(),
            viewportWidth = viewport.width;

        if (!viewport.width) {
            viewportWidth = global.screen.width;
        }

        return viewportWidth;
    };

    /**
     * Viewport height relative to the orietation and taking into consideration
     * that scale will change when in different orientation (See Amund Midtskog's answer on SOF).
     * 
     * @see http://stackoverflow.com/questions/26799330/why-does-window-innerheight-return-180-when-in-horizontal-orientation/26799896
     * @return {Number}
     */
    device.getViewportHeight = function () {
        var viewportWidth = device.getViewportWidth(),
            viewportHeight;

        // See somethinghere's answer on SOF.
        /*if (device.getOrientation() === 'vertical') {
            viewportHeight = (viewportWidth / global.screen.width) * global.screen.height;
        } else {
            viewportHeight = (viewportWidth /  (global.screen.height) ) * global.screen.width;
        }

        return ~~viewportHeight;*/

        if (device.getOrientation() === 'vertical') {
            return global.screen.height;
        } else {
            return global.screen.width;
        }
    };

    device.getOrientation = function () {
        return global.orientation === 0 ? 'vertical' : 'horizontal';
    };

    /**
     * Get the chrome height of the screen in the fullscreen state.
     *
     * @return {Number}
     */
    device.getChromeHeight = function () {
        var library,
            j;

        if (device.getOrientation() === 'vertical') {
            // This value is calculated when window is in fullscreen (screen.height - window.innerHeight).
            // There is no way to calculate this value without entering the fullscreen first.
            // @see http://stackoverflow.com/questions/26801943/how-to-get-the-window-size-of-fullscreen-view-when-not-in-fullscreen

            // Chrome size is either 40 or 39, depending on the device.


            // [name, screen.width, screen.height, screen.height - window.innerHeight, devicePixelRatio]

            /*library = [
                ['iPhone 4s',       320, 480, 39],
                ['iphone 5',        320, 568, 39],
                ['iphone 5s',       320, 568, 39],
                ['iPhone 6',        375, 667, 39],
                ['iPhone 6 plus',   414, 736, 40],
                ['iPad 2',          768, 1024, 40],
                ['iPad retina',     768, 1024, 39],
                ['iPad air',        768, 1024, 39]
            ];*/

            // Until I figure out what determines if it is 39 or 40, it will not work on iPad 2 and iPhone 6.

            return 39;
        } else {
            return 0;
        }

        /*if (device.getOrientation() === 'vertical') {
            console.log( 'chrome',
                global.screen.height,
                global.screen.availHeight,
                global.document.documentElement.clientHeight
            );
        }*/
    };

    /**
     * Is window height the Maximum Available Height (MAH).
     * 
     * @return {Boolean}
     */
    device.isMAH = function () {
        // console.log('isMAH', device.getMAH(), global.innerHeight);

        return device.getMAH() === global.innerHeight;
    };

    /**
     * The Maximum Available Height (MAH) in the current orientation.
     * 
     * @return {Number}
     */
    device.getMAH = function () {
        return device.getViewportHeight() - device.getChromeHeight();
    };
};

global.gajus = global.gajus || {};
global.gajus.Brim = Brim;

module.exports = Brim;