var s3LP = {
	init: function(options) {
		var self = this;
		if (options){
			this.is_cms = options.is_cms ? true : false;
		}
		this.initForms();

		lp_init($('body'));

		self.popupForm();
		
		if (s3LP.page_blocking) {
			self.pageBlocking();
		}
		
		if ($('body').find('._lp-image-container').length) {
			if (!window.hasOwnProperty('img_convert_cache')) {
				window.img_convert_cache = {};
			}
			var debounce = (function () {
				return function (fn, time) {
					var timer, func;
					func = function() {
						var args = [].slice.call(arguments, 0);
						window.clearTimeout(timer);
						timer = window.setTimeout(function () {
							window.requestAnimationFrame && window.requestAnimationFrame(function() {
								fn.apply(null, args);
							}) || fn.apply(null, args);
						}, time)
					};
					return func;
				}
			}());
			self.convertImages($('body'));
			$(window).on('resize', debounce(function() {
				self.convertImages($('body'));
			}, 200));
		}
	},

	pageBlocking: function() {
		$('html, body').css({
			'overflow': 'hidden',
			'height': '100%'
		});
		$('<div />', {
			'class' : 'page-blocked'
		}).appendTo($('body'));
		
		$('.page-blocked').css({
			'background': 'rgba(0,0,0,.8)',
			'position': 'absolute',
			'left': 0,
			'right': 0,
			'bottom': 0,
			'top': 0,
			'z-index': 100000,
			'color': '#fff',
			'font-size': '28px',
			'display': 'flex',
			'align-items': 'center',
			'flex-direction': 'column',
			'padding': '10px',
			'text-align': 'center',
			'line-height':'1.5',
			'align-items': 'center',
			'justify-content': 'center'
		}).append('<b>Страница заблокирована</b><div style="font-size: 18px;">обратитесь в техническую поддержку</div>');

	},

	initForms: function(parent) {
		var self = this;
		if (!parent) parent = document;
		if (!$(parent).is('[data-api-url][data-api-type=form]')) {
			parent = $(parent).find('[data-api-url][data-api-type=form]');
		}

		$(parent).each(function() {
			var obj = $(this);
			var objParent = obj.closest('[data-block-layout]');
			var form = obj.is("form") ? obj : obj.find("form");

			if (self.is_cms) {
				form.attr('title', JS_LP_FORM_NOTE).tooltip();
				form.submit(function() {
					return false;
				});
			} else if (!form.data('anketa2')) {
				form.submit(function(event) {
				
					/*var inputPhone = $(form).find('input[data-validator="phone"]'),
						inputPhonesError = false;
				
					inputPhone.each(function(i){
						if ($(this).val() != '' || $(this).parents('.tpl-field').hasClass('field-required')) {
							var validateField = s3LP.validateFormFields($(this).val(), "phone");
							if (!validateField.valid) {
								inputPhonesError = true;
								$(this).parents('.tpl-field').addClass('field-error');
							}
						}
					});
					
					if (inputPhonesError) {
						return false;
					}*/
					
					$.post(obj.data('api-url'), form.serialize(), function(response) {
						if (response.result.success && response.result.redirect_url) {
							document.location.href = response.result.redirect_url.replace(/&amp;/g, '&');
						} else {
							if (response.result.html) {

								var replacement = $(response.result.html.replace(/[\r\n]/g, '').replace(/<script[^>]*>.*?<\/script>/g, ''));
								
								var uploaders_inits = '';
								var scripts = response.result.html.match(/<script[^>]*>[^<]*newSWFU[^<]*<\/script>/gm);
								if (scripts) {
									for (var i = 0; i < scripts.length; i++) {
										uploaders_inits += scripts[i].replace(/<script[^>]*>([^<]+)<\/script>/, "$1");
									}
								}

								if (!$(replacement).is('[data-api-url][data-api-type=form]')) {
									replacement = $(replacement).find('[data-api-url][data-api-type=form]');
								}
								
								obj.replaceWith(replacement);
								
								if (response.result && response.result.success){
									replacement.parent().find(`[data-path="title"]`).parent().remove();
								}
								
								if (typeof self.successForm == 'function' && response.result.success) {
									self.successForm(objParent);
								}
								
								var inputMask = $('input[data-mask="mask"]');
								if (inputMask.length) {
									$.getScript('/g/libs/jquery-maskedinput/1.3.1//jquery.maskedinput.min.js', function() {
										inputMask.mask("+7 (999) 999-99-99");
									});
								}
								
								var inputDates = $('input[data-calendar="calendar"], input[data-calendar="calendar-interval"]');
								
								if (inputDates.length) {
									$.getScript('/g/s3/lp/js//datepicker.min.js', function() {
										var inputCalender = $('input[data-calendar="calendar"]'),
											inputCalenderInterval = $('input[data-calendar="calendar-interval"]');
											
										if (typeof lp_template.datepicker == 'function') {
											lp_template.datepicker.call(inputCalender)
										}
										
										if (typeof lp_template.datepicker_range == 'function') {
											lp_template.datepicker_range.call(inputCalenderInterval)
										}
									});
								}
			
								function inituploaders() {
									if (uploaders_inits) {
										eval(uploaders_inits);
									}
								}
								
								var $captcha = replacement.find('input[name=_cn]');
								if ($captcha.length) {
									$.getScript('http://captcha.oml.ru/static/captcha.js?2', function() {
										var $d = replacement.find("[id^=s3_captcha_cn]");
										mgCaptcha.draw("/my/s3/captcha/get.php", ($d.length ? $d.get(0) : null));
									});
								}
								
								self.initForms(replacement);
								
								var $uploads = obj.find('input[type="hidden"][id^="hidUploadField"]');
								if ($uploads.length) {
									if (!!$uploads.eq(0).closest('form').data('new-inited-upload')) {
										var $newUploads = replacement.find('input[type="hidden"][id^="hidUploadField"]');
										$newUploads.each(function(){
											var thisAttr = $(this).data('init-upload');
											newSWFU.apply(void 0, thisAttr);
											
										});
									} else {
										if (typeof window['newSWFU'] !== 'function') {
											$.getScript('/shared/s3/plupload/plupload.all.pack.js', function() {
												inituploaders();
											});
										} else {
											inituploaders();
										}
									}
								}
							}
						}
					});
					event.preventDefault();
				});
			}
		})
	},

	validateFormFields: function(value, type, options) {
		if (value == undefined) {
			console.log("Error: " + type + " - value is undefined");
			return false;
		}
		
		var settings = options || {
			canBeEmpty: false,
			messages: {
				EMPTY_FIELD: "Заполните поле",
				WRONG_EMAIL: "Некорректный E-mail",
				WRONG_SITE: "Некорректный адрес сайта",
				WRONG_PHONE: "Некорректный номер",
				TOO_SHORT_PHONE: "Короткий номер"
			}
		};

		var reg = null;
		var response = {
			valid: true,
			message: '',
			empty: false
		};
		value = value.trim();
		
		switch (type) {
			case 'phone':
				reg = /^[\+\-\d\s\(\)]+$/i;
				response.message = settings.messages.WRONG_PHONE;
				break;

			case 'email':
				reg = /^.+@.+\..+$/i;
				response.message = settings.messages.WRONG_EMAIL;
				break;
			case 'site':
				reg = /^.+\..{2,}$/i;
				response.message = settings.messages.WRONG_SITE;
				break;
			default:
				reg = /.+/;
				response.message = settings.messages.EMPTY_FIELD;
				break;
		}
		response.empty = (value.length == 0);
		if (response.empty) {
			if (settings.canBeEmpty) {
				response.valid = true;
				return response;
			} else {
				response.valid = false;
				response.message = settings.messages.EMPTY_FIELD;
				return response;
			}
		}

		response.valid = reg.test(value);

		if (!response.valid) {
			return response;
		}	else if (type === 'phone') {
			var tmp = value.match(/\d/g);
			if (!tmp || tmp.length < 7) {           // кол-во цифр в строке.
				response.valid = false;
				response.message = settings.messages.TOO_SHORT_PHONE;
				return response;
			}
		}

		return response;
	},

	popupForm: function() {
		var $body = $('body'),
			$html = $('html'),
			self = this;

		$('<div class="lp-popup-wrapper js-popup-wrapper"><div class="lp-popup-overlay"></div><div class="lp-popup-inner js-popup-inner"></div></div>').appendTo($body);

		var $wrapper = $('.js-popup-wrapper'),
			$newBlock = null,
			$container = $wrapper.find('.js-popup-inner'),
			$readyPopup = $body.find('[data-popup-type="ready"]'),
			$inactionPopup = $body.find('[data-popup-type="inaction"]'),
			openedClass = '_opened';

		function popupTimer() {
			if ($readyPopup.length) {
				$readyPopup.each(function() {
					var $this = $(this);
					
					setTimeout(function(){
						if (!$wrapper.hasClass(openedClass) && !self.is_cms) {
							$newBlock = self.appendPopupForm($this, $container, $wrapper);
						}
					}, +$this.data('popup-time'))
				});
			}
		};
		
		popupTimer();
		
		if ($inactionPopup.length) {
			$inactionPopup.each(function() {
				var $this = $(this),
					thisTime = +$this.data('popup-time'),
					idleTimer = null,
					idleState = false;
					
				$(document).on('mousemove keydown scroll', function(){
					clearTimeout(idleTimer); // отменяем прежний временной отрезок
				
					if(idleState == true) return;
				
					idleState = false;
					
					idleTimer = setTimeout(function(){ 
						if (!$wrapper.hasClass(openedClass)) {
							$newBlock = self.appendPopupForm($this, $container, $wrapper);
							idleState = true; 
						};
					}, thisTime);
				});
				
				$(document).trigger('mousemove');
			});
		}

		$body.on('click', 'a[href^="popup:"]', function(e){
			e.preventDefault();
			
			var $thisBlock = $('#' + this.href.replace(':', ''));
			
			if ($thisBlock.length == 1) {
				if (!$wrapper.hasClass(openedClass)) {
					$newBlock = self.appendPopupForm($thisBlock, $container, $wrapper, $newBlock);
				}
			}

			if ($(this).closest('.lp-popup-wrapper').length != 0) {
	            $newBlock.appendTo($('body'));
	            $container.html('');
	            
	            var $thisBlock = $('#' + this.href.replace(':', ''));
	            
	            $newBlock = self.appendPopupForm($thisBlock, $container, $wrapper, $newBlock);
	        }
		});
		
		$container.on('click', '.js-close-popup', function(e) {
			e.preventDefault();
			
			$newBlock.appendTo($('body'));
			$newBlock = null;
			
			$container.html('');
			$wrapper.removeClass(openedClass);
			
			$html.css({
				overflow: 'auto'
			});


			/*if (!$wrapper.hasClass(openedClass)) {
	            popupTimer();
	        }*/
		});
		
		$(document).on('keyup', function(e){
			if (e.keyCode != 27) return;
			
			if ($newBlock) {
				$newBlock.appendTo($('body'));
				$newBlock = null;
			}
			
			$container.html('');
			$wrapper.removeClass(openedClass);
			
			$html.css({
				overflow: 'auto'
			});

			/*if (!$wrapper.hasClass(openedClass)) {
	            popupTimer();
	        }*/
		});
	},

	appendPopupForm: function($block, $container, $wrap, $newBlock) {
		if ($newBlock) {
			$newBlock.appendTo($('body'));
		}

		var $newBlock2 = $block.prependTo($container),
			$html = $('html'),
			openedClass = '_opened';
			
		if (!$wrap.find('.lp-form-step-popup-inner').length) {
			var $uploads = $container.find('input[type="hidden"][id^="hidUploadField"]');

			if ($uploads.length) {
				$uploads.each(function(){
					var thisAttr = $(this).data('init-upload');
					newSWFU(void 0, thisAttr);
				});
			}
			
		} else {
			var $block = $wrap.find('.js-lp-steps-form');
			$block.html('');
			$block.formsteps();
		}
		
		$html.css({
			overflow: 'hidden'
		});

		$wrap.addClass(openedClass);
		
		return $newBlock2;
		
	},
	
	convertImages: function ($container) {
		var self = this;

		$container.find('._lp-image-container').each(function() {
			var $img = $(this).find('img');

			if ($img.length) {
				var img_src = $img.attr('src');
				if (!window.img_convert_cache.hasOwnProperty(img_src)) window.img_convert_cache[img_src] = {};
				self.convertImg(window.img_convert_cache[img_src], $img);
			}
		});
	},

	convertImg : function (cache_img, $img) {
		var self = this;
		$img.css({"max-width": "100%", "max-height": "100%"});

		if (!$img.parent().hasClass('lp-img-contain')) {
			var img_width,
				img_height;

			if (!cache_img.hasOwnProperty('width') || !cache_img.hasOwnProperty('height')) {
				if ($img.is('svg') || ($img.attr('src') && $img.attr('src').slice(-3) == 'svg')) {
					img_width = $img.parent().width();
					img_height = $img.parent().height();
				} else {
					img_width = $img[0].naturalWidth;
					img_height = $img[0].naturalHeight;
				}
			} else {
				img_width = cache_img.width;
				img_height = cache_img.height;
			}

			self.setImgStyles($img, img_width, img_height, null);
		}
	},

	setImgStyles: function ($img, img_width, img_height, svg) {
		var $wrap = $img.parent();
		var wrap_width = parseInt($wrap.width()),
			wrap_height = parseInt($wrap.height()),
			wrap_prop = wrap_width/wrap_height;

		var min_width = wrap_height/img_height * img_width;

		if(img_width && img_height) {
			var img_prop = img_width/img_height;

			if (wrap_prop > img_prop) {
				$img.css({"max-width": "100%", "width": img_width > wrap_width ? wrap_width : img_width, "min-width": "0", "max-height": "none", "height": "auto"});
			} else {
				$img.css({"max-width": "none", "width": "auto", "min-width": min_width > img_width ? img_width : min_width, /*"min-height": "100%",*/  "max-height": "100%", "height": img_height > wrap_height ? wrap_height : img_height});

				if (svg) {
					$img.css('min-height', '100%');
				}
			}
		}
	}
}