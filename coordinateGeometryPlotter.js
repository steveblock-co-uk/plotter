// TODO: Fix markers.

function CurvePlotter(plot) {
  this.plot_ = plot;
}

CurvePlotter.prototype.plot = function(curve, options) {
  assert(curve instanceof Curve);
  curve.visit(new CurvePlotter.Visitor_(this.plot_, options));
};

CurvePlotter.Visitor_ = function(plot, options) {
  this.plot_ = plot;
  this.options_ = options;
};

CurvePlotter.Visitor_.prototype = Object.create(CurveVisitor.prototype);

CurvePlotter.Visitor_.prototype.plotCurve_ = function(curve, parameterStep, markers) {
  var options = this.options_ === undefined ? {} : this.options_;
  options.markers = markers;
  var x = [];
  var y = [];
  for (var i = 0; i <= 1; i += parameterStep) {
    x.push(curve.getPointAtParameter(i).getX());
    y.push(curve.getPointAtParameter(i).getY());
  }
  this.plot_.plot(x, y, options);
};

CurvePlotter.Visitor_.prototype.onVisitStraightLine = function(straightLine) {
  assert(straightLine instanceof StraightLine);
  var endMarkers = this.getEndMarkers();
  this.plotCurve_(straightLine, 1, endMarkers);
};

CurvePlotter.Visitor_.prototype.onVisitArc = function(arc) {
  assert(arc instanceof Arc);
  var endMarkers = this.getEndMarkers();
  var numSegments = 100;
  var markers = Array(numSegments + 1).fill('');
  markers[0] = endMarkers[0];
  markers[numSegments] = endMarkers[1];
  this.plotCurve_(arc, 1 / numSegments, markers);
};

CurvePlotter.Visitor_.prototype.getEndMarkers = function() {
  if (this.options_ !== undefined && this.options_.markers !== undefined) {
    if (this.options_.markers instanceof Array && this.options_.markers.length > 0) {
      return this.options_.markers.length > 1 ? this.options_.markers : Array(2).fill(this.options_.markers[0]);
    } else if (typeof this.options_.markers === 'string') {
      return Array(2).fill(this.options_.markers);
    }
  }
  return ['.', '.'];
};

CurvePlotter.Visitor_.prototype.onVisitPolyCurve = function(polyCurve) {
  assert(polyCurve instanceof PolyCurve);
  var endMarkers = this.getEndMarkers();
  var curves = polyCurve.getCurves();
  if (this.options_ === undefined) {
    this.options_ = {};
  }
  this.options_.markers = [endMarkers[0], ''];
  curves[0].visit(this);
  this.options_.markers = ['', endMarkers[1]];
  curves[curves.length - 1].visit(this);
  this.options_.markers = '';
  for (var i = 1; i < curves.length - 1; ++i) {
    curves[i].visit(this);
  }
};
