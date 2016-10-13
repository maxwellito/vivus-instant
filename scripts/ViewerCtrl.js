function ViewerController (el) {
  this.el = el;

  this.svgTag = null;
  this.svgFileName = null;
  this.svgPre = '';
  this.svgPost = '';

  this.newSvgCb = null;

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

  // Find SVG tag indexes
  var indexStart = fileContent.indexOf('<svg'),
      indexEnd   = fileContent.indexOf('</svg>');

  if (!~indexStart || !~indexEnd) {
    throw new Error('Cannot find SVG tag. You sure it\'s an SVG and not a cat picture?');
  }

  // Save content pre and post SVG
  this.svgPre  = fileContent.substr(0, indexStart);
  this.svgPost = fileContent.substr(indexEnd + 6);
  fileContent  = fileContent.substr(indexStart, indexEnd + 6 - indexStart);

  var wrapDom = document.createElement('div');
  wrapDom.innerHTML = fileContent;

  // Delete previous SVG if existing
  if (this.svg) {
    this.el.removeChild(this.svgTag);
    this.svgTag.remove();
  }
  this.svgTag = wrapDom.childNodes[0];
  this.el.appendChild(this.svgTag);
  this.newSvgCb && this.newSvgCb(this.svg);
};
