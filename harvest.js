// Interface
///<reference path="drawer.ts" />
///<reference path="lib/jquery.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

function randomInt(a, b) {
    return Math.floor((Math.random() * (b - a + 1)) + a);
}

var Ui = (function () {
    function Ui() {
    }
    Ui.addButton = function (name, callback) {
        var newDiv = $('<div>');
        newDiv.html(name).addClass('button').addClass('Grid-cell').click(function (event) {
            $("#units-ui").children().removeClass("active");
            newDiv.addClass("active");
            callback(event);
        });

        $("#units-ui").append(newDiv);
    };

    Ui.setDisplayedMoney = function (money) {
        $("#money").html("$" + money);
    };
    return Ui;
})();

var Game = (function () {
    function Game() {
        this.clickMode = null;
        this.money = 100;
        this.screenSize = new Point(1, 1);
        this.screenOffset = new Point(0, 0);
        this.scrolling = new Point(0, 0);
        this.mousePosition = new Point(0, 0);
        this.objects = [];
        for (var unit in Units) {
            (function (unit) {
                if (Units[unit].buildable) {
                    Ui.addButton(unit, function (event) {
                        game.clickMode = unit;
                    });
                }
            })(unit);
        }
    }
    Game.prototype.startNewGame = function () {
        this.objects = [];
        for (var i = 0; i < 50; ++i) {
            var place = new Point(randomInt(50, 1250), randomInt(50, 750));
            this.addObject(new Units.Rock("terrain", place));
        }
        this.screenOffset.x = this.screenOffset.y = 0;

        // first solar plants
        this.addObject(new Units.SolarPlant("player", new Point(500, 500)));
        this.addObject(new Units.SolarPlant("player", new Point(550, 550)));
        this.addObject(new Units.SolarPlant("player", new Point(450, 550)));

        this.money = 100;
    };

    Game.prototype.draw = function () {
        drawer.setDrawingOffset(this.screenOffset);
        this.objects.forEach(function (o) {
            return o.draw();
        });

        if (this.clickMode) {
            var p = new Point(this.mousePosition.x + this.screenOffset.x, this.mousePosition.y + this.screenOffset.y);

            // energy hop circle
            drawer.drawCircle(p, 150, Color.white, false);

            // harvest circle
            if (this.clickMode == "Harvester") {
                drawer.drawCircle(p, 100, new Color(0.314, 0.863, 0.471), false);
            }
        }
    };

    Game.prototype.update = function () {
        this.objects.forEach(function (o) {
            return o.update();
        });
        this.objects = this.objects.filter(function (object) {
            return !object.flaggedForDeletion();
        });
        this.screenOffset.x += this.scrolling.x;
        this.screenOffset.y += this.scrolling.y;

        Ui.setDisplayedMoney(this.money);
    };

    Game.prototype.addObject = function (object) {
        this.objects.push(object);
    };

    Game.prototype.mouseOut = function () {
        this.scrolling.x = 0;
        this.scrolling.y = 0;
    };

    Game.prototype.mouseDown = function (position, button) {
        if (typeof button === "undefined") { button = 0; }
        switch (button) {
            case 0:
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
                var collidingWithCircle = function (position, size) {
                    return function (obj) {
                        if ((size <= 0) || (obj.getSize() <= 0))
                            return false;

                        var distance = obj.position.getDistanceTo(position);
                        var maxDistance = obj.getSize() + size;

                        return distance <= maxDistance;
                    };
                };
                var result = this.objects.filter(collidingWithCircle(position, Units[this.clickMode].prototype.getSize()));
                if (result.length > 0)
                    return;

                this.addObject(new Units.Construction("player", position, this.clickMode));
                this.money -= unit.price;
                break;
            case 2:
                this.clickMode = "";
                break;
        }
    };

    Game.prototype.mouseMove = function (position) {
        this.mousePosition.x = position.x;
        this.mousePosition.y = position.y;

        if (position.x < 50) {
            this.scrolling.x = -5;
        } else if (position.x > (this.screenSize.x - 50)) {
            this.scrolling.x = 5;
        } else {
            this.scrolling.x = 0;
        }

        if (position.y < 50) {
            this.scrolling.y = -5;
        } else if (position.y > (this.screenSize.y - 50)) {
            this.scrolling.y = 5;
        } else {
            this.scrolling.y = 0;
        }
    };

    Game.prototype.query = function (location, range, idFilter, kindFilter) {
        if (typeof kindFilter === "undefined") { kindFilter = []; }
        return this.objects.filter(function (object) {
            return (object.position.getDistanceTo(location) <= range) && (object.getId() !== idFilter) && (kindFilter.indexOf(object.getKind()) > -1);
        });
    };
    return Game;
})();
var Game;
(function (Game) {
    (function (QueryAllianceType) {
        QueryAllianceType[QueryAllianceType["ALLY"] = 0] = "ALLY";
        QueryAllianceType[QueryAllianceType["ENEMY"] = 1] = "ENEMY";
        QueryAllianceType[QueryAllianceType["BOTH"] = 2] = "BOTH";
    })(Game.QueryAllianceType || (Game.QueryAllianceType = {}));
    var QueryAllianceType = Game.QueryAllianceType;
})(Game || (Game = {}));

