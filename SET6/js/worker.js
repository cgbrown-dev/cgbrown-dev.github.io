

importScripts('three.js');
importScripts('constants.js');
importScripts('grass.js');

var generateGrass = function (workData) {
// console.log("Generating grass . . .");
    var minControl = 0.0;
    var maxControl = 0.0;

    // Set the color range
    var minColor = new THREE.Vector3();
    var maxColor = new THREE.Vector3();
    minControl = workData.controlBuffer[ControlType.GRASS_COLOR] -
        (workData.controlBuffer[ControlType.GRASS_COLOR_VARIETY] * 0.5);
    maxControl = workData.controlBuffer[ControlType.GRASS_COLOR] +
        (workData.controlBuffer[ControlType.GRASS_COLOR_VARIETY] * 0.5);
    if(minControl < 0.0) {
        maxControl += (-minControl);
        minControl = 0.0;
    }
    else if(maxControl > 1.0) {
        minControl -= (maxControl - 1.0);
        maxControl = 1.0;
    }
    minColor.copy(GRASS_COLORS.getPoint(minControl));
    maxColor.copy(GRASS_COLORS.getPoint(maxControl));

    // Set the length range
    var minLength = 0.0;
    var maxLength = 0.0;
    minControl = workData.controlBuffer[ControlType.GRASS_LENGTH] -
        (workData.controlBuffer[ControlType.GRASS_LENGTH_VARIETY] * 0.5);
    maxControl = workData.controlBuffer[ControlType.GRASS_LENGTH] +
        (workData.controlBuffer[ControlType.GRASS_LENGTH_VARIETY] * 0.5);
    if(minControl < 0.0) {
        maxControl += (-minControl);
        minControl = 0.0;
    }
    else if(maxControl > 1.0) {
        minControl -= (maxControl - 1.0);
        maxControl = 1.0;
    }
    minLength = MIN_GRASS_LENGTH + (minControl * RANGE_GRASS_LENGTH);
    maxLength = MIN_GRASS_LENGTH + (maxControl * RANGE_GRASS_LENGTH);

    // Set the bend range
    var minBend= 0.0;
    var maxBend = 0.0;
    minControl = workData.controlBuffer[ControlType.GRASS_BEND] -
        (workData.controlBuffer[ControlType.GRASS_BEND_VARIETY] * 0.5);
    maxControl = workData.controlBuffer[ControlType.GRASS_BEND] +
        (workData.controlBuffer[ControlType.GRASS_BEND_VARIETY] * 0.5);
    if(minControl < 0.0) {
        maxControl += (-minControl);
        minControl = 0.0;
    }
    else if(maxControl > 1.0) {
        minControl -= (maxControl - 1.0);
        maxControl = 1.0;
    }
    minBend = MIN_GRASS_BEND + (minControl * RANGE_GRASS_BEND);
    maxBend = MIN_GRASS_BEND + (maxControl * RANGE_GRASS_BEND);
    

    var grass = new Grass(
        GRASS_AREA,
        GRASS_WIDTH,
        minColor,
        maxColor,
        minLength,
        maxLength,
        minBend,
        maxBend
    );

    // These objects are needed so that modifications to their data propogate
    // back from subroutines to the calling function.
    var i = {grass: 0, index: 0, buffer: 0};
    var sub = {index: 0, buffer: 0};

    // Compute the data needed for each blade of grass.
    for(i.grass = 0; i.grass < workData.controlBuffer[ControlType.GRASS_COUNT]; i.grass++) {
        grass.compute(i, workData);
    }
// console.log("Computed Grass Count: " + i.grass.toString());
// console.log("Computed Index Count: " + i.index.toString());
// console.log("Computed Geometry Count: " + i.buffer.toString());

    for(i.grass; i.grass < MAX_GRASS_COUNT; i.grass++) {
        grass.zeros(i, workData);
    }
// console.log("Total Grass Count: " + i.grass.toString());
// console.log("Total Index Count: " + i.index.toString());
// console.log("Total Geometry Count: " + i.buffer.toString());

};

self.addEventListener(
    'message',
    function (msg) {
// console.log("Worker received a message!");
        var workData = {
            indexBuffer : msg.data.indexBuffer,
            vertexBuffer : msg.data.vertexBuffer,
            //normalBuffer : msg.data.normalBuffer,
            colorBuffer : msg.data.colorBuffer,
            controlBuffer : msg.data.controlBuffer
        };

        var time = Date.now();
        generateGrass(workData);
//console.log("Elapsed Worker Time: " + (0.001 * (Date.now() - time)).toString());
        this.postMessage(
            workData,
            [
                workData.indexBuffer.buffer,
                workData.vertexBuffer.buffer,
                //workData.normalBuffer.buffer,
                workData.colorBuffer.buffer,
                workData.controlBuffer.buffer
            ]
        );

    },
    false
);