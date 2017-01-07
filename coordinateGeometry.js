// All types are immutable, so operations return new objects

function virtualMethod() {
  throw 'Implement me!';
}

function isVector(x) {
  return x instanceof Vector;
}

function isNumber(x) {
  return typeof x === 'number';
}

function isBoolean(x) {
  return typeof x === 'boolean';
}

function isCurve(x) {
  return x instanceof Curve;
}

function isStraightLine(x) {
  return x instanceof StraightLine;
}

function isArc(x) {
  return x instanceof Arc;
}

function solveQuadratic(a, b, c) {
  console.assert(isNumber(a));
  console.assert(isNumber(b));
  console.assert(isNumber(c));
  var x = b * b - 4 * a * c;
  if (x < 0)
    return [];
  if (x === 0)
    return [-b / (2 * a)];
  var root = Math.sqrt(x);
  return [(-b + root) / (2 * a), (-b - root) / (2 * a)];
}

// Unused ???
function calculateTriangleAngle(a, b, c) {
  console.assert(isNumber(a));
  console.assert(isNumber(b));
  console.assert(isNumber(c));
  // a2 = b2 + c2 - 2bc cos A
  return Math.acos((b * b + c * c - a * a) / (2 * b * c));
}

function getParameter(start, end, x) {
  console.assert(isNumber(start));
  console.assert(isNumber(end));
  console.assert(isNumber(x));
  return (x - start) / (end - start);
}

function interpolate(start, end, t) {
  console.assert(isNumber(t));
  console.assert(isNumber(start));
  console.assert(isNumber(end));
  return start * (1 - t) + end * t;
}

// Exclusive at zero, inclusive at two pi.
function toZeroTwoPi(x) {
  var y = x % (2 * Math.PI);
  return y > 0 ? y : y + 2 * Math.PI;
}

// Exclusive at zero, inclusive at minus two pi.
function toZeroMinusTwoPi(x) {
  var y = toZeroTwoPi(x) - 2 * Math.PI;
  return y === 2 * Math.PI ? 0 : y;
}

// Inclusive at minus pi, exclusive at pi.
function toMinusPlusPi(x) {
  var y = toZeroTwoPi(x);
  return y < Math.PI ? y : y - 2 * Math.PI;
}


function Vector(x, y) {
  console.assert(isNumber(x));
  console.assert(isNumber(y));
  this.x_ = x;
  this.y_ = y;
}

Vector.X = new Vector(1, 0);

Vector.Y = new Vector(0, 1);

Vector.prototype.toString = function() {
  return "(" + this.x_ + ", " + this.y_ + ")";
};

Vector.prototype.getX = function() {
  return this.x_;
};

Vector.prototype.getY = function() {
  return this.y_;
};

Vector.prototype.add = function(other) {
  console.assert(isVector(other));
  return new Vector(this.x_ + other.x_, this.y_ + other.y_);
};

Vector.prototype.subtract = function(other) {
  console.assert(isVector(other));
  return new Vector(this.x_ - other.x_, this.y_ - other.y_);
};

Vector.prototype.multiply = function(m) {
  console.assert(isNumber(m));
  return new Vector(m * this.x_, m * this.y_);
};

Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x_ * this.x_ + this.y_ * this.y_);
};

// Radians anti-clockwise from +ve x axis
Vector.prototype.angle = function() {
  return Math.atan2(this.y_, this.x_);
};

Vector.prototype.unit = function() {
  return this.multiply(1 / this.magnitude());
};

// Gets unit normal that is rotated +90 degrees from normal.
Vector.prototype.unitNormal = function() {
  var unit = this.unit();
  // Special-case rather than using rotate() to avoid rounding errors.
  return new Vector(-unit.getY(), unit.getX());
};

Vector.prototype.dot = function(v) {
  console.assert(isVector(v));
  return this.x_ * v.getX() + this.y_ * v.getY();
};

Vector.prototype.equals = function(v) {
  console.assert(isVector(v));
  return this.x_ === v.getX() && this.y_ === v.getY();
};

Vector.prototype.rotate = function(theta) {
  console.assert(isNumber(theta));
  var cosTheta = Math.cos(theta);
  var sinTheta = Math.sin(theta);
 return new Vector(this.x_ * cosTheta - this.y_ * sinTheta, this.y_ * sinTheta + this.x_ * cosTheta);
}


function Curve() {}

Curve.prototype.toString = virtualMethod;
// Unused ???
Curve.prototype.shift = virtualMethod;
Curve.prototype.shiftOrthogonal = virtualMethod;
Curve.prototype.getPointAtParameter = virtualMethod;
Curve.prototype.getIntersectionsAtDistanceFromPoint = virtualMethod;
Curve.prototype.getIntersectionsWithStraightLine = virtualMethod;
Curve.prototype.getIntersectionsWithArc = virtualMethod;
Curve.prototype.getIntersectionsWithCurve = virtualMethod;


