#AnythingZoomer jQuery Plugin

* Latest [AnythingZoomer demo](http://mottie.github.com/AnythingZoomer/).
* [Documentation](http://mottie.github.com/AnythingZoomer/use.html).
* [Original post](http://css-tricks.com/3075-anythingzoomer-jquery-plugin/) at CSS-Tricks.
* Have an issue? Submit it [here](https://github.com/Mottie/AnythingZoomer/issues).

## Changelog

### Version 1.2 (6/8/2012)
* AnythingZoomer can now be updated to change both the small and large content dynamically.
  * To update the content, just call anythingZoomer without any options: `$('#zoom').anythingZoomer();`.
  * Added a [Swap image](http://mottie.github.com/AnythingZoomer/swap.html) demo.
* Modified plugin to properly position the zoom window with dynamically centered content.
* A class name of `az-hovered` will be applied to the `az-small-inner` when it is hovered.
  * This can be used to change the opacity of the `smallArea` content while the zoom window is active.
  * See the anythingzoomer.css file; the addition is commented out.
* Added a `speed` option:
  * This option allows you to set the zoom window's fade animation speed.
  * Time can be set in milliseconds, or use `'slow'` or `'fast'`.
  * Default is 100 milliseconds.
* Added an `overlay` option:
  * An overlay has been added to cover the `smallArea` content, by default it has no styling and shouldn't interfere; but if it does, add a negative z-index to the `az-overly` (no "a") class.
  * If this option is `true`, the `az-overlay` class name is applied to the overlay to darken the area below the zoom window.
  * If `false`, the default setting, the overlay will remain transparent.
  * The [Image demo](http://mottie.github.com/AnythingZoomer/image.html) has been updated to demonstrate the overlay.
* Added events and callbacks:
  * "initialized" event which occurs after AnythingZoomer has finished initializing.
  * "zoom" event occurs when the zoom window is visible.
  * "unzoom" event occurs when the zoom window is hidden.
  * Instructions on how to use the callback or events can be found in the [documentation](http://mottie.github.com/AnythingZoomer/use.html).
* Updated `edge` option to now allow setting it to zero.
* Fixed an issue in the Double Demo when the Text Demo was expanded (large content showing), and the zoom window would not line up properly in the Image demo.

### Version 1.1.2 (12/9/2011)
* Added package.json created by Richard D. Worth
* Updated download links.

### Version 1.1 (8/25/2011)
* Initial commit to github.
* Modified initial required markup
* Removed `zoomPort` and `mover` options.
* Changed `smallArea` and `largeArea` to use classes.
* Removed the `speedMultiplier` option, it is now automatically calculated.
* Renamed `expansionSize` option to `edge`.
* Added `clone` option to make a clone of the `smallArea` content.
* Added methods to open up the zoom window from an external link.
* Added `switchEvent` option to allow changing the event that toggles between the small and large content.

### Version 1.0 (7/20/2009)
* Initial post on css-tricks
