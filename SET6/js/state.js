

State = function () {
    this.clock = null;
    this.animationID = null;
    this.displayState = null;
};

State.prototype.initialize = function (controlBuffer, html) {
    this.clock = new THREE.Clock();
    this.animationID = -1;
    this.readControls(controlBuffer);
    this.setDisplay(DisplayState.VIEW, html);
};

State.prototype.readControls = function (controlBuffer) {
    for(var i = 0; i < NUM_CONTROLS; i++) {
        var number = i.toString();
        var sliderName = "#slider-" + number;
        controlBuffer[i] = parseFloat($(sliderName).val());
//console.log("Slider %i: %f", i, controlBuffer[i]);
    }
    controlBuffer[ControlType.GRASS_COUNT] *= 1000;
    controlBuffer[ControlType.GRASS_COLOR] *= 0.01;
    controlBuffer[ControlType.GRASS_COLOR_VARIETY] *= 0.01 * 0.6;
    controlBuffer[ControlType.GRASS_LENGTH] *= 0.01;
    controlBuffer[ControlType.GRASS_LENGTH_VARIETY] *= 0.01 * 0.6;
    controlBuffer[ControlType.GRASS_BEND] *= 0.01;
    controlBuffer[ControlType.GRASS_BEND_VARIETY] *= 0.01 * 0.6;
};


State.prototype.setDisplay = function (displayState, html) {
    var zIndex = [0, -2];
    zIndex[displayState.value] = 1;

    html.viewArea.style.zIndex = zIndex[0];
    html.waitArea.style.zIndex = zIndex[1];

    this.displayState = displayState;
};

