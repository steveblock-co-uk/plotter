// TODO
// Axis tick rounding errors
// Axis label rounding

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
  if (forceZero) {
    dataRange.expand(0);
  }
  var order = calculateOrder(dataRange.range());
  var value = dataRange.range() / order;
  var baseMultiple = getMultiple(value);
  var multiple = baseMultiple * order
  return new Range(roundToMultiple(dataRange.min(), multiple, false),
                   roundToMultiple(dataRange.max(), multiple, true));
}
function calculateOrder(x) {
  return Math.pow(10, Math.floor(Math.log(x) / Math.LN10));
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
Rect.prototype.toString = function() {
  return '{x: ' + this.x_ + '; y: ' + this.y_ + '; width: ' + this.width_ + '; height: ' + this.height_ + '}';
};

/////////////////////////////////////////////////////////////////////////
function Axes(xRange, xTick, yRange, yTick) {
  this.xRange_ = xRange;
  this.yRange_ = yRange;
  this.xTick_ = xTick;
  this.yTick_ = yTick;
  this.gridOn_ = false;
}
Axes.prototype.xRange = function() {
  return this.xRange_;
};
Axes.prototype.yRange = function() {
  return this.yRange_;
};
Axes.prototype.setGridOn = function(gridOn) {
  this.gridOn_ = gridOn;
};
// TODO: Allow force of equal scales?
Axes.prototype.draw = function(context, rect) {
  console.log('Axes.draw()');
  context.strokeStyle = 'black';
  context.strokeRect(rect.x(), rect.y(), rect.width(), rect.height());
  var tickLength = 5;

  var xTickFirst = roundToMultiple(this.xRange_.min(), this.xTick_, true);
  for (var x = xTickFirst; x <= this.xRange_.max(); x += this.xTick_) {
    context.beginPath();
    var xCoord = rect.xInterpolate(this.xRange_.fraction(x));
    context.moveTo(xCoord, rect.yMax() + tickLength); 
    context.lineTo(xCoord, rect.yMax());
    context.fillText(x, xCoord, rect.yMax() + 3 * tickLength);
    context.stroke();
    if (this.gridOn_) {
      context.setLineDash([1, 1]);
      context.moveTo(xCoord, rect.yMax());
      context.lineTo(xCoord, rect.y());
      context.stroke();
      context.setLineDash([]);
    }
  }
  var yTickFirst = roundToMultiple(this.yRange_.min(), this.yTick_, true);
  for (var y = yTickFirst; y <= this.yRange_.max(); y += this.yTick_) {
    context.beginPath();
    var yCoord = rect.yInterpolate(1 - this.yRange_.fraction(y));
    context.moveTo(rect.x() - tickLength, yCoord); 
    context.lineTo(rect.x(), yCoord);
    context.fillText(y, rect.x() - 5 * tickLength, yCoord);
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
  this.axisRangesForced = false;
  this.holdOn_ = false;
  this.gridOn_ = false;
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
Plot.prototype.plot = function(x, y, color, marker, drawLine) {
  console.log('Plot.plot()');
  if (x.length !== y.length) {
    throw new Error('Can not plot data series of lengths ' + x.length + ' and ' + y.length);
  }
  if (drawLine === undefined) {
    drawLine = true;
  }
  if (!this.holdOn_) {
    this.clearData_();
  }
  this.updateData_(x, y, color, marker, drawLine);
  if (!this.axisRangesForced_) {
    this.calculateDefaultAxisRanges_();
  }
  this.redraw_();
};
Plot.prototype.redraw_ = function() {
  console.log('Plot.redraw_()');
  if (this.dataSeries_.length === 0) {
    return;
  }
  this.context_.clearRect(0, 0, this.width_, this.height_);
  this.axes_.draw(this.context_, this.plotRect_);
  for (var i = 0; i < this.dataSeries_.length; i++ ) {
    var data = this.dataSeries_[i];
    this.context_.strokeStyle = data.color === undefined ? 'black' : data.color;
    // Line
    if (data.drawLine) {
      this.context_.beginPath();
      this.context_.moveTo(this.xCoord_(data.x[0]), this.yCoord_(data.y[0]));
      for (var j = 0; j < data.x.length; j++ ) {
        this.context_.lineTo(this.xCoord_(data.x[j]), this.yCoord_(data.y[j]));
      }
      this.context_.stroke();
    }
    // Markers - need separate loop as they count as part of the stroke.
    if (data.marker !== undefined) {
      var radius = 3;
      for (var j = 0; j < data.x.length; j++ ) {
        this.context_.beginPath();
        if (data.marker === '.') {
          this.context_.arc(this.xCoord_(data.x[j]), this.yCoord_(data.y[j]), 1, 0, 2 * Math.PI);
          // TODO: Fill?
          this.context_.stroke();
        } else if (data.marker === 'o') {
          this.context_.arc(this.xCoord_(data.x[j]), this.yCoord_(data.y[j]), radius, 0, 2 * Math.PI);
          this.context_.stroke();
        } else if (data.marker === 's') {
          this.context_.strokeRect(this.xCoord_(data.x[j]) - radius, this.yCoord_(data.y[j]) - radius, 2 * radius, 2 * radius);
        }
      }
    }
  }
};
Plot.prototype.updateData_ = function(x, y, color, marker, drawLine) {
  console.log('Plot.updateData_()');
  this.dataSeries_.push({x: x, y: y, color: color, marker: marker, drawLine: drawLine});
  this.xRange_.expand(arrayMin(x));
  this.xRange_.expand(arrayMax(x));
  this.yRange_.expand(arrayMin(y));
  this.yRange_.expand(arrayMax(y));
  console.log('xRange: ' + this.xRange_);
  console.log('yRange: ' + this.yRange_);
};
Plot.prototype.calculateDefaultAxisRanges_ = function() {
  console.log('Plot.calculateDefaultAxisRanges_()');
  // This will be called again when some data is added in plot().
  if (this.dataSeries_.length === 0) {
    return;
  }
  var xAxisRange = calculateAxisRange(this.xRange_, this.forceXAxisZero_);
  var yAxisRange = calculateAxisRange(this.yRange_, this.forceYAxisZero_);
  console.log('xAxisRange: ' + xAxisRange);
  console.log('yAxisRange: ' + yAxisRange);
  var xAxisTick = calculateAxisTick(xAxisRange.range());
  var yAxisTick = calculateAxisTick(yAxisRange.range());
  console.log('xAxisTick: ' + xAxisTick);
  console.log('yAxisTick: ' + yAxisTick);
  this.axes_ = new Axes(xAxisRange, xAxisTick, yAxisRange, yAxisTick);
  this.axes_.setGridOn(this.gridOn_);
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
  if (!this.axisRangesForced_) {
    this.calculateDefaultAxisRanges_();
    this.redraw_();
  }
};
Plot.prototype.getAxisRanges = function() {
  return [this.axes_.xRange(), this.axes_.yRange()];
};
// Forces the axis ranges. These are retained for future plot commands.
// Call with no params to reset to auto mode.
Plot.prototype.setAxisRanges = function(xAxisRange, yAxisRange) {
  if (xAxisRange === undefined && yAxisRange === undefined) {
    this.axisRangesForced_ = false;
    this.calculateDefaultAxisRanges_();
  } else {
    this.axisRangesForced_ = true;
    var xAxisTick = calculateAxisTick(xAxisRange.range());
    var yAxisTick = calculateAxisTick(yAxisRange.range());
    this.axes_ = new Axes(xAxisRange, xAxisTick, yAxisRange, yAxisTick);
    this.axes_.setGridOn(this.gridOn_);
  }
  this.redraw_();
};
