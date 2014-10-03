// TODO
// Force axis tick at zero
// Draw axis zero in solid line

function arrayMin(x) {
  var result = x[0];
  for (var i = 1; i < x.length; i++) {
    result = Math.min(result, x[i]);
  }
  return result;
}
function arrayMax(x) {
  var result = x[0];
  for (var i = 1; i < x.length; i++) {
    result = Math.max(result, x[i]);
  }
  return result;
}
function getMultiple(x) {
  if (x < 1 || x > 10) {
    throw new Error('Out of range: ' + x);
  }
  // Purely empirical
  if (x > 6) {
    return 2;
  }
  if (x > 4) {
    return 1;
  }
  if (x > 2) {
    return 0.5;
  }
  return 0.2;
}
function roundToMultiple(x, multiple, roundUp) {
  var isPositive = x > 0;
  fraction = Math.abs(x) / multiple;
  var rounded;
  if (roundUp === isPositive) {
    rounded = Math.ceil(fraction);
  } else {
    rounded = Math.floor(fraction);
  }
  var result = (isPositive ? 1 : -1) * multiple * rounded;
  return result;
}
function roundTowardsZero(x, multiple) {
  var sign = x < 0 ? -1 : 1;
  return sign * multiple * Math.ceil(Math.abs(x) / multiple);
}
function calculateAxisRange(dataRange, forceZero) {
  var localDataRange = new Range(dataRange.min(), dataRange.max());
  if (forceZero) {
    localDataRange.expand(0);
  }
  var order = calculateOrder(localDataRange.range());
  var value = localDataRange.range() / order;
  var baseMultiple = getMultiple(value);
  var multiple = baseMultiple * order
  return new Range(roundToMultiple(localDataRange.min(), multiple, false),
                   roundToMultiple(localDataRange.max(), multiple, true));
}
function calculateDecimalPlaces(x) {
  return Math.max(0, -calculatePowerOfTen(x));
}
function calculatePowerOfTen(x) {
  return Math.floor(Math.log(x) / Math.LN10);
}
function calculateOrder(x) {
  return Math.pow(10, calculatePowerOfTen(x));
}
function calculateAxisTick(axisRange) {
  var order = calculateOrder(axisRange);
  var value = axisRange / order;
  var interval;
  if (value > 5) {
    interval = 1;
  } else if (value > 2) {
    interval = 0.5;
  } else if (value > 1) {
    interval = 0.2;
  } else {
    interval = 0.1;
  }
  return interval * order;
}
// Exclusive wrt end points of input line, but inclusive wrt end points of
// horizontal/vertical line.
function intersectHorizontalLine(x1, y1, x2, y2, value, start, end) {
  if (y1 === y2) {
    return null;
  }
  if ((value - y1) * (value - y2) >= 0) {
    return null;
  }
  var xIntercept = x1 + (value - y1) * (x2 - x1) / (y2 - y1);
  if (xIntercept >= start && xIntercept <= end) {
    return {x: xIntercept, y: value};
  }
  return null;
}
function intersectVerticalLine(x1, y1, x2, y2, value, start, end) {
  if (x1 === x2) {
    return null;
  }
  if ((value - x1) * (value - x2) >= 0) {
    return null;
  }
  var yIntercept = y1 + (value - x1) * (y2 - y1) / (x2 - x1);
  if (yIntercept >= start && yIntercept <= end) {
    return {x: value, y: yIntercept};
  }
  return null;
}

// TODO: Could merge this with Rect?
function Range(min, max) {
  if (min === undefined) {
    this.min_ = Infinity;
  } else {
    this.min_ = min;
  }
  if (max === undefined) {
    this.max_ = - Infinity;
  } else {
    this.max_ = max;
  }
}
Range.prototype.min = function() {
  return this.min_;
};
Range.prototype.max = function() {
  return this.max_;
};
Range.prototype.range = function() {
  return this.max_ - this.min_;
};
Range.prototype.expand = function(x) {
  this.min_ = Math.min(this.min_, x);
  this.max_ = Math.max(this.max_, x);
};
// Gets the fraction through the range that value x is.
Range.prototype.fraction = function(x) {
  return (x - this.min_) / this.range();
};
Range.prototype.toString = function() {
  return '{min: ' + this.min_ + '; max: ' + this.max_ + '}';
};

