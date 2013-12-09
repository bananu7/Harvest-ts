// Interface
///<reference path="lib/WebGL.d.ts" />
///<reference path="lib/gl-matrix.d.ts" />
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.getDistanceTo = function (other) {
        var x = this.x - other.x;
        var y = this.y - other.y;
        return Math.sqrt(x * x + y * y);
    };

    Point.prototype.getDirectionTo = function (other) {
        return Math.atan2(other.y - this.y, other.x - this.x);
    };
    return Point;
})();

var Color = (function () {
    //constructor(public r: number, public g: number, public b: number) { }
    function Color(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.a = a || 1.0;
    }
    Color.white = new Color(1.0, 1.0, 1.0, 1.0);
    Color.black = new Color(0.0, 0.0, 0.0, 1.0);
    return Color;
})();

var WebGLDrawer = (function () {
    function WebGLDrawer(gl, size) {
        this.gl = gl;
        this.vertCode = 'attribute vec2 position;' + 'uniform mat4 viewMat;' + 'void main(void) {' + '  gl_Position = viewMat * vec4(position, 0.0, 1.0);' + '}';
        this.fragCode = 'precision lowp float;' + 'uniform vec4 color;' + 'void main(void) {' + '   gl_FragColor = color;' + '}';
        this.VBO = gl.createBuffer();
        this.gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);

        this.screenSize = size;
        this.screenOffset = new Point(0, 0);

        this.initShaders();
    }
    WebGLDrawer.prototype.recalcMatrices = function () {
        this.viewMatrix = mat4.ortho(0, this.screenSize.x, this.screenSize.y, 0, -1, 1);

        var offsetVec = vec4.createFrom(-this.screenOffset.x, -this.screenOffset.y, 0, 0);
        this.viewMatrix = mat4.translate(this.viewMatrix, offsetVec);

        var viewMatrixLocation = this.gl.getUniformLocation(this.shaderProgram, "viewMat");
        this.gl.uniformMatrix4fv(viewMatrixLocation, false, this.viewMatrix);
        this.gl.viewport(0, 0, this.screenSize.x, this.screenSize.y);
    };

    WebGLDrawer.prototype.setDrawingOffset = function (offset) {
        this.screenOffset = offset;
        this.recalcMatrices();
    };

    WebGLDrawer.prototype.resize = function (width, height) {
        this.screenSize.x = width;
        this.screenSize.y = height;
        this.recalcMatrices();
    };

    WebGLDrawer.prototype.enableBindings = function () {
        this.gl.useProgram(this.shaderProgram);

        var coordinatesVar = this.gl.getAttribLocation(this.shaderProgram, "position");
        this.gl.enableVertexAttribArray(coordinatesVar);
        this.gl.vertexAttribPointer(coordinatesVar, 2, this.gl.FLOAT, false, 0, 0);
    };

    WebGLDrawer.prototype.setShaderColor = function (color) {
        var colorLocation = this.gl.getUniformLocation(this.shaderProgram, "color");
        this.gl.uniform4f(colorLocation, color.r, color.g, color.b, color.a);
    };

    WebGLDrawer.prototype.initShaders = function () {
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

        this.resize(this.screenSize.x, this.screenSize.y);
    };

    WebGLDrawer.prototype.drawCircle = function (center, radius, color, filled) {
        if (typeof color === "undefined") { color = Color.white; }
        if (typeof filled === "undefined") { filled = true; }
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

        if (filled)
            this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, count);
        else {
            this.gl.drawArrays(this.gl.LINE_LOOP, 0, count);
        }
    };

    WebGLDrawer.prototype.drawLine = function (a, b, color) {
        if (typeof color === "undefined") { color = Color.white; }
        color = color || Color.white;

        var lineData = [a.x, a.y, b.x, b.y];
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lineData), this.gl.STREAM_DRAW);

        this.enableBindings();
        this.setShaderColor(color);

        this.gl.drawArrays(this.gl.LINES, 0, 2);
    };

    WebGLDrawer.prototype.drawSquare = function (center, size, color) {
        if (typeof color === "undefined") { color = Color.white; }
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

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4);
    };
    return WebGLDrawer;
})();
//# sourceMappingURL=drawer.js.map
