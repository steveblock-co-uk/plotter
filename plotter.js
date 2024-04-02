// TODO
// Ignore non-numerics in data
// Force axis tick at zero
// Draw axis zero in solid line

function NumberAxisRepresentation() {

}

/*
Have a getLevel(min, max) function?
Doesn't work. eg (19, 35) -> 100, but reasonable bounds would be [10, 40]
Caller can't work this out
This class will have to have knowledge of how to build axis range.
Cannot just return the numeric value, because caller can;t know how to format
(eg precision to use, which TZ to use around DST transition)
 */
// Returns a list of tuples. Each tuple is the numeric value and formatted string
DecimalNumberAxisRepresentation.prototype.getAxisValues = function(
    dataRange,
    axisRange = undefined,
    forceZero = false,
    suggestedTickCount = 10) {
  if (axisRange === undefined) {
    if (forceZero) {
      dataRange = dataRange.expand(0);
    }
    var multiple = getRangeMultiple(dataRange.range());
    axisRange = new Range(roundToMultiple(dataRange.min(), multiple, false),
        roundToMultiple(dataRange.max(), multiple, true));
  }
  var tick = calculateAxisTick(axisRange.range());
  // We do the loop over integers to avoid cumulative errors. But there's still a risk of ticks not 'lining up' with the
  // range due to rounding errors. We should use BigDecimal.
  result = [];
  for (i = Math.floor(axisRange.min() / tick); i <= Math.ceil(axisRange.max() / tick); ++i) {
    result.append([i * step, i * step]);
  }
  return result;
}

// We only need values to distinguish components that don't use base 10
enum Component {
  SECOND,
  MINUTE,
  HOUR,
  DAY,
  MONTH,
  YEAR
};

// Assumes that the underlying numeric value is epoch millis.
function DateTimeNumberAxisRepresentation(tz) {
  this.tz_ = tz;
}

DateTimeNumberAxisRepresentation.prototype.getLargestDifferingComponent = function(dataRange) {
  var minDate = new Date(dataRange.min(), tz = this.tz_);
  var maxDate = new Date(dataRange.min(), tz = this.tz_);
  if (minData.getFullYear() != maxDate.getFullYear()) {
    return Component.YEAR;
  } else if (minData.getMonth() != maxDate.getMonth()) {
    return Component.MONTH;
  } else if (minData.getDay() != maxDate.getDay()) {
    return Component.DAY;
  } else if (minData.getHour() != maxDate.getHour()) {
    return Component.HOUR;
  } else if (minData.getMinute() != maxDate.getMinute()) {
    return Component.MINUTE;
  } else {
    return Component.SECOND;
  }
}

// Gets the number of values of the specified component in the instance at the specified date.
// eg getCount(2024-02-05 12:34:56, Day) -> 29
function getCount(date: Date, component, Component) {
  if (component >= Component.SECOND) {
    date.setSecond(0);
  }
  if (component >= Component.MINUTE) {
    date.setMinute(0);
  }
  if (component >= Component.HOUR) {
    date.setHour(0);
  }
  if (component >= Component.DAY) {
    date.setDay(1);
  }
  if (component >= Component.MONTH) {
    date.setMonth(0); // TOOD: 1 based?
  }
  if (component >= Component.YEAR) {
    date.setFullYear(0);
  }

}

// For decimals we calculate the range based on their being a 'nice' multiplier for each limit eg 1, 2, 5. And we
// calculate the tick multiplier based on the range. Ticks are placed every tick multiplier, irrespective of the range.
// This always result in hitting the next x10 multiplier.

// I'm not sure this always applies to dates. For days, there is no nice multiplier. So we should
// probably just use the nearest 1 day for day limits. But what about tick marks? Whatever tick multiplier we use it won't
// always align with month boundaries. Does this matter? Maybe any time the tick marks are spaced less than month we
// shouldn't care? But what about 2024-01-10 to 2024-04-10? Month ticks would only have 3, which is not enough.
// Half-months would have 5 which is about right, but where to place them? If we just base on 91 days we would choose
// 10 day ticks, but where to start? day 1 of year? Would probaly not move to monhs until we got to 5 months range.

DateTimeNumberAxisRepresentation.prototype.getAxisRangeSeconds = function(dataRangeSeconds) {
  // Just use DecimalNumberAxisRepresentation. We rely on the fact that if we pass in a range within [0, 60] the result
  // will remain in this range.
}

