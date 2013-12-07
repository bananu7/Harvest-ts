///<reference path="drawer.ts" />
///<reference path="harvest.ts" />

var gl;
var game : Game;
var drawer: IDrawer;

function tick() {
    window.requestAnimationFrame(tick);
   
    gl.clearColor(0.3, 0.3, 0.3, 1.);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawer.drawLine(new Point(10, 10), new Point(100, 100));

    game.update();
    game.draw();
}

window.onload = () => {
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

    gl = <WebGLRenderingContext> canvas.getContext('webgl');
    //gl = WebGLUtils.setupWebGL(canvas);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    drawer = new WebGLDrawer(gl, new Point(canvas.width, canvas.height));

    game = new Game;

    var resize = function () {
        var newX = $("#mainCanvas").width();
        var newY = $("#mainCanvas").height();

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

