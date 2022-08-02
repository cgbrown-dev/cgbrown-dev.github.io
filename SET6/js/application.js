

Application = function () {
    // Application State
    // holds timing and state information
    this.state = new State();
    // HTML Elements
    // holds elements for canvas and div
    this.html = new HTML();
    // Graphics Elements
    this.graphics = new Graphics();
    // Web Worker Element
    this.worker = new Worker("js/worker.js");
    // Elements used for debugging, performance, and analysis
    this.debug = DEBUG_ENABLE === true ? new Debug() : null;

    // Number of Triangles Per Grass * Max Number of Grass Blades * 3 Vertices * 3 Coordinates
    // 4 bytes per element in array
    this.indexBufferLength = MAX_GRASS_COUNT * NUM_TRIANGLES * NUM_VERTICES;
    this.geometryBufferLength = MAX_GRASS_COUNT * NUM_COORDS *
        ((NUM_TRIANGLES * NUM_VERTICES) - (NUM_SHARED_TRIANGLES * NUM_SHARED_VERTICES));

    this.workData = {
        indexBuffer : new Uint32Array(this.indexBufferLength),
        vertexBuffer : new Float32Array(this.geometryBufferLength),
        //normalBuffer : new Float32Array(this.geometryBufferLength),
        colorBuffer : new Float32Array(this.geometryBufferLength),
        controlBuffer : new Float32Array(this.geometryBufferLength)
    };
//console.log("Index Buffer Initialized Length: %i", this.indexBufferLength);
//console.log("Geometry Buffer Initialized Length: %i", this.geometryBufferLength);

    this.worker.addEventListener(
        'message',
        function (msg) { this.message(msg); }.bind(this),
        false
    );

};

Application.prototype.initialize = function () {
    this.html.initialize();
    this.state.initialize(this.workData.controlBuffer, this.html);
    this.graphics.initialize(this.html, this.state);
    this.resize();

    if(this.debug) {
        this.debug.initialize();
    }
};

Application.prototype.compute = function () {
    this.state.readControls(this.workData.controlBuffer);
    this.state.setDisplay(DisplayState.WAIT, this.html);
    this.state.clock.start();
    this.worker.postMessage(
        this.workData,
        [
            this.workData.indexBuffer.buffer,
            this.workData.vertexBuffer.buffer,
            //this.workData.normalBuffer.buffer,
            this.workData.colorBuffer.buffer,
            this.workData.controlBuffer.buffer
        ]
    );
};


// Render will animate the current position along the curve
// The animation will just keep looping over and over again
Application.prototype.render = function () {
    if(this.debug) {
        this.debug.stats.update();
    }

    // Render the view
    if (this.state.displayState == DisplayState.VIEW) {
        this.graphics.orbit.update(false, false, false);
        this.graphics.webgl.render(
            this.graphics.scene,
            this.graphics.camera
        );
    }
    // Render the wait screen
    if (this.state.displayState == DisplayState.WAIT) {
        var context = this.html.waitCanvas.getContext('2d');
        context.fillStyle = "rgba(50, 50, 50, 0.25)";
        context.fillRect(
            0, 0,
            this.html.waitCanvas.width,
            this.html.waitCanvas.height
        );
        var fontSize = 48 * (this.html.waitCanvas.width / 1440);
        context.font = fontSize + "pt Arial";
        context.textAlign = 'center';
        context.fillStyle = 'rgba(255, 255, 255, 2.0)';
        context.fillText(
            "Please wait, the grass is generating. . .",
            this.html.waitCanvas.width * 0.5,
            this.html.waitCanvas.height * 0.5
        ); 
    }

    this.state.animationID = requestAnimationFrame(this.render.bind(this));
};


Application.prototype.resize = function () {
    this.html.viewCanvas.width = (0.73 * window.innerWidth);
    this.html.viewCanvas.height = window.innerHeight;
    this.html.waitCanvas.width = this.html.viewCanvas.width;
    this.html.waitCanvas.height = this.html.viewCanvas.height;

    this.html.viewCanvas.style.width = (0.73 * window.innerWidth).toString() + "px";
    this.html.viewCanvas.style.height = (window.innerHeight).toString() + "px";
    this.html.waitCanvas.style.width = (this.html.viewCanvas.width).toString() + "px";
    this.html.waitCanvas.style.height = (this.html.viewCanvas.height).toString() + "px";
    this.graphics.webgl.setSize(
        this.html.viewCanvas.width,
        this.html.viewCanvas.height
    );
    this.graphics.camera.aspect =
        this.html.viewCanvas.width / this.html.viewCanvas.height;
    this.graphics.camera.updateProjectionMatrix();

};

Application.prototype.message = function (msg) {
// console.log("Main thread received a message!");
    this.workData.indexBuffer = msg.data.indexBuffer;
    this.workData.vertexBuffer = msg.data.vertexBuffer;
    //this.workData.normalBuffer = msg.data.normalBuffer;
    this.workData.colorBuffer = msg.data.colorBuffer;
    this.workData.controlBuffer = msg.data.controlBuffer;

// console.log("Length of index buffer: %i", this.workData.indexBuffer.length);
// for(var i = 0; i < 18; i++) {
//     console.log("index buffer sample: %i", this.workData.indexBuffer[i]);
// }
// console.log("Length of vertex buffer: %i", this.workData.vertexBuffer.length);
// for(var i = 0; i < 24; i++) {
//     console.log("vertex buffer sample: %f", this.workData.vertexBuffer[i]);
// }
// console.log("normal buffer sample: %f", this.workData.normalBuffer[0]);
// for(var i = 0; i < 24; i++) {
//     console.log("color buffer sample: %f", this.workData.colorBuffer[i]);
// }

// console.log("Upload data to GPU.");
// console.log("\n");

    this.graphics.update(this.workData, this.indexBufferLength, this.geometryBufferLength);

    this.state.clock.stop();
    this.html.update(this.state);
    this.state.setDisplay(DisplayState.VIEW, this.html);
};


