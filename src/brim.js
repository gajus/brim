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