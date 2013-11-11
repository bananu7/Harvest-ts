// Interface
///<reference path="lib/WebGL.d.ts" />
///<reference path="lib/gl-matrix.d.ts" />

class Point {
    constructor(public x: number, public y: number) { }

    getDistanceTo(other: Point) {
        var x = this.x - other.x;
        var y = this.y - other.y;
        return Math.sqrt(x*x + y*y);
    }

    getDirectionTo(other: Point) {
        return Math.atan2(other.y - this.y, other.x - this.x) 
    }
}

class Color {
    //constructor(public r: number, public g: number, public b: number) { }
    constructor(public r: number, public g: number, public b: number, public a?: number) {
        this.a = a || 1.0;
    }

    static white = new Color(1.0, 1.0, 1.0, 1.0);
    static black = new Color(0.0, 0.0, 0.0, 1.0);
}

interface IDrawer {
    drawCircle(center: Point, radius: number, color?: Color);
    drawLine(a: Point, b: Point, color?: Color);
    drawSquare(center: Point, size: number, color?: Color);
}

class WebGLDrawer implements IDrawer {
    vertCode =
    'attribute vec2 position;' +
    'uniform mat4 viewMat;' +
    'void main(void) {' +
    '  gl_Position = viewMat * vec4(position, 0.0, 1.0);' +
    '}';
    fragCode =
    'precision lowp float;' +
    'uniform vec4 color;' +
    'void main(void) {' +
    '   gl_FragColor = color;' +
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

    private setShaderColor(color: Color) {
        var colorLocation = this.gl.getUniformLocation(this.shaderProgram, "color");
        this.gl.uniform4f(colorLocation, color.r, color.g, color.b, color.a);
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

    drawCircle(center: Point, radius: number, color: Color = Color.white) {
        var circleData = [];
        var count = Math.max(8, Math.ceil(radius / 2));

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
        this.setShaderColor(color);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, count);
    }

    drawLine(a: Point, b: Point, color: Color = Color.white) {
        color = color || Color.white;

        var lineData = [a.x, a.y, b.x, b.y];
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lineData), this.gl.STREAM_DRAW);

        this.enableBindings();
        this.setShaderColor(color);

        this.gl.drawArrays(gl.LINES, 0, 2);
    }

    drawSquare(center: Point, size: number, color: Color = Color.white) {
        size /= 2;
        var squareData = [
            center.x - size, center.y - size,
            center.x + size, center.y - size,
            center.x + size, center.y + size,
            center.x - size, center.y + size
        ];

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(squareData), this.gl.STREAM_DRAW);

        this.enableBindings();
        this.setShaderColor(color);

        this.gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
}
