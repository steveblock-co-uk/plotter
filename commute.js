// TODO
// - Plot dates

document.head.innerHTML = '';
document.body.innerHTML = '';

var x = document.createElement('script');
x.src = 'https://plotter.steveblock.co.uk/plotter.js';
x.addEventListener('load', go);
document.head.appendChild(x);

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

function tableRow(x, y) {
  var tr = document.createElement('tr');
  var td = document.createElement('td');
  tr.appendChild(td);
  td.textContent = x;
  var td = document.createElement('td');
  td.textContent = y;
  tr.appendChild(td);
  return tr;
}

function go() {
  var r = new XMLHttpRequest();
  r.open('GET', 'https://connect.garmin.com/modern/proxy/activitylist-service/activities/search/activities?limit=1000&start=0');
  r.send();
  r.addEventListener('load', plot);
}

function plot() {
  var activities = JSON.parse(this.responseText);
  var commutes = activities.filter(function(activity) {
    var t = new RegExp('([0-9]{2}):([0-9]{2}):([0-9]{2})').exec(activity.startTimeLocal);
    var hourOfDay = new Number(t[1]) + t[2] / 60 + t[3] / 60 / 60;
    return true &&
      activity.activityType.typeKey === 'cycling' &&
      hourOfDay >= 16.5 &&
      hourOfDay <= 19.5 &&
      activity.elevationGain >= 200 &&
      activity.elevationGain <= 250 &&
      activity.distance >= 10500 &&
      activity.distance <= 12500 &&
      activity.startLatitude >= 49 &&
      activity.startLatitude <= 50 &&
      activity.startLongitude >= -124 &&
      activity.startLongitude <= -123 &&
      true;
  });

  var millis_2018_03_12_00_00_00_PDT = 1520838000000;
  var weeksToMillis = 1000 * 60 * 60 * 24 * 7;
  var weeks = commutes.map(function(commute) { return (commute.beginTimestamp - millis_2018_03_12_00_00_00_PDT) / weeksToMillis; });
  var seconds = commutes.map(function(commute) { return commute.duration; });
  var bestFitLine = bestFit(weeks, seconds);
  var nowWeeks = (new Date().getTime() - millis_2018_03_12_00_00_00_PDT) / weeksToMillis;

  var table = document.createElement('table');
  table.appendChild(tableRow('Count', weeks.length));
  table.appendChild(tableRow('Best (mm:ss)', printSecondsAsMinutesSeconds(seconds.reduce(function(a, b) { return Math.min(a, b); }, Infinity))));
  table.appendChild(tableRow('Weekly delta (s)', bestFitLine.m.toFixed(1)));
  table.appendChild(tableRow('Predicted (mm:ss)', printSecondsAsMinutesSeconds(bestFitLine.m * nowWeeks + bestFitLine.c)));
  document.body.appendChild(table);

  plot = new Plot(1400, 700);
  plot.setGridOn(true);
  plot.setAxisLabels('Time (weeks)', 'Time (mins)');
  plot.plot(
    weeks,
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

  document.body.appendChild(plot.canvas());
}
