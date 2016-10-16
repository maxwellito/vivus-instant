function ViewerController (el) {
  this.el = el;
  this.svgTag = null;
  this.svgFileName = null;
  this.newSvgCb = null;

  this.svgWrap = document.createElement('div');
  this.svgWrap.classList.add('viewer-wrap');
  el.appendChild(this.svgWrap);

  // Listen for drag and drop
  el.addEventListener('drop',      this.dropped.bind(this),   false);
  el.addEventListener('dragover',  this.dragOver.bind(this),  false);
  el.addEventListener('dragleave', this.dragLeave.bind(this), false);
}

ViewerController.prototype.onNewSVG = function (callback) {
  this.newSvgCb = callback;
}

ViewerController.prototype.dragOver = function (event) {
  event.preventDefault();
  this.el.classList.add('droppin');
};

ViewerController.prototype.dragLeave = function (event) {
  event.preventDefault();
  this.el.classList.remove('droppin');
};

ViewerController.prototype.dropped = function (event) {
  event.preventDefault();

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
  if (!~fileContent.indexOf('image/svg+xml')) {
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
    this.el.removeChild(this.svgTag);
    this.svgTag.remove();
  }
  this.svgTag = svgTags[0];
  this.newSvgCb && this.newSvgCb(this.svgTag);
};
