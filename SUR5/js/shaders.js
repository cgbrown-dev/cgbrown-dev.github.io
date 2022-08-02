
// Normal, diffuse, texture, reflection, refraction, glossiness, and translucency
THREE.UberShader = {

    uniforms: {
        "mRefractionRatio": {
            type: "f",
            value: 1.0 / 1.5
        },
        "mRefractionIntensity": {
            type: "f",
            value: 0.0 
        },
        "mReflectionIntensity": {
            type: "f",
            value: 0.0
        },
        // "mRefractionBlurriness": {
        //     type: "f",
        //     value: 0.0 
        // },
        // "mReflectionBlurriness": {
        //     type: "f",
        //     value: 0.0
        // },
        "mBumpiness": {
            type: "f",
            value: 0.0
        },
        "mColorIntensity" : {
            type: "f",
            value: 1.0
        },
        "mMaxIntensity" : {
            type: "f",
            value: 1.0
        },
        "tTextureCube": {
            type: "t",
            value: null
        },
        "tTextureNormal": {
            type: "t",
            value: null
        },
        "tTextureColor": {
            type: "t",
            value: null
        }
    },


    vertexShader: [
        "varying vec3 vCameraToVertex;",
        "varying vec3 vNormal;",
        "varying mat3 vNormalMatrix;",
        "varying vec2 vUv;",

        "void main() {",

            "vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
            "vec4 worldPosition = modelMatrix * vec4(position, 1.0);",
            "vCameraToVertex = normalize(worldPosition.xyz - cameraPosition);",
            "vUv = uv;",
            "vNormal = normal;",
            "vNormalMatrix = mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz);",

            "gl_Position = projectionMatrix * mvPosition;",
        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform float mMaxIntensity;",
        "uniform float mColorIntensity;",
        "uniform samplerCube tTextureCube;",
        "uniform sampler2D tTextureNormal;",
        "uniform sampler2D tTextureColor;",
        "uniform float mBumpiness;",
        "uniform float mRefractionIntensity;",
        "uniform float mReflectionIntensity;",
        // "uniform float mRefractionBlurriness;",
        // "uniform float mReflectionBlurriness;",
        "uniform float mRefractionRatio;",
        
        "varying vec3 vCameraToVertex;",
        "varying vec3 vNormal;",
        "varying mat3 vNormalMatrix;",
        "varying vec2 vUv;",

        "float random(vec3 scale, float seed) {",
            "return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);",
        "}",

        "void main() {",

            "vec3 lightDirection[2];",
            "lightDirection[0] = vec3(0.0, 1.0, 0.0);",
            "lightDirection[1] = vec3(0.0, -1.0, 0.0);",
            "normalize(lightDirection[0]);",
            "normalize(lightDirection[1]);",

            // "vec2 wrapUV = vec2(mod(2.0 * vUv, 1.0));",
            "vec2 wrapUV = vUv;",
            "vec3 materialColor = mColorIntensity * texture2D(tTextureColor, wrapUV).rgb;",
            "vec3 maxColor = vec3(mMaxIntensity);",
            "vec3 reflectedColor = vec3(0.0);",
            "vec3 refractedColor = vec3(0.0);",

            // Code to modify the normal
            "vec3 normal = vec3(vNormal.xy + (mBumpiness * 2.0 * (texture2D(tTextureNormal, wrapUV).rg - 0.5)), vNormal.z);",
            "vec3 worldNormal = normalize(vNormalMatrix * normal);",

            "float diffuseCosTheta[2];",
            "diffuseCosTheta[0] = dot(worldNormal, lightDirection[0]);",
            "diffuseCosTheta[1] = dot(worldNormal, lightDirection[1]);",
            "diffuseCosTheta[0] = (diffuseCosTheta[0] + 0.6) / 1.6;",
            "if(diffuseCosTheta[0] < 0.0) {",
                "diffuseCosTheta[0] = 0.0;",
            "}",
            "if(diffuseCosTheta[1] < 0.0) {",
                "diffuseCosTheta[1] = 0.0;",
            "}",

            "vec3 initialReflect = reflect(vCameraToVertex, worldNormal);",
            "vec3 initialRefract = refract(vCameraToVertex, worldNormal, mRefractionRatio);",

            "vec3 specularReflect[2];",
            "specularReflect[0] = reflect(lightDirection[0], worldNormal);",
            "specularReflect[1] = reflect(lightDirection[1], worldNormal);",
            "float specularCosTheta[2];",
            "specularCosTheta[0] = dot(vCameraToVertex, specularReflect[0]);",
            "specularCosTheta[1] = dot(vCameraToVertex, specularReflect[1]);",
            "if(specularCosTheta[0] < 0.0) {",
                "specularCosTheta[0] = 0.0;",
            "}",
            "if(specularCosTheta[1] < 0.0) {",
                "specularCosTheta[1] = 0.0;",
            "}",

            // "vec3 randomVector;",
            // "vec3 randomReflect;",
            // "vec3 randomRefract;",
            "vec3 sampleReflect;",
            "vec3 sampleRefract;",
            // "float offset = 0.0;",

            //"for(int i = 0; i < 16; i++) {",
            //    "offset = float(i) * 3.0;",
                // "randomVector = vec3(",
                //     "random(vec3(1.29898, 7.8233, 15.17182), offset + 0.0) - 0.5,",
                //     "random(vec3(1.29898, 7.8233, 15.17182), offset + 1.0) - 0.5,",
                //     "random(vec3(1.29898, 7.8233, 15.17182), offset + 2.0) - 0.5",
                // ");",
                // "randomReflect = randomVector * 2.0 * mReflectionBlurriness;",
                // "randomRefract = randomVector * 2.0 * mRefractionBlurriness;",
            
                // "sampleReflect = initialReflect + randomReflect;",
                // "normalize(sampleReflect);",
                // "sampleRefract = initialRefract + randomRefract;",
                // "normalize(sampleRefract);",

                "sampleReflect = initialReflect;",
                "normalize(sampleReflect);",
                "sampleRefract = initialRefract;",
                "normalize(sampleRefract);",
                // "vec3 upVector = vec3(0.0, 1.0, 0.0);",

                // "float reflectCosTheta = dot(upVector, sampleReflect);",
                // "reflectCosTheta = clamp(reflectCosTheta, 0.0, 1.0);",
                // "float refractCosTheta = dot(upVector, sampleRefract);",
                // "refractCosTheta = clamp(refractCosTheta, 0.0, 1.0);",

                // "vec3 colorLight = vec3(0.4, 0.4, 0.4);",
                // "vec3 colorDark = vec3(0.2, 0.2, 0.2);",
                // "reflectedColor = mix(colorDark, colorLight, pow(reflectCosTheta, 0.5));",
                // "refractedColor = mix(colorDark, colorLight, pow(refractCosTheta, 0.5));",

                "reflectedColor += textureCube(",
                    "tTextureCube,",
                    // x was negated, made positive to fix mapping issues
                    "vec3(sampleReflect.x, sampleReflect.yz)",
                ").rgb;",
                "refractedColor += textureCube(",
                    "tTextureCube,",
                    // x was negated, made positive to fix mapping issues
                    "vec3(sampleRefract.x, sampleRefract.yz)",
                ").rgb;",
            //"}",

            // "reflectedColor *= vec3(mReflectionIntensity * 1.0 / 16.0);",
            // "refractedColor *= vec3(mRefractionIntensity * 1.0 / 16.0);",

            "reflectedColor *= vec3(mReflectionIntensity);",
            "refractedColor *= vec3(mRefractionIntensity);",

            
            "float diffuseBlend[2];",
            "diffuseBlend[0] = pow(diffuseCosTheta[0], 1.0);",
            "diffuseBlend[1] = pow(diffuseCosTheta[1], 1.0);",
            "float specularBlend[2];",
            "float specularIntensity = 4.0 + (50.0 * mReflectionIntensity);",
            "float specularBrightness = 0.25 + (0.5 * mReflectionIntensity);",
            "specularBlend[0] = pow(specularCosTheta[0], specularIntensity);",
            "specularBlend[1] = pow(specularCosTheta[1], specularIntensity);",
            "vec3 partialColor = ((1.0 - diffuseBlend[0]) * materialColor * 0.18) + (1.0 * diffuseBlend[0] * materialColor);",
            //"partialColor += ((1.0 - diffuseBlend[1]) * materialColor * 0.85) + (diffuseBlend[1] * materialColor);",
            "partialColor += specularBlend[0] * vec3(specularBrightness);",
            //"partialColor += specularBlend[1] * vec3(specularBrightness);",
            "vec3 totalColor = partialColor + reflectedColor + refractedColor;",
            "vec3 scaledColor = vec3(totalColor.rgb / (vec3(0.0 + (1.0 * specularBrightness)) + maxColor.rgb));",
            //"vec3 scaledColor = vec3(totalColor.rgb / (vec3(0.85 + (1.0 * specularBrightness)) + maxColor.rgb));",

            "gl_FragColor = vec4(scaledColor, 1.0);",
        "}"

    ].join("\n")
};

