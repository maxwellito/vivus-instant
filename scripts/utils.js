/**
 * Polyfill to use forEach on lists
 * Todd Motto solution found on
 * https://css-tricks.com/snippets/javascript/loop-queryselectorall-matches/
 *
 * @param  {array}   array    Array to loop on
 * @param  {Function} callback Function to execute
 * @param  {object}   scope    Context to execute the method from
 */
var forEach = function (array, callback, scope) {
  for (var i = 0; i < array.length; i++) {
    callback.call(scope, i, array[i]); // passes back stuff we need
  }
};


/**
 * Parse string to integer.
 * If the number is not positive or null
 * the method will return the default value
 * or 0 if undefined
 *
 * @param {string} value String to parse
 * @param {*} defaultValue Value to return if the result parsed is invalid
 * @return {number}
 *
 */
var parsePositiveInt = function (value, defaultValue) {
  var output = parseInt(value, 10);
  return (output >= 0) ? output : defaultValue;
};
