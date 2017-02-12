// All types are immutable, so operations return new objects

function virtualMethod() {
  throw 'Implement me!';
}

function isArray(x) {
  return x instanceof Array;
}

function isVector(x) {
  return x instanceof Vector;
}

function isNumber(x) {
  return typeof x === 'number';
}

function isFiniteNumber(x) {
  return isNumber(x) && isFinite(x);
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

function isPointOnCurve(x) {
  return x instanceof PointOnCurve;
}

function isInZeroOne(x) {
  return x >= 0 && x <= 1;
}

function assert(x, message) {
  if (!x) {
    throw message;
  }
}

// TODO: Eliminate approximate equality!
function approxEqual(a, b) {
  assert(isNumber(a));
  assert(isNumber(b));
  return (isNaN(a) && isNaN(b)) || (a === Infinity && b === Infinity) || (a === -Infinity && b === -Infinity) || Math.abs(a - b) < 1e-10;
}

function multiplyPreserveZero(a, b) {
  return (a === 0 || b === 0) ? 0 : a * b;
}

function solveQuadratic(a, b, c) {
  assert(isFiniteNumber(a));
  assert(isFiniteNumber(b));
  assert(isFiniteNumber(c));
  var x = b * b - 4 * a * c;
  if (x < 0)
    return [];
  if (x === 0)
    return [-b / (2 * a)];
  var root = Math.sqrt(x);
  return [(-b + root) / (2 * a), (-b - root) / (2 * a)];
}

function calculateTriangleAngle(a, b, c) {
  assert(isFiniteNumber(a));
  assert(isFiniteNumber(b));
  assert(isFiniteNumber(c));
  // a2 = b2 + c2 - 2bc cos A
  return Math.acos((b * b + c * c - a * a) / (2 * b * c));
}

function getParameter(start, end, x) {
  assert(isNumber(start));
  assert(isNumber(end));
  assert(isNumber(x));
  if (isFinite(start)) {
    return (x - start) / (end - start);
  } else {
    return 1 - (x - end) / (start - end);
  }
}

function interpolate(start, end, t) {
  assert(isNumber(t));
  assert(isNumber(start));
  assert(isNumber(end));
  if (!isFinite(t)) {
    return Math.sign(end - start) * t;
  }
  return start * (1 - t) + end * t;
}

// Exclusive at zero, inclusive at two pi.
function toZeroTwoPi(x) {
  assert(isFiniteNumber(x));
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

// Given two arrays of objects, finds the list of pairs where one element in
// each pair is from each list and the value of f() for the two elements is a
// minimum.
function getClosestPairs(leftArray, rightArray, f) {
  assert(leftArray instanceof Array);
  assert(rightArray instanceof Array);
  assert(leftArray.length === rightArray.length);
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
    assert(!leftUsed.contains(value.left));
    assert(!rightUsed.contains(value.right));
    pairs.push({left: value.left, right: value.right});
    leftUsed.add(value.left);
    rightUsed.add(value.right);
  }
  return pairs;
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
  assert(x instanceof Hashable);
  var hashCode = x.hashCode();
  var value = this.impl_[hashCode];
  if (value !== undefined) {
    assert(x.equals(value));
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
  

function Vector(x, y) {
  assert(isNumber(x));
  assert(isNumber(y));
  this.x_ = x;
  this.y_ = y;
}

Vector.Origin = new Vector(0, 0);
Vector.X = new Vector(1, 0);
Vector.Y = new Vector(0, 1);

Vector.prototype.toString = function() {
  return "(" + this.x_ + ", " + this.y_ + ")";
};

Vector.prototype.equals = function(v) {
  assert(isVector(v));
  return approxEqual(this.x_, v.x_) && approxEqual(this.y_, v.y_);
};

Vector.prototype.getX = function() {
  return this.x_;
};

Vector.prototype.getY = function() {
  return this.y_;
};

Vector.prototype.isFinite = function(other) {
  return isFinite(this.x_) && isFinite(this.y_);
};

Vector.prototype.add = function(other) {
  assert(isVector(other));
  return new Vector(this.x_ + other.x_, this.y_ + other.y_);
};

Vector.prototype.subtract = function(other) {
  assert(isVector(other));
  // Handle infinity
  return new Vector((this.x_ === other.x_) ? 0 : this.x_ - other.x_, (this.y_ === other.y_) ? 0 : this.y_ - other.y_);
};

Vector.prototype.multiply = function(m) {
  assert(isNumber(m));
  return new Vector(multiplyPreserveZero(m, this.x_), multiplyPreserveZero(m, this.y_));
};

Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x_ * this.x_ + this.y_ * this.y_);
};

// Radians anti-clockwise from +ve x axis
Vector.prototype.angle = function() {
  return Math.atan2(this.y_, this.x_);
};

Vector.prototype.unit = function() {
  if (!isFinite(this.x_) && !isFinite(this.y_)) {
    return new Vector(Math.sign(this.x_) / Math.sqrt(2), Math.sign(this.y_) / Math.sqrt(2));
  } else if (!isFinite(this.x_)) {
    return new Vector(Math.sign(this.x_), 0);
  } else if (!isFinite(this.y_)) {
    return new Vector(0, Math.sign(this.y_));
  }
  return this.multiply(1 / this.magnitude());
};

Vector.prototype.dot = function(v) {
  assert(isVector(v));
  return this.x_ * v.x_ + this.y_ * v.y_;
};

Vector.prototype.cross = function(v) {
  assert(isVector(v));
  return this.x_ * v.y_ - this.y_ * v.x_;
};

Vector.prototype.rotate = function(theta) {
  assert(isFiniteNumber(theta));
  theta = toMinusPlusPi(theta);
  if (theta === -Math.PI) {
    return new Vector(-this.x_, -this.y_);
  } else if (theta === -Math.PI / 2) {
    return new Vector(this.y_, -this.x_);
  } else if (theta === 0) {
    return this;
  } else if (theta === Math.PI / 2) {
    return new Vector(-this.y_, this.x_);
  }
  var cosTheta = Math.cos(theta);
  var sinTheta = Math.sin(theta);
  return new Vector(this.x_ * cosTheta - this.y_ * sinTheta, this.x_ * sinTheta + this.y_ * cosTheta);
}


// Curves can only use finite vectors. Allowing infinity complicates things
// significantly, but doesn't add much as we already support intersections
// outside the length of the curve. Parameters can be infinite.
function Curve() {}

Curve.prototype = Object.create(StringHashable.prototype);

Curve.prototype.getPointAtParameter = virtualMethod;
Curve.prototype.shiftOrthogonal = virtualMethod;
// Returns an array of PointOnCurve
Curve.prototype.getIntersectionsWithStraightLine = virtualMethod;
// Returns an array of PointOnCurve
Curve.prototype.getIntersectionsWithArc = virtualMethod;
// Returns an array of PointOnCurve
Curve.prototype.getIntersectionsWithCurve = virtualMethod;
Curve.prototype.split = virtualMethod;
Curve.prototype.getAngleAtParameter = virtualMethod;
Curve.prototype.length = virtualMethod;


function PointOnCurve(curve, t) {
  assert(isCurve(curve));
  assert(isNumber(t));
  this.curve_ = curve;
  this.t_ = t;
}

PointOnCurve.prototype = Object.create(StringHashable.prototype);

PointOnCurve.prototype.toString = function() {
  return '[' + this.curve_ + ' @ ' + this.t_ + ']';
};

// Override
PointOnCurve.prototype.equals = function(o) {
  return this.curve_.equals(o.curve_) && approxEqual(this.t_, o.t_);;
};

PointOnCurve.prototype.asVector = function() {
  return this.curve_.getPointAtParameter(this.t_);
};

PointOnCurve.prototype.getCurve = function() {
  return this.curve_;
};

PointOnCurve.prototype.getParameter = function() {
  return this.t_;
};


// Directed
function StraightLine(start, end) {
  assert(isVector(start), 'Start of StraightLine must be a vector');
  assert(isVector(end, 'End of StraightLine must be a vector'));
  assert(start.isFinite() && end.isFinite(), 'Start and end of StraightLine must be finite: ' + start.toString() + ' ' + end.toString());
  this.start_ = start;
  this.end_ = end;
};

StraightLine.prototype = Object.create(Curve.prototype);

StraightLine.prototype.toString = function() {
  return "[" + this.start_.toString() + " -> " + this.end_.toString() + "]";
};

// Override
StraightLine.prototype.equals = function(o) {
  return o instanceof StraightLine && this.start_.equals(o.start_) && this.end_.equals(o.end_);
};

StraightLine.prototype.getPointAtParameter = function(t) {
  assert(isNumber(t));
  return this.start_.add(this.delta().multiply(t));
};

// Positive distance is shift to left when viewed in direction of line.
StraightLine.prototype.shiftOrthogonal = function(distance) {
  assert(isFiniteNumber(distance));
  var unitNormal = this.delta().unit().rotate(Math.PI / 2);
  var delta = unitNormal.multiply(distance);
  return new StraightLine(this.start_.add(delta), this.end_.add(delta));
};

// Returns an array of PointOnCurve
StraightLine.prototype.getIntersectionsWithStraightLine = function(straightLine) {
  assert(isStraightLine(straightLine));
  var s1 = this.start_;
  var s2 = straightLine.start_;
  var d1 = this.delta();
  var d2 = straightLine.delta();
  var t = (d2.getX() * (s1.getY() - s2.getY()) - d2.getY() * (s1.getX() - s2.getX())) /
      (d1.getX() * d2.getY() - d2.getX() * d1.getY());
  return [new PointOnCurve(this, t)];
};

// Returns an array of PointOnCurve
StraightLine.prototype.getIntersectionsWithArc = function(arc) {
  assert(isArc(arc));
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

// Returns an array of PointOnCurve
StraightLine.prototype.getIntersectionsWithCurveImpl_ = function(curve) {
  assert(isCurve(curve));
  return curve.getIntersectionsWithStraightLine(this);
};

// Returns an array of PointOnCurve
StraightLine.prototype.getIntersectionsWithCurve = function(curve) {
  assert(isCurve(curve));
  return curve.getIntersectionsWithCurveImpl_(this);
};

StraightLine.prototype.split = function(t) {
  assert(isFiniteNumber(t), 'Parameter to StraightLine.split() must be a finite number but was ' + t);
  var splitPoint = this.getPointAtParameter(t);
  return [new StraightLine(this.start_, splitPoint), new StraightLine(splitPoint, this.end_)];
};

StraightLine.prototype.getAngleAtParameter = function(t) {
  assert(isNumber(t));
  return this.delta().angle();
};

StraightLine.prototype.length = function() {
  return this.delta().magnitude();
};

StraightLine.prototype.delta = function() {
  return this.end_.subtract(this.start_);
};

// Theta is zero at the +ve x axis, increasing anti-clockwise, in radians.
function Arc(centre, radius, startTheta, endTheta, reverse) {
  assert(isVector(centre));
  assert(isFiniteNumber(radius) && radius > 0);
  assert(isFiniteNumber(startTheta));
  assert(isFiniteNumber(endTheta));
  assert(isBoolean(reverse));
  assert(isFinite(centre.getX()) && isFinite(centre.getY()));
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

Arc.prototype.getReverse = function() {
  return this.endTheta_ < this.startTheta_;
};

Arc.prototype.toString = function() {
  return "[" + this.centre_.toString() + " r" + this.radius_ + " " + this.startTheta_ + ":" + this.endTheta_ + "]";
};

// Override
Arc.prototype.equals = function(o) {
  return o instanceof Arc && this.centre_.equals(o.centre_) && this.radius_ === o.radius_ && this.startTheta_ === o.startTheta_ && this.endTheta_ === o.endTheta_;
};

Arc.prototype.getPointAtParameter = function(t) {
  assert(isNumber(t));
  var theta = interpolate(this.startTheta_, this.endTheta_, t);
  return this.centre_.add(new Vector(Math.cos(theta), Math.sin(theta)).multiply(this.radius_));
};

// Positive distance is shift to left when viewed in direction of line.
Arc.prototype.shiftOrthogonal = function(distance) {
  assert(isFiniteNumber(distance));
  var deltaRadius = this.getReverse() ? distance : -distance;
  return new Arc(this.centre_, this.radius_ + deltaRadius, this.startTheta_, this.endTheta_, this.getReverse());
};

// Returns an array of PointOnCurve
Arc.prototype.getIntersectionsWithStraightLine = function(straightLine) {
  assert(isStraightLine(straightLine));
  var normal = new StraightLine(this.centre_, this.centre_.add(straightLine.delta().unit().rotate(Math.PI / 2)));
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
  // startTheta is always in [-PI, PI).
  var wrapped = toMinusPlusPi(theta);
  if (!this.getReverse() && wrapped < this.startTheta_) {
    wrapped += 2 * Math.PI;
  } else if (this.getReverse() && wrapped > this.startTheta_) {
    wrapped -= 2 * Math.PI;
  }
  return wrapped;
};

// Returns an array of PointOnCurve
Arc.prototype.getIntersectionsWithArc = function(arc) {
  assert(isArc(arc));
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

// Returns an array of PointOnCurve
Arc.prototype.getIntersectionsWithCurveImpl_ = function(curve) {
  assert(isCurve(curve));
  return curve.getIntersectionsWithArc(this);
};

// Returns an array of PointOnCurve
Arc.prototype.getIntersectionsWithCurve = function(curve) {
  assert(isCurve(curve));
  return curve.getIntersectionsWithCurveImpl_(this);
};

Arc.prototype.split = function(t) {
  assert(isFiniteNumber(t));
  var splitTheta = interpolate(this.startTheta_, this.endTheta_, t);
  var reverse = this.getReverse();
  var leftReverse = t < 0 ? !reverse : reverse;
  var rightReverse = t > 1 ? !reverse : reverse;
  return [
    new Arc(this.centre_, this.radius_, this.startTheta_, splitTheta, leftReverse),
    new Arc(this.centre_, this.radius_, splitTheta, this.endTheta_, rightReverse)
  ];
};

Arc.prototype.getAngleAtParameter = function(t) {
  assert(isNumber(t));
  var theta = interpolate(this.startTheta_, this.endTheta_, t);
  var deltaTheta = this.getReverse() ? -Math.PI / 2 : Math.PI / 2;
  return toMinusPlusPi(theta + deltaTheta);
};

Arc.prototype.length = function() {
  return Math.abs(this.endTheta_ - this.startTheta_) * this.radius_;
};

function Intersections() {
}

Intersections.TYPE_INTERNAL = 'INTERNAL';
Intersections.TYPE_EXTERNAL = 'EXTERNAL';
Intersections.TYPE_MIXED = 'MIXED';

Intersections.get = function(left, right) {
  assert(isCurve(left));
  assert(isCurve(right));
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
  assert(isPointOnCurve(left));
  assert(isPointOnCurve(right));
  this.left_ = left;
  this.right_ = right;
}

Intersections.Intersection_.prototype.toString = function() {
  return '{left: ' + this.left_.toString() + ', right: ' + this.right_.toString() + '}';
};

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
    return Intersections.TYPE_INTERNAL;
  }
  if (!c1 && !c2) {
    return Intersections.TYPE_EXTERNAL;
  }
  return Intersections.TYPE_MIXED;
}


// TODO: Make this private
function PolyCurve(curves) {
  assert(isArray(curves));
  assert(curves.length > 0, 'PolyCurve must have at least one curve');
  for (var i = 0; i < curves.length - 1; ++i) {
    assert(curves[i].getPointAtParameter(1).equals(curves[i + 1].getPointAtParameter(0)), 'Curves must meet to build PolyCurve: ' + curves[i].getPointAtParameter(1).toString() + ' vs ' + curves[i + 1].getPointAtParameter(0).toString() + ' at index ' + i);
  }
  this.curves_ = curves;
  this.startParameters_ = [];
  var runningLength = 0;
  for (var i = 0; i < this.curves_.length; ++i) {
    this.startParameters_[i] = runningLength / this.length();
    runningLength += this.curves_[i].length();
  }
  this.startParameters_[i] = 1;
}

PolyCurve.fromPoints = function(points) {
  assert(isArray(points));
  assert(points.length > 1);
  var curves = [];
  for (var i = 1; i < points.length; ++i) {
    curves.push(new StraightLine(points[i - 1], points[i]));
  }
  return new PolyCurve(curves);
}

PolyCurve.prototype = Object.create(Curve.prototype);

PolyCurve.prototype.toString = function() {
  return "[" + this.curves_.map(function(curve) { return curve.toString(); }).join(", ") + "]";
};

// Override
PolyCurve.prototype.equals = function(other) {
  if (!other instanceof PolyCurve) {
    return false;
  }
  if (this.curves_.length !== other.curves_.length) {
    return false;
  }
  for (var i = 0; i < this.curves_.length; ++i) {
    if (!this.curves_[i].equals(other.curves_[i])) {
      return false;
    }
  }
  return true;
};

PolyCurve.prototype.getCurves = function() {
  return this.curves_.slice();
};

PolyCurve.prototype.getParameter_ = function(index, localParameter) {
  return interpolate(this.startParameters_[index], this.startParameters_[index + 1], localParameter);
};

// Local index is in [0, 1), except for first and last curves.
PolyCurve.prototype.getIndexAndLocalParameter_ = function(t) {
  assert(isNumber(t));
  var index = 0;
  while (t >= this.startParameters_[index + 1] && index < this.curves_.length - 1) {
    ++index;
  }
  var localParameter = getParameter(this.startParameters_[index], this.startParameters_[index + 1], t);
  return {
    index: index,
    localParameter: localParameter
  };
};

PolyCurve.prototype.getPointAtParameter = function(t) {
  assert(isFiniteNumber(t));
  var indexAndLocalParameter = this.getIndexAndLocalParameter_(t);
  return this.curves_[indexAndLocalParameter.index].getPointAtParameter(indexAndLocalParameter.localParameter);
};

// Positive distance is shift to left when viewed in direction of line.
PolyCurve.prototype.shiftOrthogonal = function(distance) {
  assert(isFiniteNumber(distance));
  var shiftedCurves = this.curves_.map(function(curve) {
    return curve.shiftOrthogonal(distance);
  });

  // The shifted curves may no longer meet. There are three possibilities for
  // each pair of adjacent curves.
  // 1. Original curves are parallel at join. Shifted curves will meet. Nothing
  //    to do.
  // 2. Original curves formed a convex join. Shifted curves will not meet. We
  //    need to insert an arc between them.
  // 3. Original curves formed a concave join. Shifted curves will typically
  //    intersect. However, if one curve is short compared to the shift
  //    distance, the shifted curves may not intersect. In this case we need to
  //    consider intersection with neighbouring curves, including arcs inserted
  //    in step 2 above. We need to trim each shifted curve to the intersection
  //    point. If no intersection is found, this is the end of the poly curve.

  // Step 2 - At convex joins, insert arcs.
  var shiftedCurvesWithArcs = [];
  for (var i = 0; i < this.curves_.length - 1; ++i) {
    var incomingEndAngle = this.curves_[i].getAngleAtParameter(1);
    var outgoingStartAngle = this.curves_[i + 1].getAngleAtParameter(0);
    var endJoinAngle = toMinusPlusPi(outgoingStartAngle - incomingEndAngle);
    var distanceSign = distance > 0 ? +1 : -1;
    var isParallel = (endJoinAngle === 0 || endJoinAngle === -Math.PI);
    var isConvex = !isParallel && (endJoinAngle * distanceSign) < 0;
    shiftedCurvesWithArcs.push({
      curve: shiftedCurves[i],
      isProcessed: isParallel || isConvex
    });
    if (isConvex) {
      var reverse = distance > 0;
      shiftedCurvesWithArcs.push({
        curve: new Arc(
            this.curves_[i].getPointAtParameter(1),
            Math.abs(distance),
            incomingEndAngle + (reverse ? 1 : -1) * Math.PI / 2,
            outgoingStartAngle + (reverse ? 1 : -1) * Math.PI / 2,
            reverse),
        isProcessed: true
      });
    }
  }
  shiftedCurvesWithArcs.push({
    curve: shiftedCurves[this.curves_.length - 1],
    isProcessed: true
  });

  // Step 3 - At concave joins, find intersection and trim.
  var result = [];
  var isDoneEarly = false;
  for (var i = 0; i < shiftedCurvesWithArcs.length - 1; ++i) {
    // Skip curves that have been processed.
    var incomingShiftedCurve = shiftedCurvesWithArcs[i].curve;
    if (shiftedCurvesWithArcs[i].isProcessed) {
      result.push(incomingShiftedCurve);
      continue;
    }

    // See if the curves at the join intersect. If so, we're done.
    var outgoingShiftedCurve = shiftedCurvesWithArcs[i + 1].curve;
    var intersections = Intersections.get(incomingShiftedCurve, outgoingShiftedCurve).filter(isInternal);
    // I don't think it's possible for there to be multiple internal
    // intersections if curves are either straight lines or arcs.
    assert(intersections.length < 2);
    if (intersections.length === 1) {
      var intersection = intersections[0];
      var leftParameter = intersection.getLeft().getParameter();
      assert(leftParameter > 0 && leftParameter < 1);
      assert(intersection.getLeft().getCurve() === incomingShiftedCurve);
      result.push(incomingShiftedCurve.split(leftParameter)[0]);
      // Put the trimmed outgoing curve back into the input list, as we may
      // need to process it again.
      var rightParameter = intersection.getRight().getParameter();
      assert(rightParameter > 0 && rightParameter < 1);
      assert(intersection.getRight().getCurve() === outgoingShiftedCurve);
      shiftedCurvesWithArcs[i + 1] = {
        curve: outgoingShiftedCurve.split(rightParameter)[1],
        isProcessed: shiftedCurvesWithArcs[i + 1].isProcessed
      };
      continue;
    }
    
    // Find the 'closest' pair of curves that span this join and which
    // intersect. There is no correct pair, as 'closest' is only a heuristic.
    // We use total length along the curve.
    var intersectionsAndIndices = [];
    for (var leftIndex = i; leftIndex >= 0; leftIndex--) {
      for (var rightIndex = i + 1; rightIndex < shiftedCurvesWithArcs.length; rightIndex++) {
        intersectionsAndIndices = intersectionsAndIndices.concat(
            Intersections.get(shiftedCurvesWithArcs[leftIndex].curve, shiftedCurvesWithArcs[rightIndex].curve)
                .filter(isInternal)
                .map(function(intersection) {
                  return {
                    leftIndex: leftIndex,
                    rightIndex: rightIndex,
                    intersection: intersection
                  };
                }));
      }
    }
    intersectionsAndIndices.sort(function(intersectionAndIndices1, intersectionAndIndices2) {
      var distance1 = distanceAlongCurves(
          shiftedCurvesWithArcs.map(function(x) { return x.curve; }),
          intersectionAndIndices1.leftIndex,
          intersectionAndIndices1.rightIndex,
          intersectionAndIndices1.intersection.getLeft().getParameter(),
          intersectionAndIndices1.intersection.getRight().getParameter());
      var distance2 = distanceAlongCurves(
          shiftedCurvesWithArcs.map(function(x) { return x.curve; }),
          intersectionAndIndices2.leftIndex,
          intersectionAndIndices2.rightIndex,
          intersectionAndIndices2.intersection.getLeft().getParameter(),
          intersectionAndIndices2.intersection.getRight().getParameter());
      return distance1 - distance2;
    });

    // If there are no intersections, this is the end of the polycurve.
    if (intersectionsAndIndices.length === 0) {
      result.push(incomingShiftedCurve);
      isDoneEarly = true;
      break;
    }

    // Remove shifted curves back to the left curve of the closest intersection
    // and instead add the trimmed left curve.
    var closestIntersectionAndIndices = intersectionsAndIndices[0];
    for (var index = i; index >= closestIntersectionAndIndices.leftIndex; index--) {
      result.pop();
    }
    var leftParameter = closestIntersectionAndIndices.intersection.getLeft().getParameter();
    assert(leftParameter > 0 && leftParameter < 1);
    result.push(closestIntersectionAndIndices.intersection.getLeft().getCurve().split(leftParameter)[0]);

    // Put the trimmed outgoing curve back into the input list, as we may need
    // to process it again, and jump ahead to it.
    var rightParameter = closestIntersectionAndIndices.intersection.getRight().getParameter();
    assert(rightParameter > 0 && rightParameter < 1);
    shiftedCurvesWithArcs[closestIntersectionAndIndices.rightIndex] = {
      curve: closestIntersectionAndIndices.intersection.getRight().getCurve().split(rightParameter)[1],
      isProcessed: shiftedCurvesWithArcs[closestIntersectionAndIndices.rightIndex].isProcessed
    };
    assert(i < closestIntersectionAndIndices.rightIndex);
    i = closestIntersectionAndIndices.rightIndex - 1;
  }
  if (!isDoneEarly) {
    result.push(shiftedCurvesWithArcs[shiftedCurvesWithArcs.length - 1].curve);
  }
  return new PolyCurve(result);
};

PolyCurve.prototype.getIntersections_ = function(intersectionMethodName, otherCurve) {
  return this.curves_.map(function(curve, index) {
    return curve[intersectionMethodName](otherCurve).map(function(intersection) {
      return {
        index: index,
        intersection: intersection
      };
    });
  }.bind(this)).reduce(function(accumulator, indexAndIntersection) {
    return accumulator.concat(indexAndIntersection);
  }).filter(function(indexAndIntersection) {
    var isFirstCurve = (indexAndIntersection.index === 0);
    var isLastCurve = (indexAndIntersection.index === this.curves_.length - 1);
    var parameter = indexAndIntersection.intersection.getParameter();
    return (parameter >= 0 && parameter < 1) || (isFirstCurve && (parameter < 1)) || (isLastCurve && (parameter >= 0));
  }.bind(this)).map(function(indexAndIntersection) {
    return new PointOnCurve(this, this.getParameter_(indexAndIntersection.index, indexAndIntersection.intersection.getParameter()));
  }.bind(this));
};

// Returns an array of PointOnCurve
PolyCurve.prototype.getIntersectionsWithStraightLine = function(straightLine) {
  assert(isStraightLine(straightLine));
  return this.getIntersections_('getIntersectionsWithStraightLine', straightLine);
}

// Returns an array of PointOnCurve
PolyCurve.prototype.getIntersectionsWithArc = function(arc) {
  assert(isArc(arc));
  return this.getIntersections_('getIntersectionsWithArc', arc);
};

// Returns an array of PointOnCurve
PolyCurve.prototype.getIntersectionsWithCurve = function(curve) {
  // TODO: This would require adding Curve.getIntersectionsWithPolyCurve.
  throw 'Not implemented';
};

PolyCurve.prototype.split = function(t) {
  var indexAndLocalParameter = this.getIndexAndLocalParameter_(t);
  if (indexAndLocalParameter.localParameter === 0 && indexAndLocalParameter.index !== 0) {
      return [
        new PolyCurve(this.curves_.slice(0, indexAndLocalParameter.index)),
        new PolyCurve(this.curves_.slice(indexAndLocalParameter.index))
      ];
  }
  var splitCurve = this.curves_[indexAndLocalParameter.index].split(indexAndLocalParameter.localParameter);
  return [
    new PolyCurve(this.curves_.slice(0, indexAndLocalParameter.index).concat(splitCurve[0])),
    new PolyCurve([splitCurve[1]].concat(this.curves_.slice(indexAndLocalParameter.index + 1)))
  ];
};

// At vertices, takes the angle of the outgoing curve.
PolyCurve.prototype.getAngleAtParameter = function(t) {
  var indexAndLocalParameter = this.getIndexAndLocalParameter_(t);
  return this.curves_[indexAndLocalParameter.index].getAngleAtParameter(indexAndLocalParameter.localParameter);
};

PolyCurve.prototype.length = function() {
  return this.curves_.reduce(function(accumulator, curve) {
    return accumulator + curve.length();
  }, 0);
};

// TODO: Make lcoal?
// Start inclusive, end exclusive
function lengthOfCurves(curves, startIndex, endIndex) {
  return curves.slice(startIndex, endIndex).reduce(function(accumulator, curve) {
    return accumulator + curve.length();
  }, 0);
}

// TODO: Make lcoal?
function distanceAlongCurves(curves, leftIndex, rightIndex, leftParameter, rightParameter) {
  return curves[leftIndex].length() * (1 - leftParameter) + lengthOfCurves(curves, leftIndex + 1, rightIndex) + curves[rightIndex].length() * rightParameter;
}

// TODO: Make lcoal?
function isInternal(intersection) {
  return intersection.type() === Intersections.TYPE_INTERNAL;
}
