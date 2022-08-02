THREE.ImageUtils.crossOrigin = "";

var NUMCONTROLS = 4;
var RAD = Math.PI / 180.0;
var DEG = 180.0 / Math.PI;

// This is the display / screen / UI being shown
var DisplayState = {
    ACTIVITY : {value: 0, name: "Display: Activity"},
    IDLE : {value: 1, name: "Display: Idle"},
    START : {value: 2, name: "Display: Start"},
};
for(var index in DisplayState) {
    DisplayState[DisplayState[index].value] = DisplayState[index];
}

// This is the interaction being performed
var InteractionState = {
    ACTION : {value: 0, name: "Interaction: Action"},
    IDLE : {value: 1, name: "Interaction: Idle"},
    START : {value: 2, name: "Interaction: Start"},
};
for(var index in InteractionState) {
    InteractionState[InteractionState[index].value] = InteractionState[index];
}

// Select controls by
var ControlSelect = {
    COLOR_INTENSITY: 0,
    BUMPINESS: 1,
    REFLECTION_INTENSITY: 2,
    // REFLECTION_BLURINESS: 3,
    REFRACTION_INTENSITY: 3,
    // REFRACTION_BLURINESS: 5,
    //REFRACTION_RATIO: 4
};

// Swatch type
var SwatchType = {
    COLOR: 0,
    NORMAL: 1,
    REFRACTION: 2
};

// Refraction index values
var RefractionIndex = [1.025, 1.2, 1.5, 2.5];

var checkerboardTexture = function (textureCanvas, textureSize, checkerSize) {
    textureCanvas.width = textureSize;
    textureCanvas.height = textureSize;
    var textureContext = textureCanvas.getContext("2d");

    var patternElement = document.createElement("canvas");
    patternElement.width = 2.0 * checkerSize;
    patternElement.height = 2.0 * checkerSize;
    var patternContext = patternElement.getContext("2d");

    patternContext.fillStyle = "rgb(55, 55, 55)";
    patternContext.fillRect(0, 0, checkerSize, checkerSize);
    patternContext.fillRect(checkerSize, checkerSize, checkerSize, checkerSize);
    patternContext.fillStyle = "rgb(200, 200, 200)";
    patternContext.fillRect(0, checkerSize, checkerSize, checkerSize);
    patternContext.fillRect(checkerSize, 0, checkerSize, checkerSize);

    var pattern = textureContext.createPattern(patternElement, "repeat");
    textureContext.beginPath();
    textureContext.moveTo(0, 0);
    textureContext.lineTo(textureSize, 0);
    textureContext.lineTo(textureSize, textureSize);
    textureContext.lineTo(0, textureSize);
    textureContext.fillStyle = pattern;
    textureContext.fill();
};


function Application() {
    // TODO: Maybe these should all be classes

    // Application State
    // holds timing and state information
    this.state = {
        interactionState : null,
        displayState : null,
        globalTimeStamp : null,
        idleTimeStamp : null,
        idleOffset : null,
        sliderControls : null,
        sliderDefaults : null,
        colorSwatchIndex : null,
        normalSwatchIndex : null,
        refractionSwatchIndex : null,
        updateCubeMap : false
    };
    // HTML Elements
    // holds elements for canvas and div
    this.html = {
        screenRatio : 1.0,
        startArea : null,
        idleArea : null,
        controlArea : null,
        resetArea : null,
        viewArea : null,
        colorImage : null,
        normalImage : null,
        refractionImage : null,
        startCanvas : null,
        idleCanvas : null,
        viewCanvas : null,
        textureCanvas : null
        // reflectionCanvas : null,
        // refractionCanvas : null
    };

    // Graphics Elements
    this.graphics = {
        webgl : null,
        scene : null,
        camera : null,
        orbit: null,
        grid : null,
        sphere : null,
        environment : null,
        ground : null,
        cubeCamera : null,
        colorMap : null,
        normalMap : null
    };

    // Elements used for debugging, performance, and analysis
    this.debug = {
        statsArea : null,
        stats : null
    };

    // Removing because it may not be needed. Interrupt only needs to be on
    // or touch. The mousemove is neither of those and is too much.
    //window.addEventListener('mousemove', this.onIdleInterrupt.bind(this), false);
    window.addEventListener('touchmove', this.onIdleInterrupt.bind(this), false);
    window.addEventListener('mousedown', this.onIdleInterrupt.bind(this), false);
    window.addEventListener('touchstart', this.onIdleInterrupt.bind(this), false);
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
}

