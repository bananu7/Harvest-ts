///<reference path="drawer.ts" />
///<reference path="harvest.ts" />
var WebGLUtils;
var gl;
var game;
var drawer;

function tick() {
    window.requestAnimationFrame(tick);

    gl.clearColor(0.3, 0.3, 0.3, 1.);
    gl.clear(gl.COLOR_BUFFER_BIT);

    game.update();
    game.draw();
}

window.onload = function () {
    game = new Game;

    var canvas = document.getElementById('mainCanvas');
    canvas.addEventListener("mousedown", function (event) {
        var x = event.clientX;
        var y = event.clientY;

        var canvas = document.getElementById("mainCanvas");

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        game.mouseDown(new Point(x, y), event.button);
    }, false);

    canvas.addEventListener("mousemove", function (event) {
        var x = event.clientX;
        var y = event.clientY;

        var canvas = document.getElementById("mainCanvas");

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        game.mouseMove(new Point(x, y));
    }, false);

    canvas.addEventListener("mouseout", function () {
        game.mouseOut();
    });

    //gl = <WebGLRenderingContext> canvas.getContext('webgl');
    gl = WebGLUtils.create3DContext(canvas);

    //gl = WebGLUtils.setupWebGL(canvas);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    drawer = new WebGLDrawer(gl, new Point(canvas.width, canvas.height));

    var resize = function () {
        var mainCanvas = $("#mainCanvas");
        var newX = mainCanvas.width();
        var newY = mainCanvas.height();

        game.screenSize.x = newX;
        game.screenSize.y = newY;
        drawer.resize(newX, newY);
        canvas.width = newX;
        canvas.height = newY;
    };
    window.addEventListener("resize", resize);

    // important - initial sizing based on measurement.
    resize();

    tick();
};

function showModalWindow(name) {
    $("#center-window").children("div").hide();
    $("#" + name).show();
    $("#center-window").show();
}
//# sourceMappingURL=app.js.map
