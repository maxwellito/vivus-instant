'use strict';

var requestAnimFrame, cancelAnimFrame, parsePositiveInt;

/**
 * VivusInstantInstant
 * Beta version
 *
 * Fork of VivusInstant to make inline animated SVG
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
 * @this {VivusInstant}
 * @param {DOM|String}   element  Dom element of the SVG or id of it
 * @param {Object}       options  Options about the animation
 */
function VivusInstant (element, options) {
  this.dashGap = 1;

  // Setup
  this.setElement(element);
  this.setOptions(options);
}


/**
 * Element part
 **************************************
 */

/**
 * Check and set the element in the instance
 * The method will not return anything, but will throw an
 * error if the parameter is invalid.
 *
 * @param {DOM|String}   element  SVG Dom element or id of it
 */
VivusInstant.prototype.setElement = function (element) {
  // Basic check
  if (typeof element === 'undefined') {
    throw new Error('VivusInstant [constructor]: "element" parameter is required');
  }

  // Set the element
  if (element.constructor === String) {
    element = document.getElementById(element);
    if (!element) {
      throw new Error('VivusInstant [constructor]: "element" parameter is not related to an existing ID');
    }
  }
  this.el = element;
  this.id = this.generateKey(8);

  this.styleTag = document.createElement('style');
  this.el.appendChild(this.styleTag);

  this.preMapping();
};

/**
 * Pre-mapping select the 'animatable' paths to build
 * the map array. The
 * @return {[type]} [description]
 */
VivusInstant.prototype.preMapping = function () {
  var i, path, pathObj,
      paths = this.el.querySelectorAll('path');

  this.map = [];
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
        console.warn('VivusInstant [mapping]: cannot retrieve a path element length', path);
      }
      continue;
    }

    pathObj.strokeDasharray  = pathObj.length + ' ' + (pathObj.length + this.dashGap * 2);
    pathObj.strokeDashoffset = pathObj.length + this.dashGap;
    pathObj.length += this.dashGap;

    pathObj.class = this.id + '_' + this.map.length;
    pathObj.el.classList.add(pathObj.class); //# FIX DAT' SHITE

    this.map.push(pathObj);
  }
}

/**
 * generateKey
 * generate a random key with the length
 * of your choice, and return it
 *
 * @param  {number} length Length of the id
 * @return {string}        The id
 */
VivusInstant.prototype.generateKey = function (length) {
 var output = '',
   src = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqsrtuvwxyz',
   len = src.length;

 while (length > 0) {
   output += src[Math.floor(Math.random()*len)];
   length--;
 }
 return output;
};


/**
 * Options part
 **************************************
 */

/**
 * Set up user option to the instance
 * The method will not return anything, but will throw an
 * error if the parameter is invalid
 *
 * @param  {object} options Object from the constructor
 */
VivusInstant.prototype.setOptions = function (options) {
  var allowedTypes = ['delayed', 'async', 'oneByOne', 'scenario', 'scenario-sync'];
  var allowedStarts =  ['manual', 'autostart'];

  // Set the animation type
  if (options.type && allowedTypes.indexOf(options.type) === -1) {
    throw new Error('VivusInstant [constructor]: ' + options.type + ' is not an existing animation `type`');
  }
  else {
    this.type = options.type || allowedTypes[0];
  }

  // Set the start type
  if (options.start && allowedStarts.indexOf(options.start) === -1) {
    throw new Error('VivusInstant [constructor]: ' + options.start + ' is not an existing `start` option');
  }
  else {
    this.start = options.start || allowedStarts[0];
  }

  this.loop               = !!options.loop;
  this.loopEnd            = parsePositiveInt(options.loopEnd, 0);
  this.loopTransition     = parsePositiveInt(options.loopTransition, 0);
  this.loopStart          = parsePositiveInt(options.loopStart, 0);
  this.duration           = parsePositiveInt(options.duration, 2000);
  this.delay              = parsePositiveInt(options.delay, null);
  this.pathTimingFunction = options.pathTimingFunction || 'linear';
  this.ignoreInvisible    = options.hasOwnProperty('ignoreInvisible') ? !!options.ignoreInvisible : false;
  this.triggerClass       = options.triggerClass || 'start';

  this.frameLength = this.currentFrame = this.delayUnit = this.speed = this.handle = null;
  this.totalDuration      = this.loopStart + this.duration + this.loopEnd + this.loopTransition;

  if (this.delay >= this.duration) {
    throw new Error('VivusInstant [constructor]: delay must be shorter than duration');
  }

  this.mapping();
};