Application.prototype.initialize = function () {
    var self = this;
    var material;
    var geometry;

    var initializeHTML = function () {
        self.html.startArea = document.getElementById('startArea');
        self.html.idleArea = document.getElementById('idleArea');
        self.html.controlArea = document.getElementById('controlArea');
        self.html.resetArea = document.getElementById('resetArea');
        self.html.viewArea = document.getElementById('viewArea');
        self.html.startCanvas = document.getElementById('startCanvas');
        self.html.idleCanvas = document.getElementById('idleCanvas');
        self.html.viewCanvas = document.getElementById('viewCanvas');
        self.html.textureCanvas = document.getElementById('textureCanvas');
        self.html.startArea.style.zIndex = 0;
        self.html.idleArea.style.zIndex = -1;
        self.html.controlArea.style.zIndex = -2;
        self.html.resetArea.style.zIndex = -2;
        self.html.viewArea.style.zIndex = -2;

        self.html.colorImage = [];
        var colorName;
        for(var i = 0; i < 16; i++) {
            colorName = "color-" + i.toString();
            self.html.colorImage[i] = document.getElementById(colorName);
            self.html.colorImage[i].swatchIndex = i;
            self.html.colorImage[i].swatchType = SwatchType.COLOR;
            self.html.colorImage[i].style.borderColor = "rgba(246, 246, 246, 0.4)";
            self.html.colorImage[i].addEventListener(
                'mousedown', self.changeSwatch.bind(self), false
            );
            self.html.colorImage[i].addEventListener(
                'touchstart', self.changeSwatch.bind(self), false
            );
        }

        self.html.normalImage = [];
        var normalName;
        for(var i = 0; i < 8; i++) {
            normalName = "normal-" + i.toString();
            self.html.normalImage[i] = document.getElementById(normalName);
            self.html.normalImage[i].swatchIndex = i;
            self.html.normalImage[i].swatchType = SwatchType.NORMAL;
            self.html.normalImage[i].style.borderColor = "rgba(246, 246, 246, 0.4)";
            self.html.normalImage[i].addEventListener(
                'mousedown', self.changeSwatch.bind(self), false
            );
            self.html.normalImage[i].addEventListener(
                'touchstart', self.changeSwatch.bind(self), false
            );
        }

        self.html.refractionImage = [];
        var refractionName;
        for(var i = 0; i < 4; i++) {
            refractionName = "refract-" + i.toString();
            self.html.refractionImage[i] = document.getElementById(refractionName);
            self.html.refractionImage[i].swatchIndex = i;
            self.html.refractionImage[i].swatchType = SwatchType.REFRACTION;
            self.html.refractionImage[i].style.borderColor = "rgba(246, 246, 246, 0.4)";
            self.html.refractionImage[i].addEventListener(
                'mousedown', self.changeSwatch.bind(self), false
            );
            self.html.refractionImage[i].addEventListener(
                'touchstart', self.changeSwatch.bind(self), false
            );
        }

        // self.html.reflectionCanvas = fx.canvas();
        // self.html.refractionCanvas = fx.canvas();
    };
    var initializeState = function () {
        self.state.interactionState = InteractionState.START;
        self.state.displayState = DisplayState.START;
        self.state.globalTimeStamp = new Date().getTime();
        self.state.idleTimeStamp = new Date().getTime();
        self.state.idleOffset = new THREE.Vector2(0, 0);
        self.state.sliderControls = [];
        self.state.sliderDefaults = [];

        for(var i = 0; i < NUMCONTROLS; i++) {
            self.state.sliderDefaults[i] = 0;
        }
        self.state.sliderDefaults[ControlSelect.COLOR_INTENSITY] = 1.0;
        //self.state.sliderDefaults[ControlSelect.REFRACTION_RATIO] = 1.0;

        self.state.colorSwatchIndex = 0;
        self.state.normalSwatchIndex = 0;
        self.state.refractionSwatchIndex = 0;

        var randomX = (Math.random() * 2.0) - 1.0;
        var randomY = (Math.random() * 2.0) - 1.0;
        self.state.idleOffset.set(
            Math.floor(randomX * self.html.idleCanvas.width * 0.15),
            Math.floor(randomY * self.html.idleCanvas.height * 0.15));
    };
    var initializeWebGL = function () {
        self.graphics.webgl = new THREE.WebGLRenderer({
            canvas : self.html.viewCanvas,
            antialias : true
        });
        self.graphics.webgl.setSize(
            self.html.viewCanvas.width,
            self.html.viewCanvas.height
        );    
        self.graphics.scene = new THREE.Scene();
    };
    var initializeCamera = function () {
        self.graphics.camera = new THREE.PerspectiveCamera(
            45.0,
            self.html.viewCanvas.width / self.html.viewCanvas.height,
            0.1, 100000.0
        );
        self.graphics.scene.add(self.graphics.camera);
        self.graphics.camera.position.set(0.0, 50.0, -200.0);
        var center = new THREE.Vector3(0.0, 40.0, 0.0);
        self.graphics.camera.lookAt(center);

        self.graphics.orbit = new THREE.OrbitControls(
            self.graphics.camera,
            self.html.viewCanvas
        );
        self.graphics.orbit.center.copy(center);

        self.graphics.cubeCamera = new THREE.CubeCamera(0.1, 100000.0, 1024);
        self.graphics.cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
        for(var i = 0; i < self.graphics.cubeCamera.children.length; i++) {
            self.graphics.cubeCamera.children[i].position.copy(center);
        }
        self.graphics.scene.add(self.graphics.cubeCamera);
    };
    var initializeGrid = function () {
        self.graphics.grid = new THREE.GridHelper(50, 50 / 5);
        self.graphics.grid.setColors(
            new THREE.Color(0x000000),
            new THREE.Color(0x000000)
        );
        self.graphics.scene.add(self.graphics.grid);
        var gridOffset = 0.5;
        self.graphics.grid.position.set(0.0, gridOffset, 0.0);

        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(-10, 0.1 + gridOffset, 0),
            new THREE.Vector3(30, 0.1 + gridOffset, 0)
        );
        geometry.computeLineDistances();
        material = new THREE.LineBasicMaterial({
            linewidth: 2,
            color: 0xff0000
        });
        self.graphics.scene.add(new THREE.Line(geometry, material));

        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(0, 0.1 + gridOffset, 30),
            new THREE.Vector3(0, 0.1 + gridOffset, -10)
        );
        geometry.computeLineDistances();
        material = new THREE.LineBasicMaterial({
            linewidth: 2,
            color: 0x0000ff
        });
        self.graphics.scene.add(new THREE.Line(geometry, material));
    };

    var initializeObjects = function () {

        var shader = THREE.UberShader;
        var textureCube = THREE.ImageUtils.loadTextureCube(
            [
                "images/cube_right.jpg", "images/cube_left.jpg",
                "images/cube_top.jpg", "images/cube_bottom.jpg",
                "images/cube_front.jpg", "images/cube_back.jpg"
            ],
            {},
            function () {self.state.updateCubeMap = true;}
        );

        for (var i = 0; i < 8; i++) {
            self.graphics.colorMap = new THREE.ImageUtils.loadTexture(
                "images/color-" + i.toString() +".jpg"
            );
            self.graphics.colorMap = new THREE.ImageUtils.loadTexture(
                "images/color-" + (i+8).toString() +".jpg"
            );
            self.graphics.normalMap = new THREE.ImageUtils.loadTexture(
                "images/normal-" + i.toString() +".jpg"
            );
        }
        // var textureCube = THREE.ImageUtils.loadTextureCube(
        //     [
        //         "images/color-0.jpg", "images/color-1.jpg",
        //         "images/color-2.jpg", "images/color-3.jpg",
        //         "images/color-4.jpg", "images/color-5.jpg"
        //     ]
        // );
        textureCube.needsUpdate = true;

        shader.uniforms["tTextureCube"].value = self.graphics.cubeCamera.renderTarget;

        var parameters = {
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader, 
            uniforms: shader.uniforms
        };
        material = new THREE.ShaderMaterial(parameters);
        geometry = new THREE.SphereGeometry(40, 256, 256);
        self.graphics.sphere = new THREE.Mesh(geometry, material);
        self.graphics.sphere.position.set(0, 40, 0);
        self.graphics.scene.add(self.graphics.sphere);

        self.updateShader();

        shader = THREE.ShaderLib["cube"];
        shader.uniforms["tCube"].value = textureCube;
        //shader = THREE.GradientShader;
        parameters = {
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader, 
            uniforms: shader.uniforms,
            depthWrite: false,
            side: THREE.BackSide
        };
        material = new THREE.ShaderMaterial(parameters);
        geometry = new THREE.CubeGeometry(50000, 10000, 10000);
        //geometry = new THREE.SphereGeometry(500, 256, 256);
        self.graphics.environment = new THREE.Mesh(geometry, material);
        //self.graphics.environment.rotation.x = 180.0 * RAD;
        self.graphics.scene.add(self.graphics.environment);

        checkerboardTexture(self.html.textureCanvas, 256, 256 / 4);
        var texture = new THREE.Texture(self.html.textureCanvas);
        texture.needsUpdate = true;
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(300, 300);

        shader = THREE.ImageRepeatShader;
        shader.uniforms["mRepeat"].value = 300;
        shader.uniforms["mShadowDisable"].value = 1.0;
        shader.uniforms["tTextureColor"].value = texture;
        parameters = {
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader, 
            uniforms: shader.uniforms
        };
        material = new THREE.ShaderMaterial(parameters);

        //material = new THREE.MeshBasicMaterial({map: texture});
        geometry = new THREE.PlaneGeometry(50000, 50000);
        self.graphics.ground = new THREE.Mesh(geometry, material);
        self.graphics.scene.add(self.graphics.ground);
        self.graphics.ground.position.set(0, 0, 0);
        self.graphics.ground.rotation.set(90 * RAD, 180 * RAD, 0);
    };

    var initializeDebug = function () {
        self.debug.stats = new Stats();
        self.debug.stats.domElement.style.position = 'absolute';
        self.debug.stats.domElement.style.top = '0px';
        self.debug.stats.domElement.style.zIndex = 10;

        self.debug.statsArea = document.getElementById('statsArea');
        self.debug.statsArea.appendChild(self.debug.stats.domElement);
    };

    initializeHTML();
    initializeState();
    initializeWebGL();
    //initializeGrid();
    initializeCamera();
    initializeObjects();
    //initializeDebug();

    this.clearControls();

    this.onWindowResize();
};


