'use strict';

var requestAnimFrame, cancelAnimFrame, parsePositiveInt;

/**
 * VivusInstant
 * Beta version
 *
 * Fork of Vivus to make inline animated SVG
 */

/**
 * Class constructor
 * option structure
 *   type: 'delayed'|'async'|'oneByOne'|'script' (to know if the item must be drawn asynchronously or not, default: delayed)
 *   duration: <int> (in frames)
 *   start: 'inViewport'|'manual'|'autostart' (start automatically the animation, default: inViewport)
 *   delay: <int> (delay between the drawing of first and last path)
 *   dashGap <integer> whitespace extra margin between dashes
 *   pathTimingFunction <function> timing animation function for each path element of the SVG
 *   animTimingFunction <function> timing animation function for the complete SVG
 *   forceRender <boolean> force the browser to re-render all updated path items
 *   selfDestroy <boolean> removes all extra styling on the SVG, and leaves it as original
 *
 * The attribute 'type' is by default on 'delayed'.
 *  - 'delayed'
 *    all paths are draw at the same time but with a
 *    little delay between them before start
 *  - 'async'
 *    all path are start and finish at the same time
 *  - 'oneByOne'
 *    only one path is draw at the time
 *    the end of the first one will trigger the draw
 *    of the next one
 *
 * All these values can be overwritten individually
 * for each path item in the SVG
 * The value of frames will always take the advantage of
 * the duration value.
 * If you fail somewhere, an error will be thrown.
 * Good luck.
 *
 * @constructor
 * @this {Vivus}
 * @param {DOM|String}   element  Dom element of the SVG or id of it
 * @param {Object}       options  Options about the animation
 */
function Vivus (element, options) {
  // Setup
  this.setElement(element);
  this.setOptions(options);
}


/**
 * Setters
 **************************************
 */

/**
 * Check and set the element in the instance
 * The method will not return anything, but will throw an
 * error if the parameter is invalid
 *
 * @param {DOM|String}   element  SVG Dom element or id of it
 */
Vivus.prototype.setElement = function (element) {
  // Basic check
  if (typeof element === 'undefined') {
    throw new Error('Vivus [constructor]: "element" parameter is required');
  }

  // Set the element
  if (element.constructor === String) {
    element = document.getElementById(element);
    if (!element) {
      throw new Error('Vivus [constructor]: "element" parameter is not related to an existing ID');
    }
  }
  this.el = element;
};

/**
 * Set up user option to the instance
 * The method will not return anything, but will throw an
 * error if the parameter is invalid
 *
 * @param  {object} options Object from the constructor
 */
Vivus.prototype.setOptions = function (options) {
  var allowedTypes = ['delayed', 'async', 'oneByOne', 'scenario', 'scenario-sync'];
  var allowedStarts =  ['manual', 'autostart'];

  // Set the animation type
  if (options.type && allowedTypes.indexOf(options.type) === -1) {
    throw new Error('Vivus [constructor]: ' + options.type + ' is not an existing animation `type`');
  }
  else {
    this.type = options.type || allowedTypes[0];
  }

  // Set the start type
  if (options.start && allowedStarts.indexOf(options.start) === -1) {
    throw new Error('Vivus [constructor]: ' + options.start + ' is not an existing `start` option');
  }
  else {
    this.start = options.start || allowedStarts[0];
  }

  this.loop               = !!options.loop;
  this.intervalPause      = parsePositiveInt(options.intervalPause, 0);
  this.duration           = parsePositiveInt(options.duration, 120);
  this.delay              = parsePositiveInt(options.delay, null);
  this.pathTimingFunction = options.pathTimingFunction || 'linear';
  this.dashGap            = parsePositiveInt(options.dashGap, 1);
  this.ignoreInvisible    = options.hasOwnProperty('ignoreInvisible') ? !!options.ignoreInvisible : false;

  this.map = new Array();
  this.frameLength = this.currentFrame = this.delayUnit = this.speed = this.handle = null;

  if (this.delay >= this.duration) {
    throw new Error('Vivus [constructor]: delay must be shorter than duration');
  }
};