var Actor = (function () {
    function Actor(owner, position) {
        this.owner = owner;
        this.position = position;
    }
    Actor.prototype.getKind = function () {
        throw "This method is abstract";
    };
    Actor.prototype.getSize = function () {
        return 0;
    };
    Actor.prototype.getOwner = function () {
        return this.owner;
    };
    Actor.prototype.flaggedForDeletion = function () {
        return false;
    };
    Actor.prototype.draw = function () {
        //throw "This method is abstract";
    };
    Actor.prototype.update = function () {
        //throw "This method is abstract";
    };

    Actor.prototype.getId = function () {
        return this.id;
    };

    // Behaviors
    Actor.prototype.moveToTarget = function () {
        var target = this.target;
        if (!target)
            throw "no target!";

        var direction = this.position.getDirectionTo(target.position);
        this.position.x += Math.cos(direction);
        this.position.y += Math.sin(direction);
    };
    Actor.prototype.pickATarget = function (possibleTargets, range /*, excludeSelf: boolean = true*/ ) {
        var neighbours = game.query(this.position, range, /*this.id*/ 0, possibleTargets);
        if (neighbours.length > 0) {
            this.target = neighbours[randomInt(0, neighbours.length - 1)];
        }
    };

    Actor.prototype.receiveEnergy = function () {
        this.energy += 1;
        return true;
    };
    return Actor;
})();

