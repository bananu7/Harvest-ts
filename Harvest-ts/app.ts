///<reference path="drawer.ts" />
///<reference path="harvest.ts" />

var WebGLUtils;
var gl;
var game : Game;
var drawer: IDrawer;

function tick() {
    window.requestAnimationFrame(tick);

    gl.clearColor(0.3, 0.3, 0.3, 1.);
    gl.clear(gl.COLOR_BUFFER_BIT);

    game.update();
    game.draw();
}

function fullscreen() {
    var elem = <any>document.getElementById("content");
    console.log(elem);
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen();
    }
    elem.style.width = "100%";
    elem.style.height = "100%";
    resize();
}

function resize () {
    var canvas = <any>document.getElementById('mainCanvas');
    var newX = canvas.clientWidth;
    var newY = canvas.clientHeight;

    game.screenSize.x = newX;
    game.screenSize.y = newY;
    drawer.resize(newX, newY);
    canvas.width = newX;
    canvas.height = newY;
};

window.onload = () => {
    game = new Game;

    var offsetToCanvasPos = function (x: number, y: number): Point {
        var canvas = document.getElementById("mainCanvas");

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        return new Point(x, y);
    };

    var canvas = <any>document.getElementById('mainCanvas');
    canvas.addEventListener("mousedown", function (event) {
        var x = event.clientX;
        var y = event.clientY;
        game.mouseDown(offsetToCanvasPos(x, y), event.button);
    }, false);

    canvas.addEventListener("mousemove", function (event) {
        var x = event.clientX;
        var y = event.clientY;
        game.mouseMove(offsetToCanvasPos(x, y));
    }, false);

    canvas.addEventListener('touchstart', function (event) {
        var touch = event.touches[0];
        var x = touch.clientX;
        var y = touch.clientY;
        game.touchStart(offsetToCanvasPos(x, y));
    }, false);
    canvas.addEventListener('touchmove', function (event) {
        var touch = event.touches[0];
        var x = touch.clientX;
        var y = touch.clientY;
        game.touchMove(offsetToCanvasPos(x, y));
        event.preventDefault();
    }, false);

    canvas.addEventListener("mouseout", function() {
        game.mouseOut();
    });

    //gl = <WebGLRenderingContext> canvas.getContext('webgl');
    gl = <WebGLRenderingContext> WebGLUtils.create3DContext(canvas);
    //gl = WebGLUtils.setupWebGL(canvas);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    drawer = new WebGLDrawer(gl, new Point(canvas.width, canvas.height));

    window.addEventListener("resize", resize);

    // important - initial sizing based on measurement.
    resize();

    tick();
};

function showModalWindow(name:string) {
    $("#center-window").children("div").hide();
    $("#" + name).show();
    $("#center-window").show();
}

