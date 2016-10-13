/*
Configurations and utility functions for figures
*/
if(typeof require != "undefined") {
 // hack for loading from generator
 var d3 = require('./d3.min.js')
 var visualize = require('./visualize.js').visualize
 var tsnejs = require('./tsne.js')
 var demoConfigs = require('./demo-configs.js')
 var distanceMatrix = demoConfigs.distanceMatrix
 var Point = demoConfigs.Point
}

var FIGURES = {
  width: 150,
  height: 150,
  downscaleWidth: 300,
  downscaleHeight: 300,
}

function getPoints(demo, params) {
  if(!params) {
    params = [demo.options[0].start]
    if(demo.options[1]) params.push(demo.options[1].start)
  }
  var points = demo.generator.apply(null, params);
  return points;
}
function renderDemoInitial(demo, params, canvas) {
  visualize(points, canvas, null, null)
}


/*
var demoTimescale = d3.scaleLinear()
  .domain([0, 200, 6000])
  .range([20, 10, 0])
*/
var timescale = d3.scaleLinear()
  .domain([0, 20, 50, 100, 200, 6000])
  .range([60, 30, 20, 10, 0]);

var currentThread = 0;
// Show an animated t-SNE algorithm.
function runDemo(points, canvas, options, stepCb) {
  var tsne = new tsnejs.tSNE(options);
  var dists = distanceMatrix(points);
  tsne.initDataDist(dists);
  var step = 0;
  var chunk = 1;
  var thread = ++currentThread;
  //console.log(thread, GLOBALS.running, step)
  function improve() {
    if (thread != currentThread) return;
    if(GLOBALS.running) {
      if(step > 200) chunk = 10;
      for(var k = 0; k < chunk; k++) {
        tsne.step();
        ++step;
      }
      //inform the caller about the current step
      stepCb(step)

      var solution = tsne.getSolution().map(function(coords, i) {
        return new Point(coords, points[i].color);
      });
      visualize(solution, canvas, ""); //removed message
    }
    var timeout = timescale(step)
    setTimeout(function() {
      window.requestAnimationFrame(improve);
    }, timeout)
  }
  improve();
  return thread;
}

// Sorry for the duplicate code, couldn't think of a concise way to seperate
// out this thread model. Ideally we'd keep track of the running state a bit
// more elegantly
var currentPlaygroundThread = 0;
// Show an animated t-SNE algorithm.
function runPlayground(points, canvas, options, stepCb) {
  var tsne = new tsnejs.tSNE(options);
  var dists = distanceMatrix(points);
  tsne.initDataDist(dists);
  var step = 0;
  var chunk = 1;
  var thread = ++currentPlaygroundThread;
  //console.log(thread, GLOBALS.running, step)
  function improve() {
    if (thread != currentPlaygroundThread) return;
    if(GLOBALS.running) {
      if(step > 200) chunk = 10;
      for(var k = 0; k < chunk; k++) {
        tsne.step();
        ++step;
      }
      //inform the caller about the current step
      stepCb(step)

      var solution = tsne.getSolution().map(function(coords, i) {
        return new Point(coords, points[i].color);
      });
      visualize(solution, canvas, ""); //removed message
    }
    var timeout = timescale(step)
    setTimeout(function() {
      window.requestAnimationFrame(improve);
    }, timeout)
  }
  improve();
  return thread;
}


function runDemoSync(points, canvas, options, stepLimit, no3d) {
  var tsne = new tsnejs.tSNE(options);
  var dists = distanceMatrix(points);
  tsne.initDataDist(dists);
  var step = 0;
  for(var k = 0; k < stepLimit; k++) {
    if(k % 100 === 0) console.log("step", step)
    tsne.step();
    ++step;
  }
  var solution = tsne.getSolution().map(function(coords, i) {
    return new Point(coords, points[i].color);
  });
  visualize(solution, canvas, "", no3d); //removed message
  return step;
}

if(typeof module != "undefined") module.exports = {
  runDemo: runDemo,
  runDemoSync: runDemoSync,
  getPoints: getPoints,
  FIGURES: FIGURES
}