/////////////////////////////////////////////////////////////////////////
// TODO: x and y are decoupled, so could split up and merge with Range?
function Rect(x, y, width, height) {
  this.x_ = x;
  this.y_ = y;
  this.width_ = width;
  this.height_ = height;
}
Rect.prototype.x = function() {
  return this.x_;
};
Rect.prototype.y = function() {
  return this.y_;
};
Rect.prototype.width = function() {
  return this.width_;
};
Rect.prototype.height = function() {
  return this.height_;
};
Rect.prototype.xMax = function() {
  return this.xInterpolate(1);
};
Rect.prototype.yMax = function() {
  return this.yInterpolate(1);
};
Rect.prototype.xInterpolate = function(x) {
  return this.x_ + this.width_ * x;
};
Rect.prototype.yInterpolate = function(y) {
  return this.y_ + this.height_ * y;
};
Rect.prototype.contains = function(x, y) {
  return x >= this.x_ && x <= this.xMax() && y >= this.y_ && y <= this.yMax();
};
Rect.prototype.clipLine = function(x1, y1, x2, y2) {
  var points = [];
  if (this.contains(x1, y1)) {
    points.push({x: x1, y: y1});
  }
  if (this.contains(x2, y2)) {
    points.push({x: x2, y: y2});
  }
  if (points.length === 2) {
    return points;
  }
  var intersections = [
    // We must do two non-adjacent edges first, so that we don't double-count
    // the same corner.
    intersectHorizontalLine(x1, y1, x2, y2, this.y_, this.x_, this.xMax()),
    intersectHorizontalLine(x1, y1, x2, y2, this.yMax(), this.x_, this.xMax()),
    intersectVerticalLine(x1, y1, x2, y2, this.x_, this.y_, this.yMax()),
    intersectVerticalLine(x1, y1, x2, y2, this.xMax(), this.y_, this.yMax())
  ];
  intersections.forEach(function(intersection) {
    if (points.length < 2 && intersection != null) {
      points.push(intersection);
    }
  });
  if (points.length === 0) {
    return null;
  }
  console.assert(points.length === 2, 'points.length = ' + points.length);
  return points;
};
Rect.prototype.toString = function() {
  return '{x: ' + this.x_ + '; y: ' + this.y_ + '; width: ' + this.width_ + '; height: ' + this.height_ + '}';
};

/////////////////////////////////////////////////////////////////////////
function Axes() {
  this.gridOn_ = false;
}
Axes.prototype.setXValues = function(range, tick) {
  this.xRange_ = range;
  this.xTick_ = tick;
};
Axes.prototype.setYValues = function(range, tick) {
  this.yRange_ = range;
  this.yTick_ = tick;
};
Axes.prototype.xRange = function() {
  return this.xRange_;
};
Axes.prototype.yRange = function() {
  return this.yRange_;
};
Axes.prototype.xTick = function() {
  return this.xTick_;
};
Axes.prototype.yTick = function() {
  return this.yTick_;
};
Axes.prototype.setGridOn = function(gridOn) {
  this.gridOn_ = gridOn;
};
// TODO: Allow force of equal scales?
Axes.prototype.draw = function(context, rect) {
  context.strokeStyle = 'black';
  context.strokeRect(rect.x(), rect.y(), rect.width(), rect.height());
  var tickLength = 5;

  var xDecimalPlaces = calculateDecimalPlaces(this.xTick_);
  var xTickFirst = roundToMultiple(this.xRange_.min(), this.xTick_, true);
  for (var x = xTickFirst; x <= this.xRange_.max(); x += this.xTick_) {
    context.beginPath();
    var xCoord = rect.xInterpolate(this.xRange_.fraction(x));
    context.moveTo(xCoord, rect.yMax() + tickLength); 
    context.lineTo(xCoord, rect.yMax());
    context.fillText(x.toFixed(xDecimalPlaces), xCoord, rect.yMax() + 3 * tickLength);
    context.stroke();
    if (this.gridOn_) {
      context.setLineDash([1, 1]);
      context.moveTo(xCoord, rect.yMax());
      context.lineTo(xCoord, rect.y());
      context.stroke();
      context.setLineDash([]);
    }
  }
  var yDecimalPlaces = calculateDecimalPlaces(this.yTick_);
  var yTickFirst = roundToMultiple(this.yRange_.min(), this.yTick_, true);
  for (var y = yTickFirst; y <= this.yRange_.max(); y += this.yTick_) {
    context.beginPath();
    var yCoord = rect.yInterpolate(1 - this.yRange_.fraction(y));
    context.moveTo(rect.x() - tickLength, yCoord); 
    context.lineTo(rect.x(), yCoord);
    context.fillText(y.toFixed(yDecimalPlaces), rect.x() - 5 * tickLength, yCoord);
    context.stroke();
    if (this.gridOn_) {
      context.setLineDash([1, 1]);
      context.moveTo(rect.x(), yCoord);
      context.lineTo(rect.xMax(), yCoord);
      context.stroke();
      context.setLineDash([]);
    }
  }
};

