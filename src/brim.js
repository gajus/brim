var Brim,
    Sister = require('sister');

Brim = function Brim (config) {
    var brim,
        player = {},
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

    /**
     *
     */
    brim._setupDOMEventListeners = function () {
        viewport.on('orientationchangeend', function () {
            brim._treadmill();
            brim._main();
            brim._mask();
        });

        viewport.on('viewchange', function (e) {
            brim._main();
            brim._mask();

            eventEmitter.trigger('viewchange', e);
        });

        // Disable window scrolling when in minimal view.
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
     * Setting the offset ensures that "resize" event is triggered upon loading the page.
     * A large (somewhat arbitrary) offset ensures that the page view does not change after device orientation.
     *
     * @see http://stackoverflow.com/questions/26784456/how-to-get-window-height-when-in-fullscreen
     */
    brim._treadmill = function () {
        global.scrollTo(0, 1000);
    };

    /**
     * Sets the dimensions and position of the drag mask player. The mask is an overlay on top
     * of the treadmill and the main content.
     *
     * The mask is visible when view is full.
     */
    brim._mask = function () {
        if (viewport.isMinimalView()) {
            player.mask.style.display = 'none';
        } else {
            player.mask.style.display = 'block';

            player.mask.style.width = global.innerWidth + 'px';
            player.mask.style.height = (global.innerHeight * 2) + 'px';

            brim._repaintElement(player.mask);
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

        // Why make it such a large number?
        // Huge body height makes the size and position of the scrollbar fixed.
        treadmill.style.width = '1px';
        treadmill.style.height = '9999999999999999px';

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

    eventEmitter = Sister();

    brim.on = eventEmitter.on;

    player.treadmill = brim._makeTreadmill();
    player.mask = brim._makeMask();
    player.main = brim._makeMain();

    brim._setupDOMEventListeners();
};

global.gajus = global.gajus || {};
global.gajus.Brim = Brim;

module.exports = Brim;