// Create gradient pattern, no lighting
THREE.GradientShader = {

    uniforms: {
    },

    vertexShader: [
        "varying vec3 vWorldPosition;",

        "void main() {",

            "vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
            "vec4 worldPosition = modelMatrix * vec4(position, 1.0);",
            "vWorldPosition = worldPosition.xyz;",

            "gl_Position = projectionMatrix * mvPosition;",
        "}"

    ].join("\n"),

    fragmentShader: [
        "varying vec3 vWorldPosition;",

        "void main() {",
            "vec3 colorLight = vec3(0.4, 0.4, 0.4);",
            "vec3 colorDark = vec3(0.2, 0.2, 0.2);",

            "vec3 upVector = vec3(0.0, 1.0, 0.0);",
            "vec3 rayVector = normalize(vWorldPosition);",

            "float cosTheta = dot(upVector, rayVector);",
            "cosTheta = clamp(cosTheta, 0.0, 1.0);",
            "float percent = pow(cosTheta, 0.5);",

            "gl_FragColor = vec4(mix(colorDark, colorLight, percent), 1.0);",
        "}"

    ].join("\n")
};



// Create checkerboard pattern, no lighting
THREE.CheckerboardShader = {

    uniforms: {
        "mRepeat": {
            type: "f",
            value: 16.0
        }
    },

    vertexShader: [
        "varying vec3 vCameraToVertex;",
        "varying vec2 vUv;",

        "void main() {",

            "vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
            "vec4 worldPosition = modelMatrix * vec4(position, 1.0);",
            "vCameraToVertex = normalize(worldPosition.xyz - cameraPosition);",
            "vUv = uv;",
            "gl_Position = projectionMatrix * mvPosition;",
        "}"

    ].join("\n"),

    fragmentShader: [
        "uniform float mRepeat;",
        "varying vec3 vCameraToVertex;",
        "varying vec2 vUv;",

        "void main() {",
            "vec3 colorLight = vec3(0.9, 0.9, 0.9);",
            "vec3 colorDark = vec3(0.1, 0.1, 0.1);",
            "vec3 colorAverage = vec3(0.5, 0.5, 0.5);",
            "vec3 color = colorLight;",
            "float percent = clamp((length(vCameraToVertex) - 0.025) / 0.1, 0.0, 1.0);",

            "if((mod(mRepeat * vUv.x, 1.0) < 0.5) ^^ (mod(mRepeat * vUv.y, 1.0) < 0.5)) {",
                "color = colorDark;",
            "}",
            "gl_FragColor = vec4(mix(color, colorAverage, percent), 1.0);",
        "}"

    ].join("\n")
};