// Module
var Units;
(function (Units) {
    var Construction = (function (_super) {
        __extends(Construction, _super);
        function Construction(owner, position, building) {
            _super.call(this, owner, position);
            this.building = building;
            this.energy = 0;
            this.constructedBuilding = null;
        }
        Construction.prototype.getKind = function () {
            return "construction";
        };
        Construction.prototype.getSize = function () {
            return Units[this.building].prototype.getSize();
        };

        Construction.prototype.update = function () {
            if (this.energy >= Units[this.building].price) {
                this.constructedBuilding = new Units[this.building](this.owner, this.position);
                game.addObject(this.constructedBuilding);
                this.flaggedForDeletion = function () {
                    return true;
                };
            }
        };

        Construction.prototype.receiveEnergy = function () {
            if (this.constructedBuilding) {
                return this.constructedBuilding.receiveEnergy();
            } else {
                return _super.prototype.receiveEnergy.call(this);
            }
        };

        Construction.prototype.draw = function () {
            drawer.drawSquare(this.position, Units[this.building].prototype.getSize() / 0.717, new Color(0.4, 0.4, 0.4));
        };
        return Construction;
    })(Actor);
    Units.Construction = Construction;

    var Harvester = (function (_super) {
        __extends(Harvester, _super);
        function Harvester() {
            _super.apply(this, arguments);
            this.energy = 0;
            this._flaggedForDeletion = false;
        }
        Harvester.prototype.getKind = function () {
            return "harvester";
        };
        Harvester.prototype.getSize = function () {
            return 10;
        };

        Harvester.prototype.flaggedForDeletion = function () {
            return this._flaggedForDeletion;
        };

        Harvester.prototype.receiveEnergy = function () {
            if (this.energy > 0)
                return false;
            else {
                this.energy = 1;
                return true;
            }
        };

        Harvester.prototype.draw = function () {
            drawer.drawCircle(this.position, this.getSize(), new Color(0.314, 0.863, 0.471));
            if (this.target) {
                //if (this.energy > 0) {
                drawer.drawLine(this.position, this.target.position, new Color(1.0, 1.0, 1.0));
                //}
            }
        };
        Harvester.prototype.update = function () {
            var target = this.target;
            var possibleTargets = ["rock"];
            if (target) {
                if (target.energy <= 0) {
                    this.target = null;

                    // does the harvester inner energy need to be zeroed too?
                    return;
                }

                if (this.energy > 0) {
                    this.energy = this.energy - 0.025;
                } else {
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
                    _super.prototype.pickATarget.call(this, possibleTargets, 100);
                }
            }
        };
        Harvester.buildable = true;
        Harvester.price = 15;
        return Harvester;
    })(Actor);
    Units.Harvester = Harvester;

    var Rock = (function (_super) {
        __extends(Rock, _super);
        function Rock() {
            _super.apply(this, arguments);
            this.energy = 1000;
        }
        Rock.prototype.flaggedForDeletion = function () {
            return this.energy <= 0;
        };

        Rock.prototype.getKind = function () {
            return "rock";
        };
        Rock.prototype.getSize = function () {
            return 15;
        };
        Rock.prototype.draw = function () {
            drawer.drawCircle(this.position, this.getSize(), new Color(0.8, 0.8, 0.8));
        };
        return Rock;
    })(Actor);
    Units.Rock = Rock;

    var EnergyLink = (function (_super) {
        __extends(EnergyLink, _super);
        function EnergyLink() {
            _super.apply(this, arguments);
        }
        EnergyLink.prototype.receiveEnergy = function () {
            return false;
        };
        EnergyLink.prototype.getKind = function () {
            return "energy_link";
        };
        EnergyLink.prototype.getSize = function () {
            return 8;
        };
        EnergyLink.prototype.draw = function () {
            drawer.drawCircle(this.position, this.getSize(), new Color(0.8, 0.8, 0.2));
        };
        EnergyLink.buildable = true;
        EnergyLink.price = 2;
        return EnergyLink;
    })(Actor);
    Units.EnergyLink = EnergyLink;

    var EnergyPacket = (function (_super) {
        __extends(EnergyPacket, _super);
        function EnergyPacket() {
            _super.apply(this, arguments);
            this._flaggedForDeletion = false;
        }
        EnergyPacket.prototype.flaggedForDeletion = function () {
            return this._flaggedForDeletion;
        };

        EnergyPacket.prototype.getKind = function () {
            return "energy_packet";
        };

        EnergyPacket.prototype.pickATarget = function () {
            var possibleTargets = ["harvester", "energy_link", "turret", "solar_plant", "construction"];
            var range = 150;

            _super.prototype.pickATarget.call(this, possibleTargets, range);
        };

        EnergyPacket.prototype.draw = function () {
            drawer.drawCircle(this.position, 3, new Color(1.0, 1.0, 0.5));
        };

        EnergyPacket.prototype.update = function () {
            var target = this.target;

            if (target) {
                if (this.position.getDistanceTo(target.position) < 5) {
                    if (target.receiveEnergy()) {
                        this._flaggedForDeletion = true;
                    } else {
                        this.pickATarget();
                    }
                } else {
                    this.moveToTarget();
                }
            } else {
                this.pickATarget();
            }
        };
        return EnergyPacket;
    })(Actor);
    Units.EnergyPacket = EnergyPacket;

    var SolarPlant = (function (_super) {
        __extends(SolarPlant, _super);
        function SolarPlant() {
            _super.apply(this, arguments);
            this.energy = 0;
        }
        SolarPlant.prototype.getKind = function () {
            return "solar_plant";
        };
        SolarPlant.prototype.getSize = function () {
            return 30;
        };
        SolarPlant.prototype.receiveEnergy = function () {
            return false;
        };

        SolarPlant.prototype.draw = function () {
            drawer.drawCircle(this.position, this.getSize(), new Color(0.455, 0.157, 0.580));
        };
        SolarPlant.prototype.update = function () {
            if (this.energy > 100) {
                this.energy = 0;
                var p = new EnergyPacket(this.getOwner(), new Point(this.position.x, this.position.y));
                game.addObject(p);
            } else {
                this.energy += 1;
            }
        };
        SolarPlant.buildable = true;
        SolarPlant.price = 40;
        return SolarPlant;
    })(Actor);
    Units.SolarPlant = SolarPlant;

    var Turret = (function (_super) {
        __extends(Turret, _super);
        function Turret() {
            _super.apply(this, arguments);
            this.energy = 0;
        }
        Turret.prototype.getKind = function () {
            return "turret";
        };
        Turret.prototype.getSize = function () {
            return 15;
        };

        Turret.prototype.draw = function () {
            drawer.drawCircle(this.position, this.getSize(), new Color(0.9, 0.3, 0.4));
        };
        Turret.prototype.update = function () {
            var _this = this;
            var target = this.target;
            if (this.energy > 0) {
                if (target) {
                    target.flaggedForDeletion = function () {
                        return true;
                    };
                    this.energy -= 1;
                } else {
                    var targets = game.query(this.position, 200, this.getId());

                    // exclude friendly units
                    // TODO player alliances
                    targets = targets.filter(function (t) {
                        return t.getOwner() != _this.owner;
                    });
                    if (targets.length > 0) {
                        this.target = targets[randomInt(0, targets.length - 1)];
                    }
                }
            }
        };
        Turret.buildable = true;
        Turret.price = 20;
        return Turret;
    })(Actor);
    Units.Turret = Turret;

    var Vehicle = (function (_super) {
        __extends(Vehicle, _super);
        function Vehicle() {
            _super.apply(this, arguments);
            this.energy = 0;
        }
        Vehicle.prototype.moveToTarget = function () {
            // batteries depleted, can't move.
            if (this.energy < 0)
                return;
            else {
                this.energy -= 1; // TODO: actual engine efficiency
                _super.prototype.moveToTarget.call(this);
            }
        };
        return Vehicle;
    })(Actor);
    Units.Vehicle = Vehicle;

    var Tank = (function (_super) {
        __extends(Tank, _super);
        function Tank(owner, position) {
            _super.call(this, owner, position);
            this.energy = 100;
        }
        Tank.prototype.getKind = function () {
            return "tank";
        };
        Tank.prototype.getSize = function () {
            return 28;
        };

        Tank.prototype.draw = function () {
            drawer.drawSquare(this.position, 40, new Color(0.572, 0.671, 0.302));
        };

        Tank.prototype.pickATarget = function () {
            var possibleTargets = ["solar_plant", "energy_link", "harvester"];
            var range = 1000;
            _super.prototype.pickATarget.call(this, possibleTargets, range);
        };

        Tank.prototype.update = function () {
            if (!this.target) {
                this.pickATarget();
            } else {
                if (this.position.getDistanceTo(this.target.position) < 5) {
                    this.target.flaggedForDeletion = (function () {
                        return true;
                    });
                    this.target = null;
                    return;
                }

                this.moveToTarget();
            }
        };
        return Tank;
    })(Vehicle);
    Units.Tank = Tank;
})(Units || (Units = {}));
//# sourceMappingURL=harvest.js.map
