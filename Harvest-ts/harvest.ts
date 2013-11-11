// Interface
///<reference path="drawer.ts" />
///<reference path="lib/jquery.d.ts" />

declare var drawer: IDrawer;
declare var ui: Ui;
declare var game: Game;

class Actor {
    public energy: number;

    constructor(public position: Point) {
    }

    getKind(): string {
        throw "This method is abstract";
    }
    flaggedForDeletion(): boolean {
        return false;
    }
    draw() {
        //throw "This method is abstract";
    }
    update() {
        //throw "This method is abstract";
    }

    private id: number;
    public getId(): number {
        return this.id;
    }
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
    objects: Actor[];
    clickMode: string = null;

    constructor() {
        this.objects = [];
        for (var unit in Units) {
            (function (unit) { // bind unit to lambda scope
                if (Units[unit].buildable) {
                    Ui.addButton(unit,
                        (event) => {
                            game.clickMode = unit;
                        });
                }
            })(unit);
        }

        for (var i = 0; i < 50; ++i) {
            this.addObject(new Units.Rock(new Point(randomInt(50, 1250), randomInt(50, 750))));
        }
    }

    public draw() {
        this.objects.forEach((o) => o.draw());
    }

    public update() {
        this.objects.forEach((o) => o.update());
        this.objects = this.objects.filter((object) => !object.flaggedForDeletion());
    }

    public addObject(object: Actor) {
        this.objects.push(object);
    }

    public mouseDown(position: Point) {
        if (this.clickMode) {
            this.addObject(new Units[this.clickMode](position));
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

        var result: Actor[] = [];
        this.objects.forEach((object) => {
            if (object.position.getDistanceTo(location) <= range) {
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
    export class Harvester extends Actor {
        static buildable = true;
        public getKind(): string { return "harvester"; }
        public energy: number = 0;
        private target: Actor;

        private _flaggedForDeletion: boolean = false;
        public flaggedForDeletion(): boolean { return this._flaggedForDeletion; }

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
                if (this.energy > 0) {
                    var neighbours = game.query(this.position, 100, 0, possibleTargets)
                    if (neighbours.length > 0) {
                        this.target = neighbours[randomInt(0, neighbours.length - 1)];
                    }
                }
            }
        }
    }

    export class Rock extends Actor {
        public flaggedForDeletion(): boolean { return this.energy <= 0; }

        public energy: number = 1000;

        getKind(): string {
            return "rock";
        }
        draw() {
            drawer.drawCircle(this.position, 15, new Color(0.8, 0.8, 0.8));
        }
    }

    export class EnergyLink extends Actor {
        static buildable = true;
        getKind(): string { return "energy_link"; }
        draw() {
            drawer.drawCircle(this.position, 8, new Color(0.8, 0.8, 0.2));
        }
    }

    export class EnergyPacket extends Actor {
        private _flaggedForDeletion: boolean = false;
        public flaggedForDeletion(): boolean { return this._flaggedForDeletion; }

        private target: Actor;
        getKind(): string { return "energy_packet"; }

        private pickATarget() {
            var possibleTargets = ["harvester", "energy_link", "turret", "solar_plant"];
            var neighbours = game.query(this.position, 200, 0, possibleTargets)
                    if (neighbours.length > 0) {
                this.target = neighbours[randomInt(0, neighbours.length - 1)];
            }
        }

        draw() {
            drawer.drawCircle(this.position, 3, new Color(1.0, 1.0, 0.5));
        }

        update() {
            var target = this.target

            if (target) {
                if (this.position.getDistanceTo(target.position) < 5) {
                    var bounce = false;
                    if (target.getKind() == 'energy_link' || target.getKind() == 'solar_plant') {
                        bounce = true;
                    } else if (target.getKind() == 'harvester' && target.energy > 0) {
                        bounce = true;
                    }/* else if (target.getKind() == 'turret' && target.energy > Turret.maxEnergy {
                        bounce = true;
                    }*/

                    if (bounce) {
                        this.pickATarget();
                    } else {
                        this._flaggedForDeletion = true
                        target.energy = target.energy + 1
                    }
                } else {
                    var direction = this.position.getDirectionTo(target.position);
                    this.position.x = this.position.x + Math.cos(direction);
                    this.position.y = this.position.y + Math.sin(direction);
                }
            } else {
                this.pickATarget();
            }
        }
    }

    export class SolarPlant extends Actor {
        static buildable = true;
        energy: number = 0;
        getKind(): string { return "solar_plant"; }

        draw() {
            drawer.drawCircle(this.position, 30, new Color(0.455, 0.157, 0.580));
        }
        update() {
            if (this.energy > 100) {
                this.energy = 0;
                var p = new EnergyPacket(new Point(this.position.x, this.position.y));
                game.addObject(p);
            } else {
                this.energy = this.energy + 1
            }
        }
    }
}
