/*
	AnythingZoomer v1.1
	Original by Chris Coyier: http://css-tricks.com
	Get the latest version: https://github.com/Mottie/AnythingZoomer
*/

(function($){
	$.anythingZoomer = function(el, options){
		var t, o, base = this;
		base.$wrap = $(el).addClass('az-wrap').wrapInner('<span class="az-wrap-inner"/>');
		base.wrap = el;

		// Add a reverse reference to the DOM object
		base.$wrap.data('zoomer', base);

		base.init = function(){
			base.options = o = $.extend( {}, $.anythingZoomer.defaultOptions, options );

			// true when small element is showing, false when large is visible
			base.state = true;

			base.$small = base.$wrap.find('.' + o.smallArea);
			base.$large = base.$wrap.find('.' + o.largeArea);
			if (o.clone) {
				t = base.$small.clone()
					.removeClass(o.smallArea)
					.addClass(o.largeArea);
				if (base.$large.length) {
					base.$large.html( t.html() );
				} else {
					base.$small.after(t);
					base.$large = base.$wrap.find('.' + o.largeArea);
				}
			}

			// wrap inner content with a span to get a more accurate width
			// get height from original object since span will need "display:block" to get an accurate height, but adding that messes up the width
			base.largeDim = [ base.$large.wrapInner('<span class="az-large-inner"/>').find('.az-large-inner').width(), base.$large.height() ];
			base.smallDim = [ base.$small.wrapInner('<span class="az-small-inner"/>').find('.az-small-inner').width(), base.$small.height() ];

			// Add classes after getting size
			base.$large.addClass('az-large').wrap('<div class="az-zoom"></div>');
			base.$small.addClass('az-small');

			base.$zoom = base.$wrap.find('.az-zoom');

			base.ratio = [
				base.smallDim[0] === 0 ? 1 : base.largeDim[0] / base.smallDim[0],
				base.smallDim[1] === 0 ? 1 : base.largeDim[1] / base.smallDim[1]
			];

			base.$inner = base.$wrap.find('.az-wrap-inner').css({
				width  : base.smallDim[0],
				height : base.smallDim[1]
			});

			base.zoomDim = base.last = [ base.$zoom.width(), base.$zoom.height() ];
			base.smallOffset = [ base.$small.offset().left - base.$inner.position().left, base.$small.offset().top ];

			base.$inner
				.bind('mouseenter.anythingZoomer', function(){
					if (base.state){ base.$zoom.fadeIn(100); }
				})
				.bind('mouseleave.anythingZoomer', function(){
					if (base.state){
						base.timer = setTimeout(function(){
							if (base.$zoom.is('.az-windowed')){
								base.hideZoom();
							}
						}, 200);
					}
				})
				.bind('mousemove.anythingZoomer', function(e){
					if (base.state){
						clearTimeout(base.timer);
						base.zoomAt( e.pageX - base.smallOffset[0], e.pageY - base.smallOffset[1] );
					}
				})
				.bind(o.switchEvent + (o.switchEvent !== '' ? '.anythingZoomer' : ''), function(){
					// toggle visible image
					if (base.state){
						base.showLarge();
					} else {
						base.showSmall();
					}
				});

			base.showSmall();

		};

		// Show small image - Setup
		base.showSmall = function(){
			base.state = true;
			base.$small.show();

			base.$zoom
				.removeClass('az-expanded')
				.addClass('az-windowed az-zoom')
				.css({
					width  : base.zoomDim[0],
					height : base.zoomDim[1]
				});

			base.$inner.css({
				width  : base.smallDim[0],
				height : base.smallDim[1]
			});

		};

		// Switch small and large on double click
		base.showLarge = function(){
			base.state = false;
			base.$small.hide();

			base.$zoom
				.fadeIn(100)
				.addClass('az-expanded')
				.removeClass('az-windowed az-zoom')
				.css({
					height : 'auto',
					width  : 'auto'
				});

			base.$inner.css({
				width  : base.largeDim[0],
				height : base.largeDim[1]
			});

			base.$large.css({
				left   : 0,
				top    : 0,
				width  : base.largeDim[0],
				height : base.largeDim[1]
			});

		};

		// x,y coords -> George Washington in image demo
		// base.setTarget( 82, 50, [200,200] );

		// 'selector', [xOffset, yOffset], [zoomW, zoomH] -> Aug 26 in calendar demo
		// base.setTarget( '.day[rel=2009-08-26]', [0, 0], [200, 200] );
		base.setTarget = function(tar, sec, sz){
			var t, x = 0, y = 0;

			if (!base.$zoom.is('.az-windowed')){
				base.showSmall();
			}

			// x, y coords
			if ( !isNaN(tar) && !isNaN(sec) ){
				x = parseInt(tar, 10);
				y = parseInt(sec, 10);
			} else if ( typeof(tar) === 'string' && $(tar).length ){
				// '.selector', [xOffSet, yOffSet]
				t = $(tar);
				x = t.position().left + t.width()/2 + (sec ? sec[0] || 0 : 0);
				y = t.position().top + t.height()/2 + (sec ? sec[1] || 0 : 0);
			}

			base.zoomAt(x, y, sz);

		};

		// x, y, [zoomX, zoomY] - zoomX, zoomY are the dimensions of the zoom window
		base.zoomAt = function(x, y, sz){
			var sx = (sz ? sz[0] || 0 : 0) || base.last[0],
				sy = (sz ? sz[1] || sz[0] || 0 : 0) || base.last[1],
				sx2 = sx / 2,
				sy2 = sy / 2,
				ex = o.edge || sx2 * 0.66, // 2/3 of zoom window
				ey = o.edge || sy2 * 0.66;

			// save new zoom size
			base.last = [ sx, sy ];

			if ( (x < -ex) || (x > base.smallDim[0] + ex) || (y < -ey) || (y > base.smallDim[1] + ey) ){
				base.hideZoom();
				return;
			} else {
				// Sometimes the mouseenter event is delayed
				base.$zoom.fadeIn(100);
			}

			// center zoom under the cursor
			base.$zoom.css({
				left   : x - sx2,
				top    : y - sy2,
				width  : sx,
				height : sy
			});

			// match locations of small element to the large
			base.$large.css({
				left : -(x - sx2/2) * base.ratio[0],
				top  : -(y - sy2/2) * base.ratio[1]
			});

		};

		base.hideZoom = function(){
			base.last = base.zoomDim;
			base.$zoom.fadeOut(100);
		};

		// Initialize zoomer
		base.init();

	};

	$.anythingZoomer.defaultOptions = {
		smallArea   : 'small',    // class of small content area; the element with this class name must be inside of the wrapper
		largeArea   : 'large',    // class of large content area; this class must exist inside of the wrapper. When the clone option is true, it will add this automatically
		clone       : false,      // Make a clone of the small content area, use css to modify the style
		switchEvent : 'dblclick', // event that allows toggling between small and large elements - default is double click
		edge        : 30          // How far outside the wrapped edges the mouse can go; previously called "expansionSize"
	};

	$.fn.anythingZoomer = function(options, second, sx, sy){
		return this.each(function(){
			var anyZoom = $(this).data('zoomer');
			// initialize the zoomer but prevent multiple initializations
			if ((typeof(options)).match('object|undefined') && !anyZoom){
				(new $.anythingZoomer(this, options));
			} else if ( typeof options === 'string' || (!isNaN(options) && !isNaN(second)) ){
				anyZoom.setTarget(options, second, sx, sy);
			}
		});
	};

	$.fn.getAnythingZoomer = function(){
		return this.data('zoomer');
	};

})(jQuery);