// Hiding or showing using CSS display does not work because it seems to trigger
// move, touch, or click events when changing from none to block / inline / inline-block
Application.prototype.setDisplay = function (displayState) {
    var zIndex = [0, -1, -2, 0];
    zIndex[displayState.value] = 1;
    zIndex[3] = (zIndex[0] + 1) * zIndex[0];

    this.html.viewArea.style.zIndex = zIndex[0];
    this.html.controlArea.style.zIndex = zIndex[3];
    this.html.resetArea.style.zIndex = zIndex[3];
    this.html.idleArea.style.zIndex = zIndex[1];
    this.html.startArea.style.zIndex = zIndex[2];

    this.state.displayState = displayState;
};

Application.prototype.clearControls = function () {
    this.state.updateCubeMap = true;
    var event = new Object();
    event.target = this.html.colorImage[0];
    this.changeSwatch(event);
    event.target = this.html.normalImage[0];
    this.changeSwatch(event);
    event.target = this.html.refractionImage[0];
    this.changeSwatch(event);

    for(var i = 0; i < NUMCONTROLS; i++) {
        var number = i.toString();
        var sliderName = "#slider-" + number;

        $(sliderName).val(this.state.sliderDefaults[i].toString());
        $(sliderName).slider("refresh");
    }
    this.updateShader();
};

