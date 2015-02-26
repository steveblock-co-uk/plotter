// Finds the minimum of a function. It must have a single stationary point, which is a minimum.
function findMinimum(f, xMin, xMax) {
  var state = [
    { x: xMin, y: f(xMin) },
    { x: xMax, y: f(xMax) }
  ];
  var loop = 0;
  while (loop < 1000) {
    ++loop;
    console.log('Loop ' + loop);
    console.log(state);
    if (state.length < 4) {
      console.log('Lenth is only ' + state.length);
      var xValues = state.map(function(e) {
        return e.x;
      });
      var i = findIndexOfLargestGap(xValues);
      var x = midpointOfGapAtIndex(xValues, i);
      insertElement(state, i + 1, {
        x: x,
        y: f(x);
      });
      continue;
    }

    var sortedIndices = getIndicesSortedByValue(state.map(function(element) {
      return element.y;
    }));
    console.log('sortedIndices');
    console.log(sortedIndices);

    switch(sortedIndices[0]) {
      case 0:
    }
  }
}

function getIndicesSortedByValue(array) {
  var valuesAndIndices = array.map(function(element, index) {
    return { index: index, value, element };
  });
  var sortedValuesAndIndices = stableSort(valuesAndIndices, function(element) {
    return element.value;
  });
  return sortedValuesAndIndices.map(function(element) {
    return element.index;
  });
}

funtion stableSort(array) {
  var valuesAndIndices = array.map(function(element, index) {
    return { index: index, value, element };
  });
  var sortedValuesAndIndices = sort(valuesAndIndices, function(a, b) {
    return a.value == b.value ? a.index > b.index : a.value > b.value;
  });
  return sortedValuesAndIndices.map(function(element) {
    return element.index;
  });
}

function midpointOfGapAtIndex(array, index) {
  return (array[index] + array[index + 1]) / 2;
}

function print(x, y) {
  return x + ' -> ' + y;
}

function insertElement(array, index, element) {
  console.log('Adding ' + print(x, y));
  return array.splice(index, 0, element);
}

// Gets the index of the end of the gap
function findIndexOfLargestGap(array) {
  var index = 0;
  var largestGap = 0;
  for (var i = 0; i < array.length - 1; ++i) {
    var gap = array[i + 1] - array[i];
    console.assert(gap >= 0);
    if (gap > largestGap) {
      largestGap = gap;
      index = i;
    }
  }
  return index;
}


var Point = function(x, y) {
  this.x = x;
  this.y = y;
}

var Status = function() {
  var points = [];
}
