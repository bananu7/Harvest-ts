///<reference path="drawer.ts" />
///<reference path="harvest.ts" />
///<reference path="webgl-utils.d.ts" />

var gl;
var game;
var drawer: IDrawer;


function tick() {
    window.requestAnimationFrame(tick);
   
    gl.clearColor(0., 0., 0., 1.);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawer.drawLine(new Point(10, 10), new Point(100, 100));

    //drawer.drawCircle(new Point(200, 200), 20);
    //drawer.drawCircle(new Point(250, 200), 30);
    game.draw();
}

window.onload = () => {
    var canvas = <any>document.getElementById('mainCanvas');
    canvas.addEventListener("mousedown", function (event) {
        var x = event.x;
        var y = event.y;

        var canvas = document.getElementById("canvas");

        x -= canvas.offsetLeft;
        y -= canvas.offsetTop;

        game.mouseDown(new Point(x, y));
    }, false);


    gl = <WebGLRenderingContext> canvas.getContext('webgl');
    //gl = WebGLUtils.setupWebGL(canvas);
    canvas.width = 500;
    canvas.height = 500;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    drawer = new WebGLDrawer(gl);

    game = new Game;
    game.addObject(new Units.Rock(new Point(400, 400)));

    tick();
};