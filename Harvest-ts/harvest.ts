// Interface
///<reference path="drawer.ts" />
///<reference path="lib/jquery.d.ts" />

declare var drawer: IDrawer;
declare var ui: Ui;
declare var game: Game;

function randomInt(a: number, b: number): number {
    return Math.floor((Math.random() * (b-a+1)) + a);
}

class Ui {
    static addButton(name: string, callback: (JQueryEventObject) => any) {
        var newDiv = $('<div>');
        newDiv
            .html(name)
            .addClass('button')
            .addClass('Grid-cell')
            .click((event) => {
                $("#units-ui").children().removeClass("active");
                newDiv.addClass("active");
                callback(event);
            });
        
        $("#units-ui").append(newDiv); 
    }

    static setDisplayedMoney(money: number) {
        $("#money").html("$" + money);
    }
}

class Game {
    objects: Actor[];
    clickMode: string = null;
    money: number = 100;
    screenSize: Point = new Point(1,1);
    screenOffset: Point = new Point(0,0);
    scrolling: Point = new Point(0,0);

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
            var place = new Point(randomInt(50, 1250), randomInt(50, 750));
            this.addObject(new Units.Rock("terrain", place));
        }

        // first solar plants
        this.addObject(new Units.SolarPlant("player", new Point(500, 500)));
        this.addObject(new Units.SolarPlant("player", new Point(550, 550)));
        this.addObject(new Units.SolarPlant("player", new Point(450, 550)));
    }

    public draw() {
        drawer.setDrawingOffset(this.screenOffset);
        this.objects.forEach((o) => o.draw());
    }

    public update() {
        this.objects.forEach((o) => o.update());
        this.objects = this.objects.filter((object) => !object.flaggedForDeletion());
        this.screenOffset.x += this.scrolling.x;
        this.screenOffset.y += this.scrolling.y;

        Ui.setDisplayedMoney(this.money);
    }

    public addObject(object: Actor) {
        this.objects.push(object);
    }

    public mouseOut() {
        this.scrolling.x = 0;
        this.scrolling.y = 0;
    }

    public mouseDown(position: Point) {
        if (!this.clickMode)
            return;

        var unit = Units[this.clickMode];
        if (!unit)
            throw "The selected unit type is not loaded";

        if (unit.price > this.money)
            return;

        //this.addObject(new Units[this.clickMode]("player", position));

        position.x += this.screenOffset.x;
        position.y += this.screenOffset.y;

        // collision test
        var collidingWithCircle = function(position, size) {
            return function(obj) {
                var distance = obj.position.getDistanceTo(position);
                var maxDistance = obj.getSize() + size;

                return distance <= maxDistance;
            }
        };
        var result = this.objects.filter(collidingWithCircle(position, Units[this.clickMode].prototype.getSize()));
        if (result.length > 0)
            return;

        this.addObject(new Units.Construction("player", position, this.clickMode));
        this.money -= unit.price;
    }

    public mouseMove(position: Point) {
        if (position.x < 50) { // scroll left
            this.scrolling.x = -5;
        }
        else if (position.x > (this.screenSize.x - 50)) { // scroll right
            this.scrolling.x = 5;
        }
        else {
            this.scrolling.x = 0;
        }

        if (position.y < 50) { // scroll up
            this.scrolling.y = -5;
        }
        else if (position.y > (this.screenSize.y - 50)) { // scroll down11
            this.scrolling.y = 5;
        }
        else {
            this.scrolling.y = 0;
        }
    }

    public query(location: Point, range: number, idFilter: number, kindFilter: string[] = []) {
        return this.objects.filter((object) =>
            (object.position.getDistanceTo(location) <= range)
            &&
            (object.getId() !== idFilter)
            &&
            (kindFilter.indexOf(object.getKind()) > -1)
        );
    }
}
module Game {
    export enum QueryAllianceType {
        ALLY,
        ENEMY,
        BOTH
    }
}


class Actor {
    public energy: number;

    constructor(public owner: string, public position: Point) {
    }

    getKind(): string {
        throw "This method is abstract";
    }
    getSize(): number {
        return 0;
    }
    getOwner():string { 
        return this.owner; 
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

    // Behaviors
    moveToTarget() {
        var target = (<any>this).target;
        if (!target)
            throw "no target!";

        var direction = this.position.getDirectionTo(target.position);
        this.position.x += Math.cos(direction);
        this.position.y += Math.sin(direction);
    }
    pickATarget(possibleTargets: string[], range: number/*, excludeSelf: boolean = true*/) {
        var neighbours = game.query(this.position, range, /*this.id*/0, possibleTargets)
        if (neighbours.length > 0) {
            (<any>this).target = neighbours[randomInt(0, neighbours.length-1)];
        }
    }
}

// Module
module Units {