Application.prototype.readControls = function () {
    for(var i = 0; i < NUMCONTROLS; i++) {
        var number = i.toString();
        var sliderName = "#slider-" + number;

        this.state.sliderControls[i] = parseFloat($(sliderName).val());
    }
};

Application.prototype.updateShader = function () {
    this.readControls();

    var colorIntensity = this.state.sliderControls[ControlSelect.COLOR_INTENSITY];
    var maxIntensity = this.state.sliderControls[ControlSelect.COLOR_INTENSITY] +
        this.state.sliderControls[ControlSelect.REFLECTION_INTENSITY] +
        this.state.sliderControls[ControlSelect.REFRACTION_INTENSITY];

    if(maxIntensity < 1.0) {
        maxIntensity = 1.0;
    }
    //maxColor.setRGB(maxChannel, maxChannel, maxChannel);
    //console.log("RGB: %f, %f, %f", color.r, color.g, color.b);

    this.graphics.sphere.material.uniforms["tTextureColor"].value =
        this.graphics.colorMap;
    this.graphics.sphere.material.uniforms["tTextureNormal"].value =
        this.graphics.normalMap;
    this.graphics.sphere.material.uniforms["mColorIntensity"].value =
        colorIntensity;
    this.graphics.sphere.material.uniforms["mMaxIntensity"].value =
        maxIntensity;
    this.graphics.sphere.material.uniforms["mBumpiness"].value =
        this.state.sliderControls[ControlSelect.BUMPINESS];
    // this.graphics.sphere.material.uniforms["mReflectionBlurriness"].value =
    //     this.state.sliderControls[ControlSelect.REFLECTION_BLURINESS];
    // this.graphics.sphere.material.uniforms["mRefractionBlurriness"].value =
    //     this.state.sliderControls[ControlSelect.REFRACTION_BLURINESS];
    this.graphics.sphere.material.uniforms["mReflectionIntensity"].value =
        this.state.sliderControls[ControlSelect.REFLECTION_INTENSITY];
    this.graphics.sphere.material.uniforms["mRefractionIntensity"].value =
        this.state.sliderControls[ControlSelect.REFRACTION_INTENSITY];
    this.graphics.sphere.material.uniforms["mRefractionRatio"].value =
        1.0 / RefractionIndex[this.state.refractionSwatchIndex];
};

