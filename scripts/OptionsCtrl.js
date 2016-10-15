function OptionController (el) {
  this.el = el;

  el.querySelectorAll('input[x-panel]')
    .forEach(function (input) {
      input.addEventListener('click', function (e) {
        var panel = document.querySelector('.' + e.currentTarget.getAttribute('x-panel'));
        panel.style.display = e.currentTarget.checked ? 'block' : 'none';
      });
    })
}

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