/**
 * Core
 **************************************
 */

/**
 * Map the svg, path by path.
 * The method return nothing, it just fill the
 * `map` array. Each item in this array represent
 * a path element from the SVG, with informations for
 * the animation.
 *
 * ```
 * [
 *   {
 *     el: <DOMobj> the path element
 *     length: <number> length of the path line
 *     startAt: <number> time start of the path animation (in frames)
 *     duration: <number> path animation duration (in frames)
 *   },
 *   ...
 * ]
 * ```
 *
 */
Vivus.prototype.mapping = function () {
  var i, paths, path, pAttrs, pathObj, totalLength, lengthMeter, timePoint;
  timePoint = totalLength = lengthMeter = 0;
  paths = this.el.querySelectorAll('path');

  for (i = 0; i < paths.length; i++) {
    path = paths[i];
    if (this.isInvisible(path)) {
      continue;
    }
    pathObj = {
      el: path,
      length: Math.ceil(path.getTotalLength())
    };

    // Test if the path length is correct
    if (isNaN(pathObj.length)) {
      if (window.console && console.warn) {
        console.warn('Vivus [mapping]: cannot retrieve a path element length', path);
      }
      continue;
    }
    this.map.push(pathObj);
    pathObj.strokeDasharray  = pathObj.length + ' ' + (pathObj.length + this.dashGap * 2);
    pathObj.strokeDashoffset = pathObj.length + this.dashGap;
    pathObj.length += this.dashGap;
    totalLength += pathObj.length;
  }

  totalLength = totalLength === 0 ? 1 : totalLength;
  this.delay = this.delay === null ? this.duration / 3 : this.delay;
  this.delayUnit = this.delay / (paths.length > 1 ? paths.length - 1 : 1);

  for (i = 0; i < this.map.length; i++) {
    pathObj = this.map[i];

    switch (this.type) {
    case 'delayed':
      pathObj.startAt = this.delayUnit * i;
      pathObj.duration = this.duration - this.delay;
      break;

    case 'oneByOne':
      pathObj.startAt = lengthMeter / totalLength * this.duration;
      pathObj.duration = pathObj.length / totalLength * this.duration;
      break;

    case 'async':
      pathObj.startAt = 0;
      pathObj.duration = this.duration;
      break;

    case 'scenario-sync':
      path = pathObj.el;
      pAttrs = this.parseAttr(path);
      pathObj.startAt = timePoint + (parsePositiveInt(pAttrs['data-delay'], this.delayUnit) || 0);
      pathObj.duration = parsePositiveInt(pAttrs['data-duration'], this.duration);
      timePoint = pAttrs['data-async'] !== undefined ? pathObj.startAt : pathObj.startAt + pathObj.duration;
      this.frameLength = Math.max(this.frameLength, (pathObj.startAt + pathObj.duration));
      break;

    case 'scenario':
      path = pathObj.el;
      pAttrs = this.parseAttr(path);
      pathObj.startAt = parsePositiveInt(pAttrs['data-start'], this.delayUnit) || 0;
      pathObj.duration = parsePositiveInt(pAttrs['data-duration'], this.duration);
      this.frameLength = Math.max(this.frameLength, (pathObj.startAt + pathObj.duration));
      break;
    }
    lengthMeter += pathObj.length;
    this.frameLength = this.frameLength || this.duration;
  }
};
/**
 * Method to best guess if a path should added into
 * the animation or not.
 *
 * 1. Use the `data-vivus-ignore` attribute if set
 * 2. Check if the instance must ignore invisible paths
 * 3. Check if the path is visible
 *
 * For now the visibility checking is unstable.
 * It will be used for a beta phase.
 *
 * Other improvments are planned. Like detecting
 * is the path got a stroke or a valid opacity.
 */
