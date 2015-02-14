// Least-Squares fit to an exponential of form y = a  + b ln(x)
// From http://mathworld.wolfram.com/LeastSquaresFittingLogarithmic.html

function leastSquaresLogarithmic(x, y) {
  var n = x.length;
  console.assert(y.length === n);

  var q_ln_p = function(p, q) { return q * Math.log(p); };
  var p = function(p) { return p; };
  var ln_p = function(p) { return Math.log(p); };
  var ln_p_ln_p = function(p) { return Math.pow(Math.log(p), 2); };

  var sx = function(f) { return sum_1(x, f); };
  var sy = function(f) { return sum_1(y, f); };
  var sxy = function(f) { return sum_2(x, y, f); };

  var b = ( n * sxy(q_ln_p) - sy(p) * sx(ln_p) ) / ( n * sx(ln_p_ln_p) - Math.pow(sx(ln_p), 2) );
  var a = ( sy(p) - b * sx(ln_p) ) / n;

  return {a: a, b: b};
}

function logarithmic(x, a, b) {
  return x.map(function(element) { return a + b * Math.log(element); });
}

function leastSquaresExponential(x, y) {
  var n = x.length;
  console.assert(y.length === n);

  var p_p_q = function(p, q) { return p * p * q; };
  var p_ln_p = function(p) { return p * Math.log(p); };
  var p_q = function(p, q) { return p * q; };
  var p_q_ln_q = function(p, q) { return p * q * Math.log(q); };
  var p = function(p) { return p; };

  var sx = function(f) { return sum_1(x, f); };
  var sy = function(f) { return sum_1(y, f); };
  var sxy = function(f) { return sum_2(x, y, f); };

  var denominator = sy(p) * sxy(p_p_q) - Math.pow(sxy(p_q), 2);
  var a = ( sxy(p_p_q) * sy(p_ln_p) - sxy(p_q) * sxy(p_q_ln_q) ) / denominator;
  var b = ( sy(p) * sxy(p_q_ln_q) - sxy(p_q) * sy(p_ln_p) ) / denominator;

  return {A: Math.exp(a), B: b};
}

// f is a function which takes two arguments and returns a single value.
// It's called with the ith element of x and y.
function sum_2(x, y, f) {
  console.assert(x.length === y.length);
  return x.reduce(function(previousValue, currentValue, index) {
    return previousValue + f(currentValue, y[index]);
  }, 0);
}

// f is a function which takes one arguments and returns a single value.
// It's called with the ith element of x.
function sum_1(x, f) {
  return x.reduce(function(previousValue, currentValue) {
    return previousValue + f(currentValue);
  }, 0);
}

function exponential(x, A, B, C) {
  return x.map(function(element) { return C - A * Math.exp(B * element); });
}