// Render will animate the current position along the curve
// The animation will just keep looping over and over again
Application.prototype.render = function () {
    requestAnimationFrame(this.render.bind(this));
    //this.debug.stats.update();

    var time = new Date().getTime();
    var timeDelta =  (time - this.state.globalTimeStamp) / 1000;

    // 180
    if (timeDelta > 100) {
        this.interactionState = InteractionState.IDLE;
        this.setDisplay(DisplayState.IDLE);
    }
    // 195
    if (timeDelta > 150) {
        this.clearControls();
        this.initialize();
        this.interactionState = InteractionState.START;
        this.setDisplay(DisplayState.START);
    }
    else {
        if (this.state.displayState == DisplayState.ACTIVITY) {
            this.viewRender();
            this.state.interactionState = InteractionState.IDLE;
        } 
        else if (this.state.displayState == DisplayState.START) {
            this.state.globalTimeStamp = time;
            this.startRender();
            this.state.interactionState = InteractionState.IDLE;
        }
        else if (this.state.displayState == DisplayState.IDLE) {
            this.idleRender();
            this.state.interactionState = InteractionState.IDLE;
        }
    }
};

Application.prototype.viewRender = function () {
    if(this.state.updateCubeMap) {
        this.graphics.sphere.visible = false; // *cough*
        this.graphics.ground.material.uniforms["mShadowDisable"].value = 1.0;
        this.graphics.cubeCamera.updateCubeMap(this.graphics.webgl, this.graphics.scene);
        this.graphics.sphere.visible = true; // *cough*
        this.graphics.ground.material.uniforms["mShadowDisable"].value = 0.0;
        this.state.updateCubeMap = false;
    }
    this.graphics.orbit.update(false, true, true);
    this.graphics.webgl.render(
        this.graphics.scene,
        this.graphics.camera
    );
};

