// TODO
// - Plot dates
// - Add trend line
// - Add stats

document.head.innerHTML = '';
document.body.innerHTML = '';

var x = document.createElement('script');
x.src = 'https://plotter.steveblock.co.uk/plotter.js';
x.addEventListener('load', go);
document.head.appendChild(x);

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

  plot = new Plot(1400, 700);
  plot.setGridOn(true);
  plot.setAxisLabels('Time since epoch (ms)', 'Time (mins)');
  plot.plot(
    commutes.map(function(commute) { return commute.beginTimestamp; }),
    commutes.map(function(commute) { return commute.duration / 60; }),
    {
      lineStyle: '',
      markers: '.',
    });

  document.body.appendChild(plot.canvas());
}
