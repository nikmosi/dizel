/* masalygin 0.0.1 */
'use strict';

(function(factory) {

	if (typeof define === 'function' && define.amd) {

		define(['jquery'], factory);

	} else {

		factory(jQuery);

	}

})(function($) {

	$.s3Eventable = function(obj) {

		obj = obj || {};
		obj._events = {};
		obj._lock = false;

		obj.on = function(type, func) {

			if (!obj._lock) {

				if ($.type(type) === 'object')  {

					$.each(type, function(key, value) {
						obj.on(key, value);
					});

					return this;
				}

				if (!this._events[type]) {
					this._events[type] = $.Callbacks();
				}

				this._events[type].add(func);

			}

			return this;
		};

		obj.off = function(type, func) {

			if (this._events[type] && !obj._lock) {
				func ? this._events[type].remove(func) : this._events[type].empty();
			}

			return this;
		};

		obj.trigger  = function(type) {
			if (this._events[type]) {
				this._events[type].fireWith(obj, [].slice.call(arguments, 1));
			}
			return this;
		};

		obj.lock = function() {
			obj._lock = true;
		};

		obj.unlock = function() {
			obj._lock = false;
		};

		return obj;

	};

});