// Interface
///<reference path="drawer.ts" />
///<reference path="lib/jquery.d.ts" />

declare var drawer: IDrawer;
declare var ui: Ui;
declare var game: Game;

interface IActor {
    position: Point;
    energy: number;

    getKind(): string;
    flaggedForDeletion(): boolean;

    draw();
    update();
    getId(): number;
}

function randomInt(a: number, b: number): number {
    return Math.floor((Math.random() * b) + a);
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
            (event) => this.clickMode = Units.Harvester.prototype.getKind());
        Ui.addButton("Rock",
            (event) => this.clickMode = Units.Rock.prototype.getKind());
    }

    public draw() {
        this.objects.forEach((o) => o.draw());
    }

    public update() {
        this.objects.forEach((o) => o.update());
        this.objects = this.objects.filter((object) => !object.flaggedForDeletion());
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

    public query(location: Point, range: number, idFilter: number, kindFilter: string[]= []) {
        /*local function icontains(table, elem)
            for k, v in ipairs(table) do
                if v == elem then
                    return true
                end
            end
            return false
        end*/

        var result: IActor[] = [];
        this.objects.forEach((object) => {
            if (object.position.getDistance(location) <= range) {
                if (object.getId() != idFilter) {
                    if (kindFilter.indexOf(object.getKind()) > -1) {
                        result.push(object);
                    }
                }
            }
        });
        return result;
    }
}

//export query : 

// Module
module Units {
    export class Harvester implements IActor {
        private id: number;
        public getId(): number {
            return this.id;
        }

        public getKind(): string { return "harvester"; }
        public energy: number = 1000;
        private target: IActor;

        private _flaggedForDeletion: boolean = false;
        public flaggedForDeletion(): boolean { return this._flaggedForDeletion; }

        constructor(public position: Point) {
        }

        draw() {
            drawer.drawCircle(this.position, 10, new Color(0.314, 0.863, 0.471));
            if (this.target) {
                //if (this.energy > 0) {
                    drawer.drawLine(this.position, this.target.position, new Color(1.0, 1.0, 1.0));
                //}
            }
        }
        update() {
            var target = this.target;
            var possibleTargets = ["rock"];
            if (target) {
                if (target.energy > 0) {
                    if (this.energy > 0) {
                        // TODO : increase player money
                        target.energy = target.energy - 1;
                        this.energy = this.energy - 0.005;
                    }
                } else {
                    this.target = null;
                }
            } else {
                var neighbours = game.query(this.position, 100, 0, possibleTargets)
                if (neighbours.length > 0) {
                    this.target = neighbours[randomInt(0, neighbours.length - 1)];
                }
            }
        }
    }

    export class Rock implements IActor {
        private id: number;
        public getId(): number {
            return this.id;
        }

        public flaggedForDeletion(): boolean { return this.energy <= 0; }

        public energy: number;
        constructor(public position: Point) {
            this.energy = 1000;
        }

        public getKind(): string {
            return "rock";
        }

        draw() {
            drawer.drawCircle(this.position, 15, new Color(0.8, 0.8, 0.8));
        }
        update() {
        }
    }
}
