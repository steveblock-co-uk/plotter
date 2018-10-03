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

var GOAL_KILO_FEET = 100;
var DAYS_TO_MILLIS = 1000 * 60 * 60 * 24;
var FEET_TO_METRES = 0.3048;
var START_DATE_MILLIS = new Date('2018-10-01T00:00:00-0800').getTime();
var END_DATE_MILLIS = new Date('2018-11-01T00:00:00-0800').getTime();

function plot() {
  var activities = JSON.parse(this.responseText).filter(function(activity) {
    var t = new RegExp('([0-9]{2}):([0-9]{2}):([0-9]{2})').exec(activity.startTimeLocal);
    return true &&
      activity.beginTimestamp >= START_DATE_MILLIS &&
      activity.beginTimestamp + activity.elapsedDuration < END_DATE_MILLIS &&
      true;
  }).sort(function(a, b) {
    return a.beginTimestamp - b.beginTimestamp;
  });

  var timeMillis = [START_DATE_MILLIS];
  var currentClimb = 0;
  var climbMetres = [currentClimb];

  for (var i = 0; i <  activities.length; ++i) {
    var activity = activities[i];
    timeMillis.push(activity.beginTimestamp);
    climbMetres.push(currentClimb);
    currentClimb += activity.elevationGain;
    timeMillis.push(activity.beginTimestamp + activity.elapsedDuration);
    climbMetres.push(currentClimb);
  }

  timeMillis.push(new Date().getTime());
  climbMetres.push(climbMetres.slice(-1));

  var timeDays = timeMillis.map(function(millis) {
    return (millis - START_DATE_MILLIS) / DAYS_TO_MILLIS;
  });
  var climbKiloFeet = climbMetres.map(function(metres) {
    return metres / FEET_TO_METRES / 1000;
  });

  var endDay = (END_DATE_MILLIS - START_DATE_MILLIS) / DAYS_TO_MILLIS;

  plot = new Plot(1400, 700);
  plot.setGridOn(true);
  plot.setAxisLabels('Time (days)', 'Climb (1000 ft)');
  plot.plot(timeDays, climbKiloFeet);
  plot.setHoldOn(true);
  plot.plot([0, endDay], [0, GOAL_KILO_FEET], { lineColor: 'red' });
  plot.setAxisRanges(new Range(0, endDay));

  document.body.appendChild(plot.canvas());

  var table = document.createElement('table');
  table.appendChild(tableRow('Total Climb (ft)', Math.round(1000* climbKiloFeet.slice(-1))));
  table.appendChild(tableRow('Remaining Climb (ft)', Math.round(1000* (GOAL_KILO_FEET - climbKiloFeet.slice(-1)))));
  document.body.appendChild(table);
}
