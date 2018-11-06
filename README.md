# AnythingZoomer jQuery Plugin

Zoom in on images or content.

[![NPM Version][npm-image]][npm-url] [![devDependency Status][david-dev-image]][david-dev-url] [![MIT][license-image]][license-url]

[npm-url]: https://npmjs.org/package/anythingzoomer
[npm-image]: https://img.shields.io/npm/v/anythingzoomer.svg
[david-dev-url]: https://david-dm.org/CSS-Tricks/AnythingZoomer?type=dev
[david-dev-image]: https://img.shields.io/david/dev/CSS-Tricks/AnythingZoomer.svg
[license-url]: https://github.com/CSS-Tricks/AnythingZoomer/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg

* Latest [AnythingZoomer demo](https://css-tricks.github.io/AnythingZoomer/).
* [Documentation](https://css-tricks.github.io/AnythingZoomer/use.html).
* [JSFiddle playground](http://jsfiddle.net/Mottie/KwvjL/).
* [Original post](https://css-tricks.com/anythingzoomer-jquery-plugin/) at CSS-Tricks.
* Have an issue? Submit it [here](https://github.com/CSS-Tricks/AnythingZoomer/issues).

## Dependencies

* jQuery v1.3.2+

## Download

* Get all files: [zip](https://github.com/CSS-Tricks/AnythingZoomer/archive/master.zip) or [tar.gz](https://github.com/CSS-Tricks/AnythingZoomer/archive/master.tar.gz).
* Use [npm](https://www.npmjs.com/package/anythingzoomer): `npm install anythingzoomer`.

## Known issues

* In the [text demo](https://css-tricks.github.io/AnythingZoomer/text.html), you can resize the large area content dynamically. At 2x, the top left corner of the large content matches the top left corner of the small content. But as the size increases (up to 4x), the spacing of the content from the top left corner increases. This happens with any content. I'm still looking for a fix.

## Recent Changes

View the [complete change log here](change-log.md)

### Version 2.2.8 (2018-11-06)

* Fix JS error when enabled. See [issue #41](https://github.com/CSS-Tricks/AnythingZoomer/issues/41).
* Fix overlay interference & position. See [issue #41](https://github.com/CSS-Tricks/AnythingZoomer/issues/41).
* Readme: Remove bower.

### Version 2.2.7 (2016-11-05)

* Fix misspelling. See [pull #38](https://github.com/CSS-Tricks/AnythingZoomer/pull/38); thanks [@draber](https://github.com/draber)!
* Bower: Fix bower.json.
* Readme:
  * Add links to bower & npm.
  * Add download links.

### Version 2.2.5 & 2.2.6 (2016-08-26)

* Add UMD wrapper.
* Add bower package & fix name.
