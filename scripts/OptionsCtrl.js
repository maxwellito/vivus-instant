/**
 * OptionController class
 * Dirty controller to display the extra
 * options when necessary and output the
 * data into a simple object.
 * It takes a DOM element as parameter which is
 * supposed to content all the required fields of
 * a Vivus option object.
 *
 * Funny enough, we have crazy new feature
 * in ES2015(& more)/HTML/CSS and other
 * experiments. But it's still not possible
 * to serialise a form with one method...
 * (please tell me I'm wrong in an issue)
 *
 * @param {[type]} el [description]
 */
function OptionController (el) {
  this.el = el;
  this.buttons = el.querySelectorAll('button');
  this.fields  = el.querySelectorAll('form *[name]');
  this.toggleActions(false);

  this.panelLoop = el.querySelector('.control-loop-panel');
  this.panelDelay = el.querySelector('.delay-panel');
  this.panelTriggerClass = el.querySelector('.manual-trigger-class-panel');
  this.updateForm();
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
 * in the form.
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
