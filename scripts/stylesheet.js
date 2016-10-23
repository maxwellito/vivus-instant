/**
 * Stylesheet class
 * Manage stylesheet elements to export it
 * in the smallest format possible.
 * Don't laugh, I can't promess the best
 * output possible.
 */
function Stylesheet () {
  this.selectors = {};
  this.keyframes = {};
}

/**
 * Set a property and it's value to a specific selector.
 * @param {string}        selector Selector to add the property to
 * @param {string}        property Property to set
 * @param {string|number} value    Value to set
 */
Stylesheet.prototype.setProperty = function (selector, property, value) {
  var styles = this.selectors[selector] || {};
  styles[property] = value;
  this.selectors[selector] = styles;
};

/**
 * Set a keyframe
 * @param {string} name    Keyframe name
 * @param {string} content Content of the keyframe
 */
Stylesheet.prototype.setKeyframe = function (name, content) {
  this.keyframes[name] = content;
};

/**
 * Use the content set in the instance to generate
 * the CSS.
 * @return {string} Le CSS
 */
Stylesheet.prototype.render = function () {
  var output = '';

  // Concat styles
  var prop, props, style, css = [];
  for (var selector in this.selectors) {
    style = '';
    props = this.selectors[selector];
    for (prop in props) {
      style += prop + ':' + props[prop] + ';';
    }
    output += selector + '{' + style + '}';
  }

  // Concat keyframes
  for (var keyframe in this.keyframes) {
    output += '@keyframes ' + keyframe + '{' + this.keyframes[keyframe] + '}';
  }

  return output;
  // Where is the optimisation? Good question.
};
