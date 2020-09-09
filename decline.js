document.head = document.createElement('head');
document.body = document.createElement('body');
document.body.style.overflow = "auto";

var x = document.createElement('script');
x.src = 'https://plotter.steveblock.co.uk/plotter.js';
x.addEventListener('load', go);
document.head.appendChild(x);


function LatLng(lat, lng) {
  this.lat = lat;
  this.lng = lng;
}

function sum(a, b) {
  return a + b;
}

function bestFit(x, y) {
  console.assert(x.length == y.length);
  var xMean = x.reduce(sum, 0) / x.length;
  var yMean = y.reduce(sum, 0) / y.length;
  var xDelta = x.map(function(a) { return a - xMean; });
  var yDelta = y.map(function(a) { return a - yMean; });
  var cross = 0;
  for (var i = 0; i < x.length; ++i) {
    cross += xDelta[i] * yDelta[i];
  }
  var square = 0;
  for (var i = 0; i < x.length; ++i) {
    square += xDelta[i] * xDelta[i];
  }
  var m = cross / square;
  return {
    m: m,
    c: yMean - m * xMean,
  };
}

function pad(num, size) {
  var s = num + '';
  while (s.length < size) {
    s = '0' + s;
  }
  return s;
}

function print(x, multipliers, separator) {
  var result = '';
  for (var i = 0; i < multipliers.length - 1; ++i) {
    x = Math.floor(x / multipliers[i]);
    var value = x % (multipliers[i + 1]);
    var length = Math.ceil(Math.log10(multipliers[i + 1]));
    result = separator + pad(value, length) + result;
  }
  if (multipliers.length > 0) {
    var value = Math.floor(x / multipliers[multipliers.length - 1]);
    result = value + result;
  }
  return result;
}

function printSecondsAsMinutesSeconds(x) {
  return print(x, [1, 60], ':');
}

function tableRow(label, id) {
  var tr = document.createElement('tr');
  var td = document.createElement('td');
  tr.appendChild(td);
  td.textContent = label;
  var td = document.createElement('td');
  td.id = id;
  td.textContent = '...';
  tr.appendChild(td);
  return tr;
}

function formInput(description, id, onchange, defaultValue) {
  var label = document.createElement('label');
  label.for = id;
  label.textContent = description;
  var input = document.createElement('input');
  input.name = id;
  input.id = id;
  input.value = defaultValue;
  input.addEventListener('change', onchange);
  var div = document.createElement('div');
  div.appendChild(label);
  div.appendChild(input);
  return div;
}

function go() {
  var form = document.createElement('form');
  form.appendChild(formInput('Start latitude (deg)', 'startLatDegrees', refresh, 49.3712296));
  form.appendChild(formInput('Start longitude (deg)', 'startLngDegrees', refresh, -123.0984528));
  form.appendChild(formInput('Start radius (m)', 'startRadiusMetres', refresh, 100));
  form.appendChild(formInput('Min distance (km)', 'minDistanceKilometres', refresh, 1.5));
  form.appendChild(formInput('Max distance (km)', 'maxDistanceKilometres', refresh, 2.5));
  form.appendChild(formInput('Min duration (H:M:S)', 'minDurationHms', refresh, "0:35:00"));
  form.appendChild(formInput('Max duration (H:M:S)', 'maxDurationHms', refresh, "0:50:00"));
  document.body.appendChild(form);

  var table = document.createElement('table');
  table.appendChild(tableRow('Count', 'count'));
  table.appendChild(tableRow('Best (mm:ss)', 'best'));
  document.body.appendChild(table);

  plot = new Plot(1400, 700);
  plot.setGridOn(true);
  plot.setAxisLabels('Timestamp (ms)', 'Time (mins)');
  document.body.appendChild(plot.canvas());

  var r = new XMLHttpRequest();
  r.open('GET', 'https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?limit=1000&start=0');
  r.addEventListener('load', storeData);
  r.send();
}