/////////////////////////////////////////////////////////////////////////
function Plot(width, height) {
  this.width_ = width;
  this.height_ = height;
  this.forceXAxisZero_ = false;
  this.forceYAxisZero_ = false;
  this.xAxisRangeForced_ = false;
  this.yAxisRangeForced_ = false;
  this.holdOn_ = false;
  this.gridOn_ = false;
  this.axes_ = new Axes();
  this.clearData_();
  this.createCanvas_();
  var plotSize = 0.8;
  this.plotRect_ = new Rect(width * (1 - plotSize) / 2, height * (1 - plotSize) / 2, width * plotSize, height * plotSize);
}
Plot.prototype.canvas = function() {
  return this.canvas_;
};
Plot.prototype.setHoldOn = function(holdOn) {
  this.holdOn_ = holdOn;
};
Plot.prototype.setGridOn = function(gridOn) {
  this.gridOn_ = gridOn;
  if (this.axes_) {
    this.axes_.setGridOn(this.gridOn_);
  }
  this.redraw_();
};
Plot.prototype.clearData_ = function() {
  this.dataSeries_ = [];
  this.xRange_ = new Range();
  this.yRange_ = new Range();
};
Plot.prototype.createCanvas_ = function() {
  this.canvas_ = document.createElement('canvas');
  this.canvas_.width = this.width_;
  this.canvas_.height = this.height_;
  this.context_ = this.canvas_.getContext('2d');
};
Plot.applyStyleDefaults = function(style) {
  if (typeof style !== 'object') {
    style = {};
  }
  if (style.lineColor === undefined) {
    style.lineColor = 'black';
  }
  if (style.markers === undefined) {
    style.markers = [''];
  }
  if (!Array.isArray(style.markers)) {
    style.markers = [style.markers];
  }
  if (style.markerColors === undefined) {
    style.markerColors = [style.lineColor];
  }
  if (!Array.isArray(style.markerColors)) {
    style.markerColors = [style.markerColors];
  }
  if (style.lineStyle === undefined) {
    style.lineStyle = '-';
  }
  return style;
};
Plot.prototype.plot = function(x, y, style) {
  if (x.length !== y.length) {
    throw new Error('Can not plot data series of lengths ' + x.length + ' and ' + y.length);
  }
  style = Plot.applyStyleDefaults(style);

  if (!this.holdOn_) {
    this.clearData_();
  }
  this.updateData_(x, y, style.lineColor, style.markers, style.lineStyle, style.markerColors);
  if (!this.xAxisRangeForced_) {
    this.setXAxisRange_();
  }
  if (!this.yAxisRangeForced_) {
    this.setYAxisRange_();
  }
  this.redraw_();
};
function getLineDash(shorthand) {
  switch(shorthand) {
    case '--':
      return [6, 6];
    case ':':
      return [2, 2];
    case '-.':
      return [6, 2, 2, 2];
  }
  return [];
}
Plot.prototype.redraw_ = function() {
  if (this.dataSeries_.length === 0) {
    return;
  }
  this.context_.clearRect(0, 0, this.width_, this.height_);
  this.axes_.draw(this.context_, this.plotRect_);
  for (var i = 0; i < this.dataSeries_.length; i++ ) {
    var data = this.dataSeries_[i];
    this.context_.strokeStyle = data.lineColor;
    // Line
    if (data.lineStyle !== '') {
      this.context_.setLineDash(getLineDash(data.lineStyle));
      for (var j = 1; j < data.x.length; j++ ) {
        this.drawLine_(this.xCoord_(data.x[j - 1]), this.yCoord_(data.y[j - 1]),
                       this.xCoord_(data.x[j]), this.yCoord_(data.y[j]));
      }
      this.context_.setLineDash([]);
    }
    var radius = 3;
    for (var j = 0; j < data.x.length; j++ ) {
      var xCoord = this.xCoord_(data.x[j]);
      var yCoord = this.yCoord_(data.y[j]);
      if (!this.plotRect_.contains(xCoord, yCoord)) {
        continue;
      }
      var marker = data.markers[j % data.markers.length];
      var markerColor = data.markerColors[j % data.markerColors.length];
      this.context_.strokeStyle = markerColor;
      this.context_.beginPath();
      if (marker === '.') {
        this.context_.arc(xCoord, yCoord, 1, 0, 2 * Math.PI);
        // TODO: Fill?
        this.context_.stroke();
      } else if (marker === 'o') {
        this.context_.arc(xCoord, yCoord, radius, 0, 2 * Math.PI);
        this.context_.stroke();
      } else if (marker === 's') {
        this.context_.strokeRect(xCoord - radius, yCoord - radius, 2 * radius, 2 * radius);
      } else if (marker === '+') {
        this.context_.moveTo(xCoord - radius, yCoord);
        this.context_.lineTo(xCoord + radius, yCoord);
        this.context_.moveTo(xCoord, yCoord - radius);
        this.context_.lineTo(xCoord, yCoord + radius);
        this.context_.stroke();
      } else if (marker === 'x') {
        var radiusByRootTwo = radius / Math.sqrt(2);
        this.context_.moveTo(xCoord - radiusByRootTwo, yCoord - radiusByRootTwo);
        this.context_.lineTo(xCoord + radiusByRootTwo, yCoord + radiusByRootTwo);
        this.context_.moveTo(xCoord - radiusByRootTwo, yCoord + radiusByRootTwo);
        this.context_.lineTo(xCoord + radiusByRootTwo, yCoord - radiusByRootTwo);
        this.context_.stroke();
      }
    }
  }
};
Plot.prototype.updateData_ = function(x, y, lineColor, markers, lineStyle, markerColors) {
  this.dataSeries_.push({x: x, y: y, lineColor: lineColor, markers: markers, lineStyle: lineStyle, markerColors: markerColors});
  this.xRange_.expand(arrayMin(x));
  this.xRange_.expand(arrayMax(x));
  this.yRange_.expand(arrayMin(y));
  this.yRange_.expand(arrayMax(y));
};
Plot.prototype.setXAxisRange_ = function(range) {
  // This will be called again when some data is added in plot().
  if (this.dataSeries_.length === 0) {
    return;
  }
  var effectiveRange = range ? range : calculateAxisRange(this.xRange_, this.forceXAxisZero_);
  var tick = calculateAxisTick(effectiveRange.range());
  this.axes_.setXValues(effectiveRange, tick);
  this.axes_.setGridOn(this.gridOn_);
};
Plot.prototype.setYAxisRange_ = function(range) {
  // This will be called again when some data is added in plot().
  if (this.dataSeries_.length === 0) {
    return;
  }
  var effectiveRange = range ? range : calculateAxisRange(this.yRange_, this.forceYAxisZero_);
  var tick = calculateAxisTick(effectiveRange.range());
  this.axes_.setYValues(effectiveRange, tick);
  this.axes_.setGridOn(this.gridOn_);
};
// Clips to plot rect.
Plot.prototype.drawLine_ = function(x1Coord, y1Coord, x2Coord, y2Coord) {
  var points = this.plotRect_.clipLine(x1Coord, y1Coord, x2Coord, y2Coord);
  if (points === null) {
    return;
  }
  console.assert(points.length === 2, 'points.length = ' + points.length);

  // TODO: Consider using a single stroke for line segments that don't go
  // outside the plot area.
  this.context_.beginPath();
  this.context_.moveTo(points[0].x, points[0].y);
  this.context_.lineTo(points[1].x, points[1].y);
  this.context_.stroke();
};
// TODO: Better to introduce Point type and do x and y together?
Plot.prototype.xCoord_ = function(x) {
  return this.plotRect_.xInterpolate(this.axes_.xRange().fraction(x));
};
Plot.prototype.yCoord_ = function(y) {
  return this.plotRect_.yInterpolate(1 - this.axes_.yRange().fraction(y));
};
// When in auto-axis mode, forces the axis range to include zero. Use 1
// arg to control both axes, 2 args to control x and y separately.
// TODO: Should this override setAxisRanges? Currently it does not.
Plot.prototype.forceAxisZero = function(arg1, arg2) {
  this.forceXAxisZero_ = arg1;
  if (arg2 === undefined) {
    this.forceYAxisZero_ = arg1;
  } else {
    this.forceYAxisZero_ = arg2;
  }
  // If the axes are forced, don't update or redraw them, but leave the
  // flags above set for when forcing is disabled.
  if (!this.xAxisRangeForced_) {
    this.setXAxisRange_();
    this.redraw_();
  }
  if (!this.yAxisRangeForced_) {
    this.setYAxisRange_();
    this.redraw_();
  }
};
Plot.prototype.getAxisRanges = function() {
  return [this.axes_.xRange(), this.axes_.yRange()];
};
// Forces the axis ranges. These are retained for future plot commands.
// Uses auto mode if either or both axis ranges are absent.
Plot.prototype.setAxisRanges = function(xAxisRange, yAxisRange) {
  this.xAxisRangeForced_ = !!xAxisRange;
  this.setXAxisRange_(this.xAxisRangeForced_ ? xAxisRange : null);

  this.yAxisRangeForced_ = !!yAxisRange;
  this.setYAxisRange_(this.yAxisRangeForced_ ? yAxisRange : null);

  this.redraw_();
};
