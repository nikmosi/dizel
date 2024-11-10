shop2.queue.delivery = function() {
  $(document).on('click', '.option-label', function() {
    var options = $(document).find('.option-label'),
      groups = $(document).find('.option-type'),
      details = options.next();

    var $this = $(this),
      index = $this.parent().index();

    groups.removeClass('active-type');
    $this.parent().addClass('active-type');
    details.find('input, textarea, select').prop('disabled', true);
    $this.next().find('input, textarea, select').prop('disabled', false);
    
    $this.next().find('select').trigger('refresh');

  });
  
  $(document).on('click', '.shop2-delivery--item__tab .label', function() {
    var groups = $(document).find('.shop2-delivery--item__tab'),
      $this =  $(this),
      parent = $this.parent(),
      index = parent.index();

    if (parent.hasClass('disabled')) return false;

    groups.removeClass('active-tab').eq(index).addClass('active-tab');
    anketaController.init({anketa_id:"g-anketa",form_selector:"#form_g-anketa"});
  });

  $(document).on("click", ".option-label", function() {
    var $this = $(this),
      attach_id = $this.data("attach_id"),
      siblings = $this.parent().siblings(".option-type"),
      tabsSib  = $this.parents('.shop2-delivery--item__tab:first').siblings();
    $("#delivery_id_deligate").val(attach_id);
    $("#deligate_points_fields .fields").empty();
    $("#deligate_points_fields").hide();
    tabsSib.find('.option-type input').prop('checked', false);
    tabsSib.removeClass('point');
    siblings.find('input').prop('checked', false);

    //$('#form_g-anketa .text-right button').prop('disabled', false).removeClass('g-button--disabled');
  });

	$('#shop2-ems-calc, #shop2-edost-calc').on('click', function(e) {
		var $this = $(this);
		var attach_id = $this.data('attach-id');
		var to = $('select[name=' + attach_id + '\\[to\\]]');
		var zip = $('input[name=' + attach_id + '\\[zip\\]]');
		var order_value = $('input[name=' + attach_id + '\\[order_value\\]]');

		if (to.length == 0) {
			to = $('#shop2-edost2-to');
		}

		e.preventDefault();

		to = to.get(0)? to.val() : '';
		zip = zip.get(0)? zip.val() : '';
		order_value = order_value.prop("checked") ? 'on' : '';

		shop2.delivery.calc(attach_id, 'to=' + to + '&zip=' + zip + '&order_value=' + order_value, function(d) {
			if (!d.data && d.errstr) {
				shop2.alert(d.errstr);
				$('#delivery-' + attach_id + '-cost').html(0);
			} else {
				$('#delivery-' + attach_id + '-cost').html(d.data.cost);

				if (d.data.html) {
					$('#delivery-' + attach_id + '-html').html(d.data.html);
					shop2.queue.edost();
				}
			}
		});

	});
};

shop2.queue.filter = function() {

	var wrap = $('.shop-filter'),
		result = $('.result');

	shop2.filter.init();

	shop2.on('afterGetSearchMatches', function (d, status) {

		if (d.data.total_found === 0) {

			result.addClass('no-result');
		} else {
			result.removeClass('no-result');
		}

		$('#filter-result').html(d.data.total_found);

		result.removeClass('hide');
	});

	wrap.find('.param-val').on('click', function(e) {
		var $this = $(this),
			name = $this.data('name'),
			value = $this.data('value');

		e.preventDefault();

		$this.toggleClass('active-val');
		shop2.filter.toggle(name, value);
		shop2.filter.count();
	});
	
	wrap.find('.type-val').on('click', function(e) {
		var $this = $(this),
			name = $this.data('name'),
			value = $this.data('value');

		e.preventDefault();

		$this.addClass('active-val');
		shop2.filter.add(name, value);
		shop2.filter.count();
	});
	
	if (wrap.find('.type-val').length) {
		var $this = $('.type-val.active-val'),
			name = $this.data('name'),
			value = $this.data('value');
			
		shop2.filter.add(name, value);
		shop2.filter.count();
	}

	wrap.find('select').on('change', function() {
		var $this = $(this),
			name = this.name,
			value = $this.val();

		shop2.filter.add(name, value);
		shop2.filter.count();
	});

	wrap.find('input:text').keyup(function() {
		var $this = $(this),
			name = $this.attr('name');

		$.s3throttle('filter: ' + name, function() {
			var value = $this.val();

			shop2.filter.add(name, value);
			shop2.filter.count();
		}, 500);
	});

	wrap.find('.shop-filter-go').on('click', function(e) {
		e.preventDefault();
		shop2.filter.go();
	});

};

shop2.queue.cart = function() {

	var updateBtn = $('.shop2-cart-update'),
		cartTable = $('.shop2-products-wrapper'),
		form = $('#shop2-cart');

	shop2.on('afterCartRemoveItem, afterCartUpdate', function() {
		document.location.reload();
	});

	function updateBtnShow() {
		updateBtn.show();
		updateBtn.css({'display': 'inline-block'});
	}

	cartTable.find('input:text').on('keypress', function(e) {
		if (e.keyCode == 13) {
			shop2.cart.update(form);
		} else {
			updateBtnShow();
		}
	});

	cartTable.find('.amount-minus, .amount-plus').on('click', updateBtnShow);

	updateBtn.on('click', function(e) {
		e.preventDefault();
		shop2.cart.update(form);
		return false;
	});

	$('.cart-delete a').on('click', function(e) {
		var $this = $(this),
			id = $this.data('id');

		e.preventDefault();

		shop2.cart.remove(id);

	});

};

shop2.msg = function(text, obj) {
	var selector = '#shop2-msg',
		msg = $(selector),
		offset = obj.offset(),
		width = obj.outerWidth(true),
		height = obj.outerHeight();

	if (!msg.get(0)) {
		msg = $('<div id="shop2-msg">');
		$(document.body).append(msg);
		msg = $(selector);
	}

	msg.html(text).show();

	var msgWidth = msg.outerWidth();
	var left = offset.left + width;
	var top = offset.top + height;

	if (left + msgWidth > $(window).width()) {
		left = offset.left - msgWidth;
	}

	msg.css({
		left: left,
		top: top
	});

	$.s3throttle('msg', function() {
		msg.hide();
	}, shop2.options.msgTime);

};



