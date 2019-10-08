'use strict';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var inBrowser = typeof window !== 'undefined';
var debounce = function debounce(callback, wait) {
  var timeout; // eslint-disable-next-line func-names

  return function () {
    var context = this; // eslint-disable-next-line prefer-rest-params

    var args = arguments; // eslint-disable-next-line func-names

    var later = function later() {
      timeout = null;
      callback.apply(context, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
var parseSemver = function parseSemver(version) {
  var fragments = version.split('.');
  var major = parseInt(fragments[0], 10);
  return {
    major: typeof major === 'number' ? major : 1,
    minor: parseInt(fragments[1], 10) || 0,
    patch: parseInt(fragments[2], 10) || 0
  };
};
var checkVersion = function checkVersion(current, required) {
  var currentVersion = parseSemver(current);
  var requiredVersion = parseSemver(required);
  return currentVersion.major > requiredVersion.major || currentVersion.major === requiredVersion.major && currentVersion.minor > requiredVersion.minor || currentVersion.major === requiredVersion.major && currentVersion.minor === requiredVersion.minor && currentVersion.patch >= requiredVersion.patch;
};

var bootstrap = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
};

var bulma = {
  tablet: 769,
  desktop: 1024,
  widescreen: 1216,
  fullhd: 1408
};

var foundation = {
  medium: 640,
  large: 1024
};

var semantic = {
  tablet: 768,
  computer: 992,
  large: 1201
};

var tailwind = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
};

var grids = {
  bootstrap: bootstrap,
  bulma: bulma,
  foundation: foundation,
  'semantic-ui': semantic,
  tailwind: tailwind
};

var Vue;
var MIN_VUE_VERSION = '2.6.0'; // GoogleBot default screen size

var DEFAULT_WIDTH = 410;
var DEFAULT_HEIGHT = 730;
var DEFAULT_FRAMEWORK = 'tailwind';
var DEBOUNCE_MS = 100;
var RESERVED_KEYS = ['width', 'height', 'touch', 'portrait', 'landscape'];
var Plugin =
/*#__PURE__*/
function () {
  /**
   * Class constructor
   *
   * @param {object | string} breakpoints
   */
  function Plugin() {
    var breakpoints = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    _classCallCheck(this, Plugin);

    this.callbacks = {};
    this.createScreen(Plugin.parseBreakpoints(breakpoints));
    this.init();
  }
  /**
   * Parse the breakpoints parameter and return a Breakpoint object
   *
   * @param {object | string} breakpoints
   * @returns {object}
   */


  _createClass(Plugin, [{
    key: "init",

    /**
     * Init the reactive object
     */
    value: function init() {
      this.attachResize();
      this.setScreenSize();
      this.checkTouch();
    }
    /**
     * Attach a listener to the window resize event
     */

  }, {
    key: "attachResize",
    value: function attachResize() {
      if (inBrowser) {
        window.addEventListener('resize', debounce(this.setScreenSize.bind(this), DEBOUNCE_MS));
      }
    }
    /**
     * Set the screen size
     */

  }, {
    key: "setScreenSize",
    value: function setScreenSize() {
      if (inBrowser) {
        this.screen.width = window.innerWidth;
        this.screen.height = window.innerHeight;
        this.runCallbacks();
      }
    }
    /**
     * Run callbacks
     */

  }, {
    key: "runCallbacks",
    value: function runCallbacks() {
      var _this = this;

      Object.keys(this.callbacks).forEach(function (key) {
        _this.screen[key] = _this.callbacks[key].call(null, _this.screen);
      });
    }
    /**
     * Check touch screen capability
     */

  }, {
    key: "checkTouch",
    value: function checkTouch() {
      if (inBrowser) {
        this.screen.touch = 'ontouchstart' in window;
      }
    }
    /**
     * Create the reactive object
     *
     * @param {object} breakpoints
     */

  }, {
    key: "createScreen",
    value: function createScreen(breakpoints) {
      var _this2 = this;

      this.screen = Vue.observable({
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        touch: true,
        portrait: true,
        landscape: false
      });
      Object.keys(breakpoints).forEach(function (name) {
        if (RESERVED_KEYS.indexOf(name) >= 0) {
          throw new Error("Invalid breakpoint name: \"".concat(name, "\". This key is reserved."));
        }

        Vue.set(_this2.screen, name, false);
      });

      if (inBrowser) {
        this.initMediaQueries(breakpoints);
      }
    }
    /**
     * Initialize the media queries to test
     *
     * @param {object} breakpoints
     */

  }, {
    key: "initMediaQueries",
    value: function initMediaQueries(breakpoints) {
      var _this3 = this;

      Object.keys(breakpoints).forEach(function (name) {
        var width = breakpoints[name];
        var w = null;

        if (typeof width === 'function') {
          _this3.callbacks[name] = width;
        } else if (typeof width === 'number') {
          w = "".concat(width, "px");
        } else {
          w = width;
        }

        if (w) {
          var _query = window.matchMedia("(min-width: ".concat(w, ")"));

          _query.addListener(function (e) {
            return _this3.mediaStateChanged(name, e.matches);
          });

          _this3.mediaStateChanged(name, _query.matches);
        }
      });
      var query = window.matchMedia('(orientation: portrait)');
      query.addListener(function (e) {
        _this3.mediaStateChanged('portrait', e.matches);

        _this3.mediaStateChanged('landscape', !e.matches);
      });
      this.mediaStateChanged('portrait', query.matches);
      this.mediaStateChanged('landscape', !query.matches);
    }
    /**
     * Set the media query state on the reactive object
     *
     * @param {string} name
     * @param {boolean} matches
     */

  }, {
    key: "mediaStateChanged",
    value: function mediaStateChanged(name, matches) {
      Vue.set(this.screen, name, matches);
    }
    /**
     * Install the plugin
     *
     * @param {Vue} vue
     * @param {object} options
     */

  }], [{
    key: "parseBreakpoints",
    value: function parseBreakpoints(breakpoints) {
      if (_typeof(breakpoints) === 'object') {
        if (breakpoints.extend) {
          var framework = breakpoints.extend.toString(); // eslint-disable-next-line no-param-reassign

          delete breakpoints.extend;
          return Object.assign({}, breakpoints, Plugin.getBreakpoints(framework));
        }

        return breakpoints;
      }

      return Plugin.getBreakpoints(breakpoints.toString());
    }
    /**
     * Get the breakpoints of one of the supported frameworks
     *
     * @param {string} framework
     * @returns {object}
     */

  }, {
    key: "getBreakpoints",
    value: function getBreakpoints() {
      var framework = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      if (!framework) {
        // eslint-disable-next-line no-param-reassign
        framework = DEFAULT_FRAMEWORK;
      }

      if (!grids[framework]) {
        throw new Error("Cannot find grid breakpoints for framework \"".concat(framework, "\""));
      }

      return grids[framework];
    }
  }, {
    key: "install",
    value: function install(vue, options) {
      Vue = vue;

      if (!checkVersion(Vue.version, MIN_VUE_VERSION)) {
        throw Error("VueScreen requires at least Vue ".concat(MIN_VUE_VERSION));
      } // eslint-disable-next-line no-param-reassign


      Vue.prototype.$screen = new Plugin(options).screen;
    }
  }]);

  return Plugin;
}();

if (inBrowser && window.Vue) {
  window.Vue.use(Plugin);
}

module.exports = Plugin;