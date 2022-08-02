
Grass = function (area, width, minColor, maxColor, minLength, maxLength, minBend, maxBend) {
    this.rangeLength = maxLength - minLength;
    this.centerLength = (maxLength + minLength) * 0.5;
    this.rangeBend = maxBend - minBend;
    this.centerBend = (maxBend + minBend) * 0.5;
    this.rangeColor = new THREE.Vector3();
    this.rangeColor.subVectors(maxColor, minColor);
    this.centerColor = new THREE.Vector3();
    this.centerColor.addVectors(maxColor, minColor);
    this.centerColor.multiplyScalar(0.5);
    this.grassColor = new THREE.Vector3();
    this.grassX = 0.0;
    this.grassY = 0.0;
    this.grassArea = area;
    this.grassWidth = width;
    this.grassLength = 0.0;
    this.grassBend = 0.0;

    this.startPoint = new THREE.Vector3();
    this.straightPoint = new THREE.Vector3();
    this.endOffset = new THREE.Vector3();
    this.endPoint = new THREE.Vector3();
    this.bendOffset = new THREE.Vector3();
    this.bendPoint = new THREE.Vector3();

    this.upVector = new THREE.Vector3(0.0, 1.0, 0.0);
    this.xAxis = new THREE.Vector3();
    this.yAxis = new THREE.Vector3();
    this.zAxis = new THREE.Vector3();

    this.midPoint = new THREE.Vector3();
    this.vertexDirection = new THREE.Vector3();
    this.tangentDirection = new THREE.Vector3();
    this.bendDirection = new THREE.Vector3();
    this.curvePoint = new THREE.Vector3();
    this.vertexPoint = new THREE.Vector3();

    this.t = 0.0;
    this.vertexCount = 0;
    this.indexStart = 0;
    this.colorVariation = 0.0;

    // This will update by reference.
    this.curve = new THREE.SplineCurve3(
        [this.startPoint, this.straightPoint, this.bendPoint, this.endPoint]
    );
}

