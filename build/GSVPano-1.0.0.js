(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var value = require('es5-ext/object/valid-object')

  , hasOwnProperty = Object.prototype.hasOwnProperty;

module.exports = function (emitter/*, type*/) {
	var type = arguments[1], data;

	value(emitter);

	if (type !== undefined) {
		data = hasOwnProperty.call(emitter, '__ee__') && emitter.__ee__;
		if (!data) return;
		if (data[type]) delete data[type];
		return;
	}
	if (hasOwnProperty.call(emitter, '__ee__')) delete emitter.__ee__;
};

},{"es5-ext/object/valid-object":14}],2:[function(require,module,exports){
'use strict';

var d        = require('d')
  , callable = require('es5-ext/object/valid-callable')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

},{"d":3,"es5-ext/object/valid-callable":13}],3:[function(require,module,exports){
'use strict';

var assign        = require('es5-ext/object/assign')
  , normalizeOpts = require('es5-ext/object/normalize-options')
  , isCallable    = require('es5-ext/object/is-callable')
  , contains      = require('es5-ext/string/#/contains')

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":4,"es5-ext/object/is-callable":7,"es5-ext/object/normalize-options":12,"es5-ext/string/#/contains":16}],4:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.assign
	: require('./shim');

},{"./is-implemented":5,"./shim":6}],5:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

},{}],6:[function(require,module,exports){
'use strict';

var keys  = require('../keys')
  , value = require('../valid-value')

  , max = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, l = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try { dest[key] = src[key]; } catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":9,"../valid-value":15}],7:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };

},{}],8:[function(require,module,exports){
'use strict';

var map = { function: true, object: true };

module.exports = function (x) {
	return ((x != null) && map[typeof x]) || false;
};

},{}],9:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.keys
	: require('./shim');

},{"./is-implemented":10,"./shim":11}],10:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

},{}],11:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],12:[function(require,module,exports){
'use strict';

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

module.exports = function (options/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};

},{}],13:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],14:[function(require,module,exports){
'use strict';

var isObject = require('./is-object');

module.exports = function (value) {
	if (!isObject(value)) throw new TypeError(value + " is not an Object");
	return value;
};

},{"./is-object":8}],15:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],16:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? String.prototype.contains
	: require('./shim');

},{"./is-implemented":17,"./shim":18}],17:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

},{}],18:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],19:[function(require,module,exports){
(function (global){
// GSVPano.js
// Copyright (c) 2014 Heganoo
// https://github.com/heganoo/GSVPano

var eventEmitter = require('event-emitter');

/**
 * @module GSVPANO
 * @author Hegano
 * @author juampi92
 */
var GSVPANO = GSVPANO || {};


/**
 * Fetch URL. Use this parameter in case the URL stops working. At
 * the end of this string, the parameters &panoid, &x, &y, &zoom 
 * and the current timestamp are appended.
 * @property GSVPANO._url
 * @type {String}
 * @default 'http://maps.google.com/cbk?output=tile'
 */
// 'https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=tile&nbt&fover=2'
// 'https://cbks2.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=tile'

GSVPANO._url = 'http://maps.google.com/cbk?output=tile';

/**
 * Data Fetch URL. Use this parameter in case the URL stops working.
 * At the end of this string, the parameter &ll is appended.
 * @property GSVPANO._data_url
 * @type {String}
 * @default 'https://cbks0.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=polygon&it=1%3A1&rank=closest&radius=350'
 */
GSVPANO._data_url = 'https://cbks0.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=polygon&it=1%3A1&rank=closest&radius=350';

GSVPANO.Pano = require('./Pano');

/**
 * @class PanoLoader
 * @extends {EventEmitter}
 * @constructor
 * @param {Object} parameters
 * @param {Number} parameters.zoom Zoom (default 1)
 * @example
 *       var loader = GSVPANO.PanoLoader({ zoom: 3 });
 */
GSVPANO.PanoLoader = function(parameters) {
  'use strict';

  eventEmitter(this);

  var self = this,
    _parameters = parameters || {},
    _location,
    _zoom,
    _panoId,
    _panoClient = new google.maps.StreetViewService(),
    _count = 0,
    _total = 0,
    _canvas = document.createElement('canvas'),
    _ctx = _canvas.getContext('2d'),
    rotation = 0,
    pitch = 0,
    copyright = '';

  /**
   * @event panorama.data
   * @param {Pano} pano
   * @example
   *     loader.on('panorama.data', function(pano){
   *       console.log('Pano ' + pano.id + ' added');
   *     });
   */

  /**
   * @event panorama.nodata
   * @param {Google.Maps.LatLng} location
   * @param {Google.Maps.StreetViewStatus} status
   */

  /**
   * @event panorama.progress
   * @param {Number} p
   * @param {Pano} pano
   * @example
   *         loader.on('progress', function(p, pano) {
   *           console.log('Pano progress: ' + p + '%');
   *         });
   */
  var setProgress = function(pano, p) {
    self.emit('panorama.progress', p, pano);
  };
  /**
   * @event panorama.load
   * @param {Pano} pano
   * @example
   *     loader.on('panorama.load', function(pano){
   *       $container.append(pano.canvas);
   *     });
   */
  var handlePanoLoad = function(callback, pano) {
    self.emit('panorama.load', pano);
    if (callback) {
      callback(pano);
    }
  };

  /**
   * @event error
   * @param {String} message
   * @example
   *     loader.on('error', function(message){
   *       console.log(message)
   *     });
   */
  var throwError = function(message) {
    self.emit('error', message);
  };

  /**
   * Middle function for working with IDs.
   * @method loadData
   * @param {Google.Maps.Location} location
   * @deprecated Disabled right now
   */
  /*this.loadData = function(location) {
    var self = this;
    var url;

    //url = 'https://maps.google.com/cbk?output=json&hl=x-local&ll=' + location.lat() + ',' + location.lng() + '&cb_client=maps_sv&v=3';
    url = GSVPANO._data_url + '&ll=' + location.lat() + ',' + location.lng();

    var http_request = new XMLHttpRequest();
    http_request.open("GET", url, true);
    http_request.onreadystatechange = function() {
      if (http_request.readyState == 4 && http_request.status == 200) {
        var data = JSON.parse(http_request.responseText);
        // self.loadPano(location, data.result[0].id);
      }
    };
    http_request.send(null);
  };*/

  /**
   * Fires panorama.data, panorama.nodata
   * @method load
   * @param {Google.Maps.Location} location
   * @param {Function} callback
   * @example
   *         // Let the panorama.load event handle it's load
   *         loader.load(new google.maps.LatLng(lat, lng));
   * @example
   *         // Also handle the load individually
   *         loader.load(new google.maps.LatLng(lat, lng), function(pano){
   *           // This individual load has been completed
   *           container.append(pano.canvas);
   *         });
   */
  this.load = function(location, callback) {
    var self = this;

    _panoClient.getPanoramaByLocation(location, 50, function(result, status) {
      if (status === google.maps.StreetViewStatus.OK) {

        var pano = new GSVPANO.Pano({
            id: result.location.pano,
            rotation: result.tiles.centerHeading,
            pitch: result.tiles.originPitch,
            copyright: result.copyright,
            imageDate: result.imageDate,
            location: result.location,
            zoom: _zoom
          })
          .on('complete', handlePanoLoad.bind(self, callback))
          .on('progress', setProgress.bind(self, pano));

        pano.compose();
        self.emit('panorama.data', pano);
      } else {
        self.emit('panorama.nodata', location, status);
        throwError('Could not retrieve panorama for the following reason: ' + status);
      }
    });
  };

  /**
   * @method setZoom
   * @param {Number} z
   */
  this.setZoom = function(z) {
    _zoom = z;
  };

  // Default zoom.
  this.setZoom(_parameters.zoom || 1);

};

global.GSVPANO = module.exports = GSVPANO;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Pano":20,"event-emitter":2}],20:[function(require,module,exports){
/**
 * @module GSVPANO
 */

var eventEmitter = require('event-emitter');
eventEmitter.alloff = require('event-emitter/all-off');

/**
 * One single Panoramic item
 * @class Pano
 * @author juampi92
 * @extends {EventEmitter}
 * @constructor
 * @param  {Object} params
 * @param {Hash} params.panoId
 * @param {Number} params.rotation (on degrees)
 * @param {Number} params.pitch
 * @param {Google.Maps.LatLng} params.location
 * @param {String} params.copyright
 * @param {Date} params.imageDate
 * @example
 *         var pano = new GSVPANO.Pano({
 *           id: panoId,
 *           rotation: rotation,
 *           pitch: pitch,
 *           location: location,
 *           imageDate: imageDate,
 *           copyright: copyright,
 *           zoom: zoom
 *         });
 */
var Pano = function(params) {
  eventEmitter(this);

  var _params = params || {};

  /**
   * @attribute id
   * @type {Hash}
   */
  this.id = params.id;
  /**
   * @attribute rotation
   * @type {Number}
   */

  this.setRotation(params.rotation || 0);
  /**
   * @attribute pitch
   * @type {Number}
   */
  this.pitch = params.pitch;
  /**
   * @attribute location
   * @type {Google.Maps.LatLng}
   */
  this.location = params.location;
  /**
   * @attribute imageDate
   * @type {Date}
   */
  this.imageDate = params.imageDate;
  /**
   * @attribute copyright
   * @type {String}
   */
  this.copyright = params.copyright;
  /**
   * @attribute zoom
   * @type {Number}
   */
  this.zoom = params.zoom;
  /**
   * @attribute canvas
   * @type {Canvas Element}
   * @default null
   */
  this.canvas = null;
  /**
   * @attribute _ctx
   * @type {Canvas 2d Context}
   * @default null
   */
  this._ctx = null;
  /**
   * @attribute _loaded
   * @type {Boolean}
   */
  this._loaded = false;
};

/**
 * Saves rotation. Input in degrees
 * @method setRotation
 * @param  {Number} deg
 * @chainable
 */
Pano.prototype.setRotation = function(deg) {
  this.rotation = deg * Math.PI / 180.0;
  return this;
};

/**
 * @method initCanvas
 * @private
 */
Pano.prototype.initCanvas = function() {
  this.canvas = document.createElement('canvas');
  this._ctx = this.canvas.getContext('2d');

  var w = 416 * Math.pow(2, this.zoom),
    h = (416 * Math.pow(2, this.zoom - 1));
  this.canvas.width = w;
  this.canvas.height = h;
  // this._ctx.translate( this.canvas.width, 0 );
  // this._ctx.scale( -1, 1 );
};

/**
 * Progress notification
 * @event progress
 * @param  {Number} p
 * @chainable
 * @example
 *         pano.on('progress', function(p) {
 *           console.log('Pano download progress: ' + p + '%');
 *         });
 */
/**
 * Complete notification
 * @event complete
 * @param  {Pano} pano
 * @chainable
 * @example
 *         pano.on('complete', function(p) {
 *           console.log('Pano completed progress: ' + p + '%');
 *         });
 */
/**
 * Will fire 'callback' when completed
 * @method compose
 * @param {Hash} panoId
 * @chainable
 * @example
 *         var pano = new Pano(...);
 *         pano.compose();
 */
Pano.prototype.compose = function() {
  this.initCanvas();

  var w = (this.zoom == 3) ? 7 : Math.pow(2, this.zoom),
    h = Math.pow(2, this.zoom - 1),
    url, x, y;

  this._count = 0;
  this._total = w * h;

  // Get the tiles
  for (y = 0; y < h; y++) {
    for (x = 0; x < w; x++) {
      this.createImage(x, y);
    }
  }
  return this;
};

/**
 * Creates an Image with the appropiate load callback
 * @method createImage
 * @param  {Number} x
 * @param  {Number} y
 * @private
 */
Pano.prototype.createImage = function(x, y) {
  var url = GSVPANO._url + '&panoid=' + this.id + '&zoom=' + this.zoom + '&x=' + x + '&y=' + y + '&' + Date.now(),
    img = new Image();

  img.addEventListener('load', this.composeFromTile.bind(this, x, y, img));
  img.crossOrigin = '';
  img.src = url;
};

/**
 * @method composeFromTile
 * @param {Number} x
 * @param {Number} y
 * @param {Image} texture
 * @private
 */
Pano.prototype.composeFromTile = function(x, y, texture) {
  // Complete this section of the frame
  this._ctx.drawImage(texture, x * 512, y * 512);
  this._count++;

  var p = Math.round(this._count * 100 / this._total);
  this.emit('progress', p);

  // If finished
  if (this._count === this._total) {
    // Done loading
    this._loaded = true;
    // Trigger complete event
    this.emit('complete', this);
    // Remove all events
    eventEmitter.alloff(this);
  }
};

module.exports = Pano;
},{"event-emitter":2,"event-emitter/all-off":1}]},{},[19]);
