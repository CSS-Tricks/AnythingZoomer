/*
	AnythingZoomer v1.2
	Original by Chris Coyier: http://css-tricks.com
	Get the latest version: https://github.com/Mottie/AnythingZoomer
*/

(function($){
	$.anythingZoomer = function(el, options){
		var n, t, o, base = this;
		base.$wrap = $(el);
		base.wrap = el;

		// Add a reverse reference to the DOM object
		base.$wrap.data('zoomer', base);

		base.init = function(){
			base.options = o = $.extend( {}, $.anythingZoomer.defaultOptions, options );

			// default class names
			n = $.anythingZoomer.classNames;

			// true when small element is showing, false when large is visible
			base.state = true;

			base.$wrap.addClass(n.wrap).wrapInner('<span class="' + n.wrapInner + '"/>');
			base.$inner = base.$wrap.find('.' + n.wrapInner);
			base.$small = base.$wrap.find('.' + o.smallArea);
			base.$large = base.$wrap.find('.' + o.largeArea);

			base.update();

			// Add classes after getting size
			base.$large.addClass(n.large);
			base.$small.addClass(n.small);

			base.$inner
				.bind('mouseenter' + n.namespace, function(){
					if (base.state){
						base.$zoom.stop(true,true).fadeIn(o.speed);
						if (o.overlay) { base.$overlay.addClass(n.overlay); }
						base.$smInner.addClass(n.hovered);
					}
				})
				.bind('mouseleave' + n.namespace, function(){
					if (base.state){
						// delay hiding to prevent flash if user hovers over it again
						// i.e. moving from a link to the image
						base.timer = setTimeout(function(){
							if (base.$zoom.hasClass(n.windowed)){
								base.hideZoom();
							}
						}, 200);
					}
				})
				.bind('mousemove' + n.namespace, function(e){
					if (base.state){
						clearTimeout(base.timer);
						// get current offsets in case page positioning has changed
						// Double demo: expanded text demo will offset image demo zoom window
						var off = base.$small.offset();
						base.zoomAt( e.pageX - off.left - base.$inner.position().left, e.pageY - off.top );
					}
				})
				.bind(o.switchEvent + (o.switchEvent !== '' ? n.namespace : ''), function(){
					// toggle visible image
					if (base.state){
						base.showLarge();
					} else {
						base.showSmall();
					}
				});

			base.showSmall();

			base.initialized = true;

		};

		base.update = function(){

			// make sure the large image is hidden
			if (base.initialized) {
				base.showSmall();
			}

			base.$smInner = (base.$small.find('.' + n.smallInner).length) ?
				base.$small.find('.' + n.smallInner) : 
				base.$small.wrapInner('<span class="' + n.smallInner + '"/>').find('.' + n.smallInner);
			base.$small.find('.' + n.overly).remove();

			if (o.clone) {
				t = base.$smInner.clone()
					.removeClass(n.smallInner)
					.addClass(n.largeInner);
				if (base.$large.length) {
					// large area exists, just add content
					base.$large.html( t.html() );
				} else {
					// no large area, so add it
					t.wrap('<div class="' + o.largeArea + '">');
					base.$small.after(t.parent());
					// set base.$large again in case small area was cloned
					base.$large = base.$wrap.find('.' + o.largeArea);
				}
			}

			base.$lgInner = (base.$large.find('.' + n.largeInner).length) ?
				base.$large.find('.' + n.largeInner) :
				base.$large.wrapInner('<span class="' + n.largeInner + '"/>').find('.' + n.largeInner);

			if (!base.$wrap.find('.' + n.zoom).length) {
				base.$large.wrap('<div class="' + n.zoom + '"/>');
				base.$zoom = base.$wrap.find('.' + n.zoom);
			}

			// wrap inner content with a span to get a more accurate width
			// get height from either the inner content itself or the children of the inner content since span will need
			// a "display:block" to get an accurate height, but adding that messes up the width
			base.$zoom.show();
			base.largeDim = [ base.$lgInner.width(), Math.max( base.$lgInner.height(), base.$lgInner.children().height() ) ];
			base.zoomDim = base.last = [ base.$zoom.width(), base.$zoom.height() ];
			base.$zoom.hide();

			base.smallDim = [ base.$smInner.width(), base.$small.height() ];
			base.$overlay = $('<div class="' + n.overly + '" style="position:absolute;left:0;top:0;" />').prependTo(base.$small);

			base.ratio = [
				base.smallDim[0] === 0 ? 1 : base.largeDim[0] / base.smallDim[0],
				base.smallDim[1] === 0 ? 1 : base.largeDim[1] / base.smallDim[1]
			];

			base.$inner.add(base.$overlay).css({
				width  : base.smallDim[0],
				height : base.smallDim[1]
			});

		};

		// Show small image - Setup
		base.showSmall = function(){
			base.state = true;
			base.$small.show();

			base.$zoom
				.removeClass(n.expanded)
				.addClass(n.windowed + ' ' + n.zoom)
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
				.stop(true,true)
				.fadeIn(o.speed)
				.addClass(n.expanded)
				.removeClass(n.windowed + ' ' + n.zoom)
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
			clearTimeout(base.timer);

			if (!base.$zoom.hasClass(n.windowed)){
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

			// add overlay
			if (o.overlay) {
				base.$overlay.addClass(n.overlay);
			}
			// hovered, but not really
			base.$smInner.addClass(n.hovered);

		};

		// x, y, [zoomX, zoomY] - zoomX, zoomY are the dimensions of the zoom window
		base.zoomAt = function(x, y, sz){
			var sx = (sz ? sz[0] || 0 : 0) || base.last[0],
				sy = (sz ? sz[1] || sz[0] || 0 : 0) || base.last[1],
				sx2 = sx / 2,
				sy2 = sy / 2,
				ex = o.edge || (o.edge === 0 ? 0 : sx2 * 0.66), // 2/3 of zoom window
				ey = o.edge || (o.edge === 0 ? 0 : sy2 * 0.66); // allows edge to be zero

			// save new zoom size
			base.last = [ sx, sy ];

			if ( (x < -ex) || (x > base.smallDim[0] + ex) || (y < -ey) || (y > base.smallDim[1] + ey) ){
				base.hideZoom();
				return;
			} else {
				// Sometimes the mouseenter event is delayed
				base.$zoom.stop(true,true).fadeIn(o.speed);
			}

			// center zoom under the cursor
			base.$zoom.css({
				left   : x - sx2 + parseInt(base.$inner.css('margin-left'), 10) || 0,
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
			base.$zoom.stop(true,true).fadeOut(o.speed);
			base.$overlay.removeClass(n.overlay);
			base.$smInner.removeClass(n.hovered);
			base.lastKey = null;
		};

		// Initialize zoomer
		base.init();

	};

	// class names used by anythingZoomer
	$.anythingZoomer.classNames = {
		namespace  : '.anythingZoomer', // event namespace
		wrap       : 'az-wrap',
		wrapInner  : 'az-wrap-inner',
		large      : 'az-large',
		largeInner : 'az-large-inner',
		small      : 'az-small',
		smallInner : 'az-small-inner',
		overlay    : 'az-overlay',  // toggled class name
		overly     : 'az-overly',   // overlay unstyled class
		hovered    : 'az-hovered',
		zoom       : 'az-zoom',
		windowed   : 'az-windowed', // zoom window active
		expanded   : 'az-expanded'  // zoom window inactive (large is showing)
	};

	$.anythingZoomer.defaultOptions = {
		smallArea   : 'small',    // class of small content area; the element with this class name must be inside of the wrapper
		largeArea   : 'large',    // class of large content area; this class must exist inside of the wrapper. When the clone option is true, it will add this automatically
		clone       : false,      // Make a clone of the small content area, use css to modify the style
		overlay     : false,      // set to true to apply overlay class "az-overlay"; false to not apply it
		speed       : 100,        // fade animation speed (in milliseconds)
		switchEvent : 'dblclick', // event that allows toggling between small and large elements - default is double click
		edge        : 30          // How far outside the wrapped edges the mouse can go; previously called "expansionSize"
	};

	$.fn.anythingZoomer = function(options, second, sx, sy){
		return this.each(function(){
			var anyZoom = $(this).data('zoomer');
			// initialize the zoomer but prevent multiple initializations
			if ( /object|undefined/.test( typeof options ) ) {
				if (anyZoom){
					anyZoom.update();
				} else {
					(new $.anythingZoomer(this, options));
				}
			} else if ( anyZoom && ( typeof options === 'string' || (!isNaN(options) && !isNaN(second)) ) ){
				anyZoom.setTarget(options, second, sx, sy);
			}
		});
	};

	$.fn.getAnythingZoomer = function(){
		return this.data('zoomer');
	};

})(jQuery);