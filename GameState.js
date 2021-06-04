class GameState {
    constructor() {
        this.gameObjects = [];
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.17, y: canvasHeight * 0.5 }, 0, 0))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.1, y: canvasHeight * 0.2 }, 0, 1))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.25, y: canvasHeight * 0.15 }, 0, 2))

        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.41, y: canvasHeight * 0.18 }, 1, 3))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.53, y: canvasHeight * 0.36 }, 1, 4))

        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.43, y: canvasHeight * 0.60 }, 2, 5))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.47, y: canvasHeight * 0.83 }, 2, 6))

        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.76, y: canvasHeight * 0.15 }, 3, 7))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.83, y: canvasHeight * 0.44 }, 3, 8))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.93, y: canvasHeight * 0.56 }, 3, 9))

        this.gameObjects.push(makeShopFrame({ x: canvasWidth * 0.72, y: canvasHeight * 0.05 }, canvasWidth * 0.23, canvasHeight * 0.9, "r"));
        this.gameObjects.push(makeShopFrame({ x: canvasWidth * 0.02, y: canvasHeight * 0.05 }, canvasWidth * 0.23, canvasHeight * 0.9, "l"));

        this.wayPoints = new Map();
        this.wayPoints.set(0, { x: canvasWidth * -0.01, y: canvasHeight * 0.5 })
        this.wayPoints.set(1, { x: canvasWidth * 0.14, y: canvasHeight * 0.5 })
        this.wayPoints.set(2, { x: canvasWidth * 0.14, y: canvasHeight * 0.1 })
        this.wayPoints.set(3, { x: canvasWidth * 0.38, y: canvasHeight * 0.1 })
        this.wayPoints.set(4, { x: canvasWidth * 0.38, y: canvasHeight * 0.9 })
        this.wayPoints.set(5, { x: canvasWidth * 0.56, y: canvasHeight * 0.9 })
        this.wayPoints.set(6, { x: canvasWidth * 0.56, y: canvasHeight * 0.1 })
        this.wayPoints.set(7, { x: canvasWidth * 0.8, y: canvasHeight * 0.1 })
        this.wayPoints.set(8, { x: canvasWidth * 0.8, y: canvasHeight * 0.5 })
        this.wayPoints.set(9, { x: canvasWidth * 1.01, y: canvasHeight * 0.5 })

        this.baseHealth = 100;

        this.upcomingEnemies = [];
        this.enemySpawnRate = 20;
        this.spawnEnemies = false;
        this.spawnedFrameCounter = 0;

        this.enemyLifespans = [];

        this.rules = [];
        this.sectionModifiers = [

            { section: 0, turret: "SNIPER", modifies: "RANGE", value: 0.9 },
            { section: 0, turret: "MACHINE_GUN", modifies: "RANGE", value: 1.2 },

            { section: 1, turret: "SNIPER", modifies: "RANGE", value: 1.1 },
            { section: 1, turret: "SNIPER", modifies: "COOLDOWN", value: 0.9 },
            { section: 1, turret: "STANDARD", modifies: "RANGE", value: 1.2 },

            { section: 2, turret: "MACHINE_GUN", modifies: "COOLDOWN", value: 1.1 },
            { section: 2, turret: "MACHINE_GUN", modifies: "ACCURACY", value: 0.8 },
            { section: 2, turret: "SNIPER", modifies: "ACCURACY", value: 0.9 },

            { section: 3, turret: "STANDARD", modifies: "RANGE", value: 1.4 },
            { section: 3, turret: "STANDARD", modifies: "COOLDOWN", value: 0.8 },
        ];
        this.rulesUpdated = false;

        this.shotTraces = [];

        this.currency = 10;
        this.wave = 0;
        this.frameCounter = 0;
    }
    static initial() {
        var gs = new GameState();
        gs.attachTurret(Turret.standardTurret(),0);
        gs.attachTurret(Turret.machineGunTurret(),2);
        gs.attachTurret(Turret.sniperTurret(),5);
        gs.attachTurret(Turret.laserTurret(),6);
        gs.enemySpawnRate = 10;
        gs.wave = 50;
        return gs;
    }

    updateGame(inputsArr, soundToggle) {

        if (this.spawnEnemies) {
            if (this.upcomingEnemies.length > 0) {
                if (this.spawnedFrameCounter == this.enemySpawnRate) {
                    var newEnem = this.upcomingEnemies.pop();
                    newEnem.timeMade = this.frameCounter;
                    this.gameObjects.push(newEnem);
                    this.spawnedFrameCounter = 0;
                } else {
                    this.spawnedFrameCounter += 1;
                }
            } else {
                this.spawnEnemies = false;
            }
        }

        this.shotTraces.forEach(t => t.frameCounter += 1);
        this.shotTraces = this.shotTraces.filter(t => t.frameCounter < 1);

        this.gameObjects.forEach(e => {
            switch (e.type) {
                case "ENEMY":
                    this.updateEnemy(e);
                    break;
                case "TURRET_PLATFORM":
                    if (e.data.hasTurret) {
                        this.updateTurret(e.data.turret, e.position, e.data.sector);
                    }
                    break;
            }
        })
        this.gameObjects = this.gameObjects.filter(o => o.isAlive);
        if (isClicked == true) {
            var objectClicked = this.checkObjectClicked(this.returnMousePos(clickEvent));
            isClicked = false;
            if (objectClicked == null) {
                this.gameObjects.filter(s => s.type == "UI_FRAME").forEach(s => {
                    s.data.isVisible = false;
                });
            }
            else if (objectClicked.type == "TURRET_PLATFORM") {
                if (objectClicked.data.sector <= 1) {
                    this.gameObjects.filter(s => s.type == "UI_FRAME" && s.data.side == "r").forEach(s => {
                        s.data.isVisible = true;
                    });
                    this.gameObjects.filter(s => s.type == "UI_FRAME" && s.data.side == "l").forEach(s => {
                        s.data.isVisible = false;
                    });
                }
                else {
                    this.gameObjects.filter(s => s.type == "UI_FRAME" && s.data.side == "l").forEach(s => {
                        s.data.isVisible = true;
                    });
                    this.gameObjects.filter(s => s.type == "UI_FRAME" && s.data.side == "r").forEach(s => {
                        s.data.isVisible = false;
                    });
                }
            }
        }

        if (this.rulesUpdated) {
            this.rulesUpdated = false;
        }
        this.frameCounter += 1;
    }

    updateEnemy(enemy) {
        if (enemy.data.health <= 0) {
            this.enemyLifespans.push(this.frameCounter - enemy.data.timeMade);
            enemy.isAlive = false;
        } else {
            var targetPosition = this.wayPoints.get(enemy.data.curWay);
            var distanceToTarget = calcDistance(enemy.position, targetPosition);
            enemy.data.curWayDist = distanceToTarget;
            if (distanceToTarget <= 4) {

                if (enemy.data.curWay == this.wayPoints.size - 1) {
                    this.baseHealth -= enemy.data.health;
                    this.enemyLifespans.push(this.frameCounter - enemy.data.timeMade);
                    enemy.isAlive = false;
                }

                enemy.data.curWay = Math.min(enemy.data.curWay + 1, this.wayPoints.size - 1);
                enemy.data.curWayDist = 999999999999999;//Lmao this is such a hack, it avoids having to re-calcualte distance for targeting
            } else {
                enemy.data.speed = (11 - enemy.data.health) * 0.35;
                var angle = calcAngle(enemy.position, targetPosition);
                var velComp = calcComponents(enemy.data.speed, angle);
                enemy.position.x += velComp.x;
                enemy.position.y += velComp.y;
            }
            enemy.data.angle += 0.05;
        }
    }

    updateTurret(turret, position, section, sound) {

        turret.offset *= 0.9;

        //Update turret attributes to conform to section & rule modifiers
        if (!turret.atributesUpdated || this.rulesUpdated) {
            var modifiers = this.getModifiers(turret.type, section);
            turret.range = turret.baseRange * modifiers.range;
            turret.accuracy = turret.baseAccuracy * modifiers.accuracy;
            turret.cooldown = turret.baseCooldown * modifiers.cooldown;

            turret.atributesUpdated = true;
        }

        //Enemy targeting & shooting
        if (!this.rules.filter(r => r.type == "BAN" && r.subtype == turret.type).map(r => r.section).includes(section)) {

            var enemyTargets = this.gameObjects.filter(o => o.type == "ENEMY");
            var avoidEnemyHealths = this.rules.filter(r => r.type == "PRESERVE" && r.section == section).map(r => r.health);
            var enemiesInRange = checkRange(enemyTargets, turret.range, position).filter(e => !avoidEnemyHealths.includes(e.data.health));

            if (enemiesInRange.length > 0) {
                var target = targetEnemy(enemiesInRange);
                turret.angle = (calcAngle(target.position, position) % (2 * Math.PI)) - Math.PI / 2;
                if (turret.shotTimer == 0 && (Math.abs(turret.actualAngle - turret.angle) < 0.8)) {
                    if (soundToggle) {
                        switch (turret.type) {
                            case "STANDARD":
                                zzfx(...[1.04, , 235, .02, .04, .05, 3, 1.07, -6.4, .6, , , , , , .1, , .84, , .22]).start();
                                break;
                            case "SNIPER":
                                zzfx(...[1.5, , 870, .01, .18, .35, 3, 4.32, , , , , , .6, , 1, , .6, .06, .29]).start();
                                break;
                            case "MACHINE_GUN":
                                zzfx(...[0.83, 0, 238, .02, .03, 0, 4, 1.8, , , , , , , , .1, .1, .75, .02]).start();
                                break;
                            case "LASER":
                                zzfx(...[, , 442, .01, , .04, 1, .21, -1.8, -0.8, , , , , , , , .74, .04]).start();
                                break;
                        }
                    }
                    if (Math.random() < turret.accuracy) {
                        target.data.health -= turret.damage;
                        this.currency += turret.damage;
                        turret.shotTimer += 1;
                        this.shotTraces.push({ x1: position.x, y1: position.y, x2: target.position.x, y2: target.position.y, type: turret.type, frameCounter: 0 });
                    } else {
                        turret.shotTimer += 1;
                        this.shotTraces.push({ x1: position.x, y1: position.y, x2: target.position.x + ((Math.random() * 20) - 10), y2: target.position.y + ((Math.random() * 20) - 10), type: turret.type, frameCounter: 0 });
                    }
                    turret.offset = 1;
                }
            }

            if (turret.shotTimer == turret.cooldown) {
                turret.shotTimer = 0;
            } else if (turret.shotTimer != 0) {
                turret.shotTimer += 1;
            }

            //turret.actualAngle = lerp(turret.actualAngle, turret.angle, 0.2);
            turret.actualAngle = turret.angle;
        }
    }

    // Checks the position of a given mouse position against the x and y of all towers to see if any were clicked.
    // Returns the tower clicked if any, or null if no tower was clicked.
    checkTowerClicked(mousePos) {
        var towers;
        towers = this.gameObjects.filter(e => e.type == "TURRET_PLATFORM")
        for (var i = 0; i < towers.length; i++) {
            if (Math.abs(mousePos.x - towers[i].position.x) < 20 && Math.abs(mousePos.y - towers[i].position.y) < 20) {
                return towers[i].data.platformNum
            }
        }
        return null
    }

    ///Checks for valid game objects that have been clicked on and returns the game object that is clicked on
    ///Valid game objects are UI buttons, or turret platforms
    ///Returns the object that was at the mouse's position.
    checkObjectClicked(mousePos) {
        var objs;
        var towers = this.gameObjects.filter(e => e.type == "TURRET_PLATFORM")
        for (var i = 0; i < towers.length; i++) {
            if (Math.abs(mousePos.x - towers[i].position.x) < 20 && Math.abs(mousePos.y - towers[i].position.y) < 20) {
                return towers[i];
            }
        }
        var uiButtons = this.gameObjects.filter(e => e.type == "UI_OBJECT")
        for (var i = 0; i < uiButtons.length; i++) {
            if (mousePos.x - uiButtons[i].position.x < uiButtons[i].data.height && mousePos.x - uiButtons[i].position.x > 0
                && mousePos.y - uiButtons[i].position.y < uiButtons[i].data.height && mousePos.y - uiButtons[i].position.x > 0) {
                return uiButtons[i];
            }
        }
        return null;
    }

    returnMousePos(event) {
        var rect = canvas.getBoundingClientRect();
        console.log("X: " + (event.clientX - rect.left) / (rect.right - rect.left) * canvasWidth)
        console.log("Y: " + (event.clientY - rect.top) / (rect.bottom - rect.top) * canvasHeight)
        return {
            x: (event.clientX - rect.left) / (rect.right - rect.left) * canvasWidth,
            y: (event.clientY - rect.top) / (rect.bottom - rect.top) * canvasHeight
        };
    }

    update(inputsArr, soundToggle) {
        this.updateGame(inputsArr, soundToggle);
    }

    draw(ctx) {
        ctx.save();

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = rgbToHex(0, 0, 0);
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.shadowBlur = 10;
        ctx.shadowColor = rgbToHex(100, 100, 100);
        ctx.lineWidth = 3;
        ctx.strokeStyle = rgbToHex(180, 180, 180);
        ctx.strokeRect(0, 0, canvasWidth / 3 - 50, canvasHeight);
        ctx.strokeRect(canvasWidth / 3 - 50, 0, canvasWidth / 3 + 50, canvasHeight / 2);
        ctx.strokeRect(canvasWidth / 3 - 50, canvasHeight / 2, canvasWidth / 3 + 50, canvasHeight / 2);
        ctx.strokeRect((canvasWidth / 3) * 2, 0, canvasWidth / 3, canvasHeight);

        ctx.fillStyle = rgbToHex(255, 0, 0);

        ctx.lineWidth = 3;
        ctx.strokeStyle = rgbToHex(0, 200, 0);
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.shadowBlur = 10;
        ctx.shadowColor = rgbToHex(0, 200, 0);
        var first = true;
        Array.from(this.wayPoints.values()).forEach(w => {
            if (first) {
                ctx.moveTo(w.x, w.y);
                first = false;
            } else {
                ctx.lineTo(w.x, w.y);
            }
        })
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.shadowColor = rgbToHexAlpha(0, 0, 0, 0);
        ctx.setLineDash([]);

        this.gameObjects.filter(o => o.type == "ENEMY").forEach(e => {
            ctx.save();
            var size = 10;
            //ctx.fillStyle = "#" + healthToColour(e.data.health);
            ctx.strokeStyle = "#" + healthToColour(e.data.health);
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#" + healthToColour(e.data.health);

            ctx.translate(e.position.x, e.position.y);
            ctx.rotate(e.data.angle);
            ctx.beginPath();
            for (var angle = 0; angle <= Math.PI * 2; angle += (Math.PI * 2) / (e.data.health + 2)) {
                var p = calcComponents(size, angle);
                if (angle == 0) {
                    ctx.moveTo(p.x, p.y);
                }
                ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            //ctx.fill();
            ctx.stroke();
            ctx.restore();
        })


        this.gameObjects.filter(o => o.type == "TURRET_PLATFORM").forEach(e => {
            ctx.save();

            ctx.translate(Math.floor(e.position.x), Math.floor(e.position.y));


            if (e.data.hasTurret) {

                ctx.lineWidth = 3;
                ctx.strokeStyle = rgbToHex(50, 50, 120);
                ctx.beginPath();
                ctx.ellipse(0, 0, 2, 2, 0, 0, 2 * Math.PI);
                ctx.stroke();

                ctx.strokeStyle = rgbToHex(250, 250, 250);
                ctx.shadowBlur = 10;
                ctx.shadowColor = rgbToHex(200, 200, 200);
                ctx.lineWidth = 2;

                ctx.save();
                ctx.rotate(e.data.turret.actualAngle);
                switch (e.data.turret.type) {
                    case "STANDARD":
                        ctx.translate(0, Math.floor(e.data.turret.offset * 10));
                        ctx.beginPath();
                        ctx.rect(-2, 5, 4, 20);
                        ctx.rect(-4, 25, 8, 5);
                        ctx.rect(-10, 30, 20, 10);
                        ctx.rect(-14, 25, 4, 20);
                        ctx.rect(10, 25, 4, 20);
                        ctx.closePath();
                        ctx.stroke();
                        break;
                    case "SNIPER":
                        ctx.translate(0, Math.floor(e.data.turret.offset * 20));
                        ctx.beginPath();
                        ctx.rect(-2, 5, 4, 40);
                        ctx.rect(-4, 45, 8, 15);
                        ctx.rect(-6, 60, 12, 30);
                        ctx.moveTo(6, 70);
                        ctx.lineTo(12, 70);
                        ctx.lineTo(17, 75);
                        ctx.lineTo(17, 90);
                        ctx.lineTo(6, 90);
                        ctx.closePath();
                        ctx.stroke();
                        break;
                    case "MACHINE_GUN":
                        ctx.translate(0, Math.floor(e.data.turret.offset * 15));
                        ctx.beginPath();
                        ctx.rect(-4, 5, 8, 30);
                        ctx.rect(-6, 35, 12, 5);
                        ctx.rect(-10, 40, 20, 20);
                        ctx.closePath();
                        ctx.stroke();
                        break;
                    case "LASER":
                        ctx.translate(0, Math.floor(e.data.turret.offset * 5));
                        ctx.beginPath();
                        ctx.rect(-1, 5, 2, 30);
                        ctx.rect(-5, 35, 10, 20);
                        ctx.rect(-10, 45, 5, 10);
                        ctx.rect(5, 45, 5, 10);
                        ctx.closePath();
                        ctx.stroke();
                        break;
                }
                ctx.restore();

                ctx.strokeStyle = rgbToHex(250, 250, 250);
                ctx.shadowBlur = 10;
                ctx.shadowColor = rgbToHex(200, 200, 200);
                ctx.lineWidth = 2;
                var circ = e.data.turret.range * 2 * Math.PI;
                switch (e.data.turret.type) {
                    case "STANDARD":
                        ctx.rotate(this.frameCounter * 0.008);
                        ctx.setLineDash([circ / 4, circ / 4]);
                        break;
                    case "SNIPER":
                        ctx.rotate(this.frameCounter * 0.001);
                        ctx.setLineDash([circ / 6, circ / 6]);
                        break;
                    case "MACHINE_GUN":
                        ctx.rotate(this.frameCounter * 0.01);
                        ctx.setLineDash([circ / 8, circ / 8]);
                        break;
                    case "LASER":
                        ctx.rotate(this.frameCounter * 0.008);
                        ctx.setLineDash([circ / 10, circ / 10]);
                        break;
                }

                ctx.beginPath();
                ctx.ellipse(0, 0, e.data.turret.range, e.data.turret.range, 0, 0, 2 * Math.PI);
                ctx.stroke();
            } else {
                ctx.lineWidth = 3;
                ctx.strokeStyle = rgbToHex(50, 50, 120);
                ctx.beginPath();
                ctx.ellipse(0, 0, 8, 8, 0, 0, 2 * Math.PI);
                ctx.stroke();
            }

            ctx.restore();
        });

        this.gameObjects.filter(o => o.type == "UI_FRAME").forEach(e => {
            if (e.data.isVisible == true) {
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.fillStyle = "#000000";
                ctx.strokeStyle = "#FF0000"
                ctx.rect(e.position.x, e.position.y, e.data.width, e.data.height/3)
                ctx.rect(e.position.x, e.position.y+e.data.height/3, e.data.width, e.data.height/3)
                ctx.rect(e.position.x, e.position.y+(2*e.data.height/3), e.data.width, e.data.height/3)
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        })

        this.shotTraces.forEach(t => {
            ctx.strokeStyle = rgbToHex(255, 255, 255);
            ctx.beginPath();
            ctx.moveTo(t.x1, t.y1);
            ctx.lineTo(t.x2, t.y2);
            ctx.stroke();
        })





        var UICenterPoint = 0.47;
        var UIOffset = 0.17;
        ctx.fillStyle = rgbToHexAlpha(0, 0, 0, 200);
        var underlayWidth = 0.38;
        ctx.fillRect((canvasWidth * UICenterPoint) - (canvasWidth * underlayWidth * 0.49), 0, canvasWidth * underlayWidth, canvasHeight * 0.075);
        ctx.font = "20px Georgia";
        ctx.shadowBlur = 8;
        var remainingEnems = this.gameObjects.filter(o => o.type == "ENEMY").length + this.upcomingEnemies.length;
        ctx.fillStyle = rgbToHex(0, 0, 255);
        ctx.shadowColor = rgbToHex(0, 0, 255);
        ctx.textAlign = "left";
        ctx.fillText("ᐯ" + this.currency, canvasWidth * (UICenterPoint - UIOffset), canvasHeight * 0.06);
        ctx.shadowColor = rgbToHex(255, 0, 0);
        ctx.fillStyle = rgbToHex(255, 0, 0);
        ctx.textAlign = "center";
        ctx.fillText("⎔" + remainingEnems, canvasWidth * (UICenterPoint), canvasHeight * 0.06);
        ctx.shadowColor = rgbToHex(0, 255, 0);
        ctx.fillStyle = rgbToHex(0, 255, 0);
        ctx.textAlign = "right";
        ctx.fillText("✚" + this.baseHealth, canvasWidth * (UICenterPoint + UIOffset), canvasHeight * 0.06);

        ctx.restore();
    }

    attachTurret(turret, platformNumber) {
        var platform = this.gameObjects.filter(o => o.type == "TURRET_PLATFORM" && o.data.platformNum == platformNumber).pop();
        platform.data.hasTurret = true;
        platform.data.turret = turret;
    }

    getModifiers(turretType, section) {
        var appliedRules = this.rules.filter(r => r.type == "EMBARGO" && r.section == section && r.subtype == turretType);
        var appliedSectionMods = this.sectionModifiers.filter(m => m.section == section && m.subtype == turretType);

        var rangeModifiers = appliedRules.filter(r => r.modifies == "RANGE").concat(appliedSectionMods.filter(m => m.modifies == "RANGE")).map(o => o.value);
        var cooldownModifiers = appliedRules.filter(r => r.modifies == "COOLDOWN").concat(appliedSectionMods.filter(m => m.modifies == "COOLDOWN")).map(o => o.value);
        var accuracyModifiers = appliedRules.filter(r => r.modifies == "ACCURACY").concat(appliedSectionMods.filter(m => m.modifies == "ACCURACY")).map(o => o.value);

        var rangeMod = rangeModifiers.length > 0 ? rangeModifiers.reduce((acc, cur) => acc * cur) : 1;
        var cooldownMod = cooldownModifiers.length > 0 ? cooldownModifiers.reduce((acc, cur) => acc * cur) : 1;
        var accuracyMod = accuracyModifiers.length > 0 ? accuracyModifiers.reduce((acc, cur) => acc * cur) : 1;

        return { range: rangeMod, cooldown: cooldownMod, accuracy: accuracyMod };
    }

    getTurretRepresentation() {

        var rep = [];
        this.gameObjects.filter(o => o.type == "TURRET_PLATFORM").forEach(p => {
            if (p.data.hasTurret) {
                switch (p.data.turret.type) {
                    case "STANDARD":
                        rep = rep.concat([1, 0, 0, 0]);
                        break;
                    case "SNIPER":
                        rep = rep.concat([0, 1, 0, 0]);
                        break;
                    case "MACHINE_GUN":
                        rep = rep.concat([0, 0, 1, 0]);
                        break;
                    case "LASER":
                        rep = rep.concat([0, 0, 0, 1]);
                        break;
                }
            } else {
                rep = rep.concat([0, 0, 0, 0]);
            }
        })

        return rep;
    }

    addNewRule() {
        var nextRule = getNextRule(model, this.getTurretRepresentation(), 0, allRules, this.rules);
        console.log(nextRule);
        this.rules.push(nextRule);
        this.rulesUpdated = true;
    }

    buyTurret(turret, platform) {
        var platformObj = this.gameObjects.filter(o => o.type == "TURRET_PLATFORM" && o.data.platformNum == platform)[0];
        if (!platformObj.data.hasTurret) {
            if (turret.price <= this.currency) {
                this.currency -= turret.price;
                this.attachTurret(turret, platform);
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    nextWave() {
        if(this.wave == 0){
            for (var i = 0; i < 10; i++) {
                this.upcomingEnemies.push(makeEnemy({ x: -10, y: canvasHeight * 0.5 }, "NORM", 1));
            }
        } else if (this.wave < 5) {

            for (var i = 0; i < 3; i++) {
                this.upcomingEnemies.push(makeEnemy({ x: -10, y: canvasHeight * 0.5 }, "NORM", 1));
            }

            if (this.wave > 0) {
                for (var i = 0; i < 3 + (this.wave - 1); i++) {
                    this.upcomingEnemies.push(makeEnemy({ x: -10, y: canvasHeight * 0.5 }, "NORM", 2));
                }
            }
            if (this.wave > 2) {
                for (var i = 0; i < 3 + (this.wave - 1); i++) {
                    this.upcomingEnemies.push(makeEnemy({ x: -10, y: canvasHeight * 0.5 }, "NORM", Math.floor(Math.random() * 3)));
                }
            }
        } else if (this.wave < 10) {
            for (var i = 0; i < 3 + (this.wave - 1); i++) {
                this.upcomingEnemies.push(makeEnemy({ x: -10, y: canvasHeight * 0.5 }, "NORM", Math.floor(Math.random() * 5)));
            }
        } else if (this.wave < 15) {
            for (var i = 0; i < 3 + (this.wave - 1); i++) {
                this.upcomingEnemies.push(makeEnemy({ x: -10, y: canvasHeight * 0.5 }, "NORM", Math.floor(Math.random() * 8)));
            }
        } else {
            for (var i = 0; i < Math.floor(this.wave * 1.5); i++) {
                this.upcomingEnemies.push(makeEnemy({ x: -10, y: canvasHeight * 0.5 }, "NORM", Math.floor(Math.random() * Math.min(10, this.wave))));
            }
        }
        this.upcomingEnemies = this.upcomingEnemies.reverse();
        if(this.wave % 2 == 0){
            this.enemySpawnRate = Math.max(10, this.enemySpawnRate - 1);
        }
        this.wave += 1;
    }

    startWave() {
        this.nextWave();
        this.spawnEnemies = true;
    }
}