shop2.queue.addToCart = function() {


	$(document).on('click', '.shop2-product-btn', function(e) {

		var $this = $(this),
			$form = $this.closest('form'),
			form = $form.get(0),
			adds = $form.find('.additional-cart-params'),
			len = adds.length,
			i, el,
			a4 = form.amount.value,
			kind_id = form.kind_id.value;

		e.preventDefault();

		if (len) {
			a4 = {
				amount: a4
			};

			for (i = 0; i < len; i += 1) {
				el = adds[i];
				if (el.value) {
					a4[el.name] = el.value;
				}
			}
		}

		shop2.cart.add(kind_id, a4, function(d) {

			$('#shop2-cart-preview').replaceWith(d.data);

			if (d.errstr) {
				shop2.msg(d.errstr, $this);
			} else {
			var $text = window._s3Lang.JS_SHOP2_ADD_CART_WITH_LINK;
            // window._s3Lang.JS_ADDED - Добавлено
            shop2.msg($text.replace('%s', shop2.uri + '/cart'), $this);
			}

			if (d.panel) {
				$('#shop2-panel').replaceWith(d.panel);
			}
		});

	});

};

if(/MSIE 10|rv:11.0/i.test(navigator.userAgent)) {
	document.documentElement.className="ie";
} else if (/AppleWebKit/i.test(navigator.userAgent)) {
	if(Number(navigator.userAgent.match(/AppleWebKit\/([^\s]*)/i)[1]) < 537.1) {
		document.documentElement.className="oldWebKit";
	}
}

