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
  el.addEventListener('drop',      this.dropped.bind(this),   false);
  el.addEventListener('dragover',  this.dragStart.bind(this), false);
  el.addEventListener('dragleave', this.dragEnd.bind(this),   false);
}

ViewerController.prototype.SVG_TYPE_FILE = 'image/svg+xml';

ViewerController.prototype.onNewSVG = function (callback) {
  this.newSvgCb = callback;
}

ViewerController.prototype.dragStart = function (event) {
  event.preventDefault();
  this.el.classList.add('droppin');
};

ViewerController.prototype.dragEnd = function (event) {
  event.preventDefault();
  this.el.classList.remove('droppin');
};

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
    return;
  }

  file = new FileReader();
  file.addEventListener('load', this.buildSVG.bind(this), false);
  file.readAsDataURL(data.files[0]);
  this.svgFileName = data.files[0].name;
};

ViewerController.prototype.buildSVG = function (event) {
  var fileContent = event.currentTarget.result;

  if (!fileContent) {
    throw new Error('Empty file dropped. Or maybe invisible SVG? If so no animation needed.');
  }

  // Transform base64 to XML
  // fileContent = atob(fileContent);
  if (!~fileContent.indexOf(this.SVG_TYPE_FILE)) {
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

ViewerController.prototype.refreshSVG = function () {
  var svgTag = this.svgTag;
  requestAnimationFrame(function () {
    svgTag.style.display = 'none';
    requestAnimationFrame(function () {
      svgTag.style.display = '';
    });
  });
};

ViewerController.prototype.download = function () {
    var blob = new Blob([this.svgWrap.innerHTML], {type: this.SVG_TYPE_FILE}),
        url = window.URL.createObjectURL(blob);
    this.downloadAnchor.href = url;
    this.downloadAnchor.download = this.svgFileName;
    this.downloadAnchor.click();
    window.setTimeout(function () {
      window.URL.revokeObjectURL(url);
    }, 10);
};