// Directed
function StraightLine(start, end) {
  console.assert(isVector(start));
  console.assert(isVector(end));
  this.start_ = start;
  this.end_ = end_;
};

StraightLine.prototype = Curve.prototype;

StraightLine.prototype.toString = function() {
  return "[" + this.start_.toString() + " -> " + this.end_.toString() + "]";
};

StraightLine.prototype.getPointAtParameter = function(t) {
  console.assert(isNumber(t));
  return this.start_.plus(this.delta().multiply(t));
};

StraightLine.prototype.shift = function(delta) {
  console.assert(isVector(delta));
  return new StraightLine(this.start_.plus(delta), this.end_.plus(delta));
};

/*
// Shifts towards point.
StraightLine.prototype.shiftOrthogonal = function(distance, point) {
  console.assert(isNumber(distance));
  console.assert(isVector(point));
  var unitNormal = this.unitNormal();
  var orthogonalDistanceToPoint = point.subtract(this.start_).dot(unitNormal);
  console.assert(orthogonalDistanceToPoint !== 0);
  var delta = unitNormal.multiply(orthogonalDistanceToPoint > 0 ? distance : -distance);
  return this.shift(delta);
};
*/

// Positive distance is shift to left when viewed in direction of line.
StraightLine.prototype.shiftOrthogonal = function(distance) {
  console.assert(isNumber(distance));
  var unitNormal = this.end_.subtract(this.start_).unitNormal();
  var delta = unitNormal.multiply(distance);
  return this.shift(delta);
};

// Returns an array of PointOnLine
StraightLine.prototype.getIntersectionsAtDistanceFromPoint = function(point, d) {
  console.assert(isVector(point));
  console.assert(isNumber(d));

  var p = this.end_.getX() - this.start_.getX();
  var q = this.start_.getX() - point.getX();
  var r = this.end_.getY() - this.start_.getY();
  var s = this.start_.getY() - this.point.getY();

  var a = p * p + r * r;
  var b = 2 * (p * q + r * s);
  var c = q * q + s * s - d * d;

  var tValues = solveQuadratic(a, b, c);
  return tValues.map(function(t) {
    return new PointOnLine(this, t);
  }.bind(this));
};

// Returns an array of PointOnLine
StraightLine.prototype.getIntersectionsWithStraightLine = function(straightLine) {
  console.assert(isStraightLine(straightLine));
  var s1 = this.start_;
  var s2 = straightLine.start_;
  var d1 = this.delta();
  var d2 = straightLine.delta();
  return (d2.getX() * (s1.getY() - s2.getY) - d2.getY() * (s1.getX() - s2.getX())) /
      (d1.getX() * d2.getY() - d2.getX() * d1.getY());
};

// Returns an array of PointOnLine
StraightLine.prototype.getIntersectionsWithArc = function(arc) {
  console.assert(isArc(arc));
  // TODO
};

// Returns an array of Vector
StraightLine.prototype.getIntersectionsWithCurve = function(curve) {
  console.assert(isCurve(x));
  return curve.getIntersectionsWithStraightLine(this).map(function(pointOnLine) {
    return pointOnLine.asVector();
  });
};

StraightLine.prototype.delta = function() {
  return this.end_.minus(this.start_);
};

// Angle from +vs x axis to end of line.
StraightLine.prototype.angle = function() {
  return this.delta().angle();
};

// Theta is zero at the +ve x axis, increasing anti-clockwise, in radians.
function Arc(centre, radius, startTheta, endTheta, reverse) {
  console.assert(isVector(centre));
  console.assert(isNumber(radius));
  console.assert(isNumber(startTheta));
  console.assert(isNumber(endTheta));
  console.assert(isBoolean(reverse));
  this.centre_ = centre;
  this.radius_ = radius;
  // To make interpolation work simply, we need to avoid wrap-around within the range of theta values. This also allows
  // us to determine direction by comparing start and end theta. We allow a complete circle but not a zero length arc.
  this.startTheta_ = toMinusPlusPi(startTheta);
  var deltaTheta = reverse ? toZeroMinusTwoPi(endTheta - startTheta) : toZeroTwoPi(endTheta - startTheta);
  this.endTheta_ = this.startTheta_ + deltaTheta;
}


Arc.prototype = Curve.prototype;

Arc.prototype.toString = function() {
  return "[" + this.centre_.toString() + " r" + this.radius_ + " " + this.startTheta_ + ":" + this.endTheta_ + " " + (this.reverse_ ? "forward" : "reverse") + "]";
};

