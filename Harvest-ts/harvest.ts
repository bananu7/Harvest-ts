// Interface
///<reference path="drawer.ts" />

declare var drawer: IDrawer;

interface IActor {
    position: Point;
    draw();
    update();
}

class Game {
    objects: IActor[];

    constructor() {
        this.objects = [];
    }

    public draw() {
        this.objects.forEach((o) => o.draw());
    }

    public addObject(object: IActor) {
        this.objects.push(object);
    }

    public mouseDown(position : Point) {

        alert("x:" + x + " y:" + y);
    }
}

// Module
module Units {
    export class Harvester implements IActor {
        constructor(public position: Point) { }
        draw() {
            drawer.drawCircle(this.position, 10);
        }
        update() {
        }
    }

    export class Rock implements IActor {
        constructor(public position: Point) { }

        draw() {
            drawer.drawCircle(this.position, 15);
        }
        update() {
        }
    }
}