$(function () {

	var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || /[\?&]panel_fake_mobile=1(&|$)/.test(document.location.search),
		isApple = /iPod|iPad|iPhone/i.test(navigator.userAgent),
		clickStart = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) ? 'touchstart' : 'click.respons',
		$body = $(document.body),
		$html = $(document.documentElement);
		
		
	shop2.queue.question = function() {
		var cls = '.price-old.question, .shop2-cart-total .question';

		$(document).on(isMobile ? 'touchend' : 'mouseenter', cls, function() {
			var $this = $(this),
				win = $this.next().show(),
				position = $this.position(),
				height = win.outerHeight(true);
				
			win.css({
				top: position.top - height - 5,
				left: position.left
			});
		}).on(isMobile ? 'touchstart' : 'mouseleave', cls, function() {
			var $this = $(this),
				win = $this.next();

			win.hide();
		});
		
		$(document).on(clickStart, function(e) {
			if ( $(e.target).closest(cls).length ) return;
			$(cls).siblings('.shop2-product-discount-desc').hide();
		});
	};
	
	shop2.queue.question();
		

	//слайдер

	if ($('.slider-block .item').length > 1) {
		$(".slider-block").addClass('owl-carousel').owlCarousel({
			loop: true,
			margin: 0,
			nav: true,
			items: 1,
			autoplay: false,
			dots: true,
			autoHeight: true,
			onTranslate: function() {
				setTimeout(function() {
			    	$('.left-sliderText .info').hide().html($(".slider-block").find('.owl-item.active .item .info').html()).fadeIn();
			    });
			}
		});
	}

	//слайдер

	if ($('.brands-block-inner .item').length > 1) {
		$(".brands-block-inner").addClass('owl-carousel').owlCarousel({
			loop: false,
			margin: 0,
			nav: true,
			items: 12,
			autoplay: false,
			dots: false,
			responsiveClass:true,
		    responsive:{
		    	0:{
		            items:1,
		            nav:true
		        },
	 			320:{
		            items:1,
		            nav:true
		        },
		 		480:{
		            items:3,
		            nav:true
		        },
		        767:{
		            items:7,
		            nav:true
		        },
		        1000:{
		            items:12,
		            nav:true
		        }
		    }
		});
	}

		//---Top-menu
	var topMenuFlag = 1,
		$topPanel = $('.top-panel-line-in'),
		$menuTopWr = $('.menu-top-wr');

	$('.mobile-top-menu-burger, .menu-top-title').on('click', function(event) {
		event.preventDefault();
		
		$menuTopWr.toggleClass('opened');
	});

	if (!isMobile){
		$('.menu-top').oneLineMenu({
	    	minWidth : 940
	    });
	    
	    if (shop2.my.gr_menu_top_68) {
	    
			$(window).load(function() {
				let $topPanelHeight = $('.top-wrap-panel').innerHeight();
			    $('.dropdown-wrap').on('click', function(e){
			    	//e.preventDefault();
			    	if($(this).hasClass('submenu-opened')) {
			    		//$(this).removeClass('submenu-opened').find('ul:first').css({'display' : '', 'top' : ''});
			    		console.log(123);
			    	} else {
			    		$(this).addClass('submenu-opened').find('ul:first').css({'display' : 'block', 'top' : $topPanelHeight});
			    	};
			    });
			    $('.dropdown-wrap').mouseleave(function(){
			    	$(this).removeClass('submenu-opened').find('ul:first').css({'display' : '', 'top' : ''});
			    });
			})
		
		} else {
			
			$(window).load(function() {
				let $topPanelHeight = $('.top-wrap-panel').innerHeight();
			    $('.dropdown-wrap').on('click', function(e){
			    	e.preventDefault();
			    	if($(this).hasClass('submenu-opened')) {
			    		$(this).removeClass('submenu-opened').find('ul:first').css({'display' : '', 'top' : ''});
			    	} else {
			    		$(this).addClass('submenu-opened').find('ul:first').css({'display' : 'block', 'top' : $topPanelHeight});
			    	};
			    });
			    $('.dropdown-wrap').mouseleave(function(){
			    	$(this).removeClass('submenu-opened').find('ul:first').css({'display' : '', 'top' : ''});
			    });
			})
		
		}
	}
	function topMenu() {
		if ((!isMobile && window.matchMedia('(min-width:940px)').matches) && (topMenuFlag == 1 || topMenuFlag == 3)){
			$menuTopWr.removeClass('mobileTopMenu');
			$topPanel.removeClass('mobileTopLine');

			$(function() {
			    $('.menu-top').s3MenuAllIn({
			        type: 'bottom',
			        debug: 0,
			        activateTimeout: 250,
			        showTime: 250,
			        hideTime: 250,
			        showFn: $.fn.fadeIn,
			        hideFn: $.fn.fadeOut
			    });
			});
			$('.menu-top li').each(function(){		
				var $this = $(this);

				if ($this.find('> ul').get(0)) {
					$this.find('> a > .s1').hide();
					$this.find('> a').removeClass('hasMenu');
				}
			});

			topMenuFlag = 2;
		}else if(isMobile || window.matchMedia('(max-width:939px)').matches){


            if (topMenuFlag == 1 || topMenuFlag == 2) {
				$('.menu-top').off('mouseenter mouseleave');
	            $('.menu-top').find('.s3-menu-allin-has').removeClass('s3-menu-allin-has');
	            $('.menu-top').find('ul').removeAttr('style');

				$menuTopWr.addClass('mobileTopMenu');
				$topPanel.addClass('mobileTopLine');

				$('.menu-top li').each(function(){
					var $this = $(this),
					$spanS1 = $('<span class="s1"></span>');
					
					if ($this.find('> ul').get(0)) {
						$this.find('> ul').css('marginLeft', 0);
						if ($this.find('> a .s1').length){
							$this.find('> a .s1').show();
						} else {
							$this.find('> a').append($spanS1);
						}
						$this.find('> a').addClass('hasMenu')
					}
					if ($this.hasClass('opened')) {
						$this.find($spanS1).addClass('active');
					}
				});
				$('.menu-top li span.s1').on(clickStart, function(event) {
					event.preventDefault();

					var $this = $(this);
					var ul = $this.parents('li:first').find('ul:first');
					var $li = $this.closest('li');
					
					if (ul.get(0)) {
							ul.toggle();
							$this.toggleClass('active');
							$this.closest('a').toggleClass('active');

							$li.siblings().filter(':has(">ul")').each(function(){
								var $this = $(this);
								$this.find('>ul').css('display', 'none');
								$this.find('> a .s1').removeClass('active');
							});
					}
					return true;
				});
			}

			topMenuFlag = 3;
		}
	}
	
	//Buy-one-click
	
	$('.buy-one-click-form-wr').appendTo('.site-wrapper');
	(function(){
		if(!$('.buy-one-click, .catalog-btn').length) return;
		
		var $form = $('.buy-one-click-form-wr'),
			$closeFormBtn = $('.buy-one-click-form-in .close-form');
		
		$('.buy-one-click, .catalog-btn').on("click", function(e){
			e.preventDefault();
			var productLink = (shop2.mode!=="product") ? (document.location.origin)+$(this).closest('.shop2-item-product').find('.product-name > a').attr('href') : (document.location.href),
				productName = (shop2.mode!=="product") ? $(this).closest('.shop2-item-product').find('.product-name > a').html() + (' Количество:' + $(this).closest('.shop2-item-product').find('.shop2-product-amount input[type="text"]').val()) : $(this).closest('.site-container').find('h1').html() + (' | Количество: ' + $(this).closest('.product-l-side-in').find('.shop2-product-amount input[type="text"]').val());
			
			$form.addClass('opened');
			setTimeout(function() {
				$form.find('input.productName').val(productName);
				$form.find('input.productLink').val(productLink);
			}, 800);
			
			if (isApple) {
				$('html, body').addClass('overflowHidden');
			} else {
				$(document.documentElement).addClass('overflowHidden');
			}
		});
		
		$closeFormBtn.on(clickStart, function(e){
			e.preventDefault();
			
			$form.removeClass('opened');
			
			if (isApple) {
				$('html, body').removeClass('overflowHidden');
			} else {
				$(document.documentElement).removeClass('overflowHidden');
			}
		});
		
		$body.on(clickStart, function(event) {
			
			if ($(event.target).closest('.buy-one-click, .catalog-btn, .buy-one-click-form-in, body #ui-datepicker-div, .ui-datepicker-next, .ui-datepicker-prev').length) return;
			
			$form.removeClass('opened');
			
			if (isApple) {
				$('html, body').removeClass('overflowHidden');
			} else {
				$(document.documentElement).removeClass('overflowHidden');
			}
		});
		
		$html.on('keyup', function(e) {
			if ( (e.keyCode || e.which) == 27 && $form.hasClass('opened') ) {
				$form.removeClass('opened');
				$html.removeClass('overflowHidden');
			}
		});
	})();


	//--Cart
	var $input = $('.shop2-product-amount input');
	
	$input.on("change", function(e) {
    	var curVal = +$(this).val();
    	
		if (curVal < 1) {
    		$(this).val(1);
    	} else if (curVal == 1) {
    		$minus.attr("disabled", "disabled");
    	} else if (curVal > 1) {
    		$minus.removeAttr("disabled");
    	}
	});
	
	
	var $cartBtn = $('.cart-block-btn');
		
	$cartBtn.on(clickStart, function(event) {
		event.preventDefault();
		$('.cart-wrapper').toggleClass('opened');
	});

	$body.on(clickStart, function(e) {
		if ( $(e.target).closest($('.cart-wrapper').add($cartBtn)).length ) return;
		$('.cart-wrapper').removeClass('opened');
	});

	// Mail Form
			
	var mailForm = $('.form-callback-wrapper'),
		mailButton = $('.callback-click a');
		
	mailButton.on('click', function (e) {
		e.preventDefault();
		mailForm.addClass('opened');
		$html.addClass('overflowHidden');
	});
	
	mailForm.find('.close-form').on(clickStart, function(e) {
		e.preventDefault();
		mailForm.removeClass('opened');
		$html.removeClass('overflowHidden');
	});
	
	$body.on(clickStart, function(e) {
		if ( $(e.target).closest($('.form-callback-inner, body #ui-datepicker-div, .ui-datepicker-next, .ui-datepicker-prev').add(mailButton)).length ) return;
		if ( mailForm.hasClass('opened') ) {
			mailForm.removeClass('opened');
			$html.removeClass('overflowHidden');
		}
	});
	
	$html.on('keyup', function(e) {
		if ( (e.keyCode || e.which) == 27 && mailForm.hasClass('opened') ) {
			mailForm.removeClass('opened');
			$html.removeClass('overflowHidden');
		}
	});

	//----Folder
	var	$folderWr = $('.folder-top-wr'),
		$folderOpenBtn = $('.folder-block-title');

	$folderOpenBtn.on('click', function(event) {
		event.preventDefault();
		
		$folderWr.toggleClass('opened');

		if (!isMobile) return false;
		var maxHeight = $(window).height();

		$folderWr.css({
			'maxHeight': maxHeight,
			'overflow': 'auto'
		});
	});

	$('.folder-ul li').each(function(){
		var $this = $(this),
		$spanS1 = $('<span class="s1"></span>');
		
		if ($this.find('> ul').get(0)) {
			$this.find('> ul').css('marginLeft', 0);
			if ($this.find('> a .s1').length){
				$this.find('> a .s1').show();
			} else {
				$this.find('> a').append($spanS1);
			}
			$this.find('> a').addClass('hasMenu')
		}
		if ($this.hasClass('opened')) {
			$this.find($spanS1).addClass('active');
		}
	});
	$('.folder-ul li span.s1').on(clickStart, function(event) {
		event.preventDefault();

		var $this = $(this);
		var ul = $this.parents('li:first').find('ul:first');
		var $li = $this.closest('li');
		
		if (ul.get(0)) {
				ul.toggle();
				$this.toggleClass('active');
				$this.closest('a').toggleClass('active');

				$li.siblings().filter(':has(">ul")').each(function(){

					var $this = $(this);
					$this.find('>ul').css('display', 'none');
					$this.find('> a .s1').removeClass('active');
					$this.find('> a').removeClass('active');
				});
		}
		return true;
	});
	
	$body.on(clickStart, function(e) {
		if ( $(e.target).closest($folderWr).length ) return;
		
		if ($folderWr.hasClass('opened')) {
			$folderWr.removeClass('opened');
		}
	});
	
	$html.on('keyup', function(e) {
		if ( (e.keyCode || e.which) == 27 && $folderWr.hasClass('opened') ) {
			$folderWr.removeClass('opened');
		}
	});


	//---Search
	var $searchOpenBtn = $('.site-search-btn'),
		$siteSearch = $('.site-search-wr').eq(0);

		$searchOpenBtn.on(clickStart, function(event) {
			event.preventDefault();
			$siteSearch.addClass('opened');
		});
		
		$body.on(clickStart, function(e) {
			if ( $(e.target).closest($siteSearch.add($searchOpenBtn)).length ) return;
			$siteSearch.removeClass('opened');
		});

	//---User-block
	var $userBlockBtn = $('.login-block-wr .block-user .block-title'),
		$userBlock = $('.login-block-wr .block-user');

	$userBlockBtn.on(clickStart, function(event) {
		event.preventDefault();
		
		if ($userBlock.hasClass('opened')) {
			$userBlock.removeClass('opened');
		} else {
			$userBlock.addClass('opened');
		}
	});
	
	$body.on(clickStart, function(e) {
		if ( $(e.target).closest($userBlock.add($userBlockBtn)).length ) return;
		$userBlock.removeClass('opened');
	});

	//---Main-folder-block
	var folderAmount = $('.folders-main .folders-li').length,
		$viewFolder = $('.view-all-folder'),
		folderViewText = $viewFolder.data('more') ? $viewFolder.data('more') : 'Все категории',
		folderHideText = $viewFolder.data('hide') ? $viewFolder.data('hide') : 'Скрыть',
		mainNum;

	function folder_mobile_amount() {
		$viewFolder.off(clickStart).hide();
		if(window.matchMedia('(max-width:650px)').matches) {
			mainNum = 3;
		} else {
			mainNum = 9;
		}
		
		if ( $('.folders-main .folders-li').length > mainNum ) {
			$viewFolder.show();
		}
		
		if (folderAmount > mainNum) {
			$viewFolder.removeClass('disabled');
			$viewFolder.on(clickStart, function(event) {
				event.preventDefault();
				var folderCount = 0;

				if ($('.folders-main .folders-li').last().is(':hidden')) {
					$('.folders-main .folders-li').each(function() {
						folderCount = folderCount +1;
						if (folderCount > mainNum) {
							$(this).css('display', 'inline-block');
						}
					});
					$(this).addClass('active').find('> span').html(folderHideText);
				} else {
					var folderCount = 0,
						offsetTopFolder = $('.folders-main-wr').offset().top - $('.top-line-wr').height();

					$('.folders-main .folders-li').each(function() {
						folderCount = folderCount +1;
						if (folderCount > mainNum) {
							$(this).css('display', 'none');
						}
					});
					$(this).removeClass('active').find('> span').html(folderViewText);
					$('body,html').animate({ scrollTop: offsetTopFolder}, 500);
					return false;
				}
			});
		}
	}
    
	var ContH = $('.site-container').height;

	// left folders

	$('.left-folders').find(' li.has-child > a').append('<span class="s1"></span>')

	$('.left-folders li span.s1').on(clickStart, function(event) {
		event.preventDefault();

		var $this = $(this);
		var ul = $this.parents('li:first').find('ul:first');
		var $li = $this.closest('li');
		
		if (ul.get(0)) {
				ul.toggle();
				$this.toggleClass('active');
				$this.closest('a').toggleClass('active');

				$li.siblings().filter(':has(">ul")').each(function(){
					var $this = $(this);
					$this.find('>ul').css('display', 'none');
					$this.find('> a .s1, > a').removeClass('active');
				});
		}
		setTimeout(function() {
			$('.fixed-category-inner').sly('reload');
			$('.fixed-category-inner').sly('reload');
		}, 100);
		return true;
	});
	
	$(document).on(clickStart, function(e) {
		if ( $(e.target).closest('.mobile-select-product').length ) {
			$('.field-product-type').toggleClass('active');	
		}
		
		if ( $(e.target).closest('.field-product-type > label').length ) {
			setTimeout(function() {
				$('.field-product-type').removeClass('active');
			}, 10);
			
			$('.mobile-select-product').text($(e.target).closest('.field-product-type > label').find('.cat-item').text());
		}
	});

	//слайдер

	var mainProductsWr = $('.main-slide-block');
	
	for ( var sl_count = 0; sl_count < mainProductsWr.length; sl_count++ ) {
		if ( mainProductsWr.eq(sl_count).find('.product-list .main-product-item').length > 1 ) {
			mainProductsWr.eq(sl_count).find('.product-list').addClass('owl-carousel').owlCarousel({
				loop: true,
				margin: 30,
				nav: true,
				items: 2,
				autoplay: false,
				dots: true,
				responsive:{
					0:{
						items:1
					},
					480:{
						items: 2,
						margin: 30         
					},
					701:{
						items: 3,
						margin: 24
					},
					768:{
						items:3,
						margin: 20
					},
					1025:{
						items:4
					},
					1171:{
						items:2
					}
				},
				onInitialized: function () {
					var controlWr = mainProductsWr
												.eq(sl_count)
												.find('.product-list')
												.append('<div class="owl-controls"></div>');
					controlWr.find('.owl-controls').append(controlWr.find('.owl-nav, .owl-dots'));
				}   
			});
		}                       
	}
	
	$('.main-slide-block .main-product-item').matchHeight();
	
	
	if ( shop2.mode == 'product' ) {
	 	$('.product-r-side-in .product-image').lightGallery({
	 		selector : 'a',
	 		useLeftForZoom : true
	 	});
	}
	
	
	// Product Thumbnails

	$('.product-thumbnails-wr .product-thumbnails').addClass('owl-carousel').owlCarousel({
		loop: false,
		margin: 12,
		nav: true,
		items: 3,
		autoWidth: true,
		autoplay: false,
		dots: false,
		mouseDrag: false,
		responsive: {
			0: {
				margin: 8
			},
			768: {
				margin: 10
			},
			981: {
				margin: 12
			}
		},
		onInitialized: function(){
			$('.product-thumbnails-wr .product-thumbnails').trigger('refresh.owl.carousel');	
		}
	});
	
	$(window).on('load', function() {
		$('.product-thumbnails-wr .product-thumbnails').trigger('refresh.owl.carousel');
	});
	
	var $thumbsProductPic = $('.product-thumbnails a'),
		$productPic = $('.product-r-side-in .product-image a');
		$productPicLi = $('.product-thumbnails li');
		
		$thumbsProductPic.on(clickStart, function(e) {
			var ind = $(this).closest('.owl-item').index();
			e.preventDefault();
			$productPic.hide().removeClass('active').eq(ind).show().addClass('active');
			$productPicLi.removeClass('active').closest('.owl-item').eq(ind).find('li').addClass('active');
		});

	//Tabs
	if ($('.shop-product-tabs').length>0) {
	var $tabs = $('#product_tabs');

		$tabs.responsiveTabs({
			rotate: false,
			startCollapsed: false,
			collapsible: 'accordion',
			animation: 'slide',
			setHash: false,
			scrollToAccordionOffset: 0,
			activate: function(){
				//collectionHeight();
			}
		});
	};
		
	var flag = 1;	
	function collectionSlider() {	
		setTimeout(function () {
			
		
		var orentation = (window.matchMedia('(max-width: 1170px)').matches) ? 1 : 0;

		if (window.matchMedia('(min-width: 981px)').matches) {
			var ThumbWidth = 33.333333333;
		} else if (window.matchMedia('(min-width: 701px)').matches) {
			var ThumbWidth = 50;
		} else {
			var ThumbWidth = 100;
		}

		

		for (var i = 1; i <= $('.shop-collection-wr').length; i++) {
		
			var $wrap = $('#sly-collection-' + i).parent(),
				heightItems = 0;

			if (!orentation) {
				$wrap.find('.shop2-kind-item').each(function () {
					heightItems += $(this).outerHeight();
				});

				if (heightItems <= $wrap.innerHeight()) {
					$wrap.addClass('disabled');
				}
			} else if ($wrap.find('.shop2-kind-item').length <= 3 &&
				window.matchMedia('(min-width: 981px)').matches)
			{
				$wrap.addClass('disabled');
			} else if ( $wrap.find('.shop2-kind-item').length <= 2 &&
				window.matchMedia('(min-width: 701px)').matches)
			{
				$wrap.addClass('disabled');
			} else if ( $wrap.find('.shop2-kind-item').length < 2 &&
				window.matchMedia('(max-width: 700px)').matches)
			{
				$wrap.addClass('disabled');
			} else {
				$wrap.removeClass('disabled');
			}

			if (orentation) {
				var wrapperWidth = $wrap.find('.shop-collection-in').outerWidth(),
					collectionThumbWidth = Math.floor((wrapperWidth / 100) * ThumbWidth);

					$wrap.find('.shop2-kind-item').css({
						'width': collectionThumbWidth - ( (window.matchMedia('(min-width: 701px)').matches) ? 19 : 0)
					});
			}
			
			if (flag == 1) {
				var options = {
						horizontal: orentation,
						itemNav: 'basic',
						smart: 1,
						activateOn: 'click',
						mouseDragging: 1,
						touchDragging: 1,
						releaseSwing: 1,
						startAt: 0,
						scrollBar: $wrap.find('.scrollbar'),
						scrollBy: 1,
						pagesBar: $wrap.find('.pages'),
						activatePageOn: 'click',
						speed: 100,
						elasticBounds: 1,
						dragHandle: 1,
						dynamicHandle: 1,
						clickBar: 1,
						prevPage: $wrap.find('.prevPage'),
						nextPage: $wrap.find('.nextPage')
				};

				$('#sly-collection-' + i).sly(options);
			}

			$(window).on('resize load', function(){
				$('#sly-collection-' + i).sly('reload');
			});

		}
		}, 200);	
	}
	
	
	$(window).on('resize', collectionSlider).trigger('resize');
	
	$('.product_options .shop2-color-ext-select, .product_options select').closest('.option_body').addClass('color-select');
	
	//-----View-btn
	var $btnThumbs = $('.view-shop2 .thumbs'),
		$btnSimple = $('.view-shop2 .simple'),
		$btnPrice = $('.view-shop2 .pricelist'),
		$lotsWrap = $('.product-list');

	function thumbsLots() {
		$btnThumbs.addClass('active-view');
		$btnSimple.removeClass('active-view');
		$btnPrice.removeClass('active-view');
		$lotsWrap.addClass('product-list-thumbs');
		$lotsWrap.removeClass('product-list-simple');
		$lotsWrap.removeClass('product-list-price');
		
		var temp = 1;
		
		setTimeout(function(){
		    var heights = [],
		    	maxHeight;
				
			$('.shop2-item-product .product-image').css('height', 'auto');

    		$('.shop2-item-product .product-image').each(function(){
	            heights.push($(this).height());
	        });
    		maxHeight = Math.max.apply(null, heights);
		    
		    $('.shop2-item-product .product-image').each(function(){					    
				$(this).css('height', maxHeight);
		    });
		}, 300);
	}
	function simpleLots() {
		$btnSimple.addClass('active-view');
		$btnThumbs.removeClass('active-view');
		$btnPrice.removeClass('active-view');
		$lotsWrap.addClass('product-list-simple');
		$lotsWrap.removeClass('product-list-thumbs');
		$lotsWrap.removeClass('product-list-price');

		$('.shop2-item-product .product-image').css('height', 'auto');
	}
	function priceLots() {
		$btnPrice.addClass('active-view');
		$btnThumbs.removeClass('active-view');
		$btnSimple.removeClass('active-view');
		$lotsWrap.addClass('product-list-price');
		$lotsWrap.removeClass('product-list-thumbs');
		$lotsWrap.removeClass('product-list-simple');
	}

	$btnThumbs.on(clickStart, function(e) {
		e.preventDefault();
		$lotsWrap.removeClass('product-list-mobile');
		thumbsLots();

		eraseCookie('simple');
		eraseCookie('price');
		createCookie('thumbs', 1, 1);
		return false;
	});

	$btnSimple.on(clickStart, function(e) {
		e.preventDefault();
		if ($(window).width() <= 630) {
			mobileLots();
		}else{
			simpleLots();
		}

		eraseCookie('price');
		eraseCookie('thumbs');
		createCookie('simple', 1, 1);
		return false;
	});

	$btnPrice.on(clickStart, function(e) {
		e.preventDefault();
		priceLots();

		eraseCookie('simple');
		eraseCookie('thumbs');
		createCookie('price', 1, 1);
		return false;
	});
	function viewLots() {
		var	$mainBlock = $lotsWrap.closest('.shop-main-block-wr').length;

			if (readCookie('thumbs') || $mainBlock == 1 || $(window).width() <= 700) {
				thumbsLots();
			} else if (readCookie('simple') && !$mainBlock == 1) {
				simpleLots();
			} else if (readCookie('price') && !$mainBlock == 1) {
				priceLots();
			}
	}
	$(window).on('resize', viewLots).trigger('resize');
	
	$('.shop2-item-product').each(function() {
		if ($(this).find('.option-block-wr div').length) {
			$(this).find('.shop2-hide-options-btn').removeClass('displayNone')
		}
	});

	//----Option-product
	$('.shop2-hide-options-btn').on(clickStart, function(event) {
		var $this = $(this),
			thisShowText = $this.data('show') ? $this.data('show') : 'Параметры',
			thisHideText = $this.data('hide') ? $this.data('hide') : 'Скрыть';
			
		$this.closest('.product-list-price .shop2-product-item').find('.product-options-inner').slideToggle('slow');
		$this.toggleClass('opened');
		if ($this.hasClass('opened')) {
			$this.html(thisHideText);
		} else {
			$this.html(thisShowText)
		}
	});
	
	var $sortingBtn = $('.shop-sorting-panel .sorting-wrap .sort-edit-block'),
		$sortingBlock = $('.shop-sorting-panel .sorting-wrap .sorting-block'),
		sortingParamLink = $('.shop-sorting-panel .sorting-wrap .sort-param.active');

	$sortingBtn.click(function(event) {
			$('.sorting-wrap').toggleClass('opened');
			$('.sorting-block').fadeIn();
			
	});

	$(document).on(clickStart, function(event) {
	
		if ($('.sorting-wrap').hasClass('opened')) {
			if ($(event.target).closest('.sorting-wrap').length) return;
			$('.sorting-wrap').removeClass('opened');
			
			$('.sorting-block').fadeOut();
		}
	});

	function sortingTitle() {
		var paramClone = sortingParamLink.first().clone().addClass('clone');

		$sortingBtn.html(paramClone);

		$('.shop2-panel-sorting .sorting-wrap .sort-param.clone').click(function(event) {
			event.preventDefault();
		});
	}
	if (sortingParamLink.hasClass('active')){
		sortingTitle();
	}


	$(window).on('resize', viewLots).trigger('resize');
	
	$('.site-container').css({
		opacity: '1',
	});

	//---Resize
	function resizeFunction() {
		topMenu();
		folder_mobile_amount();

		shopSearchBlock();
	}


	//---Shop-search
	$('.reset-btn').on('click', function(event) {
		window.location.href = window.location.pathname;
	});
	
	var $searchBlur = $('.top-panel-line, .site-header, .block-shop-search-background, .site-container, .bot-block-wr, .site-footer, .path-wrapper, .h1-wr');

	$('.opened-all-selsect, .shop-search-close').on('click', function(event) {
		event.preventDefault();
		
		$('.search-online-store').toggleClass('opened');
		if ($('.search-online-store').hasClass('opened')) {
			$searchBlur.addClass('blockBlur');
		} else {
			$searchBlur.removeClass('blockBlur');
		}
		// if ($('.block-shop-search-wr').hasClass('page-in')) {
		// 	$('.search-block-wr').toggleClass('beforeClass');
		// }
	});
	$('.mobile-view-search-btn').on('click', function(event) {
		event.preventDefault();
		
		$('.mobile-view-search-btn-wr').toggleClass('active');
		$('.search-block-wr').toggleClass('active');
		
		if (window.matchMedia('(max-width:610px)').matches) {
			var maxHeigth = $(window).height() - 60;

			$('.search-block-wr').css('maxHeight', maxHeigth);
		} else {
			$('.search-block-wr').css('maxHeight', 'none');
		}
	});

	$('.search-shop-button').on('click', function () {
		$('.search-block-wr').addClass('open');
	});

	$('.close-mobile-search').on('click', function () {
		$('.search-block-wr').removeClass('open');
	});

	var shopSearchBlockFlag = 1,
		$searchWr = $('.search-online-store'),
		$fieldFirstWr = $('<div class="field-first clear-self"></div>');

	function shopSearchBlock() {
		var selectCount = (window.matchMedia('(min-width:1070px)').matches) ? 3 : 2;

		if (window.matchMedia('(min-width:1070px)').matches && (shopSearchBlockFlag == 1 || shopSearchBlockFlag == 3 || shopSearchBlockFlag == 4)) {
			var selectCount = 3;

			if (!$('.search-online-store .dropdown .field-first').length) {
				if ($('.search-online-store .dropdown .user-flags-wr').length) {
					$('.search-online-store .dropdown .user-flags-wr').after($fieldFirstWr);
				} else {
					$fieldFirstWr.prependTo('.search-online-store .dropdown');
				}
				
			} else {
				$searchWr.find('.dropdown .field-first > .field').prependTo('.search-online-store .dropdown');
				$('.search-online-store .dropdown .field-first').prependTo('.search-online-store .dropdown');
			}

			$searchWr.find('.dropdown > .field').each(function(index) {
				if (index > selectCount) return false;

				$(this).appendTo('.field-first');
			});
			shopSearchBlockFlag = 2;
		} else if (window.matchMedia('(max-width:1069px)').matches && window.matchMedia('(min-width:769px)').matches && (shopSearchBlockFlag == 1 || shopSearchBlockFlag == 2 || shopSearchBlockFlag == 4)) {
			if (window.matchMedia('(max-width: 940px)').matches) {
				var selectCount = 3;
			} else {
				var selectCount = 2;
			}
			

			if (!$('.search-online-store .dropdown .field-first').length){
				if ($('.search-online-store .dropdown .user-flags-wr').length) {
					$('.search-online-store .dropdown .user-flags-wr').after($fieldFirstWr);
				} else {
					$fieldFirstWr.prependTo('.search-online-store .dropdown');
				}
			} else {
				$searchWr.find('.dropdown .field-first > .field').prependTo('.search-online-store .dropdown');
				$('.search-online-store .dropdown .field-first').prependTo('.search-online-store .dropdown');
			}

			$searchWr.find('.dropdown > .field').each(function(index) {
				if (index > selectCount) return false;

				$(this).appendTo('.field-first');
			});
			shopSearchBlockFlag = 1;
		} else if (window.matchMedia('(max-width:768px)').matches && (shopSearchBlockFlag == 1 || shopSearchBlockFlag == 2 || shopSearchBlockFlag == 3)) {
			var selectCount = 2;

			if (!$('.search-online-store .dropdown .field-first').length){
				if ($('.search-online-store .dropdown .user-flags-wr').length) {
					$('.search-online-store .dropdown .user-flags-wr').after($fieldFirstWr);
				} else {
					$fieldFirstWr.prependTo('.search-online-store .dropdown');
				}
			} else {
				$searchWr.find('.dropdown .field-first > .field').prependTo('.search-online-store .dropdown');
				$('.search-online-store .dropdown .field-first').prependTo('.search-online-store .dropdown');
			}

			$searchWr.find('.dropdown > .field').each(function(index) {
				if (index > selectCount) return false;

				$(this).appendTo('.field-first');
			});
			shopSearchBlockFlag = 2;
		}
	};
	
	shop2.on('afterProductReloaded', function(){
		setTimeout(function(){
			$('.product_options').each(function(){
				$(this).find('select').styler();
			});
			$('.product_options .shop2-color-ext-select, .product_options select').closest('.option_body').addClass('color-select');
		})
	});

	$('.field.checkbox .param-val').on(clickStart, function(event) {
		$(this).closest('.field.checkbox').find('.param-val').not(this).removeClass('active-val')
	});
	$('.field.checkbox input[type="checkbox"]').on('change', function(event) {
		$(this).closest('.field.checkbox').find('input[type="checkbox"]').not(this).removeAttr('checked', true);
	});
	$('.shop-filter .field-product-type .type-val').on(clickStart, function(event) {
		$(this).closest('.field-product-type').find('.type-val').not(this).removeClass('active-val')
	});

	//---Styler
	var selectAll = $('select:first').find('option:first').text();
	
	$('input[type="radio"], input[type="checkbox"]').not('.search-online-store .field.checkbox input[type="checkbox"], .field-product-type input[type="radio"], .anketa-wrapper input[type="radio"], .anketa-wrapper input[type="checkbox"], .product-compare input[type="checkbox"], .sg-page-article__comment-list input[type="checkbox"], .option-type select').styler();
	
	$('.product_options select, .tpl-anketa select').styler();
	
	$('.option-type .option-label').on(clickStart, function() {
			$('.option-type select').trigger('refresh');
	});
	
	$.ajaxSetup({complete: function(){
		$('.option-details select, .search-online-store select').styler();
	}});

	$('.search-online-store select, .shop2-filter select').each(function() {
		var $this = $(this),
			selectTitle = $this.closest('.field').find('.field-title').text();

		$this.styler({
			selectPlaceholder: selectTitle,
			onSelectClosed: function() {
				$this.closest('.jq-selectbox.jqselect').find('.jq-selectbox__select-text.placeholder').text(selectAll)
			}
		});
	});

	$('.product-options select, .products-per-page-wr select').styler({
		selectPlaceholder: selectAll
	});


	$(window).on('resize', resizeFunction).trigger('resize');
	
	
	s3From.initForms(".tpl-anketa", function() {

		$('.buy-one-click-form-wr input[type=radio], .buy-one-click-form-wr input[type=checkbox], .buy-one-click-form-wr select, .form-callback-wrapper input[type=radio], .form-callback-wrapper input[type=checkbox], .form-callback-wrapper select').styler();
		
		DatePicker.init();
		
		var dateInput = $('.firstAndSecondVal').val(),
				dateFromInput = dateInput.substr(3,10),
				dateToInput = dateInput.substr(-10);
		
			$('.firstInput').val(dateFromInput);
			$('.secondInput').val(dateToInput);
	});
	
	var DatePicker = {
			init: function() {
				this.setDatePicker();
			},
		
			setDatePicker: function (){
		
				$.datepicker.regional['ru'] = {
					closeText: 'Закрыть',
					prevText: '<Пред',
					nextText: 'След>',
					currentText: 'Сегодня',
					monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
					monthNamesTitle: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'],
					dayNames: ['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],
					dayNamesShort: ['вск','пнд','втр','срд','чтв','птн','сбт'],
					dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
					weekHeader: 'Нед',
					dateFormat: 'dd.mm.yy',
					firstDay: 1,
					isRTL: false,
					showMonthAfterYear: false,
					yearSuffix: ''};
				$.datepicker.setDefaults($.datepicker.regional['ru']);
		
				$( ".datepickerFrom" ).datepicker({
			        minDate:0,
			        changeMonth: false,
			        numberOfMonths: 1
			    });
		
			    var initFrom = $('.firstInput' );
			    var initTo = $('.secondInput' );
			    var initTotal = $('.firstAndSecondVal' );
			    
			    function setTotalValue () {
			        initTotal.val('от ' + initFrom.val() + ' до ' + initTo.val());
			    };
			    initFrom.datepicker({
			        minDate:0,
			        changeMonth: false,
			        numberOfMonths: 1,
			        onClose: function( selectedDate ) {
			            initTo.datepicker( 'option', 'minDate', selectedDate );
			            setTotalValue();
			        }
			    });
			    
			    initTo.datepicker({
			        defaultDate: '+1w',
			        minDate:0,
			        changeMonth: false,
			        numberOfMonths: 1,
			        onClose: function( selectedDate ) {
			            initFrom.datepicker( 'option', 'maxDate', selectedDate );
			            setTotalValue();
			        }
			    });
			}
		};
		
		DatePicker.init();
		
	
	
	function ajaxCart() {
		$.ajax({
			url: shop2.uri + "/cart?cart_only",
			method: "get",
			dataType: "html",
			success: function (data, statusText, xhr) {
				
				// вырезаем все скрипты в ответе ajax
				var data = data.replace(/<script[\s\S]*/, '');
				
				$(".cart-wrapper .cart-block ul").html(data);
				
				$( document ).ajaxStop(function() {	
					var	$this = $(this),
						$cartTotalAmount = $this.find('.cart-total-amount span').html(),
						$cartLeftTotal = $('.cart-block-btn .cart-total-amount');
						$cartLeftTotal.empty().html($cartTotalAmount);
						
						if ($cartTotalAmount != 0){
							$('.cart-wrapper').removeClass('disabled');
						} else {
							$('.cart-wrapper').addClass('disabled');
						}
				});
				
				$('.cart-wrapper .cart-delete a')
			    .off('click')
			    .on('click', function(event){
			        event.preventDefault();
			        var url    = $(this).attr('href');
			        var parent = $(this).closest('.cart-preview-product');
			
			        parent.addClass('removeThis');
		
			        $.ajax({
			            method  : "GET",
			            url     : url,
			            success : function() {
			                parent.slideUp(300, function(){
			                    parent.remove();
			                });
			            }
			        });
		
					$.get(url, function(d, status) {
						data = $('.cart-wrapper .cart-block-in .information-cart', d).html();
						$('.cart-wrapper .cart-block-in .information-cart .information-cart-in').replaceWith(data);
					});
					
					data = undefined;
			        
			    });
			    
				$('.remove-all-cart-poruduct').click(function(e) {
				
					var $this = $(this),
						url = shop2.uri + "?mode=cart&action=cleanup",
						data, func;
	
					shop2.trigger('beforeCartClear');
					$.get(shop2.uri + '?mode=cart&action=cleanup', function(d, status) {
						shop2.trigger('afterCartClear', d, status);
					});
	
					e.preventDefault();
					
					shop2.trigger('afterCartPreviewRemoveItem');
					
				
		
					$.get(url, function(d, status) {
						data = $('.cart-wrapper .cart-block-in', d).html();
						
							console.log(data);
						
						$('#shop2-cart-preview').replaceWith(data);
						
						shop2.fire('afterCartPreviewRemoveItem', func, d, status);
						shop2.trigger('afterCartPreviewRemoveItem', d, status);
					});
					
					data = undefined;				
					
					return false;
					
				});
			}
		});

		$('.cart-param-btn').on(clickStart, function(event) {
			var $this = $(this),
				thisShowText = $this.data('show') ? $this.data('show') : 'Параметры',
				thisHideText = $this.data('hide') ? $this.data('hide') : 'Скрыть';
			$this.closest('.cart-product-bot').find('.cart-product-param-wr').slideToggle('slow');
			$this.toggleClass('opened');
			if ($this.hasClass('opened')){
				$this.html(thisHideText);
			} else {
				$this.html(thisShowText);
			}
		});
	};
	ajaxCart();
	shop2.on('afterCartPreviewRemoveItem', ajaxCart);
	shop2.on('afterCartAddItem', ajaxCart);
	
	



});