// Repeat an image tile
THREE.ImageRepeatShader = {

    uniforms: {
        "mShadowDisable": {
            type: "f",
            value: 1.0
        },
        "mRepeat": {
            type: "f",
            value: 16.0
        },
        "tTextureColor": {
            type: "t",
            value: null
        }
    },

    vertexShader: [
        "varying vec3 vCameraToVertex;",
        "varying vec3 vWorldPosition;",
        "varying vec2 vUv;",

        "void main() {",
            "vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
            "vec4 worldPosition = modelMatrix * vec4(position, 1.0);",
            "vWorldPosition = worldPosition.xyz;",
            "vCameraToVertex = normalize(worldPosition.xyz - cameraPosition);",
            "vUv = uv;",
            "gl_Position = projectionMatrix * mvPosition;",
        "}"

    ].join("\n"),

    fragmentShader: [
        "uniform float mRepeat;",
        "uniform float mShadowDisable;",
        "uniform sampler2D tTextureColor;",
        "varying vec3 vCameraToVertex;",
        "varying vec3 vWorldPosition;",
        "varying vec2 vUv;",

        "#define PI 3.1415926535897932384626433832795",

        "float random(vec3 scale, float seed) {",
            "return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);",
        "}",

        "void main() {",
            "vec3 materialColor = texture2D(tTextureColor, vUv * mRepeat).rgb;",
            // "vec3 randomVector = vec3(",
            //     "random(vec3(1.29898, 7.8233, 15.17182), 0.0) - 0.5,",
            //     "random(vec3(1.29898, 7.8233, 15.17182), 1.0) - 0.5,",
            //     "random(vec3(1.29898, 7.8233, 15.17182), 2.0) - 0.5",
            // ");",
            // "randomVector *= 0.25;",
            // "float radius = length(vWorldPosition + randomVector);",
            "float radius = length(vWorldPosition);",
            "float maxRadius = 40.0;",
            "float percent = clamp((radius / maxRadius) + mShadowDisable, 0.0, 1.0);",
            "float exponential = 0.5 * (1.0 - cos(percent * PI));",
            "vec3 finalColor = materialColor * pow(exponential, 2.0);",

            "gl_FragColor = vec4(finalColor, 1.0);",
        "}"

    ].join("\n")
};



