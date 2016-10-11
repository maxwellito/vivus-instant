function PlaygroundController (el) {
  this.el = el;
  this.svgTag = null;
  this.svgFileName = null;
  this.newSvgCb = null;

  // Listen for drag and drop
  el.addEventListener('drop',      this.dropped.bind(this),   false);
  el.addEventListener('dragover',  this.dragOver.bind(this),  false);
  el.addEventListener('dragleave', this.dragLeave.bind(this), false);
}

PlaygroundController.prototype.onNewSVG = function (callback) {
  this.newSvgCb = callback;
}

PlaygroundController.prototype.dragOver = function (event) {
  event.preventDefault();
  this.el.classList.add('droppin');
};

PlaygroundController.prototype.dragLeave = function (event) {
  event.preventDefault();
  this.el.classList.remove('droppin');
};

PlaygroundController.prototype.dropped = function (event) {
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

PlaygroundController.prototype.buildSVG = function (event) {
  var encodedData = event.currentTarget.result;
  encodedData = encodedData.substr(encodedData.indexOf('base64,')+7);
  var wrapDom = document.createElement('div');
  wrapDom.innerHTML = atob(encodedData);

  if (this.svg) {
    this.el.removeChild(this.svgTag);
    this.svgTag.remove();
  }
  this.svgTag = wrapDom.childNodes[0];
  this.el.appendChild(this.svgTag);
  this.newSvgCb && this.newSvgCb(this.svg);
};
