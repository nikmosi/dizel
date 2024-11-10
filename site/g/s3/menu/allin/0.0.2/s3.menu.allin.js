/* masalygin 0.0.2 */
'use strict';

(function (factory) {

	if (typeof define === 'function' && define.amd) {

		define(['jquery', 's3/misc/math/0.0.1/s3.math', 's3/misc/eventable/0.0.1/s3.eventable'], factory);

	} else {

		factory(jQuery, s3Math);

	}

})(function ($, math) {

	function debug(menu) {

		var points = {};

		$.each(['a', 'b', 'c'], function (key, value) {

			var attr = {
				id: 's3-menu-allin-point-' + value,
				'class': 's3-menu-allin-point',
				html: value
			};

			points[value] = $('<div></div>', attr);

			$(document.body).append(points[value]);

		});

		setInterval(function () {

			$.each(points, function (name, point) {

				point.css({
					left: menu.triangle[name].x,
					top: menu.triangle[name].y
				});

			});

		}, 0);

	}

	var popupEvents = {

		activate: function (params) {

			var $siblings = params.$item.siblings();
			params.$item.addClass(this.settings.activeClass);
			$siblings.removeClass(this.settings.activeClass);
			this.hide($siblings.children('ul'));
			this.show(params.$sub);
			this.hide(params.$sub.find('ul'));

		},

		deactivate: function (params, c) {

			params.$item.removeClass(this.settings.activeClass);
			this.hide(params.$sub);

		},

		exit: function () {

			this.$li.removeClass(this.settings.activeClass);
			this.hide(this.$ul);

		}

	};


	function dropdownPlus(menu, direction) {

		var $el = menu.$el.children('li');

		var dropDownMenu = $.extend({}, menu, {
			$el: $el
		});

		$.s3MenuAllInTypes.dropdown(dropDownMenu, '> a');

		$el.children('ul').s3MenuAllIn($.extend({}, menu.settings, {type: direction}));

	}

	$.s3MenuAllInTypes = {

		bottom: function (menu) {

			menu.on('activate', function (params) {

				var winWidth = $(window).width();

				var $sub = params.$sub;
				var $item = params.$item;
				var isHidden = $sub.is(':hidden');

				$sub.removeClass(this.settings.revertClass);
				$sub.show();

				var iPos = $item.position();
				var iOffset = $item.offset();
				var iWidth = $item.width();
				var sWidth = $sub.width();
				var sPos = {};

				var b = this.triangle.b;
				var c = this.triangle.c;

				var left;
				var revert = false;

				if (params.level === 1) {

					left = iOffset.left + sWidth;

					if (left > winWidth) {

						sPos.left = iPos.left + iWidth - sWidth;

					} else {

						sPos.left = iPos.left;

					}

					sPos.top = iPos.top + $item.height();

				} else {

					left = iOffset.left + iWidth + sWidth;

					if (left > winWidth) {

						sPos.left = iPos.left - sWidth;
						revert = true;

					} else {

						sPos.left = iPos.left + iWidth;

					}

					sPos.top = iPos.top;

				}

				$sub.css(sPos);

				var sOffset = $sub.offset();

				if (params.level === 1) {

					b.y = c.y = sOffset.top;
					b.x = sOffset.left;
					c.x = sOffset.left + sWidth;

				} else {

					b.y = sOffset.top;
					c.y = sOffset.top + $sub.height();
					b.x = c.x = revert ? sOffset.left + sWidth : sOffset.left;

				}

				if (revert) {
					$sub.addClass(this.settings.revertClass);
				}

				if (isHidden) {
					$sub.hide();
				}


			});

			menu.on(popupEvents);

		},

		top: function (menu) {

			menu.on('activate', function (params) {

				var winWidth = $(window).width();

				var $sub = params.$sub;
				var $item = params.$item;
				var isHidden = $sub.is(':hidden');

				$sub.removeClass(this.settings.revertClass);
				$sub.show();

				var iPos = $item.position();
				var iOffset = $item.offset();
				var iWidth = $item.width();
				var iHeight = $item.height();
				var sWidth = $sub.width();
				var sHeight = $sub.height();
				var sPos = {};

				var b = this.triangle.b;
				var c = this.triangle.c;

				var left;
				var revert = false;

				if (params.level === 1) {

					left = iOffset.left + sWidth;

					if (left > winWidth) {

						sPos.left = iPos.left + iWidth - sWidth;

					} else {

						sPos.left = iPos.left;

					}

					sPos.top = iPos.top - sHeight;

				} else {

					left = iOffset.left + iWidth + sWidth;

					if (left > winWidth) {

						sPos.left = iPos.left - sWidth;
						revert = true;

					} else {

						sPos.left = iPos.left + iWidth;

					}

					sPos.top = iPos.top - sHeight + iHeight;

				}

				$sub.css(sPos);

				var sOffset = $sub.offset();

				if (params.level === 1) {

					b.y = c.y = sOffset.top + sHeight;
					b.x = sOffset.left;
					c.x = sOffset.left + sWidth;

				} else {

					b.y = sOffset.top;
					c.y = sOffset.top + $sub.height();
					b.x = c.x = revert ? sOffset.left + sWidth : sOffset.left;

				}

				if (revert) {
					$sub.addClass(this.settings.revertClass);
				}

				if (isHidden) {
					$sub.hide();
				}

			});

			menu.on(popupEvents);

		},

		right: function (menu) {

			menu.on('activate', function (params) {

				var winWidth = $(window).width();

				var $sub = params.$sub;
				var $item = params.$item;
				var isHidden = $sub.is(':hidden');

				$sub.show();

				var iPos = $item.position();
				var iOffset = $item.offset();
				var iWidth = $item.width();
				var sWidth = $sub.width();
				var sPos = {};

				var b = this.triangle.b;
				var c = this.triangle.c;

				var left;
				var revert = false;

				left = iOffset.left + iWidth + sWidth;

				sPos.top = iPos.top;

				if (left > winWidth) {

					sPos.left = iPos.left - sWidth;
					revert = true;

				} else {

					sPos.left = iPos.left + iWidth;

				}

				$sub.css(sPos);

				var sOffset = $sub.offset();

				b.y = sOffset.top;
				c.y = sOffset.top + $sub.height();
				b.x = c.x = revert ? sOffset.left + sWidth : sOffset.left;

				if (isHidden) {
					$sub.hide();
				}


			});

			menu.on(popupEvents);

		},

		left: function (menu) {

			menu.on('activate', function (params) {

				var $sub = params.$sub;
				var $item = params.$item;
				var isHidden = $sub.is(':hidden');

				$sub.show();

				var iPos = $item.position();
				var iOffset = $item.offset();
				var iWidth = $item.width();
				var sWidth = $sub.width();
				var sPos = {};

				var b = this.triangle.b;
				var c = this.triangle.c;

				var left;
				var revert = false;

				left = iOffset.left - sWidth;

				sPos.top = iPos.top;

				if (left < 0) {

					sPos.left = iPos.left + sWidth;
					revert = true;

				} else {

					sPos.left = iPos.left - iWidth;

				}

				$sub.css(sPos);

				var sOffset = $sub.offset();

				b.y = sOffset.top;
				c.y = sOffset.top + $sub.height();
				b.x = c.x = revert ? sOffset.left : sOffset.left + sWidth;

				if (isHidden) {
					$sub.hide();
				}

			});

			menu.on(popupEvents);

		},

		dropdown: function (menu, selector) {

			selector = selector || 'a';

			menu.$el.on({

				click: function () {

					var $a = $(this);
					var $item = $a.closest('li');
					var $sub = $item.children('ul');

					if (!$sub.length) {
						return true;
					}

					if ($sub.is(':animated')) {
						return false;
					}

					if ($sub.is(':hidden')) {

						menu.show($sub, function () {
							$a.addClass(menu.settings.openClass);
						});

					} else {

						menu.hide($sub, function () {
							$a.removeClass(menu.settings.openClass);
						});

					}

					return false;

				}

			}, selector);

		},

		'dropdown+left': function (menu) {

			dropdownPlus(menu, 'left');

		},

		'dropdown+right': function(menu) {

			dropdownPlus(menu, 'right');

		}

	};

	$.fn.s3MenuAllIn = function (settings) {

		settings = $.extend({

			deviation: 10,
			type: 'right',
			exitTimeout: 250,
			activateTimeout: 0,
			deactivateTimeout: 100,
			exclude: 'ul',
			debug: false,
			showFn: $.fn.show,
			showTime: 0,
			hideFn: $.fn.hide,
			hideTime: 0,
			activeClass: 's3-menu-allin-active',
			hasClass: 's3-menu-allin-has',
			openClass: 's3-menu-allin-open',
			revertClass: 's3-menu-allin-revert'

		}, settings);

		return this.each(function () {

			var $el = $(this);

			var menu = $.s3Eventable({

				settings: settings,
				triangle: new math.Triangle({}, {}, {}),
				$el: $el,
				$li: $el.find('li'),
				$ul: $el.find('ul'),
				isBlocked: false,
				isExit: true,
				active: {}

			});

			if (settings.hasClass) {
				menu.$ul.parent('li').addClass(settings.hasClass);
			}

			$.each(['show', 'hide'], function (key, value) {

				menu[value] = function ($el, callback) {

					callback = callback || $.noop;

					if ($el.length) {

						$el.stop(true, true);
						this.settings[value + 'Fn'].call($el, this.settings[value + 'Time'], callback);

					}

				};

			});

			if (settings.debug) {
				debug(menu);
			}


			$(document).on('mousemove', function (e) {

				if (menu.isBlocked) {

					var $item = $(e.target).not(settings.exclude).closest('li');
					var isSub = false;
					var isMenu = false;

					if ($item.get(0)) {

						if (menu.active.$sub) {
							isSub = $item.closest('ul').get(0) === menu.active.$sub.get(0);
						}

						isMenu = !!menu.$el.has($item).length;

					}

					var hasPoint = menu.triangle.hasPoint({x: e.pageX, y: e.pageY}, settings.deviation);

					if (isMenu) {

						menu.isExit = false;
						clearTimeout(menu.exitTimeoutId);

					}

					if (isSub) {

						menu.isBlocked = false;
						clearTimeout(menu.deactivateTimeoutId);
						$item.trigger('mouseenter');

					} else if (isMenu) {

						clearTimeout(menu.deactivateTimeoutId);

						if (hasPoint) {

							(function(params) {

								menu.deactivateTimeoutId = setTimeout(function () {

									menu.isBlocked = false;
									menu.trigger('deactivate', params, 1);
									$item.trigger('mouseenter');

								}, settings.deactivateTimeout);

							})($.extend({}, menu.active));

						} else {

							menu.isBlocked = false;
							menu.trigger('deactivate', $.extend({}, menu.active), 2);
							$item.trigger('mouseenter');

						}

					} else {

						if (hasPoint) {

							menu.isExit = false;

							clearTimeout(menu.exitTimeoutId);

							menu.exitTimeoutId = setTimeout(function () {

								menu.isExit = false;
								menu.trigger('exit');

							}, settings.deactivateTimeout);

						} else {

							if (!menu.isExit) {

								menu.isExit = true;

								clearTimeout(menu.exitTimeoutId);
								menu.exitTimeoutId = setTimeout(function () {

									menu.isExit = false;
									menu.trigger('exit');

								}, settings.exitTimeout);

							}

						}

					}

				}

			});

			menu.$el.on({

				mouseenter: function (e) {

					e.stopPropagation();
					menu.isExit = false;

					if (menu.isBlocked) {
						return;
					}

					var $item = $(this);
					
					if ($item.hasClass('dropdown-wrap')) return;

					var $sub = $item.children('ul');

					if (!$sub.length) {
						return;
					}

					var $parents = $sub.parentsUntil(menu.$el, 'li');

					(function(params) {

						clearTimeout(menu.activateTimeoutId);
						menu.activateTimeoutId = setTimeout(function () {
							if (!menu.isExit) {
								menu.trigger('activate', params);
							}
						}, menu.settings.activateTimeout);

					})({
						$item: $item,
						$sub: $sub,
						$parents: $parents,
						$ul: $item.parent(),
						level: $parents.length
					});

				},

				mouseleave: function (e) {

					e.stopPropagation();

					if (!menu.isBlocked) {
						menu.triangle.a.x = e.pageX;
						menu.triangle.a.y = e.pageY;
						menu.isBlocked = true;
					}

					var $item = $(this);
					var $sub = $item.children('ul');
					var $parents = $sub.parentsUntil(menu.$el, 'li');

					menu.active = {
						$item: $item,
						$sub: $sub,
						$parents: $parents,
						$ul: $item.parent(),
						level: $parents.length
					};

				}

			}, 'li');

			$.s3MenuAllInTypes[settings.type](menu);

		});

	};

});