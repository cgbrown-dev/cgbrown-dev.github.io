

Graphics = function () {
    this.webgl = null;
    this.scene = null;
    this.grid = null;
    this.camera = null;
    this.orbit = null;
    this.light = null;
    this.hemi = null;
    this.ambient = null;
    this.ground = null;

    this.geometry = null;
    this.material = null;

    this.initialize = function (html, state) {
        // Setup WebGL Renderer
        this.webgl = new THREE.WebGLRenderer({
            canvas : html.viewCanvas,
            antialias : true
        });
        this.webgl.setClearColor( "rgb(230, 230, 225)", 1.0);
        this.webgl.setSize(
            html.viewCanvas.width,
            html.viewCanvas.height
        );    
        this.scene = new THREE.Scene();

        // Setup Camera
        this.camera = new THREE.PerspectiveCamera(
            45.0,
            html.viewCanvas.width / html.viewCanvas.height,
            0.1, 100000.0
        );
        this.camera.position.set(50.0, 20.0, -50.0);
        var center = new THREE.Vector3(0.0, 5.0, 0.0);
        this.camera.lookAt(center);
        this.scene.add(this.camera);

        this.orbit = new THREE.OrbitControls(
            this.camera,
            html.viewCanvas
        );
        this.orbit.center.copy(center);
        this.orbit.maxPolarAngle = Math.PI * 0.5;

        // Setup Grid
        var material;
        var geometry;
        // this.grid = new THREE.GridHelper(50, 50 / 5);
        // this.grid.setColors(
        //     new THREE.Color(0x000000),
        //     new THREE.Color(0x000000)
        // );
        // this.scene.add(this.grid);
        // var gridOffset = 0.1;
        // this.grid.position.set(0.0, gridOffset, 0.0);

        // geometry = new THREE.Geometry();
        // geometry.vertices.push(
        //     new THREE.Vector3(0.0, 0.1 + gridOffset, 0),
        //     new THREE.Vector3(20, 0.1 + gridOffset, 0)
        // );
        // geometry.computeLineDistances();
        // material = new THREE.LineBasicMaterial({
        //     linewidth: 2,
        //     color: 0xff0000
        // });
        // this.scene.add(new THREE.Line(geometry, material));

        // geometry = new THREE.Geometry();
        // geometry.vertices.push(
        //     new THREE.Vector3(0, 0.1 + gridOffset, 20),
        //     new THREE.Vector3(0, 0.1 + gridOffset, 0.0)
        // );
        // geometry.computeLineDistances();
        // material = new THREE.LineBasicMaterial({
        //     linewidth: 2,
        //     color: 0x0000ff
        // });
        // this.scene.add(new THREE.Line(geometry, material));

        // Setup Light
        this.light = new THREE.PointLight(0xffffff, 1.0, 200.0);
        this.light.position.set(0.0, 100.0, 0.0 );
        this.scene.add(this.light);

        this.ambient = new THREE.AmbientLight(0x111111);
        this.scene.add(this.ambient);

        this.hemi = new THREE.HemisphereLight(0xcccccc, 0x140e07, 0.25);
        this.scene.add(this.hemi);

        // Setup Ground
        geometry = new THREE.PlaneGeometry(100, 100);
        material = new THREE.MeshLambertMaterial(
            {color: 0x221815, side: THREE.DoubleSide}
        );
        this.ground = new THREE.Mesh(geometry, material);
        this.ground.rotation.x = 90.0 * RAD;
        this.scene.add(this.ground);

        //Grass
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.MeshBasicMaterial(
            {color: 0xffffff, side: THREE.DoubleSide, vertexColors: THREE.VertexColors}
        );
    };


    this.update = function (workData, indexBufferLength, geometryBufferLength) {

        if(this.grass != null) {
            this.scene.remove(this.grass);
            this.geometry.dispose();
            this.geometry = new THREE.BufferGeometry();
        }

        this.geometry.attributes = {
            index: {
                itemSize: 1,
                array: workData.indexBuffer,
                numItems: indexBufferLength
            },
            position: {
                itemSize: 3,
                array: workData.vertexBuffer,
                numItems: geometryBufferLength
            },
            color: {
                itemSize: 3,
                array: workData.colorBuffer,
                numItems: geometryBufferLength
            }
        }
        this.geometry.offsets = [{
            start: 0, 
            count: indexBufferLength,
            index: 0
        }];

        // Setup Grass
  
        this.grass = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.grass);
    };

};

