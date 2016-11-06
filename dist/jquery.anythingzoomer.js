/*! AnythingZoomer v2.2.7 *//*
 by Chris Coyier (http://css-tricks.com)
 https://github.com/CSS-Tricks/AnythingZoomer
 MIT license
*/
/*jshint browser:true, jquery:true */
/*global require:false, define:false, module:false */
;(function(factory) {
	if ( typeof define === 'function' && define.amd ) {
		define( ['jquery'], factory );
	} else if ( typeof module === 'object' && typeof module.exports === 'object' ) {
		module.exports = factory(require('jquery'));
	} else {
		factory( jQuery );
	}
}(function ($) {

	"use strict";
	$.anythingZoomer = function(el, options) {
		var n, o, t, base = this;
		base.$wrap = $(el);
		base.wrap = el;

		// Add a reverse reference to the DOM object
		base.$wrap.data('zoomer', base);

		base.version = '2.2.6';

		base.init = function() {
			base.options = o = $.extend( {}, $.anythingZoomer.defaultOptions, options );

			// default class names
			n = $.anythingZoomer.classNames;

			// true when small element is showing, false when large is visible
			base.state = true;
			base.enabled = true;
			base.hovered = false;

			base.$wrap.addClass(n.wrap).wrapInner('<span class="' + n.wrapInner + '"/>');
			base.$inner = base.$wrap.find('.' + n.wrapInner);
			base.$small = base.$wrap.find('.' + o.smallArea);
			base.$large = base.$wrap.find('.' + o.largeArea);

			base.update();

			// Add classes after getting size
			base.$large.addClass(n.large);
			base.$small.addClass(n.small);

			base.$inner
				.bind('mouseenter' + n.namespace, function() {
					if (!base.enabled) { return; }
					base.saved = base.enabled;
					base.hovered = true;
					if (o.delay) {
						clearTimeout(base.delay);
						base.enabled = false;
						base.delay = setTimeout(function() {
							base.enabled = base.saved;
							base.position.type = 'mousemove';
							base.$inner.trigger(base.position);
							base.reveal();
						}, o.delay);
					} else {
						base.reveal();
					}
				})
				.bind('mouseleave' + n.namespace, function() {
					base.hovered = false;
					if (!base.enabled) { return; }
					if (o.delay) {
						clearTimeout(base.delay);
						base.enabled = base.saved;
					}
					if (base.state && base.enabled) {
						// delay hiding to prevent flash if user hovers over it again
						// i.e. moving from a link to the image
						base.timer = setTimeout(function() {
							if (base.$zoom.hasClass(n.windowed)) {
								base.hideZoom(true);
							}
						}, 200);
					}
				})
				.bind('mousemove' + n.namespace, function(e) {
					if (!base.enabled) { return; }
					base.position = e;
					if (!base.hovered) { return; }
					if (base.state && base.enabled) {
						clearTimeout(base.timer);
						// get current offsets in case page positioning has changed
						// Double demo: expanded text demo will offset image demo zoom window
						var off = base.$small.offset();
						base.zoomAt( e.pageX - off.left, e.pageY - off.top, null, true );
					}
				})
				.bind(o.switchEvent + (o.switchEvent !== '' ? n.namespace : ''), function() {
					if (!base.enabled) { return; }
					// toggle visible image
					if (base.state) {
						base.showLarge();
					} else {
						base.showSmall();
					}
				});

			base.showSmall();

			// add events
			$.each('initialized zoom unzoom'.split(' '), function(i,f) {
				if ($.isFunction(o[f])) {
					base.$wrap.bind(f, o[f]);
				}
			});

			base.initialized = true;
			base.$wrap.trigger('initialized', base);

		};

		base.reveal = function() {
			base.enabled = base.saved;
			if (base.state && base.enabled) {
				base.$zoom.stop(true,true).fadeIn(o.speed);
				if (o.overlay) { base.$overlay.addClass(n.overlay); }
				base.$smInner.addClass(n.hovered);
				base.$wrap.trigger('zoom', base);
			}
		};

		base.update = function() {

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
					.removeAttr('id')
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

			if (o.edit && !base.edit) {
				base.edit = $('<span class="' + n.edit + '"></span>').appendTo(base.$zoom);
			}

			// wrap inner content with a span to get a more accurate width
			// get height from either the inner content itself or the children of the inner content since span will need
			// a "display:block" to get an accurate height, but adding that messes up the width
			base.$zoom.show();
			base.largeDim = [ base.$lgInner.children().width(), Math.max( base.$lgInner.height(), base.$lgInner.children().height() ) ];
			base.zoomDim = base.last = [ base.$zoom.width(), base.$zoom.height() ];
			base.$zoom.hide();

			base.smallDim = [ base.$smInner.children().width(), base.$small.height() ];
			base.$overlay = $('<div class="' + n.overly + '" style="position:absolute;left:0;top:0;" />').prependTo(base.$small);
			base.ratio = [
				base.largeDim[0] / (base.smallDim[0] || 1),
				base.largeDim[1] / (base.smallDim[1] || 1)
			];

			base.$inner.add(base.$overlay).css({
				width  : base.smallDim[0],
				height : base.smallDim[1]
			});

		};

		// Show small image - Setup
		base.showSmall = function() {
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
		base.showLarge = function() {
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
		base.setTarget = function(tar, sec, sz) {
			var t, x = 0, y = 0;
			clearTimeout(base.timer);

			if (!base.$zoom.hasClass(n.windowed)) {
				base.showSmall();
			}

			// x, y coords
			if ( !isNaN(tar) && !isNaN(sec) ) {
				x = parseInt(tar, 10);
				y = parseInt(sec, 10);
			} else if ( typeof(tar) === 'string' && $(tar).length ) {
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

			// zoom window triggered
			base.$wrap.trigger('zoom', base);

		};

		// x, y, [zoomX, zoomY] - zoomX, zoomY are the dimensions of the zoom window
		base.zoomAt = function(x, y, sz, internal) {
			var sx = (sz ? sz[0] || 0 : 0) || base.last[0],
				sy = (sz ? sz[1] || sz[0] || 0 : 0) || base.last[1],
				sx2 = sx / 2,
				sy2 = sy / 2,
				ex = o.edge || (o.edge === 0 ? 0 : sx2 * 0.66), // 2/3 of zoom window
				ey = o.edge || (o.edge === 0 ? 0 : sy2 * 0.66), // allows edge to be zero
				m = parseInt(base.$inner.css('margin-left'), 10) || base.$inner.position().left || 0;
			// save new zoom size
			base.last = [ sx, sy ];
			// save x, y for external access
			base.current = [ x, y ];

			// show coordinates
			if (o.edit) { base.edit.html(Math.round(x) + ', ' + Math.round(y)); }

			if ( (x < -ex) || (x > base.smallDim[0] + ex) || (y < -ey) || (y > base.smallDim[1] + ey) ) {
				base.hideZoom(internal);
				return;
			} else {
				// Sometimes the mouseenter event is delayed
				base.$zoom.stop(true,true).fadeIn(o.speed);
			}

			// center zoom under the cursor
			base.$zoom.css({
				left   : x - sx2 + m,
				top    : y - sy2,
				width  : sx,
				height : sy
			});

			// match locations of small element to the large
			base.$large.css({
				left : -(x - o.offsetX - sx2/2) * base.ratio[0],
				top  : -(y - o.offsetY - sy2/2) * base.ratio[1]
			});

		};

		base.hideZoom = function(internal) {
			if (internal && base.$smInner.hasClass(n.hovered)) {
				base.$wrap.trigger('unzoom', base);
			}
			base.last = base.zoomDim;
			base.$zoom.stop(true,true).fadeOut(o.speed);
			base.$overlay.removeClass(n.overlay);
			base.$smInner.removeClass(n.hovered);
			base.lastKey = null;
		};

		base.setEnabled = function(enable) {
			base.enabled = enable;
			if (enable) {
				var off = base.$small.offset();
				base.zoomAt( base.position.pageX - off.left, base.position.pageY - off.top, null, true );
			} else {
				base.showSmall();
				base.hideZoom();
				base.hovered = false;
			}
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
		expanded   : 'az-expanded', // zoom window inactive (large is showing)
		edit       : 'az-coords'    // coordinate window
	};

	$.anythingZoomer.defaultOptions = {
		// content areas
		smallArea   : 'small',    // class of small content area; the element with this class name must be inside of the wrapper
		largeArea   : 'large',    // class of large content area; this class must exist inside of the wrapper. When the clone option is true, it will add this automatically
		clone       : false,      // Make a clone of the small content area, use css to modify the style
		// appearance
		overlay     : false,      // set to true to apply overlay class "az-overlay"; false to not apply it
		speed       : 100,        // fade animation speed (in milliseconds)
		edge        : 30,         // How far outside the wrapped edges the mouse can go; previously called "expansionSize"
		offsetX     : 0,          // adjust the horizontal position of the large content inside the zoom window as desired
		offsetY     : 0,          // adjust the vertical position of the large content inside the zoom window as desired
		// functionality
		switchEvent : 'dblclick', // event that allows toggling between small and large elements - default is double click
		delay       : 0,          // time to delay before revealing the zoom window.
		// edit mode
		edit        : false       // add x,y coordinates into zoom window to make it easier to find coordinates
	};

	$.fn.anythingZoomer = function(options, second, sx, sy) {
		return this.each(function() {
			var anyZoom = $(this).data('zoomer');
			// initialize the zoomer but prevent multiple initializations
			if ( /object|undefined/.test( typeof options ) ) {
				if (anyZoom) {
					anyZoom.update();
				} else {
					(new $.anythingZoomer(this, options));
				}
			} else if ( anyZoom && ( typeof options === 'string' || (!isNaN(options) && !isNaN(second)) ) ) {
				if (/(en|dis)able/.test(options)) {
					anyZoom.setEnabled( options === 'enable' );
				} else {
					anyZoom.setTarget(options, second, sx, sy);
				}
			}
		});
	};

	$.fn.getAnythingZoomer = function() {
		return this.data('zoomer');
	};

	return $.anythingzoomer;

}));
