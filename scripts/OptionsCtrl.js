function OptionController (el) {
  this.el = el;
  this.toggleActions(false);

  this.panelLoop = el.querySelector('.control-loop-panel');
  this.panelDelay = el.querySelector('.delay-panel');
  this.panelTriggerClass = el.querySelector('.manual-trigger-class-panel');
  this.updateForm();
}

OptionController.prototype.updateForm = function () {
  var options = this.getOptions();
  this.panelLoop.style.display         = options.loop ? '' : 'none';
  this.panelDelay.style.display        = options.type === 'delayed' ? '' : 'none';
  this.panelTriggerClass.style.display = options.start === 'manual' ? '' : 'none';
};

OptionController.prototype.getOptions = function () {
  var options = {};
  this.el
    .querySelectorAll('form *[name]')
    .forEach((el) => {
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

OptionController.prototype.toggleActions = function (areEnabled) {
  this.el
    .querySelectorAll('button')
    .forEach(function (el) {
      el.disabled = !areEnabled;
    })
};