Arc.prototype.getPointAtParameter = function(t) {
  console.assert(isNumber(t));
  var theta = interpolate(this.startTheta_, this.endTheta_, t);
  return this.centre_.add(new Vector(Math.cos(theta), Math.sin(theta)).multiply(this.radius_));
};

Arc.prototype.shift = function(delta) {
  console.assert(isVector(delta));
  return new Arc(this.centre_.plus(delta), this.radius_, this.startTheta_, this.endTheta_);
};

/*
// Shifts towards point.
Arc.prototype.shiftOrthogonal = function(distance, point) {
  var orthogonalDistanceToPoint = point.subtract(this.centre_).magnitude() - this.radius_;
  console.assert(orthogonalDistanceToPoint !== 0);
  return new Arc(this.centre_, orthogonalDistanceToPoint > 0 ? this.radius_ + distance : this.radius_ - distance);
};
*/

// Positive distance is shift to left when viewed in direction of line.
Arc.prototype.shiftOrthogonal = function(distance) {
  console.assert(isNumber(distance));
  var deltaRadius = this.endTheta_ > this.startTheta_ ? -distance : distance;
  return new Arc(this.centre_, this.radius_ + deltaRadius);
};

// Returns an array of PointOnLine
Arc.prototype.getIntersectionsAtDistanceFromPoint = function(point, d) {
  console.assert(isVector(point));
  console.assert(isNumber(d));

  var centreToPoint = point.subtract(this.centre_);
  var distanceBetweenCentres = centreToPoint.magnitude();

  var overlap = this.radius_ + d - distanceBetweenCentres;
  if (overlap < 0)
    return [];
  var thetaToPoint = centreToPoint.angle();
  var thetas;
  if (overlap === 0)
    thetas = [thetaToPoint];
  else {
    var halfAngle = calculateTriangleAngle(d, distanceBetweenCentres, this.radius_);
    thetas = [thetaToPoint - halfAngle, thetaToPoint + halfAngle];
  }
  return thetas.map(function(theta) {
    return new PointOnLine(this, getParameter(this.startTheta_, this.endTheta_, theta));
  }.bind(this));
};

// Returns an array of PointOnLine
Arc.prototype.getIntersectionsWithStraightLine = function(straightLine) {
  console.assert(isStraightLine(straightLine));
  // TODO
};

// Returns an array of PointOnLine
Arc.prototype.getIntersectionsWithArc = function(arc) {
  console.assert(isArc(arc));
  // TODO
};

// Returns an array of Vector
Arc.prototype.getIntersectionsWithCurve = function(curve) {
  console.assert(isCurve(x));
  return curve.getIntersectionsWithArc(this).map(function(pointOnLine) {
    return pointOnLine.asVector();
  });
};


function PointOnLine(line, t) {
  console.assert(isVector(line));
  console.assert(isNumber(t));
  this.line_ = line;
  this.t_ = t;
}

PointOnLine.prototype.asVector = function() {
  return this.line_.getPointAtParameter(this.t_);
};


// In general a PolyCurve consists of a set of joined curves. This constructor uses straight line segments.
function PolyCurve(points) {
  console.assert(isArray(points));
  console.assert(points.length > 1);
  this.curves_ = [];
  for (var i = 1; i < points.length; ++i) {
    this.curves_.push_back(new StraightLine(points[i - 1], points[i]));
  }
}

// Positive distance is shift to left when viewed in direction of line.
PolyCurve.prototype.shiftOrthogonal = function(distance) {
  console.assert(isNumber(distance));
  var shiftedCurves = this.curves_.map(function(curve) {
    return curve.shiftOrthogonal(distance);
  });
  var fixedShiftedCurves = [ shiftedCurves[0] ];
  for (var i = 1; i < this.curves_.length; ++i) {
    // If the shifted curves do not meet, insert an arc with radius equal to the shift, so that it's tangent to adjacent
    // straight lines.
    // TODO: Trim lines that overlap!
    var endOfPreviousCurve = shiftedCurves[i - 1].getPointAtParameter(1);
    var startOfNextCurve = shiftedCurves[i].getPointAtParameter(0);
    // TODO: Need a tolaerance for rounding errors?
    if (!endOfPreviousCurve.equals(startOfNextCurve)) {
      var originalIntersection = this.curves_[i].getPointAtParameter(0);
      console.assert(originalIntersection.equals(this.curves_[i - 1].getPointAtParameter(1)));
      fixedShiftedCurves.push_back(new Arc(originalIntersection, Math.abs(distance), previousShift.angle(), nextShift.angle(), distance > 0));
    }
    fixedShiftedCurves.push_back(shiftedCurves[i]);
  }
};