var NAUTICAL_MILES_TO_METRES = 1809;

function metresToLatDegrees(m) {
  return m / NAUTICAL_MILES_TO_METRES / 60;
}

function metresToLngDegrees(m, latDegrees) {
  return metresToLatDegrees(m) / Math.sin(Math.PI / 180 * latDegrees);
}

function hmsToSeconds(hms) {
  var components = hms.split(':');
  return (new Number(components[0]) * 60 + new Number(components[1])) * 60 + new Number(components[2]);
}

function storeData() {
  activities = JSON.parse(this.responseText);
  // TODO: Paginate XHR
  console.assert(activities.length < 1000);

  refresh();
}

function refresh() {
  var startLatLngDegrees = new LatLng(
      new Number(document.getElementById('startLatDegrees').value),
      new Number(document.getElementById('startLngDegrees').value));
  var startRadiusMetres = new Number(document.getElementById('startRadiusMetres').value);
  var startLatLngRangeDegrees = new LatLng(
      Range.centredOn(startLatLngDegrees.lat, metresToLatDegrees(startRadiusMetres)),
      Range.centredOn(startLatLngDegrees.lng, metresToLngDegrees(startRadiusMetres, startLatLngDegrees.lat)));
  var distanceRangeMetres = new Range(
      new Number(document.getElementById('minDistanceKilometres').value) * 1_000,
      new Number(document.getElementById('maxDistanceKilometres').value) * 1_000);
  var durationRangeSeconds = new Range(
      hmsToSeconds(document.getElementById('minDurationHms').value),
      hmsToSeconds(document.getElementById('maxDurationHms').value));

  var matches = activities.filter(function(activity) {
    return true &&
      startLatLngRangeDegrees.lat.contains(activity.startLatitude) &&
      startLatLngRangeDegrees.lng.contains(activity.startLongitude) &&
      distanceRangeMetres.contains(activity.distance) &&
      durationRangeSeconds.contains(activity.duration) &&
      true;
  });

  var timestamps = matches.map(function(match) { return match.beginTimestamp; });
  var seconds = matches.map(function(match) { return match.duration; });
  var bestFitLine = bestFit(timestamps, seconds);

  document.getElementById('count').textContent = timestamps.length;
  document.getElementById('best').textContent = printSecondsAsMinutesSeconds(seconds.reduce(function(a, b) { return Math.min(a, b); }, Infinity));

  plot.setHoldOn(false);
  plot.plot(
    timestamps,
    seconds.map(function(x) { return x / 60; }),
    {
      lineStyle: '',
      markers: '.',
    });
  plot.setHoldOn(true);
  var xAxis = [plot.getAxisRanges()[0].min(), plot.getAxisRanges()[0].max()];
  plot.plot(
    xAxis,
    xAxis.map(function(x) { return (bestFitLine.m * x + bestFitLine.c) / 60; }),
    {
      lineColor: 'red'
    });
}

// Start with UTC only
function UnitHierarchy() {
}
// TODO: Use c'tor?
UnitHierarchy.prototype.init_ = function() {
  for (var i = 1; i < this.hierarchy_.length; ++i) {
    this.hierarchy_[i].setChild(this.hierarchy_[i - 1]);
    this.hierarchy_[i - 1].setParent(this.hierarchy_[i]);
  }
};

function Unit() {
  this.parent_ = null;
  this.child_ = null;
}
Unit.prototype.setParent = function(parent) {
  this.parent_ = parent;
}
Unit.prototype.setChild = function(child) {
  this.child_ = child;
}
Unit.prototype.getMax = function() {
}

function DateTime() {
  this.hierarchy_ = [
    new Second(),
    new Minute(),
    new Hour(),
    new Day(),
    new Month(),
    new Year()
  ];
  this.init_();
}

DateTime.prototype = Object.create(UnitHierarchy.prototype);

fucntion Day() {
}

Day.prototype = Object.create(Unit.prototype);