// this can't be a range of minutes. will need to pass the complete date object. becase for other components, eg year,
// we need to know the instant to know how to round at lower components (eg months).
DateTimeNumberAxisRepresentation.prototype.getAxisRangeMinutes = function(dataRangeMinutes) {
  // We do not DecimalNumberAxisRepresentation because we wish to favor multiples of 5.
}

// We assme that we always use the same multiple in each instance of a component. eg if a range spans two months, we
// use the same multiple of numbers of days in each case. No. not true. We do not wish to go 2024-02-27 to 2024-03-02,.
DateTimeNumberAxisRepresentation.prototype.getRangeMultiple = function(


DateTimeNumberAxisRepresentation.prototype.getAxisValues = function(
    dataRange,
    axisRange = undefined,
    forceZero = false,
    suggestedTickCount = 10) {
  if (axisRange === undefined) {
    if (forceZero) {
      dataRange = dataRange.expand(0);
    }
    var largestDifferingComponent = this.getLargestDifferingComponent(dataRange);
    var multiple = getRangeMultiple(dataRange.range());
    axisRange = new Range(roundToMultiple(dataRange.min(), multiple, false),
        roundToMultiple(dataRange.max(), multiple, true));
  }
  var tick = calculateAxisTick(axisRange.range());
  // We do the loop over integers to avoid cumulative errors. But there's still a risk of ticks not 'lining up' with the
  // range due to rounding errors. We should use BigDecimal.
  result = [];
  for (i = Math.floor(axisRange.min() / tick); i <= Math.ceil(axisRange.max() / tick); ++i) {
    result.append([i * step, i * step]);
  }
  return result;
}

function getRangeMultiple(a) {
  var order = calculateOrder(a);
  x = a / order;
  // Purely empirical
  if (x > 6) {
    return 2 * order;
  }
  if (x > 4) {
    return order;
  }
  if (x > 2) {
    return 0.5 * order;
  }
  return 0.2 * order;
}

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
  if (x < 1 || x >= 10) {
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
  var localDataRange = dataRange;
  if (forceZero) {
    localDataRange = localDataRange.expand(0);
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
// Inclusive wrt end points of input line and of horizontal/vertical line.
function intersectHorizontalLine(x1, y1, x2, y2, value, start, end) {
  if (y1 === y2) {
    return null;
  }
  if ((value - y1) * (value - y2) > 0) {
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
  if ((value - x1) * (value - x2) > 0) {
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
  return new Range(Math.min(this.min_, x), Math.max(this.max_, x));
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
  return x > this.x_ && x < this.xMax() && y > this.y_ && y < this.yMax();
};
Rect.prototype.containsOrOnEdge = function(x, y) {
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
  if (points.length === 1) {
    return [points[0], points[0]];
  }
  console.assert(points.length === 2, 'points.length = ' + points.length);
  return points;
};
Rect.prototype.toString = function() {
  return '{x: ' + this.x_ + '; y: ' + this.y_ + '; width: ' + this.width_ + '; height: ' + this.height_ + '}';
};

/////////////////////////////////////////////////////////////////////////
function Axes() {
  // TOOD: Factor out Axis class
  this.gridOn_ = false;
  this.xLabel_ = '';
  this.yLabel_ = '';
  this.rightYLabel_ = '';
  this.xRange_ = new Range();
  this.yRange_ = new Range();
  this.rightYRange_ = new Range();
}
Axes.prototype.setXValues = function(range, tick) {
  this.xRange_ = range;
  this.xTick_ = tick;
};
Axes.prototype.setYValues = function(range, tick) {
  this.yRange_ = range;
  this.yTick_ = tick;
};
Axes.prototype.setRightYValues = function(range, tick) {
  this.rightYRange_ = range;
  this.rightYTick_ = tick;
};
Axes.prototype.xRange = function() {
  return this.xRange_;
};
Axes.prototype.yRange = function() {
  return this.yRange_;
};
Axes.prototype.rightYRange = function() {
  return this.rightYRange_;
};
Axes.prototype.xTick = function() {
  return this.xTick_;
};
Axes.prototype.yTick = function() {
  return this.yTick_;
};
Axes.prototype.rightYTick = function() {
  return this.rightYTick_;
};
// TODO: Make grid specific to an axis
Axes.prototype.setGridOn = function(gridOn) {
  this.gridOn_ = gridOn;
};
// Only sets if label is not null or undefined
Axes.prototype.setLabels = function(xLabel, yLabel, rightYLabel) {
  // TODO Should check for undefined?
  if (xLabel != null)
    this.xLabel_ = xLabel;
  if (yLabel != null)
    this.yLabel_ = yLabel;
  if (rightYLabel != null)
    this.rightYLabel_ = rightYLabel;
};
Axes.prototype.labels = function() {
  return [this.xLabel_, this.yLabel_, this.rightYLabel];
};
// TODO: Allow force of equal scales?
Axes.prototype.draw = function(context, rect) {
  context.strokeStyle = 'black';
  context.strokeRect(rect.x(), rect.y(), rect.width(), rect.height());
  var tickLength = 5;
  var fontHeight = 8;

  context.textAlign = "center";
  var xDecimalPlaces = calculateDecimalPlaces(this.xTick_);
  var xTickFirst = roundToMultiple(this.xRange_.min(), this.xTick_, true);
  // Calculate the number of ticks like this to avoid cumulative rounding errors when adding xTick_.
  var xNumTicks = Math.floor((this.xRange_.max() - xTickFirst) / this.xTick_) + 1;
  for (var i = 0; i < xNumTicks; ++i) {
    var x = xTickFirst + i * this.xTick_;
    context.beginPath();
    var xCoord = rect.xInterpolate(this.xRange_.fraction(x));
    context.moveTo(xCoord, rect.yMax() + tickLength); 
    context.lineTo(xCoord, rect.yMax());
    context.fillText(x.toFixed(xDecimalPlaces), xCoord, rect.yMax() + 2 * tickLength + fontHeight);
    context.stroke();
    if (this.gridOn_) {
      context.setLineDash([1, 1]);
      context.moveTo(xCoord, rect.yMax());
      context.lineTo(xCoord, rect.y());
      context.stroke();
      context.setLineDash([]);
    }
  }
  if (this.xLabel_ !== '') {
    context.fillText(this.xLabel_, rect.x() + rect.width() / 2, rect.yMax() + 3 * tickLength + 2 * fontHeight);
  }

  context.textAlign = "end";
  var maxTextWidth = 0;
  var yDecimalPlaces = calculateDecimalPlaces(this.yTick_);
  var yTickFirst = roundToMultiple(this.yRange_.min(), this.yTick_, true);
  // Calculate the number of ticks like this to avoid cumulative rounding errors when adding yTick_.
  var yNumTicks = Math.floor((this.yRange_.max() - yTickFirst) / this.yTick_) + 1;
  for (var i = 0; i < yNumTicks; ++i) {
    var y = yTickFirst + i * this.yTick_;
    context.beginPath();
    var yCoord = rect.yInterpolate(1 - this.yRange_.fraction(y));
    context.moveTo(rect.x() - tickLength, yCoord); 
    context.lineTo(rect.x(), yCoord);
    var text = y.toFixed(yDecimalPlaces);
    maxTextWidth = Math.max(maxTextWidth, context.measureText(text).width);
    context.fillText(text, rect.x() - 2 * tickLength, yCoord + fontHeight / 2);
    context.stroke();
    if (this.gridOn_) {
      context.setLineDash([1, 1]);
      context.moveTo(rect.x(), yCoord);
      context.lineTo(rect.xMax(), yCoord);
      context.stroke();
      context.setLineDash([]);
    }
  }
  if (this.yLabel_ !== '') {
    // TODO: Orient this vertically.
    context.fillText(this.yLabel_, rect.x() - 5 * tickLength - maxTextWidth, rect.y() + rect.height() / 2 + fontHeight / 2);
  }

  context.textAlign = "start";
  var maxTextWidth = 0;
  var yDecimalPlaces = calculateDecimalPlaces(this.rightYTick_);
  var yTickFirst = roundToMultiple(this.rightYRange_.min(), this.rightYTick_, true);
  // Calculate the number of ticks like this to avoid cumulative rounding errors when adding yTick_.
  var yNumTicks = Math.floor((this.rightYRange_.max() - yTickFirst) / this.rightYTick_) + 1;
  for (var i = 0; i < yNumTicks; ++i) {
    var y = yTickFirst + i * this.rightYTick_;
    context.beginPath();
    var yCoord = rect.yInterpolate(1 - this.rightYRange_.fraction(y));
    context.moveTo(rect.x() + rect.width() + tickLength, yCoord); 
    context.lineTo(rect.x() + rect.width(), yCoord);
    var text = y.toFixed(yDecimalPlaces);
    maxTextWidth = Math.max(maxTextWidth, context.measureText(text).width);
    context.fillText(text, rect.x() + rect.width() + 2 * tickLength, yCoord + fontHeight / 2);
    context.stroke();
    if (this.gridOn_) {
      context.setLineDash([1, 1]);
      context.moveTo(rect.x(), yCoord);
      context.lineTo(rect.xMax(), yCoord);
      context.stroke();
      context.setLineDash([]);
    }
  }
  if (this.rightYLabel_ !== '') {
    // TODO: Orient this vertically.
    context.fillText(this.rightYLabel_, rect.x() - 5 * tickLength - maxTextWidth, rect.y() + rect.height() / 2 + fontHeight / 2);
  }
};

/////////////////////////////////////////////////////////////////////////
function Plot(width, height, legendWidth, legendHeight) {
  this.width_ = width;
  this.height_ = height;
  this.legendWidth_ = legendWidth;
  this.legendHeight_ = legendHeight;
  this.forceXAxisZero_ = false;
  this.forceYAxisZero_ = false;
  this.xAxisRangeForced_ = false;
  this.yAxisRangeForced_ = false;
  this.holdOn_ = false;
  this.axes_ = new Axes();
  this.clearData_();
  this.createCanvas_();
  this.createLegendCanvas_();
  var plotSize = 0.8;
  this.plotRect_ = new Rect(width * (1 - plotSize) / 2, height * (1 - plotSize) / 2, width * plotSize, height * plotSize);
}
Plot.prototype.legendCanvas = function() {
  return this.legendCanvas_;
};
Plot.prototype.canvas = function() {
  return this.canvas_;
};
Plot.prototype.setHoldOn = function(holdOn) {
  this.holdOn_ = holdOn;
};
Plot.prototype.setAxisLabels = function(xAxisLabel, yAxisLabel, rightYAxisLabel) {
  this.axes_.setLabels(xAxisLabel, yAxisLabel, rightYAxisLabel);
  this.redraw_();
};
Plot.prototype.setGridOn = function(gridOn) {
  this.axes_.setGridOn(gridOn);
  this.redraw_();
};
Plot.prototype.clearData_ = function() {
  this.dataSeries_ = [];
  this.xRange_ = new Range();
  this.yRange_ = new Range();
  this.rightYRange_ = new Range();
};
Plot.prototype.createCanvas_ = function() {
  this.canvas_ = document.createElement('canvas');
  this.canvas_.width = this.width_;
  this.canvas_.height = this.height_;
  this.context_ = this.canvas_.getContext('2d');
};
Plot.prototype.createLegendCanvas_ = function() {
  if (typeof this.legendHeight_ !== 'number' || typeof this.legendWidth_ !== 'number') {
    return;
  }
  this.legendCanvas_ = document.createElement('canvas');
  this.legendCanvas_.width = this.legendWidth_;
  this.legendCanvas_.height = this.legendHeight_;
  this.legendContext_ = this.legendCanvas_.getContext('2d');
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
Plot.prototype.plot = function(x, y, style, name, useRightYAxis) {
  if (x.length !== y.length) {
    throw new Error('Can not plot data series of lengths ' + x.length + ' and ' + y.length);
  }
  style = Plot.applyStyleDefaults(style);
  useRightYAxis = useRightYAxis === true ? true : false;
  if (!this.holdOn_) {
    this.clearData_();
  }
  this.updateData_(x, y, style.lineColor, style.markers, style.lineStyle, style.markerColors, name, useRightYAxis);
  if (!this.xAxisRangeForced_) {
    this.setXAxisRange_();
  }
  if (!this.yAxisRangeForced_) {
    this.setYAxisRange_();
  }
  // TODO: Add support for forcing right Y axis
  this.setRightYAxisRange_();
  this.redraw_();
  this.redrawLegend_();
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
    yCoordFunction = data.useRightYAxis ? Plot.prototype.rightYCoord_.bind(this) : Plot.prototype.yCoord_.bind(this);
    this.context_.strokeStyle = data.lineColor;
    // Line
    if (data.lineStyle !== '') {
      this.context_.setLineDash(getLineDash(data.lineStyle));
      for (var j = 1; j < data.x.length; j++ ) {
        this.drawLine_(this.xCoord_(data.x[j - 1]), yCoordFunction(data.y[j - 1]),
                       this.xCoord_(data.x[j]), yCoordFunction(data.y[j]));
      }
      this.context_.setLineDash([]);
    }
    var radius = 3;
    for (var j = 0; j < data.x.length; j++ ) {
      var xCoord = this.xCoord_(data.x[j]);
      var yCoord = yCoordFunction(data.y[j]);
      if (!this.plotRect_.containsOrOnEdge(xCoord, yCoord)) {
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
Plot.prototype.redrawLegend_ = function(x, y, lineColor, markers, lineStyle, markerColors) {
  if (this.legendCanvas_ === undefined) {
    return;
  }
  this.legendContext_.clearRect(0, 0, this.legendWidth_, this.legendHeight_);
  var fontHeight = 8;
  var filteredDataSeries = this.dataSeries_.filter(function(d) {
    return typeof d.name === 'string';
  });
  if (filteredDataSeries.length === 0) {
    return;
  }
  for (var i = 0; i < filteredDataSeries.length; i++ ) {
    var data = filteredDataSeries[i];
    this.legendContext_.strokeStyle = data.lineColor;
    this.legendContext_.setLineDash(getLineDash(data.lineStyle));
    this.legendContext_.beginPath();
    this.legendContext_.moveTo(10, fontHeight * 1.2 * (i + 0.5) + 10);
    this.legendContext_.lineTo(20, fontHeight * 1.2 * (i + 0.5) + 10);
    this.legendContext_.fillText(data.name, 30, fontHeight * 1.2 * (i + 1) + 10);
    this.legendContext_.stroke();
  }
  this.legendContext_.strokeStyle = 'black';
  this.legendContext_.setLineDash([]);
  this.legendContext_.strokeRect(0, 0, this.legendWidth_, fontHeight * 1.2 * filteredDataSeries.length + 20);
};
Plot.prototype.updateData_ = function(x, y, lineColor, markers, lineStyle, markerColors, name, useRightYAxis) {
  this.dataSeries_.push({x: x, y: y, lineColor: lineColor, markers: markers, lineStyle: lineStyle, markerColors: markerColors, name: name, useRightYAxis: useRightYAxis});
  this.xRange_ = this.xRange_.expand(arrayMin(x));
  this.xRange_ = this.xRange_.expand(arrayMax(x));
  if (useRightYAxis) {
    this.rightYRange_ = this.rightYRange_.expand(arrayMin(y));
    this.rightYRange_ = this.rightYRange_.expand(arrayMax(y));
  } else {
    this.yRange_ = this.yRange_.expand(arrayMin(y));
    this.yRange_ = this.yRange_.expand(arrayMax(y));
  }
};
Plot.prototype.setXAxisRange_ = function(range) {
  // This will be called again when some data is added in plot().
  if (this.dataSeries_.length === 0) {
    return;
  }
  var effectiveRange = range ? range : calculateAxisRange(this.xRange_, this.forceXAxisZero_);
  var tick = calculateAxisTick(effectiveRange.range());
  this.axes_.setXValues(effectiveRange, tick);
};
Plot.prototype.setYAxisRange_ = function(range) {
  // This will be called again when some data is added in plot().
  // TODO: IS it OK to early-out here if data is present for the other axis?
  if (this.dataSeries_.filter(function(ds) { return !ds.useRightYAxis; }).length === 0) {
    return;
  }
  var effectiveRange = range ? range : calculateAxisRange(this.yRange_, this.forceYAxisZero_);
  var tick = calculateAxisTick(effectiveRange.range());
  this.axes_.setYValues(effectiveRange, tick);
};
Plot.prototype.setRightYAxisRange_ = function(range) {
  // This will be called again when some data is added in plot().
  // TODO: IS it OK to early-out here if data is present for the other axis?
  if (this.dataSeries_.filter(function(ds) { return ds.useRightYAxis; }).length === 0) {
    return;
  }
  // TODO: Support forcing right Y axis zero
  var effectiveRange = range ? range : calculateAxisRange(this.rightYRange_, false);
  var tick = calculateAxisTick(effectiveRange.range());
  this.axes_.setRightYValues(effectiveRange, tick);
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
Plot.prototype.rightYCoord_ = function(y) {
  return this.plotRect_.yInterpolate(1 - this.axes_.rightYRange().fraction(y));
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
