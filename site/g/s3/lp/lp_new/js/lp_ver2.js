'use strict';

(function($, window) {
	$.fn.goodNameForForm = function(options) {
		var settings = $.extend({
			parent: '',
			title: ''
		}, options);
		return this.each(function() {
			var $this = $(this);
			$this.on('click.goodNameForForm', function() {
				var $this = $(this),
					$parent = $this.closest(settings.parent),
					$title = $parent.find(settings.title).text();
				if (settings.price) {
					var $price = $parent.find(settings.price).text();
				}
				var interval = setInterval(function() {
					var $target = $('.popover-body').find('.input-product_name input[type=text]'),
						$target2 = $('.popover-body').find('.input-product_price input[type=text]');
					if ($target.length || $target2.length) {
						if ($target.length) {
							$target.val($title);
						}
						if ($target2.length) {
							console.log($price);
							$target2.val($price);
						}
						clearInterval(interval)
					}
				}, 750)
			})
		})
	}
})(jQuery, window);

;(function($) {

	var $win = $(window),
		$doc = $(document),
		$html = $(document.documentElement),
		overflowHiddenClass = 'overflowHidden',
		$htmlLang = $html.attr('lang'),
		iOs = /iPhone|iPad|iPod/i.test(navigator.userAgent),
		documentClickEvent = iOs ? 'touchend' : 'click',
		lp_template = window.lp_template ? window.lp_template : {};
		
	lp_template = {
		name : 'Landing Page v.2',
		maps: {
			yandex: [],
			google: [],
		}
	};
		
	lp_template.phone_mask = function() {
		this.mask("+7 (999) 999-99-99");
	};
	
	lp_template.split = function(str) {
		return str.split(',');
	};
	
	lp_template.initMaps = function(options) {
		options.center = lp_template.split(options.center);

		$.each(options.data, function(key, item) {
			item.coords = lp_template.split(item.coords);
		});

		if (options.type == 'google') {

			google.maps.event.addDomListener(window, 'load', function() {

				var map = new google.maps.Map(document.getElementById(options.id), {
					zoom: parseInt(options.zoom),
					scrollwheel: false,
					center: new google.maps.LatLng(options.center[0], options.center[1])
				});

				$.each(options.data, function(key, item) {

					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(item.coords[0], item.coords[1]),
						map: map,
						title: item.name
					});

					var infowindow = new google.maps.InfoWindow({
						content: '<div class="baloon-content">' +
							'<h3 style="margin: 0; padding-bottom: 3px;">' + item.name + '</h3>' +
							item.desc +
							'</div>'
					});

					google.maps.event.addListener(marker, 'click', function() {
						infowindow.open(map, marker);
					});

				});
			});

		} else {

			ymaps.ready(function() {

				var map = new ymaps.Map(options.id, {
					center: options.center,
					zoom: options.zoom,
					behaviors: ['drag', 'rightMouseButtonMagnifier'],
				});
				
				lp_template.maps.yandex.push(map);

				map.controls.add(
					new ymaps.control.ZoomControl()
				);

				var MyBalloonContentLayoutClass = ymaps.templateLayoutFactory.createClass(
					'<div class="baloon-content" style="padding: 0 10px;">' +
					'<h3 style="margin: 0;">$[properties.name]</h3>' +
					'<p>$[properties.desc]</p>' +
					'</div>'
				);

				var myCollection = new ymaps.GeoObjectCollection();

				$.each(options.data, function(key, item) {
					myCollection.add(new ymaps.Placemark(
						item.coords,
						item, {
							balloonContentLayout: MyBalloonContentLayoutClass
						}
					));
				});

				map.geoObjects.add(myCollection);

			});
		}
	};
	
	lp_template.functions = {
	
		topFomrPopup: function($self) {
			$self.find(".top_bl_popup").on("click", function(top_form) {
				$self.find(".top_bl_form_popup").addClass("opened");
				$("html, body").addClass("overflowHidden");
			});
		},
	
		showProductsMore: function($self) {
			var $button = $self.find('.services_wrapper .service_item .desc_button');
			
			$button.each(function(){
				var $this = $(this),
					$thisHTML = $this.html();
				
				$this.on('click', function() {
					var $thisBut = $(this);
					
					if ($thisBut.siblings('.srv_desc').is(':hidden')) {
						$thisBut.siblings('.srv_desc').slideDown('slow');
						$thisBut.html('<span>Свернуть</span>');
					} else {
						$thisBut.siblings('.srv_desc').slideUp('slow');
						$thisBut.html($thisHTML);
					};
				});
			});
		},
		
		headerBurger: function($self) {
			var $burger = $self.find('.js-header-burger');
			
			$burger.on('click', function() {
				$(this).next().addClass('opened');
				$html.addClass('overflowHidden');
			});
			
			$('.top_block_wrapper .menu_close').on('click', function() {
				$('.menuDesktop').removeClass('opened');
				$html.removeClass('overflowHidden');
			});
		},
		
		dropdownMenu: function($self) {
			var $menu = $self.find('.js-dropdown-menu'),
				$subMenu = $menu.find('.new-menu1__subpages');
			
			if (!$menu.length) return;
			
			if ($(window).width() > 959) {
				$menu.s3MenuAllIn({
					type: 'bottom',
					showTime: 250,
					hideTime: 250,
					activateTimeout: 250
				});  
			} else {
				$menu.on('click', 'a', function(e){
					var $this = $(this),
						$subMenu = $this.closest('li').find('.new-menu1__subpages');
					
					$menu.find('.new-menu1__subpages').slideUp();				
						
					if (!$subMenu.length) return;
					if ($this.hasClass('_clicked')) return;
					
					$menu.find('a').removeClass('_clicked');
					
					$subMenu.eq(0).slideDown();
					$this.addClass('_clicked');
					return false;
				});
			}
		},

		popUpForms: function($self) {
			$self.on('click', '[data-api-type=popup-form]', function(e) {

				e.preventDefault();

				var $this = $(this);

				if (myo.show) {
					myo.show({
						json: $this.data('api-url'),
						onContentLoad: function(w) {
							s3LP.initForms($(this.bodyDiv));
						},
						afterOpen: function() {
							$('html').addClass('overflowHidden');
							if (iOs) {
								$('body').addClass('overflowHidden')
							}
						},
						afterClose: function() {
							$('html, body').removeClass('overflowHidden');
						}
					});
				} else if (myo.open) {
					myo.open({
						json: $this.data('api-url'),
						onLoad: function(w) {
							s3LP.initForms($(this.bodyDiv));
						},
						afterOpen: function() {
							$('html').addClass('overflowHidden');
							if (iOs) {
								$('body').addClass('overflowHidden')
							}
						},
						afterClose: function() {
							$('html, body').removeClass('overflowHidden');
						}
					});
				}
			});
		},
		
		closePopupKey: function($self) {
			var newWin = '';
			$self.find('.js-close-popup-map-key').on('click', function(e) {
				e.preventDefault();
				$(this).closest('.not-map-key').hide();
			});
			
			$self.find('.not-map-key div a').on('click', function(e) {
				e.preventDefault();
				newWin = window.open();
				newWin.location = this.href;
				newWin.focus();
			});
			
		},
		
		linkTop: function($self){
			var $button = $self.find('.link-top');
			$button.on('click', function(e) {
				e.preventDefault();
			
				$('html, body').animate({
					scrollTop: 0
				});
			});
			
			function buttonToggleShow () {
				var documentScrollTop = $doc.scrollTop(),
					meta;
				if (documentScrollTop > 200 && meta != 'show') {
					$button.addClass('show');
					meta = 'show';
				} else if (documentScrollTop < 201 && meta != 'hide') {
					$button.removeClass('show');
					meta = 'hide';
				}
			}
			
			$win.on('scroll', buttonToggleShow);
		},

		matchHeight: function($self) {
			var $blocks = $self.find('[data-match-height]');
			
			if ($blocks.length) {

				$blocks.each(function() {
					var $this = $(this);
					
					$this.data('height-elements').split(',').forEach(function(elem){
						$this.find(elem).matchHeight();
					});
				});
				
			}

		},

		oneLineMenu: function($self) {
			var menu = $self.find('.js-oneline-menu'),
				$menu2 = $self.find('.js-oneline-menu2');

			if (menu.length) {
				menu.each(function() {
					var $this = $(this),
						thisParams = [].concat($this.data('menu-params'));
					
					$this.oneLineMenu({
						minWidth: thisParams[0] || 960,
						left: thisParams[1] || -25
					})
		
				});
			}
			
			if ($menu2.length) {
				$menu2.each(function() {
					var $this = $(this),
						thisParams = [].concat($this.data('menu-params'));
					
					$this.oneLineMenu({
						minWidth: thisParams[0] || 960,
						left: thisParams[1] || -25,
						onAfterResize: function() {
							$this.find('.dropdown-wrap').prepend('<span></span><span></span><span></span>')
						}
					})
		
				});
			}
		},
		
		timer: function($self) {
			var $timer = $self.find('.js-timer');
			
			if ($timer.length) {
				$timer.timer({
					format_in: '%d.%M.%y %h:%m',
					format_out: '<div class="timePart"><ins>%d</ins><br/><span>дни</span></div><div class="timePart"><ins>%h</ins><br/><span>часы</span></div><div class="timePart"><ins>%m</ins><br/><span>минуты</span></div><div class="timePart"><ins>%s</ins><br/><span>секунды</span></div>',
					update_time: 1000,
					onEnd: function() {
						$(this).hide();
						$(this).siblings('.time_left').hide();
					}
				});
			}
		},
		
		show_map: function($self) {
			$self.find('.js-show-map').on('click', function(e) {
				e.preventDefault();
				$(this).closest('[data-block-layout]').find('.js-map-toggle').addClass('opened');
				lp_template.maps.yandex.forEach(function(item) {
					item.container.fitToViewport();
				});
			});
			
			$self.find('.js-close-map').on('click', function(e) {
				e.preventDefault();
				$(this).closest('[data-block-layout]').find('.js-map-toggle').removeClass('opened');
				lp_template.maps.yandex.forEach(function(item) {
					item.container.fitToViewport();
				});
			});
		},
		
		show_map2: function($self) {
			$self.find('.js-show-map-2').on('click', function(e) {
				e.preventDefault();
				$(this).closest('.single-office_wrap').find('.js-map-toggle').addClass('opened');
				lp_template.maps.yandex.forEach(function(item) {
					item.container.fitToViewport();
				});
			});
			
			$self.find('.js-close-map').on('click', function(e) {
				e.preventDefault();
				$(this).closest('[data-block-layout]').find('.js-map-toggle').removeClass('opened');
				lp_template.maps.yandex.forEach(function(item) {
					item.container.fitToViewport();
				});
			});
		},
		
		menuLP: function($self) {
			var menu = $self.find('.js-has-menu');

			if (menu.length) {
				menu.each(function() {
					var $this = $(this),
						thisParams = [].concat($this.data('menu-lp').split(', '));
		
					$this.menuLP({
						menuHeight: thisParams[1] || 0,
						fixedElement: thisParams[0] || null
					});
		
				})
			}
		},

		menu1: function($self) {
			var fixedSelector = '.new-menu1__fixed',
				openedClass = 'opened';

			$self.find('.js-menu1-open').on('click', function() {
				$(this).closest('.new-menu1').find(fixedSelector).addClass(openedClass).addClass('animit');
				$html.addClass(overflowHiddenClass);
			});

			$self.find('.js-menu1-close').on('click', function() {
				$(this).closest('.new-menu1').find(fixedSelector).removeClass(openedClass);
				$html.removeClass(overflowHiddenClass);
			});

			$self.find(fixedSelector).on('click', 'a', function() {
				$html.removeClass(overflowHiddenClass);
				$self.find(fixedSelector).removeClass(openedClass);
			})

			$doc.on(documentClickEvent, function(e) {
				if ($(e.target).closest('.js-menu1-open, ' + fixedSelector).length) return;
				$html.removeClass(overflowHiddenClass);
				$self.find(fixedSelector).removeClass(openedClass);
			})
		},

		menu2: function($self) {
			var fixedSelector = '.new-menu2__fixed',
				activeClass = 'active',
				openedClass = 'opened';

			$self.find('.js-menu2-toggle').on('click', function() {
				$(this).toggleClass(activeClass);
				$(this).closest('[data-block-layout]').find(fixedSelector).toggleClass(openedClass).addClass('animit');

				$html.toggleClass(overflowHiddenClass);
			});

			$self.find(fixedSelector).on('click', 'a', function() {
				$html.removeClass(overflowHiddenClass);
				$self.find(fixedSelector).removeClass(openedClass);
			})

			$doc.on(documentClickEvent, function(e) {
				if ($(e.target).closest('.js-menu2-toggle, ' + fixedSelector).length) return;
				$html.removeClass(overflowHiddenClass);
				$self.find(fixedSelector).removeClass(openedClass);
			})
		},
		
		menu3: function($self) {
			var fixedSelector = '.new-menu3__fixed',
				openedClass = 'opened';

			$self.find('.js-menu3-open').on('click', function() {
				$(this).closest('.new-menu3').find(fixedSelector).addClass(openedClass).addClass('animit');
				$html.addClass(overflowHiddenClass);
			});

			$self.find('.js-menu3-close').on('click', function() {
				$(this).closest('.new-menu3').find(fixedSelector).removeClass(openedClass);
				$html.removeClass(overflowHiddenClass);
			});

			$self.find(fixedSelector).on('click', 'a', function() {
				$html.removeClass(overflowHiddenClass);
				$self.find(fixedSelector).removeClass(openedClass);
			})

			$doc.on(documentClickEvent, function(e) {
				if ($(e.target).closest('.js-menu3-open, ' + fixedSelector).length) return;
				$html.removeClass(overflowHiddenClass);
				$self.find(fixedSelector).removeClass(openedClass);
			})
		},

		menu4: function($self) {
			var fixedSelector = '.menu-scroll',
				openedClass = 'opened';

			$self.find('.js-menu4-open').on('click', function() {
				$(this).closest('[data-block-layout]').find(fixedSelector).addClass(openedClass).addClass('animit');
				$html.addClass(overflowHiddenClass);
			});

			$self.find('.js-menu4-close').on('click', function() {
				$(this).closest('[data-block-layout]').find(fixedSelector).removeClass(openedClass);
				$html.removeClass(overflowHiddenClass);
			});

			$self.find(fixedSelector).on('click', 'a', function() {
				$html.removeClass(overflowHiddenClass);
				$self.find(fixedSelector).removeClass(openedClass);
			})

			$doc.on(documentClickEvent, function(e) {
				if ($(e.target).closest('.js-menu4-open, ' + fixedSelector).length) return;
				$html.removeClass(overflowHiddenClass);
				$self.find(fixedSelector).removeClass(openedClass);
			})

		},

		menu5: function($self) {
			var fixedSelector = '.menu-fixed',
				openedClass = 'opened';

			$self.find('.js-menu5-open').on('click', function() {
				$(this).closest('[data-block-layout]').find(fixedSelector).addClass(openedClass).addClass('animit');
				$html.addClass(overflowHiddenClass);
			});

			$self.find('.js-menu5-close').on('click', function() {
				$(this).closest('[data-block-layout]').find(fixedSelector).removeClass(openedClass);
				$html.removeClass(overflowHiddenClass);
			});

			$self.find(fixedSelector).on('click', 'a', function() {
				$html.removeClass(overflowHiddenClass);
				$self.find(fixedSelector).removeClass(openedClass);
			})

			$doc.on(documentClickEvent, function(e) {
				if ($(e.target).closest('.js-menu5-open, ' + fixedSelector).length) return;
				$html.removeClass(overflowHiddenClass);
				$self.find(fixedSelector).removeClass(openedClass);
			})
		},

		lightGalleryVideo: function($self) {
			var $block = $self.find(".js-lgVideo");
			
			if ($block.length) {
				$block.lightGallery({
					thumbnail: false,
					download: false,
					loop: false,
					zoom: false,
					actualSize: false,
					selector: '.button',
					youtubePlayerParams: {
						autoplay: 0,
						modestbranding: 1,
						showinfo: 0,
						rel: 0
					},
					vimeoPlayerParams: {
						byline: 0,
						portrait: 0,
						color: 'A90707'
					}
				});
			}
		},

		FAQblock: function($self) {
			var activeClass = 'active',
				shadowClass = 'shadow';

			$self.find('.faq_ver2_wrapper').on('click', 'div[class^="button"]', function() {
				var $this = $(this);
				
				$this.removeClass(activeClass).siblings('div[class^="button"]').addClass(activeClass);
				$this.parent().prev('.faq-item_text').slideToggle(200);
				$this.closest('.faq-item').toggleClass(shadowClass);
			});
		},

		FAQblockSlider: function($self) {
			var $block = $self.find('.reviews-and-feedback_inner');
			if ($block.length) {
				$self.find('.reviews-and-feedback_inner').owlCarousel({
					items: 1,
					loop: true,
					autoHeight: true,
					nav: true,
					dots: false,
					navSpeed: 500
				});
			}
		},

		staffSlider1: function($self) {
			$self.find('.js-staff-slider1').owlCarousel({
				items: 4,
				margin: 16,
				loop: true,
				nav: true,
				dots: true,
				dotsEach: true,
				autoplay: true,
				responsive: {
					0: {
						items: 1
					},
					640: {
						items: 2
					},
					1024: {
						items: 3
					},
					1200: {
						items: 4
					}
				}
			});
		},

		staffSlider2: function($self) {

			$self.find('.js-staff-slider2').each(function() {
				var $this = $(this),
					thisAutoplay = $this.data('autoplay'),
					thisSpeed = $this.data('speed'),
					thisPause = $this.data('pause');

				$this.owlCarousel({
					loop: true,
					margin: 0,
					nav: true,
					dots: true,
					smartSpeed: thisSpeed || 600,
					autoplay: thisAutoplay || false,
					autoplayTimeout: thisPause || 5000,
					autoHeight: false,
					responsive: {
						0: {
							margin: 0,
							items: 1
						},
						520: {
							margin: 15,
							items: 2
						},
						768: {
							margin: 15,
							items: 3
						},
						980: {
							margin: 15,
							items: 2
						}
					}
				});
			});
		},

		staffSlider3: function($self) {

			var teamSlider = $self.find('.js-staff-slider3');

			if (teamSlider.length) {
				teamSlider.owlCarousel({
					loop: true,
					margin: 0,
					nav: false,
					dots: true,
					items: 4,
					smartSpeed: 600,
					autoplay: true,
					autoHeight: false,
					responsive: {
						0: {
							items: 1
						},

						480: {
							items: 2
						},
						640: {
							items: 3
						},
						980: {
							items: 4
						}
					}
				});
			}
		},

		staffSlider4: function($self) {

			var slider = $self.find('.js-staff-slider4');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					nav: true,
					dots: true,
					center: true,
					margin: 0,
					items: 3,
					smartSpeed: 600,
					autoHeight: false,
					autoplay: true,
					autoWidth: true,
					responsive: {
						320: {
							margin: 55
						},

						520: {
							margin: 46
						},

						768: {
							margin: 46
						},

						980: {
							margin: 50
						}
					}
				});
			}
		},

		staffSlider5: function($self) {

			var slider = $self.find('.js-staff-slider5');

			if (slider.length) {
				slider.owlCarousel({
					items: 3,
					nav: true,
					dots: false,
					responsive: {
						0: {
							items: 1,
							margin: 0
						},
						540: {
							items: 2,
							margin: 15
						},
						681: {
							items: 3,
							margin: 15
						}
					}
				});
			}
		},

		staffSlider6: function($self) {

			var slider = $self.find('.js-staff-slider6');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					nav: false,
					dots: true,
					items: 3,
					autoplayHoverPause: true,
					autoplay: true,
					autoHeight: false,
					responsive: {
						0: {
							margin: 0,
							items: 1
						},
						480: {
							margin: 20,
							items: 2
						},
						640: {
							margin: 20,
							items: 3
						},
						1024: {
							margin: 20,
							items: 3
						}
					}
				});
			}
		},

		reviewsSlider1: function($self) {

			var slider = $self.find('.js-review-slider1');

			if (slider.length) {
				slider.owlCarousel({
					items: 1,
					margin: 30,
					autoplayTimeout: 5000,
					nav: true,
					dotsEach: true,
					autoplay: true,
					loop: true
				});
			}
		},

		reviewsSlider2: function($self) {

			var slider = $self.find('.js-review-slider2');

			if (slider.length) {
				slider.owlCarousel({
					items: 1,
					loop: true,
					nav: true,
					dots: false,
					responsive: {
						0: {
							items: 1,
							margin: 0
						},
						769: {
							items: 2,
							margin: 30
						}
					}
				});
			}
		},

		reviewsSlider3: function($self) {

			var slider = $self.find('.js-review-slider3');

			if (slider.length) {
				slider.owlCarousel({
					items: 1,
					loop: true,
					nav: true,
					smartSpeed: 600,
					autoplay: false,
					autoplayTimeout: 5000,
					dots: false
				});
			}
		},

		reviewsSlider4: function($self) {

			var slider = $self.find('.js-review-slider4');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					margin: 0,
					nav: true,
					dots: true,
					smartSpeed: 600,
					autoplay: false,
					autoplayTimeout: 5000,
					autoHeight: false,
					responsive: {
						0: {
							items: 1,
							autoHeight: true,
						},
						769: {
							items: 1,
							autoHeight: false
						}
					}
				});
			}
		},

		reviewsSlider5: function($self) {

			var slider = $self.find('.js-review-slider5');

			if (slider.length) {
				slider.owlCarousel({
					autoplay: true,
					nav: true,
					loop: true,
					dots: false,
					responsive: {
						0: {
							items: 1
						},
						525: {
							items: 2
						},
						768: {
							items: 3
						}
					}
				});
			}
		},

		reviewsSlider6: function($self) {

			var slider = $self.find('.js-review-slider6');

			if (slider.length) {
				slider.owlCarousel({
					items: 1,
					nav: true,
					dots: false,
					responsive: {
						0: {
							items: 1,
							margin: 0
						},
						769: {
							items: 2,
							margin: 15
						}
					}
				});
			}
		},

		reviewsSlider7: function($self) {

			var slider = $self.find('.js-review-slider7');

			if (slider.length) {
				slider.owlCarousel({
					items: 2,
					loop: true,
					nav: true,
					dots: false,
					responsive: {
						0: {
							items: 1.17,
							margin: 7,
							center: true
						},
						440: {
							items: 1.29,
							margin: 16,
							center: true
						},
						600: {
							items: 1.41,
							margin: 16,
							center: true
						},
						720: {
							items: 2,
							margin: 16
						},
						960: {
							items: 3,
							margin: 16
						}
					}
				});
			}
		},

		reviewsSlider8: function($self) {

			var slider = $self.find('.js-review-slider8');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					margin: 0,
					nav: false,
					dots: true,
					items: 1,
					autoplay: true,
					autoHeight: false
				});
			}
		},

		reviewsSlider9: function($self) {

			var slider = $self.find('.js-review-slider9');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					margin: 0,
					nav: false,
					dots: true,
					items: 1,
					autoplay: true,
					autoHeight: false
				});
			}
		},

		reviewsSlider10: function($self) {

			var slider = $self.find('.js-review-slider10');

			if (slider.length) {
				slider.owlCarousel({
					loop: !0,
					nav: false,
					dots: !0,
					autoplay: !0,
					autoHeight : false,
					responsive: {
						0: {
							items: 1,
							margin: 0
						},
						640: {
							items: 2,
							margin: 10
						},
						1024: {
							items: 3,
							margin: 20
						},
						1300: {
							items: 3,
							margin: 40
						}
					}
				});
			}
		},

		partnerSlider1: function($self) {

			var slider = $self.find('.js-partners-slider1');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					nav: true,
					autoplay: true,
					responsive: {
						0: {
							margin: 0,
							items: 1
						},
						380: {
							margin: 15,
							items: 2
						},
						480: {
							margin: 15,
							items: 3
						},
						768: {
							margin: 15,
							items: 4
						},
						1024: {
							margin: 15,
							items: 5
						}
					}
				});
			}
		},

		partnerSlider2: function($self) {

			var slider = $self.find('.js-partners-slider2');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					nav: true,
					dots: false,
					autoplay: true,
					responsive: {
						0: {
							items: 2,
							margin: 25
						},
						400: {
							items: 3,
							margin: 25
						},
						479: {
							items: 4,
							margin: 25
						},
						641: {
							items: 5,
							margin: 30
						},
						769: {
							items: 6,
							margin: 35
						}
					}
				});
			}
		},

		partnerSlider3: function($self) {

			var slider = $self.find('.js-partners-slider3');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					margin: 0,
					nav: true,
					dots: false,
					smartSpeed: 600,
					autoplay: true,
					autoHeight: false,
					responsive: {
						0: {
							items: 1
						},

						480: {
							items: 2
						},
						700: {
							items: 3
						},
						980: {
							items: 4
						}
					}
				});
			}
		},


		partnerSlider4: function($self) {

			var $block = $self.find('.js-partners-slider4'),
				flag = false,
				$sliderClone = $block.clone().addClass('js-partners-slider4-clone owl-carousel');
			
			$sliderClone.insertAfter($block);			
			$sliderClone.find('.item').unwrap();

			$sliderClone.hide();

			$win.on('resize', function() {
				if ($(window).width() > 960 && flag) {
					$sliderClone.trigger('destroy.owl.carousel');

					$block.show();
					$sliderClone.hide();

					flag = false;

				} else if ($(window).width() <= 960 && !flag) {

					$block.hide();
					$sliderClone.show();

					$sliderClone.owlCarousel({
						items: 2,
						nav: true,
						dots: false,
						responsive: {
							0: {
								items: 1,
								margin: 0
							},
							400: {
								items: 2,
								margin: 50
							},
							540: {
								items: 3,
								margin: 35
							}
						}

					});

					flag = true;
				}

			});
		},

		sertificatsSlider1: function($self) {

			var slider = $self.find('.js-sertificats-slider1');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					nav: false,
					autoplay: true,
					responsive: {
						0: {
							margin: 0,
							items: 1
						},
						380: {
							margin: 15,
							items: 2
						},
						480: {
							margin: 15,
							items: 3
						},
						768: {
							margin: 15,
							items: 4
						}
					}
				});
			}
		},

		sertificatsSlider2: function($self) {

			var slider = $self.find('.js-sertificats-slider2');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					nav: true,
					dots: false,
					autoplay: true,
					responsive: {
						0: {
							items: 1,
							margin: 0
						},
						359: {
							items: 2,
							margin: 10
						},
						400: {
							items: 3,
							margin: 15
						},
						479: {
							items: 4,
							margin: 20
						},
						641: {
							items: 5,
							margin: 30
						},
						769: {
							items: 6,
							margin: 40
						}
					}
				});
			}
		},

		sertificatsSlider3: function($self) {

			var slider = $self.find('.js-sertificats-slider3');

			if (slider.length) {
				slider.owlCarousel({
					loop: false,
					nav: true,
					dots: true,
					autoplay: true,
					responsive: {
						0: {
							items: 1,
						},

						480: {
							items: 2,
							margin: 15,
						},

						640: {
							items: 3,
							margin: 16
						},

						768: {
							items: 4
						},
						1024: {
							items: 5
						}
					}
				});
			}
		},

		sertificatsSlider4: function($self) {

			var slider = $self.find('.js-sertificats-slider4');

			if (slider.length) {
				slider.owlCarousel({
					loop: !0,
					nav: !0,
					mouseDrag: true,
					dots: !0,
					autoplay: !0,
					responsive: {
						320: {
							items: 1,
							margin: 0
						},
						500: {
							items: 2,
							margin: 15
						},
						767: {
							items: 3,
							margin: 15
						},
						1024: {
							items: 3,
							margin: 20
						}
					}
				});
			}
		},

		saleSlider1: function($self) {
			var topSlider = $self.find('.js-sale-slider1');

			if (topSlider.length) {
				topSlider.each(function() {
					var $this = $(this),
						thisSlidesLength = $this.find('> li').length;
						
					var slider = $this.bxSlider({
						mode: 'fade',
						speed: 1000,
						pause: 5000,
						auto: true,
						controls: false,
						infiniteLoop: true,
						autoControls: false,
						pager: true,
						autoHover: true,
						useCSS: false,
						preloadImages: 'all',
						onSlideAfter: function() {
							if (this.auto) {
								slider.startAuto();
							}
						},
						onSliderLoad: function() {
							$(window).resize();
						}
					});
				});
			}
		},

		saleSlider2: function($self) {
			var slider = $self.find('.js-sale-slider2');

			if (slider.length) {
				slider.each(function() {
					var $this = $(this),
						slickSlider = $this.find('.one-good-form_productSlider'),
						slickNav = $this.find('.one-good-form_pager-wrap');

					slickSlider.slick({
						slidesToShow: 1,
						slidesToScroll: 1,
						arrows: false,
						fade: true,
						asNavFor: slickNav
					});

					slickNav.slick({
						infinite: true,
						slidesToShow: 3,
						slidesToScroll: 1,
						asNavFor: slickSlider,
						dots: false,
						autoplay: false,
						autoplaySpeed: 1500,
						centerMode: false,
						vertical: true,
						focusOnSelect: true,
						responsive: [{
								breakpoint: 940,
								settings: {
									slidesToShow: 4,
									vertical: true,
									centerMode: false
								}
							},

							{
								breakpoint: 750,
								settings: {
									vertical: false,
									slidesToShow: 4,
									centerMode: false

								}
							}, {
								breakpoint: 721,
								settings: {
									slidesToShow: 3,
									vertical: false,
									centerMode: false,
									infinite: true
								}
							}, {
								breakpoint: 450,
								settings: {
									slidesToShow: 4,
									vertical: false,
									centerMode: false,
									infinite: true,
								}
							}, {
								breakpoint: 400,
								settings: {
									slidesToShow: 3,
									slidesToScroll: 1,
									vertical: false,
									infinite: true,

								}
							}

						]
					});
				});					
			}
		},
		
		saleSlider3: function($self) {
			var $slider = $self.find('.js-sale-slider3'),
				slHeight = function(slider) {
					var slh = $slider.find(".bx-viewport").height();
	
					$slider.find(".slider_wrap .pic").css('minHeight', slh);
				};
			
			if ($slider.length) {
				$slider.each(function() {
					var $this = $(this),
						thisSlidesLength = $this.find('> li').length,
						pause = $this.data('slider-speed'),
						autoplay = $this.data('autoplay'),
						arrows = $this.data('arrows'),
						autoheight = $this.data('autoheight'),
						speed = $this.data('speed');
						
					if (thisSlidesLength > 1) {
						$this.bxSlider({
							mode: 'fade',
							speed: speed ? parseInt(speed) : 700,
							pause: pause ? parseInt(pause) : 5000,
							auto: autoplay ? false : true,
							adaptiveHeight: autoheight ? true : false,
							controls: arrows ? true : false,
							autoControls: false,
							pager: true,
							useCSS: false,
							preloadImages: 'all',
							onSliderLoad: slHeight,
							onSliderResize: slHeight,
							onSlideAfter: function() {
								if (this.auto) {
									slHeight();
								}
							}
						});
					}
				});
			}
		},

		youTubeBackground: function($self) {
			var $block = $self.find('[id^=video-player-block]');

			if ($block.length) {
				$block.tubular();
			}
		},

		accordeon: function($self) {
			$self.on('click', '.accordion .item .title', function() {
				$(this).toggleClass('opened').next().slideToggle();
			});
		},

		productSlider1: function($self) {
			var slider = $self.find('.js-product-slider1');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					margin: 0,
					nav: true,
					dots: true,
					center: true,
					items: 3,
					autoWidth: true,
					autoplay: true,
					responsive: {
						0: {
							margin: 7
						},
						380: {
							margin: 15
						},
						640: {
							margin: 24
						},
						961: {
							items: 3,
							autoWidth: false,
							margin: 24,
							center: false
						}
					}
				});
			}
		},

		productSlider2: function($self) {
			var slider = $self.find('.js-product-slider2');

			if (slider.length) {
				slider.each(function() {
					var $this = $(this),
						thisAutoplay = $this.data('autoplay') || true,
						thisSpeed = $this.data('speed') || 250,
						thisPause = $this.data('pause') || 5000;
					
					$this.owlCarousel({
						nav: true,
						dots: true,
						autoplay: thisAutoplay,
						autoplayTimeout: thisPause,
						smartSpeed: thisSpeed,
						responsive: {
							0: {
								margin: 13,
								autoWidth: true,
								center: true,
								loop: false
							},
							380: {
								margin: 20,
								autoWidth: true,
								center: true,
							},
							831: {
								margin: 25,
							},
							900: {
								loop: true,
								items: 1,
								autoWidth: false,
								margin: 25,
								center: false
							}
						}
					});	
					
				});
			}
		},

		productSlider3: function($self) {
			var slider = $self.find('.js-product-slider3');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					margin: 20,
					nav: true,
					dots: true,
					smartSpeed: 600,
					center: true,
					items: 3,
					autoWidth: true,
					autoplay: true,
					autoHeight: false,
					responsive: {
						0: {
							margin: 7
						},

						380: {
							margin: 20
						}
					}
				});
			}
		},

		productSlider4: function($self) {
			var slider = $self.find('.js-product-slider4');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					nav: false,
					dots: true,
					autoplay: true,
					autoplayHoverPause: true,
					autoHeight: false,
					responsive: {
						0: {
							items: 1,
							margin: 0
						},
						500: {
							items: 2,
							margin: 15
						},
						768: {
							items: 2,
							margin: 15
						},
						940: {
							items: 3,
							margin: 15
						}
					}
				});
			}
		},

		productSlider5: function($self) {
			var slider = $self.find('.js-product-slider5');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					nav: true,
					items: 1,
					dots: false,
					autoplay: false,
					autoHeight : false
				});
			}
		},

		productSlider6: function($self) {
			var flag = true,
				$slider = $self.find('.js-product-slider6');

			if ($slider.length) {

				var responsiveSlider = function () {
					if ($win.width() >= 768 && flag) {
						$slider.each(function() {
							var $this = $(this)

							if ($this.find('.tar_bl_item').length > 3) {
								$this.addClass('owl-carousel');

								$this.owlCarousel({
									loop: true,
									nav: true,
									dots: false,
									autoplay: true,
									autoHeight : false,
									mouseDrag: true,
									responsive: {
										768: {
											items: 3,
											margin: 10
										},
										1024: {
											items: 3,
											margin: 20
										},
										1300: {
											items: 3,
											margin: 30
										}
									}
								});	
							}
						})

						flag = false;					
					} else if ($win.width() < 768 && !flag) {
						$slider.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
						flag = true;
					}
				}
				
				$win.on('resize', responsiveSlider);
			}
		},

		productSlider7: function($self) {
			var $slider = $self.find('.js-product-slider7');

			if ($slider.length) {
				$slider.owlCarousel({
					loop: true,
					nav: false,
					dots: true,
					mouseDrag: false,
					smartSpeed: 400,
					autoplay: true,
					autoHeight: 0,
					responsive: {
						0: {
							items: 1,
							margin: 0
						},
						520: {
							items: 2,
							margin: 20
						},
						640: {
							items: 1,
							margin: 0
						},
						1024: {
							items: 3,
							margin: 20
						}
					}
				});
			}
		},

		productSlider8: function($self) {
			var $slider = $self.find('.js-product-slider8');

			if ($slider.length) {
				$slider.owlCarousel({
					loop: true,
					nav: false,
					dots: true,
					autoplay: true,
					responsive: {
						0: {
							margin: 0,
							items: 1
						},
						640: {
							margin: 0,
							items: 1
						},
						1024: {
							margin: 20,
							items: 3
						}
					}
				});
			}
		},

		productSlider9: function($self) {
			var $slider = $self.find('.js-product-slider9');

			if ($slider.length) {
				$slider.each(function() {
					var $this = $(this),
						thisAutoplay = $this.data('autoplay'),
						thisPause = $this.data('pause'),
						thisSpeed = $this.data('speed');

					$this.owlCarousel({
						loop: true,
						margin: 0,
						nav: true,
						dots: true,
						autoplayTimeout: thisPause ? thisPause : 5000,
						smartSpeed: thisSpeed ? thisSpeed : 500,
						autoplay: thisAutoplay ? false : true,
						autoHeight: false,
						responsive: {
							0: {
								items: 1
							},
							500: {
								items: 2,
								margin: 10
							},
							768: {
								items: 3,
								margin: 20
							}
						}
					});
				});
			}
		},

		productSlider10: function($self) {
			var $slider = $self.find('.js-product-slider10');

			if ($slider.length) {
				$slider.owlCarousel({
					loop: true,
					nav: true,
					dots: true,
					autoplay: true,
					responsive: {
						0: {
							items: 1
						},
						500: {
							items: 2
						},
						640: {
							items: 1
						}
					}
				});
			}
		},

		productSlider11: function($self) {
			var $slider = $self.find('.js-product-slider11');

			if ($slider.length) {
				$slider.owlCarousel({
					loop: true,
					nav: false,
					dots: true,
					autoplay: true,
					autoplayHoverPause: true,
					responsive: {
						0: {
							items: 1,
							margin: 10
						},
						480: {
							items: 2,
							margin: 10
						},
						768: {
							items: 3,
							margin: 10
						},
						1024: {
							items: 3,
							margin: 15
						}
					}
				});
			}
		},

		productSlider12: function($self) {
			var $slider = $self.find('.js-product-slider12'),
				flag = true;

			if ($slider.length) {
				$win.on('resize', function() {
					var winWidth = $win.width();

					if (winWidth < 960 && flag) {
						$slider.each(function(index, item) {
							if (!$(item).hasClass('owl-carousel')) {
								$(item).addClass('owl-carousel')
							}
						});

						$slider.owlCarousel({
							items: 2,
							loop: true,
							nav: true,
							dots: false,
							autoWidth: true,
							center: true,
							responsive: {
								0: {
									margin: 15
								},
								440: {
									margin: 20
								},
								700: {
									margin: 16,
									center: false
								}
							}
						});

						flag = false;
					} else if (winWidth >= 960 && !flag) {
						$slider.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
						flag = true;
					}
				});
			}
		},

		productSlider13: function($self) {
			var $slider = $self.find('.js-product-slider13'),
				flag = true;

			if ($slider.length) {
				$win.on('resize', function() {
					var winWidth = $win.width();

					if (winWidth < 960 && flag) {
						$slider.each(function(index, item) {
							if (!$(item).hasClass('owl-carousel')) {
								$(item).addClass('owl-carousel')
							}
						});

						$slider.owlCarousel({
							items: 3,
							loop: true,
							nav: true,
							dots: false,
							responsive: {
								0: {
									center: true,
									items: 1.2,
									margin: 10
								},
								501: {
									center: false,
									items: 2,
									margin: 16
								},
								700: {
									items: 3,
									margin: 17
								}
							}

						});

						flag = false;
					} else if (winWidth >= 960 && !flag) {
						$slider.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
						flag = true;
					}
				});
			}
		},

		advantagesSlider1: function($self) {
			var $slider = $self.find('.js-advantages-slider1');

			if ($slider.length) {
				$slider.owlCarousel({
					loop: true,
					nav: true,
					items: 1,
					dots: false,
					autoplay: true,
					autoHeight : false,
					mouseDrag: true
				});
			}
		}, 

		massonry: function($self) {
			var $block = $self.find('.js-photo-masonary');
			if ($block.length) {
				setTimeout(function() {
					$block.masonry({
						itemSelector: '.bl4_item',
						gutter: '.gutter_margin',
						columnWidth: '.bl4_sizer',
						percentPosition: true
					});
				}, 1500);
			}
		},

		photoButton1: function($self){
			var $galBlock = $self.find('.gal_bl1_wrap');

			$galBlock.each(function(){
				var $this = $(this);

				$this.on('click', '.js-photo-btn1', function() {
					$(this).toggleClass('opened');
					if ($(this).hasClass('opened')) {
						$(this).text('Свернуть');
					} else {
						$(this).text('Показать все');
					}

					if ($(this).hasClass('opened')) {
						$this.find('.gal_bl_item_wrap:gt(1)').slideDown('slow');
					} else {
						$this.find('.gal_bl_item_wrap:gt(1)').slideUp('slow');
					};
				});

			});
		},

		photoButton2: function($self){
			var $galBlock = $self.find('.gal_bl3_wrap');

			$galBlock.each(function() {
				var $this = $(this);

				$this.on('click', '.js-photo-btn2', function() {
					$(this).toggleClass('opened');
					if ($(this).hasClass('opened')) {
						$(this).text('Свернуть');
					} else {
						$(this).text('Показать все');
					}

					if ($(this).hasClass('opened')) {
						$this.find('.gal_bl3_slide_wrap:gt(0)').slideDown('slow');
					} else {
						$this.find('.gal_bl3_slide_wrap:gt(0)').slideUp('slow');
					};
				});
			})
		},

		photoTab1: function($self){

			var $tabs = $self.find('.js-photo-tabs');

			$tabs.each(function(){
				var $this = $(this),
					$thisTitles = $this.find('.tabs'),
					$thisAccTitle = $this.find('.acc_title'),
					$thisAccBody = $this.find('.acc_body'),
					$thisTabs = $this.find('.tab_item');

				$thisTitles.on('click', function() {
					var $this = $(this),
						titleIndex = $this.index();

					$thisTitles.removeClass('active');
					$thisTabs.removeClass('active');
					$this.addClass('active');
					$thisTabs.eq(titleIndex).addClass('active');
				});
			});

			var $accTitle = $self.find('.js-acc-title');

			$accTitle.each(function(){
				var $this = $(this);

				$this.on('click', function() {
					if (!$(this).next('.acc_body').is(':animated')) {
						$(this).toggleClass('active').next(".acc_body").slideToggle();
					}
				});
			});

		}, 

		gallerySlider1: function($self) {

			var slider = $self.find('.js-photo-slider1');

			if (slider.length) {
				slider.owlCarousel({
					loop: true,
					nav: true,
					autoplay: true,
					responsive: {
						0: {
						items: 2,
						margin: 10
						},
						640: {
							items: 3,
							margin: 10
						},
						1024: {
							items: 4,
							margin: 20
						},
						1300: {
							items: 4,
							margin: 40
						}
					}
				});
			}
		},

		gallerySlider2: function($self){

			var slider = $self.find('.js-photo-slider2');

			if(slider.length){
				slider.owlCarousel({
					loop: true,
					margin: 0,
					nav: false,
					dots: true,
					mouseDrag: false,
					smartSpeed: 1000,
					items: 1,
					autoplay: true,
					autoHeight: 0
				});
			}	
		},

		gallerySlider3: function($self){

			/*resizeController([0, 1023], function() {

				if ($self.find(".js-photo-slider3 .gal_pic").length > 1) {
					$self.find(".js-photo-slider3").owlCarousel({
						loop: true,
						margin: 0,
						mouseDrag: false,
						smartSpeed: 500,
						autoplay: false,
						autoHeight: false,
						responsive: {
							0: {
								items: 1,
								nav: true,
								dots: false
							},
							480: {
								items: 2,
								nav: true,
								dots: false
							},
							700: {
								items: 3,
								nav: true,
								dots: false
							},
							768: {
								items: 3,
								nav: false,
								dots: true
							}
						}
					});
				}
			});*/

			/*resizeController([1024, Infinity], function() {
				$self.find('.js-photo-slider3').trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
				$this.find('.js-photo-slider3').find('.owl-stage-outer').children().unwrap();
			});*/
		},

		gallerySlider4: function($self){

			var secondFlag = 1;

			if ($(window).width() >= 768 && $self.find('.gal_bl3_slider .gal_bl3_item').length < 4) {
				secondFlag = 0;
			}

			var gallerySlider = $self.find('.js-photo-slider4');

			if (gallerySlider.length) {
				gallerySlider.each(function() {
					var $this = $(this),
						thisItemsLength = $this.find('.gal_bl3_item').length;

					if (thisItemsLength > 1) {
						$this.owlCarousel({
							loop: false,
							margin: 0,
							mouseDrag: false,
							smartSpeed: 500,
							autoplay: false,
							autoHeight: false,
							onInitialized: function(event) {
								var i = 1,
									$thisDotsSpan = $this.find('.owl-dot span');
								$thisDotsSpan.each(function() {
									$(this).append(i);
									i++;
								});
							},
							responsive: {
								0: {
									nav: true,
									dots: false,
									items: 1
								},
								639: {
									nav: true,
									dots: false,
									items: 2
								},
								700: {
									nav: true,
									dots: false,
									items: secondFlag > 0
								},
								768: {
									nav: false,
									dots: secondFlag > 0,
									items: 3
								}
							}
						});
					}
				});
			}
		
		},

		gallerySlider5: function($self) {

			var $slider = $self.find('.js-photo-slider5');

			if ($slider.length) {
				$slider.each(function() {
					var $this = $(this),
						$thisParent = $this.closest('[data-block-layout]');

					 $this.lightSlider({
						gallery: true,
						item: 1,
						auto: true,
						loop: true,
						slideMargin: 0,
						thumbMargin: 20,
						thumbItem: 4,
						thumbWidth: 190
					});

					if ($thisParent.find('.top_slider_wrapper .top_slider_wr .lSSlideOuter .lSPager.lSGallery li').length) {
						$thisParent.find('.top_slider_wrapper .top_slider_wr .lSSlideOuter .lSPager.lSGallery').show();
					} else {
						$thisParent.find('.top_slider_wrapper .top_slider_wr .lSSlideOuter .lSPager.lSGallery').hide();
					}

					$thisParent.find(".light_next").on("click", function() {
						$thisParent.find(".lSAction>.lSNext").click();
					});

					$thisParent.find(".light_prev").on("click", function() {
						$thisParent.find(".lSAction>.lSPrev").click();
					});
				});
			}
		},

		gallerySlider6: function($self) {

			var $slider = $self.find('.js-photo-slider6'),
				flag = true;

			if ($slider.length) {
				$win.on('resize', function() {
					var winWidth = $win.width();

					if (winWidth < 960 && flag) {
						$slider.each(function(index, item) {
							if (!$(item).hasClass('owl-carousel')) {
								$(item).addClass('owl-carousel')
							}
						});

						$slider.owlCarousel({
							items: 2,
							loop: true,
							nav: true,
							dots: false,
							center: true,
							responsive: {
								0: {
									items: 1.17,
									margin: 9,
									center: true
								},
								479: {
									items: 1.28,
									margin: 24
								},
								639: {
									items: 1.69,
									margin: 24
								}
							}

						});

						flag = false;
					} else if (winWidth >= 960 && !flag) {
						$slider.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
						flag = true;
					}
				});
			}
		},

		gallerySlider7: function($self) {

			var $slider = $self.find('.js-photo-slider7');

			if ($slider.length) {
			
				$slider.each(function(){
					var $this = $(this),
						thisAutoplay = $this.data('autoplay') || false,
						thisPause = $this.data('pause') || 5000,
						thisSpeed = $this.data('speed') || 250;
						
					$slider.owlCarousel({
						loop: true,
						smartSpeed: thisSpeed,
						autoplayTimeout: thisPause,
						nav: true,
						dots: false,
						autoplay: !thisAutoplay,
						responsive: {
							0: {
								items: 1,
								margin: 0
							},
							400: {
								items: 2,
								margin: 20
							},
							641: {
								items: 3,
								margin: 30
							},
							769: {
								items: 4,
								margin: 40
							}
						}
					});
					
				});
			}
		},

		gallerySlider8: function($self) {

			var $slider = $self.find('.js-photo-slider8');

			if ($slider.length) {

				$slider.each(function() {

					var $this = $(this),
						$pictureSlider = $this.find('.gallery-with-preview_Slider'),
						pictureSliderAutoplay = $pictureSlider.data('autoplay'),
						$pagers = $this.find('.gallery-with-preview_Pager'),
						$pagersChild = $pagers.find('.gallery-with-preview_pagerElement'),
						sliderOptions = {
							items: 3,
							loop: true,
							nav: true,
							dots: false,
							navSpeed: 500,
							responsive: {
								601 : {
									items: 4,
									loop: true,
									nav: true,
									dots: false,
									navSpeed: 500
								},
								951: {
									items: 1,
									loop: true,
									nav: true,
									dots: false,
									navSpeed: 500
								}
							}
						},
						modeResize;
						
					var picSlider = $pictureSlider.bxSlider({
						controls: false,
						touchEnabled: false,
						pager: false,
						auto: pictureSliderAutoplay ? true : false,
						mode: 'fade'
					});

					$this.on("click", '.gallery-with-preview_pagerElement', function(event) {
						event.preventDefault();
						
						var $this = $(this),
							thisDataIndex = $this.data('slide-index');

						$pagersChild.removeClass('shadow');
						$this.addClass('shadow');
						picSlider.goToSlide(thisDataIndex);
					});
					
					$win.on('resize', resizePhotoGallery);

					function resizePhotoGallery(){
						
						if ($win.width() < 951 && modeResize != 'phone') {
							
							if ($pagersChild.length > 3) {
								$pagers.trigger('destroy.owl.carousel');
								$pagersChild.unwrap();
								$pagers.owlCarousel(sliderOptions);
							}
							modeResize = 'phone'
							
						} else if ($win.width() >= 951 && modeResize != 'pc') {
							
							if ($pagersChild.length > 8) {
								$pagers.trigger('destroy.owl.carousel');
								
								var pagersChildDOM = $pagersChild.get();
								if (modeResize == 'phone') {
									for(var i = 0; i < $pagersChild.length; i += 8){
									    $(pagersChildDOM.slice(i, i+8)).wrapAll('<div></div>');
									}
								}
								
								$pagers.owlCarousel(sliderOptions);
							}
							
							modeResize = 'pc'
						}
					}					
				});
			}
		},

		gallerySlider9: function($self) {

			var $slider = $self.find('.js-photo-slider9');

			if ($slider.length) {
				$slider.owlCarousel({
					loop: true,
					margin: 0,
					nav: true,
					dots: false,
					mouseDrag: false,
					items: 1,
					autoplayTimeout: 5000,
					smartSpeed: 1000,
					autoplay: true
				});
			}
		},

		gallerySlider10: function($self) {

			var $slider = $self.find('.js-photo-slider10'),
				flag = true;

			if ($slider.length) {
				$win.on('resize', function() {
					var winWidth = $win.width();

					if (winWidth < 960 && flag) {
						$slider.each(function(index, item) {
							if (!$(item).hasClass('owl-carousel')) {
								$(item).addClass('owl-carousel')
							}
						});

						$slider.owlCarousel({
							loop: true,
							nav: true,
							dots: true,
							autoWidth: true,
							smartSpeed: 600,
							items: 3,
							autoplay: true,
							autoHeight: true,
							center: true,
							responsive: {
								0: {
									margin: 10
								},

								480: {
									margin: 16
								}
							}

						});

						flag = false;
					} else if (winWidth >= 960 && !flag) {
						$slider.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
						flag = true;
					}
				});
			}
		},

		productAccordeon: function($self) {
			var $products = $self.find('.js-product-accordeon');
	
			if ($products.length) {
				$products.on('click', function(e) {
					var $this = $(this),
						$button = $(e.target).closest('.desc_button'),
						$winWidth = $win.width();
						
					$this.toggleClass('active');
					
					if ($winWidth > 1023 && $button.length) {
						if (!$button.next('.desc_body').is(':animated')) {
							$button.toggleClass('active').next('.desc_body').slideToggle(200);
						}
					} else if ($winWidth <= 1023) {
						if (!$this.next('.prd_accordion').is(':animated')) {
							$this.toggleClass("active").find(".prd_accordion").slideToggle();
						}
					}
				});
			}
		},

		arrowsDown: function($self) {
			$self.on('click', '.js-arrow-down', function() {
				var $this = $(this),
					$parent = $this.closest('[data-block-layout]'),
					blockPosition = $parent.offset().top,
					blockHeight = $parent.height(),
					newScroll = blockPosition + blockHeight;

				$('html, body').animate({
					scrollTop: newScroll
				}, 850);
			})
		},

		tabsWithSlider: function($self) {
			var $tabs = $self.find('.tabs-block_wrap_tabs');

			if ($tabs.length) {
				$tabs.each(function(){
					var $tabsWrap = $(this),
						$tabsItems = $tabsWrap.find('li'),
						$tabsBoxes = $tabsWrap.closest('.tabs_block').find('.box'),
						tabsCountTotal = $tabsItems.length,
						tabsWrapWidth = $tabsWrap.width(),
						tabsWidth = 0,
						tabAverage, tabsCountInWrap;
						
					$tabsItems.each(function() {
						tabsWidth += $(this).outerWidth();
					});
					
					tabAverage = tabsWidth / tabsCountTotal;
					tabsCountInWrap = Math.floor(tabsWrapWidth / tabAverage);
					
					if (tabsWrapWidth <= tabsWidth) {
						$tabsWrap.slick({
							infinite: false,
							variableWidth: true,
							slidesToShow: tabsCountInWrap
						});
					}
					
					$tabsWrap.on('click', 'li', function() {
						var $this = $(this);
						if ($this.hasClass('active')) return;
						
						$tabsItems.removeClass('active opened');
						$this.addClass('active opened');
						$tabsBoxes.removeClass('open_tab').eq($this.index()).show();
					});
					
				});
			}
		},
		
		lightGallery: function($self) {
			$self.find('[data-lightgallery]').each(function() {
				var $this = $(this),
					thisSelector = $this.data('lightgalleryselector') || '';

				$this.lightGallery({
					thumbnail: false,
					download: false,
					loop: false,
					selector: thisSelector
				});

			})
		}

	};

	lp_template.initFunctions = function($self) {
		Object.keys(lp_template.functions).forEach(function(item) {
			var thisFunction = lp_template.functions[item];

			if (typeof thisFunction == 'function') {
				thisFunction($self);
			}
		});
	};

	window.lp_template = lp_template;

	window.lp_init = function(block_wrapper) {

		lp_template.initFunctions(block_wrapper);
		
		$doc.on('click touchend', function(e) {
			if ($(e.target).closest('.one-screen .contacts-part').length) return;
			block_wrapper.find('.one-screen .contacts-part input[type="radio"]').removeAttr('checked');
		});
		
		block_wrapper.on('click', '.one-screen .contacts-part input[type="radio"]',  function(e) {
			var $this = $(this);
			
			if ($this.data('opened') === 1) {
				block_wrapper.find('.one-screen .contacts-part input[type="radio"]').removeAttr('checked');
			} else {
				$this.data('opened', 1)
			}
		});
		
		block_wrapper.find('.services2 .item .button2').goodNameForForm({
			parent: '.item',
			title: '.title'
		});
		
		block_wrapper.find('.products-with-pic--theme9 .product .popup-button').goodNameForForm({
			parent: '.bottom-part',
			title: '.title'
		});
		
		block_wrapper.find('.products--theme9 .product .popup-button').goodNameForForm({
			parent: '.product',
			title: '.name'
		});
		
		block_wrapper.find('.one-good-wrapper .one_good_wrap .buy-good').goodNameForForm({
			parent: '.good-desc-block',
			title: '.good-title'
		});
		
		block_wrapper.find('.one-good-icon__wrapper .one_good_wrap .one-good-icon__buy').goodNameForForm({
			parent: '.one_good_wrap',
			title: '.one-good-icon__title'
		});
		
		block_wrapper.find('.one-good-horizontal__bg-wrapper .one_good_wrap .buy-good').goodNameForForm({
			parent: '.one_good_wrap',
			title: '.good-title'
		});
		
		block_wrapper.find('.only-one-product .only-one-product-inner .button-general').goodNameForForm({
			parent: '.text-part',
			title: '.title'
		});
		
		block_wrapper.find('.tariff-blocks_wrapper .block .button').goodNameForForm({
			parent: '.block',
			title: '.tariff-name'
		});
		
		block_wrapper.find('.pr_block1_wrapper .pr_block1_item .pr_button').goodNameForForm({
			parent: '.pr_block1_item',
			title: '.title'
		});
		
		block_wrapper.find('.mirrored-products_wrapper .mirrored-products_item .button').goodNameForForm({
			parent: '.mirrored-products_item',
			title: '.subtitle'
		});
		
		block_wrapper.find('.horizontal_blocks .service-item .order').goodNameForForm({
			parent: '.service-desc-block',
			title: '.service-title'
		});
		
		block_wrapper.find('.multy_blocks .service-item .buy-button').goodNameForForm({
			parent: '.service-item',
			title: '.service-title'
		});
		
		block_wrapper.find('.pr_block2_wrapper .pr_block2_item .button-general').goodNameForForm({
			parent: '.pr_block2_item',
			title: '.title'
		});
		
		block_wrapper.find('.tariffs_wrapper  .tariff .button-general').goodNameForForm({
			parent: '.tariff',
			title: '.title'
		});
		
		block_wrapper.find('.product-list .btn').goodNameForForm({
			parent: 'li',
			title: '.product-name'
		});
		
		block_wrapper.find('.services--theme5 .item .button-general').goodNameForForm({
			parent: '.item',
			title: '.title'
		});
		
		block_wrapper.find('.serv_bl3_wrapper .serv_bl3_item .serv_item_but').goodNameForForm({
			parent: '.serv_bl3_item',
			title: '.serv_item_title'
		});
		
		block_wrapper.find('.products--theme5 .item-wrapper .button-general').goodNameForForm({
			parent: '.item-wrapper',
			title: '.title'
		});
		
		block_wrapper.find('.one-good-form_inner, .one-good-form2_inner').on('click', '.button', function() {
			$(this).closest('.one-good-form_inner, .one-good-form2_inner').find('.tpl-anketa-popup').addClass('expand');
		});
		
		block_wrapper.find(".one-good-form_inner, .one-good-form2_inner").on('click', '.tpl-anketa_close', function() {
			$(this).closest(".one-good-form_inner, .one-good-form2_inner").find(".tpl-anketa-popup").removeClass("expand");
		});

		$win.trigger('resize').trigger('scroll');

	}

})(jQuery);