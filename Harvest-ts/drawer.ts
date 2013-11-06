// Interface
///<reference path="lib/WebGL.d.ts" />
///<reference path="lib/gl-matrix.d.ts" />

class Point {
    constructor(public x: number, public y: number) { }

    getDist(other : Point) { return Math.sqrt(this.x * this.x + this.y * this.y); }
}

class Color {
    //constructor(public r: number, public g: number, public b: number) { }
    constructor(public r: number, public g: number, public b: number, public a?: number) {
        this.a = a || 1.0;
    }
}

interface IDrawer {
    drawCircle(center: Point, radius: number);
    drawLine(a: Point, b: Point);
}

class WebGLDrawer implements IDrawer {
    vertCode  =
        'attribute vec2 position;' +
        'uniform mat4 viewMat;' +
        'void main(void) {' +
        '  gl_Position = viewMat * vec4(position, 0.0, 1.0);' +
        '}';
    fragCode = 
        'void main(void) {' +
        '   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);' +
        '}';
    shaderProgram: WebGLProgram;
    viewMatrix: Float32Array;
    VBO: WebGLBuffer;

    constructor(private gl: WebGLRenderingContext) {
        this.VBO = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);

        this.viewMatrix = mat4.ortho(0, 1280, 800, 0, -1, 1);

        this.initShaders();
    }

    private enableBindings() {
        this.gl.useProgram(this.shaderProgram);

        var coordinatesVar = this.gl.getAttribLocation(this.shaderProgram, "position");
        this.gl.enableVertexAttribArray(coordinatesVar);
        this.gl.vertexAttribPointer(coordinatesVar, 2, this.gl.FLOAT, false, 0, 0);
    }

    private initShaders() {
        var vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertShader, this.vertCode);
        this.gl.compileShader(vertShader);
        if (!this.gl.getShaderParameter(vertShader, this.gl.COMPILE_STATUS))
            throw new Error(this.gl.getShaderInfoLog(vertShader));

        var fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragShader, this.fragCode);
        this.gl.compileShader(fragShader);
        if (!this.gl.getShaderParameter(fragShader, this.gl.COMPILE_STATUS))
            throw new Error(this.gl.getShaderInfoLog(fragShader));

        // Put the vertex shader and fragment shader together into
        // a complete program
        //
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertShader);
        this.gl.attachShader(this.shaderProgram, fragShader);
        this.gl.linkProgram(this.shaderProgram);
        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS))
            throw new Error(this.gl.getProgramInfoLog(this.shaderProgram));

        this.gl.useProgram(this.shaderProgram);

        var viewMatrixLocation = this.gl.getUniformLocation(this.shaderProgram, "viewMat");
        this.gl.uniformMatrix4fv(viewMatrixLocation, false, this.viewMatrix);
    }

    drawCircle(center: Point, radius: number) {
        var circleData = [];

        var count = Math.max(8, radius / 2);

        for (var i = 0; i < count; ++i) {
            var theta = (i / count) * Math.PI * 2.0;

            circleData.push(Math.cos(theta) * radius + center.x);
            circleData.push(Math.sin(theta) * radius + center.y);
        }
        circleData.push(Math.cos(0) * radius + center.x);
        circleData.push(Math.sin(0) * radius + center.y);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(circleData), this.gl.STREAM_DRAW);

        this.enableBindings();

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, count);
    }

    drawLine(a: Point, b: Point) {
        var lineData = [a.x, a.y, b.x, b.y];
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lineData), this.gl.STREAM_DRAW);

        this.enableBindings();

        this.gl.drawArrays(gl.LINES, 0, 2);
    }
}