// TODO: Fix idle name variables to be start variables
Application.prototype.startRender = function () {
    var context = this.html.startCanvas.getContext('2d');
    var time = new Date().getTime();
    var timeDelta =  (time - this.state.idleTimeStamp) / 1000;
    if (timeDelta > 6) {
        var randomX = (Math.random() * 2.0) - 1.0;
        var randomY = (Math.random() * 2.0) - 1.0;
        this.state.idleOffset.set(
            Math.floor(randomX * this.html.startCanvas.width * 0.15),
            Math.floor(randomY * this.html.startCanvas.height * 0.15));
        this.state.idleTimeStamp = new Date().getTime();
    }

    context.fillStyle = "#002b40";
    context.fillRect(0, 0,
        this.html.startCanvas.width, this.html.startCanvas.height);
    var fontSize = 48 * (this.html.startCanvas.width / 1920);
    context.font = fontSize.toString() + "pt Arial";
    context.textAlign = 'center';
    context.fillStyle = '#ffffff';
    context.fillText("Touch the Screen to Begin",
        (this.html.startCanvas.width / 2.0) + this.state.idleOffset.x,
        (this.html.startCanvas.height / 2.0) + this.state.idleOffset.y);
};

Application.prototype.idleRender = function () {
    var context = this.html.idleCanvas.getContext('2d');
    context.fillStyle = "#b37700";
    context.fillRect(0, 0,
        this.html.idleCanvas.width, this.html.idleCanvas.height);
    var fontSize = 48 * (this.html.idleCanvas.width / 1920);
    context.font = fontSize + "pt Arial";
    context.textAlign = 'center';
    context.fillStyle = '#ffffff';
    context.fillText("Touch the Screen to Continue Working",
        this.html.idleCanvas.width / 2.0,
        this.html.idleCanvas.height / 2.0);    
};

Application.prototype.onIdleInterrupt = function (event) {
    this.state.globalTimeStamp = new Date().getTime();

    // Moving the mouse / touching does nothing when an animation is playing
    if (this.state.interactionState != InteractionState.ANIMATION) {
        this.state.interactionState = InteractionState.ACTION;
    }
    if(this.state.displayState == DisplayState.START ||
        this.state.displayState == DisplayState.IDLE) {
        this.setDisplay(DisplayState.ACTIVITY);
    }
};

