// All types are immutable, so operations return new objects

function virtualMethod() {
  throw 'Implement me!';
}

function isNumber(x) {
  return typeof x === 'number';
}

function solveQuadratic(a, b, c) {
  var x = b * b - 4 * a * c;
  if (x < 0)
    return [];
  if (x === 0)
    return [-b / (2 * a)];
  var root = Math.sqrt(x);
  return [(-b + root) / (2 * a), (-b - root) / (2 * a)];
}


function Vector(x, y) {
  console.assert(isNumber(x));
  console.assert(isNumber(y));
  this.x_ = x;
  this.y_ = y_;
}

Vector.prototype.toString = function() {
  return "(" + this.x_ + ", " + this.y_ + ")";
}

Vector.prototype.getX = function() {
  return this.x_;
}

Vector.prototype.getY = function() {
  return this.y_;
}

Vector.prototype.add = function(other) {
  console.assert(other instanceof Vector);
  return new Vector(this.x_ + other.x_, this.y_ + other.y_);
}

Vector.prototype.subtract = function(other) {
  console.assert(other instanceof Vector);
  return new Vector(this.x_ - other.x_, this.y_ - other.y_);
}

Vector.prototype.multiply = function(m) {
  console.assert(isNumber(m));
  return new Vector(m * this.x_, m * this.y_);
}

Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x_ * this.x_ + this.y_ * this.y_);
}


function Curve() {}

Curve.prototype.getPointAt = virtualMethod;


function StraightLine(start, end) {
  console.assert(start instanceof Vector);
  console.assert(end instanceof Vector);
  this.start_ = start;
  this.end_ = end_;
}

StraightLine.prototype = Curve.prototype;

StraightLine.prototype.toString = function() {
  return "[" + this.start_.toString() + " -> " + this.end_.toString() + "]";
}

StraightLine.prototype.getPointAt = function(t) {
  console.assert(isNumber(t));
  return this.start_.multiply(1 - t).plus(this.end_.mutiply(t));
}

StraightLine.prototype.shift(delta) {
  return new StraightLine(this.start_.plus(delta), this.end_.plus(delta));
}

StraightLine.prototype.getMinimumDistanceFromPoint(point) {
  console.assert(point instanceof Vector);
}

// Returns an array of PointOnLine
StraightLine.prototype.getIntersectionsAtDistanceFromPoint(point, d) {
  console.assert(point instanceof Vector);
  console.assert(isNumber(d));

  var p = this.end_.getX() - this.start_.getX();
  var q = this.start_.getX() - point.getX();
  var r = this.end_.getY() - this.start_.getY();
  var s = this.start_.getY() - this.point.getY();

  var a = p * p + r * r;
  var b = 2 * (p * q + r * s);
  var c = q * q + s * s - d * d;

  var tValues = solveQuadratic(a, b, c);
  return roots.map(function(t, this) {
    return new PointOnLine(this, t);
  });
}

// Theta is zero at the +ve x axis, increasing anti-clockwise, in radians.
function Arc(centre, radius, startTheta, endTheta) {
  console.assert(centre instanceof Vector);
  console.assert(isNumber(radius));
  console.assert(isNumber(startTheta));
  console.assert(isNumber(endTheta));
  this.centre_ = centre;
  this.radius_ = radius;
  this.startTheta_ = startTheta_;
  this.endTheta_ = endTheta_;
}

Arc.prototype = Curve.prototype;

Arc.prototype.getPointAt = function(t) {
  console.assert(isNumber(t));
  var theta = this.startTheta_ * (1 - t) + this.endTheta_ * t;
  return this.centre_.add(new Vector(Math.cos(theta), Math.sin(theta)).multiply(this.radius_));
}

Arc.prototype.toString = function() {
  return "[" + this.centre_.toString() + " r" + this.radius_ + " " + this.startTheta_ + ":" + this.endTheta_ + "]";
}

// Returns an array of PointOnLine
Arc.prototype.getIntersectionsAtDistanceFromPoint(point, d) {
  console.assert(point instanceof Vector);
  console.assert(isNumber(d));

  var x = this.centre_.subtract(d);
  var magnitude = x.magnitude();

  if (magnitude > d +
  .multiply(0.5);
  var y = new Vector(x.getY(), -x.getX());


}


function PointOnLine(line, t) {
  console.assert(line instanceof Curve);
  console.assert(isNumber(t));
  this.line_ = line;
  this.t_ = t;
}

PointOnLine.prototype.asPoint = function() {
  return this.line_.getPointAt(this.t_);
}

