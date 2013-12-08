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

window.onload = () => {
    game = new Game;

    var canvas = <any>document.getElementById('mainCanvas');
    canvas.addEventListener("mousedown", function (event) {
        var x = event.x;
        var y = event.y;

        var canvas = document.getElementById("mainCanvas");

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        game.mouseDown(new Point(x, y));
    }, false);

    canvas.addEventListener("mousemove", function (event) {
        var x = event.x;
        var y = event.y;

        var canvas = document.getElementById("mainCanvas");

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        game.mouseMove(new Point(x,y));
    }, false);

    canvas.addEventListener("mouseout", function() {
        game.mouseOut();
    });

    //gl = <WebGLRenderingContext> canvas.getContext('webgl');
    gl = <WebGLRenderingContext> WebGLUtils.create3DContext(canvas);
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

function showModalWindow(name:string) {
    $("#center-window").children("div").hide();
    $("#" + name).show();
    $("#center-window").show();
}