Vivus.prototype.isInvisible = function (el) {
  var rect,
    ignoreAttr = el.getAttribute('data-ignore');

  if (ignoreAttr !== null) {
    return ignoreAttr !== 'false';
  }

  if (this.ignoreInvisible) {
    rect = el.getBoundingClientRect();
    return !rect.width && !rect.height;
  }
  else {
    return false;
  }
};

 /**
  * generateKey
  * generate a random key with the length
  * of your choice, and return it
  *
  * @param  {[string]} length Length of the id
  * @param  {string}   type   Key type to generate
  * @return {[string]}        The id
  */
 Vivus.prototype.generateKey = function (length) {
 	var output = '',
 		src = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqsrtuvwxyz',
 		len = src.length;

 	while (length > 0) {
 		output += src[Math.floor(Math.random()*len)];
 		length--;
 	}
 	return output;
 };


Vivus.prototype.setNaming = function () {
  this.elementClass = this.generateKey(8);
  for (var i = 0; i < this.map.length; i++) {
    this.map[i].class = this.elementClass + '_' + i;
    this.map[i].el.setAttribute('class',this.map[i].class); //# FIX DAT' SHITE
  }
};

Vivus.prototype.render = function () {
  var pathObj, anim, styles = {};

  var keyf = [];

  for (var i = 0; i < this.map.length; i++) {
    pathObj = this.map[i];


    if (!this.loop) {
      anim = 'vivus_draw' +
             ' ' + (pathObj.duration >> 0) + 'ms' +
             ' ' + this.pathTimingFunction +
             ' ' + (pathObj.startAt >> 0) + 'ms' +
             ' forwards';
    }
    else {
      anim = 'vivus_draw_' + i +
             ' ' + (this.duration + this.intervalPause) + 'ms' +
             ' ' + this.pathTimingFunction +
             ' 0ms infinite,' +
              'vivus_fade ' + (this.duration + this.intervalPause) + 'ms ' +
              'linear 0ms ' +
              'infinite';

      keyf.push('@keyframes vivus_draw_'+i+'{'+((pathObj.startAt)/(this.duration + this.intervalPause)*100)+'%{stroke-dashoffset: '+pathObj.strokeDashoffset+'}'+((pathObj.startAt+pathObj.duration)/(this.duration + this.intervalPause)*100)+'%{ stroke-dashoffset: 0;}100%{ stroke-dashoffset: 0;}}')
    }

    styles['.' + pathObj.class] = [
      'stroke-dasharray:' + pathObj.strokeDasharray,
      'stroke-dashoffset:' + pathObj.strokeDashoffset
    ];

    if (this.start === 'autostart') {
      styles['.' + pathObj.class].push('animation:' + anim);
    }
    else {
      styles['.start .' + pathObj.class] = ['animation:' + anim];
    }
  }

  //# Put something here to clean the CSS (avoid duplicate)

  var props, css = [];
  for(var selector in styles) {
    props = styles[selector];
    css.push(selector + '{' + props.join(';') + ';}');
  }
  css = css.join('');


  var ff= (this.intervalPause/(this.duration + this.intervalPause)) * 100;

  return '@keyframes vivus_draw { 100% { stroke-dashoffset: 0;}}'+
  '@keyframes vivus_fade {'+
  '  '+(100 - ff)+'%   { stroke-opacity: 1; }'+
  '  '+(100 - (ff/2))+'%  { stroke-opacity: 1; }'+
  '  100% { stroke-opacity: 0; }'+
  '}' + keyf.join('') + css;
};


/**
 * Parse string to integer.
 * If the number is not positive or null
 * the method will return the default value
 * or 0 if undefined
 *
 * @param {string} value String to parse
 * @param {*} defaultValue Value to return if the result parsed is invalid
 * @return {number}
 *
 */
parsePositiveInt = function (value, defaultValue) {
  var output = parseInt(value, 10);
  return (output >= 0) ? output : defaultValue;
};