// iGrass may not be needed at all
Grass.prototype.compute = function (i, workData) {
    // Generate random cartesian coordinates, grass length, and grass bend amount.
    this.grassX = 2.0 * (Math.random() - 0.5) * this.grassArea;
    this.grassY = 2.0 * (Math.random() - 0.5) * this.grassArea;
    this.grassLength = ((Math.random() - 0.5) * this.rangeLength) + this.centerLength;
    this.grassBend = ((Math.random() - 0.5) * this.rangeBend) + this.centerBend;
    this.grassColor.copy(this.rangeColor);
    this.grassColor.multiplyScalar(Math.random() - 0.5);
    this.grassColor.addVectors(this.grassColor, this.centerColor);

    // Generate the random start point.
    this.startPoint.set(
        this.grassX,
        0.0,
        this.grassY
    );

    this.straightPoint.set(
        this.grassX,
        this.grassLength * 0.1,
        this.grassY
    );
// console.log("Start Point x: " + this.startPoint.x);
// console.log("Start Point y: " + this.startPoint.y);
// console.log("Start Point z: " + this.startPoint.z);

    // Generate the random end offset.
    //
    // Adjust the component ranges to fine tune the style of the grass.
    this.endOffset.set(
        (Math.random() - 0.5) * this.grassBend * this.grassLength,
        (Math.random() * 0.5 * 0.9 * this.grassLength * (1.0 - this.grassBend)) + (0.5 * this.grassLength),
        (Math.random() - 0.5) * this.grassBend * this.grassLength
    );
// console.log("End Offset x: " + this.endOffset.x);
// console.log("End Offset y: " + this.endOffset.y);
// console.log("End Offset z: " + this.endOffset.z);

    // Generate the random bend offset.
    //
    // Bend Offset is a random sampled point in the plane whose normal
    // is End Offset.
    //
    // The plane must be defined in terms of orthogonal vectors. The
    // coplanar vectors (X and Y) are used to randomly sample a
    // coplanar point.
    this.zAxis.copy(this.endOffset);
    this.zAxis.normalize();
    this.xAxis.crossVectors(this.zAxis, this.upVector);
    this.xAxis.normalize();
    this.yAxis.crossVectors(this.xAxis, this.zAxis);
    this.yAxis.normalize();
    this.bendOffset.addVectors(
        this.xAxis.multiplyScalar(this.grassBend),
        this.yAxis.multiplyScalar(this.grassBend)
    );

    // Generate the end point and bend point.
    this.endPoint.addVectors(this.straightPoint, this.endOffset);
// console.log("End Point x: " + this.endPoint.x);
// console.log("End Point y: " + this.endPoint.y);
// console.log("End Point z: " + this.endPoint.z);
    this.bendPoint.addVectors(this.straightPoint, this.endPoint);
    this.bendPoint.multiplyScalar(0.5);
    this.bendPoint.addVectors(this.bendPoint, this.bendOffset);
// console.log("Bend Point x: " + this.bendPoint.x);
// console.log("Bend Point y: " + this.bendPoint.y);
// console.log("Bend Point z: " + this.bendPoint.z);

    // No need to generate the curve, it will update by reference from
    // the constructor where it was initialized.


// TODO
//
// This is where things get messy. 
    this.midPoint.addVectors(this.straightPoint, this.endPoint);
    this.midPoint.multiplyScalar(0.5);
    this.bendDirection.subVectors(this.bendPoint, this.midPoint);
    this.bendDirection.normalize();

    this.vertexCount = 0;
    this.indexStart = Math.floor(i.buffer / 3);
    this.t = 0.0;
    this.colorVariation = 0.2 * (2.0 * (Math.random() - 0.5));
    while(this.t < 1.001) {
        this.tangentDirection.copy(this.curve.getTangent(this.t));
        this.vertexDirection.crossVectors(this.tangentDirection, this.bendDirection);
        this.vertexDirection.normalize();
        this.vertexDirection.multiplyScalar(0.025 + (this.grassWidth * (1.0 - this.t)));
        this.curvePoint.copy(this.curve.getPoint(this.t));

        this.vertexPoint.addVectors(this.curvePoint, this.vertexDirection);
        // add vertex to geometry
        // color or normal info could be added here too
        workData.vertexBuffer[i.buffer] = this.vertexPoint.x;
        workData.colorBuffer[i.buffer] = (this.t * this.grassColor.x) + this.colorVariation;
        i.buffer++;
        workData.vertexBuffer[i.buffer] = this.vertexPoint.y;
        workData.colorBuffer[i.buffer] = (this.t * this.grassColor.y) + this.colorVariation;
        i.buffer++;
        workData.vertexBuffer[i.buffer] = this.vertexPoint.z;
        workData.colorBuffer[i.buffer] = (this.t * this.grassColor.z) + this.colorVariation;
        i.buffer++;
        

        this.vertexPoint.addVectors(this.curvePoint, this.vertexDirection.multiplyScalar(-1.0));
        // add vertex to geometry
        // color or normal info could be added here too
        workData.vertexBuffer[i.buffer] = this.vertexPoint.x;
        workData.colorBuffer[i.buffer] = (this.t * this.grassColor.x) + this.colorVariation;
        i.buffer++;
        workData.vertexBuffer[i.buffer] = this.vertexPoint.y;
        workData.colorBuffer[i.buffer] = (this.t * this.grassColor.y) + this.colorVariation;
        i.buffer++;
        workData.vertexBuffer[i.buffer] = this.vertexPoint.z;
        workData.colorBuffer[i.buffer] = (this.t * this.grassColor.z) + this.colorVariation;
        i.buffer++;

        this.vertexCount += 2;
        this.t += T_INCREMENT;
    }

    for(var n = 0; n < this.vertexCount-3; n += 2) {
// console.log(this.indexStart);
        // i++ vs ++i vs i+=1, which is faster?
        workData.indexBuffer[i.index++] = this.indexStart + 1;
        workData.indexBuffer[i.index++] = this.indexStart;
        workData.indexBuffer[i.index++] = this.indexStart + 2;

        workData.indexBuffer[i.index++] = this.indexStart + 2;
        workData.indexBuffer[i.index++] = this.indexStart + 3;
        workData.indexBuffer[i.index++] = this.indexStart + 1;
        this.indexStart += 2;
    }

    // // compute normals
};

// iGrass may not be needed at all
Grass.prototype.zeros = function (i, workData) {
    this.vertexCount = 0;
    this.indexStart = Math.floor(i.buffer / 3);
    this.t = 0.0;
    while(this.t < 1.001) {
        // add vertex to geometry
        // color or normal info could be added here too
        workData.vertexBuffer[i.buffer] = 0.0;
        workData.colorBuffer[i.buffer] = 0.0;
        i.buffer++;
        workData.vertexBuffer[i.buffer] = 0.0;
        workData.colorBuffer[i.buffer] = 0.0;
        i.buffer++;
        workData.vertexBuffer[i.buffer] = 0.0;
        workData.colorBuffer[i.buffer] = 0.0;
        i.buffer++;     

        workData.vertexBuffer[i.buffer] = 0.0;
        workData.colorBuffer[i.buffer] = 0.0;
        i.buffer++;
        workData.vertexBuffer[i.buffer] = 0.0;
        workData.colorBuffer[i.buffer] = 0.0;
        i.buffer++;
        workData.vertexBuffer[i.buffer] = 0.0;
        workData.colorBuffer[i.buffer] = 0.0;
        i.buffer++;

        this.vertexCount += 2;
        this.t += T_INCREMENT;
    }

    for(var n = 0; n < this.vertexCount-3; n += 2) {
        // i++ vs ++i vs i+=1, which is faster?
        workData.indexBuffer[i.index++] = this.indexStart + 1;
        workData.indexBuffer[i.index++] = this.indexStart;
        workData.indexBuffer[i.index++] = this.indexStart + 2;

        workData.indexBuffer[i.index++] = this.indexStart + 2;
        workData.indexBuffer[i.index++] = this.indexStart + 3;
        workData.indexBuffer[i.index++] = this.indexStart + 1;
        this.indexStart += 2;
    }
};