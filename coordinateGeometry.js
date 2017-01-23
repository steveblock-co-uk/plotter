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
  return y === 0 ? -2 * Math.PI : y;
}

// Inclusive at minus pi, exclusive at pi.
function toMinusPlusPi(x) {
  var y = toZeroTwoPi(x);
  return y < Math.PI ? y : y - 2 * Math.PI;
}


function Hashable() {
}

Hashable.prototype.hashCode = virtualMethod;
Hashable.prototype.equals = virtualMethod;


function StringHashable() {
}

StringHashable.prototype = Object.create(Hashable.prototype);

StringHashable.prototype.toString = virtualMethod;

StringHashable.prototype.hashCode = function() {
  var s = this.toString();
  var hash = 0, i, chr, len;
  if (s.length === 0) return hash;
  for (i = 0, len = s.length; i < len; i++) {
    chr   = s.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

StringHashable.prototype.equals = function(o) {
  return this.toString() === o.toString();
};


// Hash collisions currently unsupported
function HashSet() {
  this.impl_ = {};
}

HashSet.prototype.add = function(x) {
  console.assert(x instanceof Hashable);
  var hashCode = x.hashCode();
  var value = this.impl_[hashCode];
  if (value !== undefined) {
    console.assert(x.equals(value));
    return;
  }
  this.impl_[hashCode] = x;
  return this;
};

HashSet.prototype.contains = function(x) {
  var result = this.impl_[x.hashCode()];
  if (result === undefined) {
    return false;
  }
  return x.equals(result);
};
  

// Given two arrays of objects, finds the list of pairs where one element in
// each pair is from each list and the value of f() for the two elements is a
// minimum.
function getClosestPairs(leftArray, rightArray, f) {
  console.assert(leftArray instanceof Array);
  console.assert(rightArray instanceof Array);
  console.assert(leftArray.length === rightArray.length);
  var values = [];
  for (var i = 0; i < leftArray.length; ++i) {
    for (var j = 0; j < rightArray.length; ++j) {
      values.push({
        value: f(leftArray[i], rightArray[j]),
        left: leftArray[i],
        right: rightArray[j]
      });
    }
  }
  values.sort(function(i, j) {
    return i.value - j.value;
  });
  var leftUsed = new HashSet();
  var rightUsed = new HashSet();
  var pairs = [];
  for (var i = 0; i < values.length; ++i) {
    var value = values[i];
    if (leftUsed.contains(value.left) && rightUsed.contains(value.right)) {
      continue;
    }
    console.assert(!leftUsed.contains(value.left));
    console.assert(!rightUsed.contains(value.right));
    pairs.push({left: value.left, right: value.right});
    leftUsed.add(value.left);
    rightUsed.add(value.right);
  }
  return pairs;
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

Vector.prototype.equals = function(v) {
  console.assert(isVector(v));
  return this.x_ === v.x_ && this.y_ === v.y_;
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

// Gets unit normal that is rotated +90 degrees.
Vector.prototype.unitNormal = function() {
  var unit = this.unit();
  // Special-case rather than using rotate() to avoid rounding errors.
  return new Vector(-unit.getY(), unit.getX());
};

Vector.prototype.dot = function(v) {
  console.assert(isVector(v));
  return this.x_ * v.x_ + this.y_ * v.y_;
};

Vector.prototype.cross = function(v) {
  console.assert(isVector(v));
  return this.x_ * v.y_ - this.y_ * v.x_;
};

Vector.prototype.rotate = function(theta) {
  console.assert(isNumber(theta));
  var cosTheta = Math.cos(theta);
  var sinTheta = Math.sin(theta);
 return new Vector(this.x_ * cosTheta - this.y_ * sinTheta, this.x_ * sinTheta + this.y_ * cosTheta);
}

function swap(x) {
  return x.map(function(e) {
    return { self: e.other, other: e.self };
  });
}

// TODO: How to make sure points are in same order?!
function join(self, other) {
  console.assert(self.length === other.length);
  var result = [];
  for (var i = 0; i < self.length; ++i) {
    result.push({self: self[i], other: other[i]});
  }
  return result;
}

function isInZeroOne(x) {
  return x >= 0 && x <= 1;
}


function Curve() {}

Curve.prototype = Object.create(StringHashable.prototype);

Curve.prototype.getPointAtParameter = virtualMethod;
Curve.prototype.shiftOrthogonal = virtualMethod;
Curve.prototype.getIntersectionsWithStraightLine = virtualMethod;
Curve.prototype.getIntersectionsWithArc = virtualMethod;
Curve.prototype.getIntersectionsWithCurve = virtualMethod;


function Intersections() {
}

Intersections.get = function(left, right) {
  console.assert(isCurve(left));
  console.assert(isCurve(right));
  var intersectionsLeft = left.getIntersectionsWithCurve(right);
  var intersectionsRight = right.getIntersectionsWithCurve(left);
  var pairs = getClosestPairs(intersectionsLeft, intersectionsRight, function(intersectionLeft, intersectionRight) {
    return intersectionLeft.asVector().subtract(intersectionRight.asVector()).magnitude();
  });
  return pairs.map(function(pair) {
    return new Intersections.Intersection_(pair.left, pair.right);
  });
}

Intersections.Intersection_ = function(left, right) {
  this.left_ = left;
  this.right_ = right;
}

Intersections.Intersection_.TYPE_INTERNAL = 'INTERNAL';
Intersections.Intersection_.TYPE_EXTERNAL = 'EXTERNAL';
Intersections.Intersection_.TYPE_MIXED = 'MIXED';

Intersections.Intersection_.prototype.getLeft = function() {
  return this.left_;
};

Intersections.Intersection_.prototype.getRight = function() {
  return this.right_;
};

Intersections.Intersection_.prototype.asVector = function() {
  // TODO: Check curve 2?
  return this.left_.asVector();
};

Intersections.Intersection_.prototype.type = function() {
  var c1 = isInZeroOne(this.left_.getParameter());
  var c2 = isInZeroOne(this.right_.getParameter());
  if (c1 && c2) {
    return Intersection.TYPE_INTERNAL;
  }
  if (!c1 && !c2) {
    return Intersection.TYPE_EXTERNAL;
  }
  return Intersection.TYPE_MIXED;
}


function PointOnCurve(curve, t) {
  console.assert(isCurve(curve));
  console.assert(isNumber(t));
  this.curve_ = curve;
  this.t_ = t;
}

PointOnCurve.prototype = Object.create(StringHashable.prototype);

PointOnCurve.prototype.toString = function() {
  return '[' + this.curve_ + ' @ ' + this.t_ + ']';
};

PointOnCurve.prototype.equals = function(o) {
  // TODO: Eliminate approximate equality!
  var tsEqual = (this.t_ === Infinity && o.t_ === Infinity) || Math.abs(this.t_ - o.t_) < 1e-10;
  return this.curve_.equals(o.curve_) && tsEqual;
};

PointOnCurve.prototype.asVector = function() {
  return this.curve_.getPointAtParameter(this.t_);
};

PointOnCurve.prototype.getParameter = function() {
  return this.t_;
};


// Directed
function StraightLine(start, end) {
  console.assert(isVector(start));
  console.assert(isVector(end));
  this.start_ = start;
  this.end_ = end;
};

StraightLine.prototype = Object.create(Curve.prototype);

StraightLine.prototype.toString = function() {
  return "[" + this.start_.toString() + " -> " + this.end_.toString() + "]";
};

StraightLine.prototype.equals = function(o) {
  return o instanceof StraightLine && this.start_.equals(o.start_) && this.end_.equals(o.end_);
};

StraightLine.prototype.getPointAtParameter = function(t) {
  console.assert(isNumber(t));
  return this.start_.add(this.delta().multiply(t));
};

// Positive distance is shift to left when viewed in direction of line.
StraightLine.prototype.shiftOrthogonal = function(distance) {
  console.assert(isNumber(distance));
  var unitNormal = this.delta().unitNormal();
  var delta = unitNormal.multiply(distance);
  return new StraightLine(this.start_.add(delta), this.end_.add(delta));
};

// Returns an array of PointOnCurve
StraightLine.prototype.getIntersectionsWithStraightLine = function(straightLine) {
  console.assert(isStraightLine(straightLine));
  var s1 = this.start_;
  var s2 = straightLine.start_;
  var d1 = this.delta();
  var d2 = straightLine.delta();
  var t = (d2.getX() * (s1.getY() - s2.getY()) - d2.getY() * (s1.getX() - s2.getX())) /
      (d1.getX() * d2.getY() - d2.getX() * d1.getY());
  return [new PointOnCurve(this, t)];
};

// Returns an array of PointOnLine
StraightLine.prototype.getIntersectionsWithArc = function(arc) {
  console.assert(isArc(arc));
  var point = arc.getCentre();
  var d = arc.getRadius();

  var p = this.end_.getX() - this.start_.getX();
  var q = this.start_.getX() - point.getX();
  var r = this.end_.getY() - this.start_.getY();
  var s = this.start_.getY() - point.getY();

  var a = p * p + r * r;
  var b = 2 * (p * q + r * s);
  var c = q * q + s * s - d * d;

  var tValues = solveQuadratic(a, b, c);
  return tValues.map(function(t) {
    return new PointOnCurve(this, t);
  }.bind(this));
};

// Returns an array of pairs of PointOnLine
StraightLine.prototype.getIntersectionsWithCurveImpl_ = function(curve) {
  console.assert(isCurve(curve));
  return curve.getIntersectionsWithStraightLine(this);
};

// Returns an array of pairs of PointOnLine
StraightLine.prototype.getIntersectionsWithCurve = function(curve) {
  console.assert(isCurve(curve));
  return curve.getIntersectionsWithCurveImpl_(this);
};

StraightLine.prototype.delta = function() {
  return this.end_.subtract(this.start_);
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


Arc.prototype = Object.create(Curve.prototype);

Arc.prototype.getCentre = function() {
  return this.centre_;
};

Arc.prototype.getRadius = function() {
  return this.radius_;
};

Arc.prototype.toString = function() {
  return "[" + this.centre_.toString() + " r" + this.radius_ + " " + this.startTheta_ + ":" + this.endTheta_ + " " + (this.reverse_ ? "reverse" : "forward") + "]";
};

Arc.prototype.equals = function(o) {
  return o instanceof Arc && this.centre_.equals(o.centre_) && this.radius_ === o.radius_ && this.startTheta_ === o.startTheta_ && this.endTheta_ === o.endTheta_ && this.reverse_ === o.reverse_;
};

Arc.prototype.getPointAtParameter = function(t) {
  console.assert(isNumber(t));
  var theta = interpolate(this.startTheta_, this.endTheta_, t);
  return this.centre_.add(new Vector(Math.cos(theta), Math.sin(theta)).multiply(this.radius_));
};

// Positive distance is shift to left when viewed in direction of line.
Arc.prototype.shiftOrthogonal = function(distance) {
  console.assert(isNumber(distance));
  var deltaRadius = this.endTheta_ > this.startTheta_ ? -distance : distance;
  return new Arc(this.centre_, this.radius_ + deltaRadius);
};

// Returns an array of PointOnCurve
Arc.prototype.getIntersectionsWithStraightLine = function(straightLine) {
  console.assert(isStraightLine(straightLine));
  var normal = new StraightLine(this.centre_, this.centre_.add(straightLine.delta().unitNormal()));
  var intersection = straightLine.getIntersectionsWithStraightLine(normal)[0].asVector();
  var centreToIntersection = intersection.subtract(this.centre_);
  var distance = centreToIntersection.magnitude();
  if (distance > this.radius_) {
    return [];
  }
  var angle = distance === 0 ? normal.delta().angle() : centreToIntersection.angle();
  var thetas;
  if (distance === this.radius_) {
    thetas = [angle];
  } else {
    var deltaAngle = Math.acos(distance / this.radius_);
    thetas = [
      angle + deltaAngle,
      angle - deltaAngle,
    ];
  }
  return thetas.map(function(theta) {
    return new PointOnCurve(this, getParameter(this.startTheta_, this.endTheta_, this.attemptToGetInRange_(theta)));
  }.bind(this));
};

// Due to wrap-around, it's arbitrary on which side of [startTheta, endTheta]
// an out-of-range theta lies. We always use a value such that t > 1.
Arc.prototype.attemptToGetInRange_ = function(theta) {
  var reverse = this.endTheta_ < this.startTheta;
  // startTheta is always in [-PI, PI).
  var wrapped = toMinusPlusPi(theta);
  if (!reverse && wrapped < this.startTheta_) {
    wrapped += 2 * Math.PI;
  } else if (reverse && wrapped > this.startTheta_) {
    wrapped -= 2 * Math.PI;
  }
  return wrapped;
};

// Returns an array of PointOnCurve
Arc.prototype.getIntersectionsWithArc = function(arc) {
  console.assert(isArc(arc));
  var point = arc.getCentre();
  var d = arc.getRadius();

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
    return new PointOnCurve(this, getParameter(this.startTheta_, this.endTheta_, this.attemptToGetInRange_(theta)));
  }.bind(this));
};

// Returns an array of pairs of PointOnCurve
Arc.prototype.getIntersectionsWithCurveImpl_ = function(curve) {
  console.assert(isCurve(curve));
  return curve.getIntersectionsWithArc(this);
};

// Returns an array of pairs of PointOnCurve
Arc.prototype.getIntersectionsWithCurve = function(curve) {
  console.assert(isCurve(curve));
  return curve.getIntersectionsWithCurveImpl_(this);
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
      fixedShiftedCurves.push_back(new Arc(originalIntersection, Math.abs(distance), previousShift.delta().angle(), nextShift.delta().angle(), distance > 0));
    }
    fixedShiftedCurves.push_back(shiftedCurves[i]);
  }
};
