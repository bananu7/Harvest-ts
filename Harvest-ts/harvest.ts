// Interface
///<reference path="drawer.ts" />
///<reference path="lib/jquery.d.ts" />

declare var drawer: IDrawer;
declare var ui: Ui;

interface IActor {
    position: Point;
    draw();
    update();
}

class Ui {
    static addButton(name: string, callback: (JQueryEventObject) => any) {
        $("#units-ui").append(
            $('<div>')
                .html(name)
                .addClass('button')
                .addClass('Grid-cell')
                .click(callback)
            );
    }
}

class Game {
    objects: IActor[];
    clickMode: string = null;

    constructor() {
        this.objects = [];
        Ui.addButton("Harvester",
            (event) => this.clickMode = Units.Harvester.kind());
        Ui.addButton("Rock",
            (event) => this.clickMode = Units.Rock.kind());
    }

    public draw() {
        this.objects.forEach((o) => o.draw());
    }

    public addObject(object: IActor) {
        this.objects.push(object);
    }

    public mouseDown(position: Point) {
        switch (this.clickMode) {
            case "harvester":
                this.addObject(new Units.Harvester(position));
                break;
            case "rock":
                this.addObject(new Units.Rock(position));
                break;
        }
    }
}

// Module
module Units {
    export class Harvester implements IActor {
        constructor(public position: Point) { }

        public static kind() {
            return "harvester";
        }

        draw() {
            drawer.drawCircle(this.position, 10);
        }
        update() {
        }
    }

    export class Rock implements IActor {
        constructor(public position: Point) { }

        public static kind() {
            return "rock";
        }

        draw() {
            drawer.drawCircle(this.position, 15);
        }
        update() {
        }
    }
}