Application.prototype.changeSwatch = function (event) {
    var swatch = event.target;

    if(swatch.swatchType == SwatchType.COLOR) {
        this.html.colorImage[this.state.colorSwatchIndex].style.borderColor = "rgba(246, 246, 246, 0.4)";
        this.state.colorSwatchIndex = swatch.swatchIndex;
        // this.html.colorImage[this.state.colorSwatchIndex].style.borderColor = "#f6f6f6";
        this.html.colorImage[this.state.colorSwatchIndex].style.borderColor = "rgba(246, 246, 246, 1.0)";

        this.graphics.colorMap = new THREE.ImageUtils.loadTexture(
            "images/color-" + swatch.swatchIndex.toString() +".jpg"
        );

        var number = ControlSelect.COLOR_INTENSITY.toString();
        var sliderName = "#slider-" + number;
        $(sliderName).val(this.state.sliderDefaults[number].toString());
        $(sliderName).slider("refresh");
        this.updateShader();
    }

    if(swatch.swatchType == SwatchType.NORMAL) {
        this.html.normalImage[this.state.normalSwatchIndex].style.borderColor = "rgba(246, 246, 246, 0.4)";
        this.state.normalSwatchIndex = swatch.swatchIndex;
        //this.html.normalImage[this.state.normalSwatchIndex].style.borderColor = "#f6f6f6";
        this.html.normalImage[this.state.normalSwatchIndex].style.borderColor = "rgba(246, 246, 246, 1.0)";

        this.graphics.normalMap = new THREE.ImageUtils.loadTexture(
            "images/normal-" + swatch.swatchIndex.toString() +".jpg"
        );

        if(this.state.sliderControls[ControlSelect.BUMPINESS] <= 0.1){
            var number = ControlSelect.BUMPINESS.toString();
            var sliderName = "#slider-" + number;
            $(sliderName).val((0.5).toString());
            $(sliderName).slider("refresh");
        }
        this.updateShader();
    }

    if(swatch.swatchType == SwatchType.REFRACTION) {
        this.html.refractionImage[this.state.refractionSwatchIndex].style.borderColor = "rgba(246, 246, 246, 0.4)";
        this.state.refractionSwatchIndex = swatch.swatchIndex;
        this.html.refractionImage[this.state.refractionSwatchIndex].style.borderColor = "rgba(246, 246, 246, 1.0)";

        if(this.state.sliderControls[ControlSelect.REFRACTION_INTENSITY] < 0.1){
            var number = ControlSelect.REFRACTION_INTENSITY.toString();
            var sliderName = "#slider-" + number;
            $(sliderName).val((0.5).toString());
            $(sliderName).slider("refresh");
        }
        this.updateShader();
    }
};

Application.prototype.onWindowResize = function () {
    this.html.startCanvas.width = window.innerWidth;
    this.html.startCanvas.height = window.innerHeight;

    this.html.idleCanvas.width = window.innerWidth;
    this.html.idleCanvas.height = window.innerHeight;

    this.html.controlArea.left = 0.70 * window.innerWidth;
    this.html.controlArea.width = 0.25 * window.innerWidth;
    //this.html.controlArea.height = 0.80 * window.innerHeight;

    this.html.viewCanvas.width = window.innerWidth;
    this.html.viewCanvas.height = window.innerHeight;

    this.graphics.webgl.setSize(
        this.html.viewCanvas.width,
        this.html.viewCanvas.height
    );
    this.graphics.camera.aspect =
        this.html.viewCanvas.width / this.html.viewCanvas.height;
    this.graphics.camera.updateProjectionMatrix();

    // update fonts and such
    this.html.screenRatio = window.innerWidth / 1920;
    var element;
    var length;
    var size;

    var fontSize;
    for(var s = 12; s <= 36; s += 2) {
        fontSize = "font" + s.toString();
        element = document.getElementsByClassName(fontSize);
        length = element.length;
        size = this.html.screenRatio * s;
        for(var i = 0; i < length; i++) {
            element[i].style.fontSize = size.toString() + "pt";
        }
    }

    var swatchSize = 48;
    for(var i = 0; i < this.html.colorImage.length; i++) {
        size = this.html.screenRatio * swatchSize;
        this.html.colorImage[i].style.width = size.toString() + "px";
    }

    for(var i = 0; i < this.html.normalImage.length; i++) {
        size = this.html.screenRatio * swatchSize;
        this.html.normalImage[i].style.width = size.toString() + "px";
    }

    for(var i = 0; i < this.html.refractionImage.length; i++) {
        size = this.html.screenRatio * swatchSize;
        this.html.refractionImage[i].style.width = size.toString() + "px";
    }

};


