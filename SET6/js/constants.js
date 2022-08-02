

var DEBUG_ENABLE = true;

var NUM_CONTROLS = 7;

// This is the display / screen / UI being shown
var DisplayState = {
    VIEW : {value: 0, name: "Display: View"},
    WAIT : {value: 1, name: "Display: Wait"},
};
for(var index in DisplayState) {
    DisplayState[DisplayState[index].value] = DisplayState[index];
}

var ControlType = {
    GRASS_COUNT: 0,
    GRASS_COLOR: 1,
    GRASS_COLOR_VARIETY: 2,
    GRASS_LENGTH: 3,
    GRASS_LENGTH_VARIETY: 4,
    GRASS_BEND: 5,
    GRASS_BEND_VARIETY: 6
};

var MAX_GRASS_COUNT = 500000;
var MIN_GRASS_LENGTH = 1.0;
var RANGE_GRASS_LENGTH = 6.0;
var MIN_GRASS_BEND = 0.0;
var RANGE_GRASS_BEND = 1.0;

var GRASS_AREA = 50.0;
var GRASS_WIDTH = 0.15;
var GRASS_BROWN = new THREE.Vector3(0.55, 0.51, 0.39);
var GRASS_YELLOW = new THREE.Vector3(0.51, 0.55, 0.24);
var GRASS_GREEN = new THREE.Vector3(0.16, 0.59, 0.08);
var GRASS_COLORS = new THREE.SplineCurve3(
    [GRASS_BROWN, GRASS_YELLOW, GRASS_GREEN]
);

var NUM_SEGMENTS = 5;
var NUM_TRIANGLES = NUM_SEGMENTS * 2;
var NUM_VERTICES = 3;
var NUM_SHARED_TRIANGLES = NUM_TRIANGLES - 1;
var NUM_SHARED_VERTICES = NUM_VERTICES - 1;
var NUM_COORDS = 3;
var T_INCREMENT = 0.1;

var RAD = Math.PI / 180.0;
var DEG = 180.0 / Math.PI;

