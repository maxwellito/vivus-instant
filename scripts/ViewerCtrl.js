/**
 * ViewerController class
 * Cheap controller for the viewer.
 * It takes a DOM element as parameter which is
 * supposed to content all the required items of
 * a viewer :
 * - an input:checkbox as theme switcher
 * - an .introbox to welcome people (no, I won't rename it Consuela, noooo...)
 *
 * @param {DOM} el Viewer element
 */
function ViewerController (el) {
  this.el = el;
  this.svgTag = null;
  this.svgFileName = null;
  this.newSvgCb = null;
  this.introEl = el.querySelector('.introbox');

  this.svgWrap = document.createElement('div');
  this.svgWrap.classList.add('viewer-wrap');
  el.appendChild(this.svgWrap);

  // Create the 'a' tag to download
  this.downloadAnchor = document.createElement('a');
  this.downloadAnchor.style = 'display: none';
  this.el.appendChild(this.downloadAnchor);

  // Listen for drag and drop
  this.el.addEventListener('drop',      this.dropped.bind(this),   true);
  this.el.addEventListener('dragenter', this.dragStart.bind(this), true);
  this.el.addEventListener('dragleave', this.dragStart.bind(this), true);
  this.el.addEventListener('dragover',  this.dragStart.bind(this), false);
}

/**
 * SVG content type
 * This is what we are looking for.
 * @type {String}
 */
ViewerController.prototype.SVG_CONTENT_TYPE = 'image/svg+xml';


/* SETTERS */

/**
 * Set the callback to be triggered when a new SVG
 * is dropped. The callback will be executed with
 * the new SVG element as parameter.
 * Of course you can only have one callback set per
 * ViewerController instance.
 * Sorry, not sorry.
 *
 * @param  {Function} callback
 */
ViewerController.prototype.onNewSVG = function (callback) {
  this.newSvgCb = callback;
}

/* DROPPIN' */

/**
 * Listener for when you turn on RuPaul party
 * @param  {Event} event Drag event, we accept all drag events, even Michelle Visage showing her tits
 */
ViewerController.prototype.dragStart = function (event) {
  event.preventDefault();
  this.el.classList.add('droppin');
};

/**
 * Listener to turn off the party.
 * Soz' bitches.
 * @param  {Event} event Sad drag events..
 */
ViewerController.prototype.dragEnd = function (event) {
  event.preventDefault();
  this.el.classList.remove('droppin');
};

/**
 * Listener for when an item is dropped on the
 * viewer. It will load the first file dropped
 * then provide the loaded event to `buildSVG`.
 * @param  {Event} event Drop event
 */
ViewerController.prototype.dropped = function (event) {
  this.dragEnd(event);

  // Delete the intro box if it's still with us.
  // Otherwise R.I.P.
  if (this.introEl) {
    this.introEl.remove();
    this.introEl = null;
  }

  var file, data = event.dataTransfer;
  if (!data || !data.files || !data.files[0]) {
    // They see me droppin'...  they hatin'.....
    return;
  }

  file = new FileReader();
  file.addEventListener('load', this.buildSVG.bind(this), false);
  file.readAsDataURL(data.files[0]);
  this.svgFileName = data.files[0].name || 'vivus.svg';
};

/**
 * Set up the SVG contained in the 'load' event.
 * And make sure it's valid.
 * @param  {event} event Load event
 */
ViewerController.prototype.buildSVG = function (event) {
  var fileContent = event.currentTarget.result;

  if (!fileContent) {
    throw new Error('Empty file dropped. Or maybe invisible SVG? If so no animation needed.');
  }

  // Transform base64 to XML
  // fileContent = atob(fileContent);
  if (!~fileContent.indexOf(this.SVG_CONTENT_TYPE)) {
    throw new Error('Invalid file dropped. It is not a SVG.');
  }
  fileContent = atob(fileContent.substr(fileContent.indexOf('base64,') + 7));

  this.svgWrap.innerHTML = fileContent;
  var svgTags = this.svgWrap.querySelectorAll('svg');
  if (svgTags.length === 0) {
    throw new Error('Cannot find the SVG tag in your file. You sure it\'s an SVG and not a cat picture?');
  }
  else if (svgTags.length > 1) {
    throw new Error('Wow! Wait a minute! There\'s more than one SVG in your file. Sorry the rule is one person per ticket.');
  }

  // Delete previous SVG if existing
  if (this.svgTag) {
    this.svgTag.remove();
  }
  this.svgTag = svgTags[0];
  this.newSvgCb && this.newSvgCb(this.svgTag);
};

/**
 * Dirty trick to refresh the SVG animation.
 * The idea is simple, it wait the next browser
 * rendering frame to hide the SVG. Then wait the
 * following one to display it again.
 * TA-DAHHH!!
 * The animation restart!
 * Dirty, right?
 *
 * What if there's a race conditi... shhhhhhhhush!
 */
ViewerController.prototype.refreshSVG = function () {
  var svgTag = this.svgTag;
  requestAnimationFrame(function () {
    svgTag.style.display = 'none';
    requestAnimationFrame(function () {
      svgTag.style.display = '';
    });
  });
};

/**
 * Simulate download to provide the SVG.
 * It shouldn't destroy the content, thats why
 * it's using a div wrap. If there's some extra
 * DOM elements (like Illustrator signature
 * or other stuff..) it will be kept in the output.
 */
ViewerController.prototype.download = function () {
    var blob = new Blob([this.svgWrap.innerHTML], {type: this.SVG_CONTENT_TYPE}),
        url = window.URL.createObjectURL(blob);
    this.downloadAnchor.href = url;
    this.downloadAnchor.download = this.svgFileName.replace(/\.svg$/i, '_animated.svg');
    this.downloadAnchor.click();
    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 10);
};
