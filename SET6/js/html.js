

HTML = function () {
    this.screenRatio = null;
    this.viewArea = null;
    this.viewCanvas = null;
    this.waitArea = null;
    this.waitCanvas = null;
    this.viewTotalTime = null;
    // this.viewTotalGrass = null;
};

HTML.prototype.initialize = function () {
    this.screenRatio = 1.0;
    this.viewArea = document.getElementById('viewArea');
    this.viewCanvas = document.getElementById('viewCanvas');
    this.viewTotalTime = document.getElementById('total-time');
    // this.viewTotalGrass = document.getElementById('total-grass');

    this.waitArea = document.getElementById('waitArea');
    this.waitCanvas = document.getElementById('waitCanvas');
};

HTML.prototype.reset = function () {
    this.viewTotalTime.innerHTML = ' Calculating Seconds . . .';
};

HTML.prototype.update = function (state) {
    var elapsedTime = 0.001 * (state.clock.oldTime - state.clock.startTime);
    elapsedTime = Math.round(elapsedTime * 1000.000000001) * 0.001;
    var stringFormatted = elapsedTime.toString();
    this.viewTotalTime.innerHTML = stringFormatted + ' Seconds';
};