    export class Construction extends Actor {
        public energy: number = 0;

        constructor(owner: string, position: Point, public building: string) {
            super(owner, position);
        }

        public getKind(): string { return "construction"; }
        public getSize(): number {
            return Units[this.building].prototype.getSize();
        }

        update() {
            if (this.energy >= Units[this.building].price) {
                game.addObject(new Units[this.building](this.owner, this.position));
                this.flaggedForDeletion = () => true;
            }
        }

        draw() {
            drawer.drawSquare(this.position, Units[this.building].prototype.getSize()/0.717, new Color(0.4, 0.4, 0.4));
        }
    }

    export class Harvester extends Actor {
        static buildable = true;
        static price = 15;
        public getKind(): string { return "harvester"; }
        public getSize(): number { return 10; }
        public energy: number = 0;
        private target: Actor;

        private _flaggedForDeletion: boolean = false;
        public flaggedForDeletion(): boolean { return this._flaggedForDeletion; }

        draw() {
            drawer.drawCircle(this.position, this.getSize(), new Color(0.314, 0.863, 0.471));
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
                if (target.energy <= 0) { // rock depleted
                    this.target = null;
                    return;
                }

                if (this.energy > 0) {
                    this.energy = this.energy - 0.025;
                } else { // finished harvesting phase
                    // one rock point is converted into one $
                    target.energy = target.energy - 1;
                    game.money += 1;
                    // reset the harvester
                    this.target = null;
                    // in case it got negative
                    this.energy = 0;
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
        getSize(): number { return 15; }
        draw() {
            drawer.drawCircle(this.position, this.getSize(), new Color(0.8, 0.8, 0.8));
        }
    }

    export class EnergyLink extends Actor {
        static buildable = true;
        static price = 2;
        getKind(): string { return "energy_link"; }
        getSize(): number { return 8; }
        draw() {
            drawer.drawCircle(this.position, this.getSize(), new Color(0.8, 0.8, 0.2));
        }
    }

    export class EnergyPacket extends Actor {
        private _flaggedForDeletion: boolean = false;
        public flaggedForDeletion(): boolean { return this._flaggedForDeletion; }

        private target: Actor;
        getKind(): string { return "energy_packet"; }
        getSize(): number { return 3; }

        public pickATarget() {
            var possibleTargets = ["harvester", "energy_link", "turret", "solar_plant", "construction"];
            var range = 100;

            super.pickATarget(possibleTargets, range);
        }

        draw() {
            drawer.drawCircle(this.position, this.getSize(), new Color(1.0, 1.0, 0.5));
        }

        update() {
            var target = this.target;

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
                        this._flaggedForDeletion = true;
                        target.energy = target.energy + 1
                    }
                } else {
                    this.moveToTarget();
                }
            } else {
                this.pickATarget();
            }
        }
    }

    export class SolarPlant extends Actor {
        static buildable = true;
        static price = 40;
        energy: number = 0;
        getKind(): string { return "solar_plant"; }
        getSize(): number { return 30; }

        draw() {
            drawer.drawCircle(this.position, this.getSize(), new Color(0.455, 0.157, 0.580));
        }
        update() {
            if (this.energy > 100) {
                this.energy = 0;
                var p = new EnergyPacket(this.getOwner(), new Point(this.position.x, this.position.y));
                game.addObject(p);
            } else {
                this.energy = this.energy + 1
            }
        }
    }

    export class Vehicle extends Actor {
        energy: number = 0;

        moveToTarget() {
            // batteries depleted, can't move.
            if (this.energy < 0)
                return;
            else {
                this.energy -= 1; // TODO: actual engine efficiency
                super.moveToTarget();
            }
        }
    }

    export class Tank extends Vehicle {
        getKind(): string {
            return "tank";
        }
        getSize(): number {
            return 28; // "radius" of a square
        }

        private target: Actor;

        constructor(owner: string, position: Point) {
            super(owner, position);
            this.energy = 100;
        }

        draw() {
            drawer.drawSquare(this.position, 40, new Color(0.572, 0.671, 0.302));
        }

        pickATarget() {
            var possibleTargets = ["solar_plant", "energy_link", "harvester"];
            var range = 1000;
            super.pickATarget(possibleTargets, range);
        }

        update() {
            if (!this.target) {
                this.pickATarget();
            } else {
                if (this.position.getDistanceTo(this.target.position) < 5) {
                    this.target.flaggedForDeletion = (() => true);
                    this.target = null;
                    return;
                }

                this.moveToTarget();
            }
        }
    }
}