/**
 * Map the svg, path by path.
 * The method return nothing, it just fill the
 * `map` array. Each item in this array represent
 * a path element from the SVG, with informations for
 * the animation.
 *
 */
VivusInstant.prototype.mapping = function () {
  var i, pAttrs, pathObj, totalLength, lengthMeter, timePoint;
  timePoint = lengthMeter = 0;

  totalLength = this.map.reduce(function (e, f) {return e + f.length}, 0);
  totalLength = totalLength === 0 ? 1 : totalLength;
  this.delay = this.delay === null ? this.duration / 3 : this.delay;
  this.delayUnit = this.delay / (this.map.length > 1 ? this.map.length - 1 : 1);

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
VivusInstant.prototype.isInvisible = function (el) {
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
 * Render part
 **************************************
 */

/**
 * About this method... I accept insults in issues.
 * I deserve them.
 */
VivusInstant.prototype.render = function () {
  var pathObj, anim,
      style = new Stylesheet();

  // Set base Vivus keyframes
  var fadeDuration = (this.loopTransition/this.totalDuration) * 100;
  style.setKeyframe(this.id + '_draw', '100%{stroke-dashoffset:0;}');
  style.setKeyframe(this.id + '_fade',
        '0%{stroke-opacity:1;}'+
        (100 - fadeDuration)+'%{stroke-opacity:1;}'+
        '100%{stroke-opacity:0;}');

  for (var i = 0; i < this.map.length; i++) {
    pathObj = this.map[i];
    style.setProperty('.' + pathObj.class, 'stroke-dasharray',  pathObj.strokeDasharray);
    style.setProperty('.' + pathObj.class, 'stroke-dashoffset', pathObj.strokeDashoffset);

    if (!this.loop) {
      anim = this.id + '_draw' +
             ' ' + (pathObj.duration >> 0) + 'ms' +
             ' ' + this.pathTimingFunction +
             ' ' + (pathObj.startAt >> 0) + 'ms' +
             ' forwards';
    }
    else {
      anim = this.id + '_draw_' + i +
             ' ' + this.totalDuration + 'ms' +
             ' ' + this.pathTimingFunction +
             ' 0ms infinite,' +
              this.id + '_fade ' + this.totalDuration + 'ms ' +
              'linear 0ms ' +
              'infinite';

      style.setKeyframe(this.id + '_draw_'+i,
                        ((this.loopStart+pathObj.startAt)/(this.totalDuration)*100)+'%{stroke-dashoffset: '+pathObj.strokeDashoffset+'}'+
                        ((this.loopStart+pathObj.startAt+pathObj.duration)/(this.totalDuration)*100)+'%{ stroke-dashoffset: 0;}'+
                        '100%{ stroke-dashoffset: 0;}');
    }

    if (this.start === 'autostart') {
      style.setProperty('.' + pathObj.class, 'animation', anim);
    }
    else {
      style.setProperty('.' + this.triggerClass + ' .' + pathObj.class, 'animation', anim);
    }
  }

  this.styleTag.innerHTML = style.render();
};

/**
 * Add or remove the trigger class
 * @param  {boolean} status If the class must be set or not
 */
VivusInstant.prototype.toggleTrigger = function (status) {
  if (this.start !== 'manual') {
    return;
  }

  if (status) {
    this.el.classList.add(this.triggerClass);
  }
  else {
    this.el.classList.remove(this.triggerClass);
  }
}
