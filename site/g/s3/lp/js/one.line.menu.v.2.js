(function($) {
	$.fn.oneLineMenu = function(options) {

		var settings = $.extend({
			minWidth  : 640,
			lastClass : 'dropdown-wrap',
			left: -25,
			ulClass: 'dropdown-ul'
		}, options);

		return this.each(function() {
			var $this      = $(this),
				$li        = $this.find('>li'),
				destroyed  = false,
				windoWidth = $(window).width(); 

			$(window).resize(function(){
				windoWidth = $(window).width();

				if (windoWidth <= settings.minWidth) {
					if (!destroyed) destroy();
					return true;
				}

				destroy();
				init();
				if (typeof settings.onAfterResize == 'function') {
					settings.onAfterResize();
				}
			});

			if (windoWidth > settings.minWidth) {
				init();
			}

			function init() {
				var liWidth = 0,
					ulWidth   = $this.outerWidth(),
					copy, toHide;

				$li.each(function(i){
					var itemWidth   = $(this).outerWidth(),
						marginLeft  = parseFloat($(this).css('marginLeft')),
						marginRight = parseFloat($(this).css('marginRight'));

					itemWidth = itemWidth + marginLeft + marginRight;

					liWidth += itemWidth;

					var nextWidth       = 0,
						nextMarginLeft  = 0,
						nextMarginRight = 0,
						from            = i;

					if ($(this).next().get(0)) {
						nextWidth       = $(this).next().outerWidth(),
						nextMarginLeft  = parseFloat($(this).next().css('marginLeft')),
						nextMarginRight = parseFloat($(this).next().css('marginRight'));
						from += 1;
					}

					nextWidth = nextWidth + nextMarginLeft + nextMarginRight;

					if (ulWidth < (liWidth + nextWidth)) {
						copy   = $li.slice(0);
						
						toHide = copy.splice(from, ($li.length - from));

						return false;
					}
				});

				var res = {
					copy : copy,
					toHide : toHide
				};

				if (res.copy && res.toHide) {
					$this.html(res.copy);

					var $newLi = $('<li></li>').addClass(settings.lastClass).append('<ul></ul>');
					$newLi.find('ul').append(res.toHide);
					$this.append($newLi);
					
					var row = $this.find('>li'),
						rowWidth   = 0;
						
					row.each(function(){
						var eWidth   = $(this).outerWidth(),
							eMarginLeft  = parseFloat($(this).css('marginLeft')),
							eMarginRight = parseFloat($(this).css('marginRight'));
							
						rowWidth += (eWidth + eMarginLeft + eMarginRight);
						
						if (rowWidth >= $this.width()) {
							var rowHide = $(this);
							
							if ($(this).hasClass(settings.lastClass)) {
								rowHide = $(this).prev();
							}
							
							rowHide.detach();
							
							$newLi.find('ul:first').prepend(rowHide);
						}
					});
	
					var $newUl = $newLi.find('ul:first');
	
					$this.on('click', '.' + settings.lastClass, function(){
						$newLi.toggleClass('active');
						$newUl.toggleClass(settings.ulClass).toggle();
						
						var ulWidth = $newUl.width(),
							ulPosition = $newUl.offset().left ,
							liWidth = $newLi.width();
							
						if (windoWidth<ulWidth+ulPosition) {
							$newUl.css('left', -(ulWidth-liWidth));
						} else {
							$newUl.css('left', settings.left);
						}
					});
					
					$(document).on('click touchstart', function(event){
						if ($(event.target).closest($newLi).length) return;
						
						$newUl.removeAttr('style');
						$newLi.removeClass('active');
					});
				}

				destroyed = false;
			}

			function destroy() {
				$('.' + settings.lastClass).unbind('click');

				$this.html($li);

				destroyed = true;
			}
			
			setTimeout(function(){
				$(window).trigger('resize');
			}, 100);
		});
	};
	
	$.fn.menuLP = function(options) {
	
		var settings = $.extend({
			fixedClass: 'fixed-menu-element',
			activeClass: 'active',
			noHashUrl: false,
			menuHeight: 0
		}, options);
		
		return this.each(function(){
			var $this = $(this),
				thisOffsetTop = $this.offset().top,
				isFixed = $this.data('fixed-menu') || false,
				$thisLinks = $this.find('a'),
				$doc = $(document),
				$win = $(window),
				winScrollTop = $win.scrollTop(),
				k = true;
				
			$this.on('click.menuLP', 'a', function(e){
			
				isMenuClick = true;
				
				var $this = $(this),
					thisLink = $this.attr('href');
					
				if ($('html, body').is(':animated') || thisLink[0] != '#') return;
				
				var thisScrollBlock = $(thisLink);
				
				if (thisScrollBlock.length) {
					
					var thisScrollBlockOffsetTop = thisScrollBlock.offset().top
					
					e.preventDefault();
					
					thisScrollBlockOffsetTop = isFixed && thisScrollBlockOffsetTop > thisOffsetTop ? thisScrollBlockOffsetTop - settings.menuHeight : thisScrollBlockOffsetTop;
					
					if (isFixed) {
						$thisLinks.removeClass(settings.activeClass);
						$this.addClass(settings.activeClass);
					}
					
					k = false;
					
					$('html, body').animate({
						scrollTop : thisScrollBlockOffsetTop
					}, 600, function() {
						setTimeout(function() {
							k = true; 
							if (!settings.noHashUrl) {
								history.pushState(null, null, thisLink);
							}
						}, 100);
					});
					
				}
			});

			if (isFixed) {
				
				var linksArray = [],
					$fixedElem = $this.find(settings.fixedElement),
					isFixedMenu = false;
					
				$thisLinks.each(function (index) {
					var $this = $(this),
						thisLink = $this.attr('href');
					
					if (thisLink[0] == '#' && $(thisLink).length) {
						linksArray.push([index, $this, parseInt($(thisLink).offset().top)]);
					}
				});
				
				linksArray.sort(function(a, b) {
					return a[2] < b[2];
				});
				
				$win.on('scroll', function() {
					winScrollTop = $win.scrollTop();
					
					if (!isFixedMenu && winScrollTop > thisOffsetTop) {
						$fixedElem.addClass(settings.fixedClass);
						isFixedMenu = true
					} else if (isFixedMenu && winScrollTop < thisOffsetTop) {
						$fixedElem.removeClass(settings.fixedClass);
						isFixedMenu = false
					}
					
					if (k) {
					
						for (var i = linksArray.length - 1; i >= 0; i--) {
							var item = linksArray[i];
							
							if (winScrollTop >= item[2] - settings.menuHeight) {
								$thisLinks.removeClass(settings.activeClass);
								item[1].addClass(settings.activeClass);
								break;
							}
							
						}
					}
				});
			}
		});
	};
})(jQuery);