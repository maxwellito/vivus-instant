/**
 * OptionController class
 * Dirty controller to display the extra
 * options when necessary and output the
 * data into a simple object.
 * It takes a DOM element as parameter which is
 * supposed to content all the required fields of
 * a Vivus option object.
 *
 * Funny enough, we have crazy new features
 * in ES2015(& more)/HTML5/CSS3 and other
 * experiments. But it's still not possible
 * to serialise a form with one method...
 * (please tell me I'm wrong in an issue)
 *
 * @param {DOMelement} el Option dom element
 * @param {ViewerController} viewer Viewer controller
 */
function OptionController (el, viewer) {
  this.el = el;
  this.viewer = viewer;
  this.vivus = null;

  this.buttons = el.querySelectorAll('button');
  this.fields  = el.querySelectorAll('form *[name]');
  this.toggleActions(false);

  this.panelLoop = el.querySelector('.control-loop-panel');
  this.panelDelay = el.querySelector('.delay-panel');
  this.panelTriggerClass = el.querySelector('.manual-trigger-class-panel');
  this.updateForm();

  viewerCtrl.onNewSVG(function (leSVG) {
    this.toggleActions(true);

    // Let's prepare the SVG by transforming all
    // elements to paths.
    new Pathformer(leSVG);
    this.vivus = new VivusInstant(leSVG, this.getOptions());
  }.bind(this));
}

/**
 * Check form values to update subpanels visibility.
 * This is triggered directly from the input.
 * It's dirty and I know it....
 */
OptionController.prototype.updateForm = function () {
  var options = this.getOptions();
  this.panelLoop.style.display         = options.loop ? '' : 'none';
  this.panelDelay.style.display        = options.type === 'delayed' ? '' : 'none';
  this.panelTriggerClass.style.display = options.start === 'manual' ? '' : 'none';
};

/**
 * Basic method to serialise input values
 * in the form. That's cheap but does the job.
 * @return {Object} Serialised values of the form
 */
OptionController.prototype.getOptions = function () {
  var options = {};
  forEach(this.fields, function (index, el) {
    if (el.type === 'radio' && !el.checked) {
      return;
    }
    else if (el.type === 'checkbox') {
      options[el.name] = el.checked;
    }
    else if (el.value) {
      options[el.name] = el.value;
    }
  });
  return options;
};

/**
 * Enable/disable action buttons
 * @param  {boolean} areEnabled New state to set
 */
OptionController.prototype.toggleActions = function (areEnabled) {
  forEach(this.buttons, function(index, button) {
    button.disabled = !areEnabled;
  });
};

/**
 * Take the values of the options and generate/refresh
 * the SVG
 */
OptionController.prototype.draw = function () {
  this.viewer.refreshSVG();
  this.vivus.toggleTrigger(false);
  this.vivus.setOptions(this.getOptions());
  this.vivus.render();
  this.vivus.toggleTrigger(true);
};

/**
 * Trigger the download
 */
OptionController.prototype.download = function () {
  this.vivus.toggleTrigger(false);
  this.viewer.download();
  this.vivus.toggleTrigger(true);
};
