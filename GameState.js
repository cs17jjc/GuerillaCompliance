class GameState {
    constructor() {
        this.gameObjects = [];
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.17, y: canvasHeight * 0.5 }, 0, 0))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.1, y: canvasHeight * 0.2 }, 0, 1))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.25, y: canvasHeight * 0.05 }, 0, 2))
        
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.41, y: canvasHeight * 0.18 }, 1, 3))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.53, y: canvasHeight * 0.36 }, 1, 4))

        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.43, y: canvasHeight * 0.60 }, 2, 5))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.47, y: canvasHeight * 0.83 }, 2, 6))

        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.76, y: canvasHeight * 0.15 }, 3, 7))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.83, y: canvasHeight * 0.44 }, 3, 8))
        this.gameObjects.push(makeTurretPlatform({ x: canvasWidth * 0.93, y: canvasHeight * 0.56 }, 3, 9))

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
        this.enemySpawnRate = 8;
        this.spawnEnemies = false;
        this.spawnedFrameCounter = 0;

        this.enemyLifespans = [];

        this.rules = [];
        this.sectionModifiers = [

            { section: 0, turret: "STANDARD", modifies: "ACCURACY", value: 0.9 },
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
            { section: 3, turret: "STANDARD", modifies: "ACCURACY", value: 1.1 },
            
        ];
        this.rulesUpdated = false;

        this.shotTraces = [];
    }
    static initial() {
        var gs = new GameState();


        var enems = [];
        for (var i = 0; i < 100; i++) {
            enems.push(makeEnemy({ x: -10, y: canvasHeight / 2 }, "NORM", Math.floor(Math.random() * 10)));
        }

        gs.upcomingEnemies = enems;
        gs.spawnEnemies = true;

        return gs;
    }

    updateGame(inputsArr, soundToggle) {

        if (this.spawnEnemies && this.upcomingEnemies.length > 0) {
            if (this.spawnedFrameCounter == this.enemySpawnRate) {
                this.gameObjects.push(this.upcomingEnemies.pop());
                this.spawnedFrameCounter = 0;
            } else {
                this.spawnedFrameCounter += 1;
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
            var towerClicked = this.checkTowerClicked(this.returnMousePos(clickEvent));
            isClicked = false;
        }

        if (this.rulesUpdated) {
            this.rulesUpdated = false;
        }
    }

    updateEnemy(enemy) {
        if (enemy.data.health <= 0) {
            this.enemyLifespans.push(Date.now() - enemy.data.timeMade);
            enemy.isAlive = false;
        } else {
            var targetPosition = this.wayPoints.get(enemy.data.curWay);
            var distanceToTarget = calcDistance(enemy.position, targetPosition);
            enemy.data.curWayDist = distanceToTarget;
            if (distanceToTarget <= 4) {

                if (enemy.data.curWay == this.wayPoints.size - 1) {
                    this.baseHealth -= enemy.data.health;
                    this.enemyLifespans.push(Date.now() - enemy.data.timeMade);
                    enemy.isAlive = false;
                }

                enemy.data.curWay = Math.min(enemy.data.curWay + 1, this.wayPoints.size - 1);
                enemy.data.curWayDist = 999999999999999;//Lmao this is such a hack, it avoids having to re-calcualte distance for targeting
            } else {
                enemy.data.speed = (11 - enemy.data.health) * 0.5;
                var angle = calcAngle(enemy.position, targetPosition);
                var velComp = calcComponents(enemy.data.speed, angle);
                enemy.position.x += velComp.x;
                enemy.position.y += velComp.y;
            }
            enemy.data.angle += 0.05;
        }
    }

    updateTurret(turret, position, section) {

        //Update turret attributes to conform to section & rule modifiers
        if (!turret.atributesUpdated || this.rulesUpdated) {
            var modifiers = this.getModifiers(turret.type, section);
            turret.range = turret.baseRange * modifiers.range;
            turret.accuracy = turret.baseAccuracy * modifiers.accuracy;
            turret.cooldown = turret.baseCooldown * modifiers.cooldown;

            turret.atributesUpdated = true;
        }

        //Enemy targeting & shooting
        if (turret.shotTimer == 0 && !this.rules.filter(r => r.type == "BAN" && r.subtype == turret.type).map(r => r.section).includes(section)) {
            var enemyTargets = this.gameObjects.filter(o => o.type == "ENEMY");
            var avoidEnemyHealths = this.rules.filter(r => r.type == "PRESERVE" && r.section == section).map(r => r.health);
            var enemiesInRange = checkRange(enemyTargets, turret.range, position).filter(e => !avoidEnemyHealths.includes(e.data.health));
            if (enemiesInRange.length > 0) {

                var target = targetEnemy(enemiesInRange);
                if (Math.random() < turret.accuracy) {
                    target.data.health -= turret.damage;
                    turret.shotTimer += 1;
                    this.shotTraces.push({ x1: position.x, y1: position.y, x2: target.position.x, y2: target.position.y, type: turret.type, frameCounter: 0 });
                } else {
                    turret.shotTimer += 1;
                    this.shotTraces.push({ x1: position.x, y1: position.y, x2: target.position.x + ((Math.random() * 20) - 10), y2: target.position.y + ((Math.random() * 20) - 10), type: turret.type, frameCounter: 0 });
                }
            }
        } else {
            if (turret.shotTimer == turret.cooldown) {
                turret.shotTimer = 0;
            } else {
                turret.shotTimer += 1;
            }
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

        ctx.lineWidth = 3;
        ctx.strokeStyle = rgbToHex(200, 200, 200);
        ctx.strokeRect(0, 0, canvasWidth / 3 - 50, canvasHeight);
        ctx.strokeRect(canvasWidth / 3 - 50, 0, canvasWidth / 3 + 50, canvasHeight / 2);
        ctx.strokeRect(canvasWidth / 3 - 50, canvasHeight / 2, canvasWidth / 3 + 50, canvasHeight / 2);
        ctx.strokeRect((canvasWidth / 3) * 2, 0, canvasWidth / 3, canvasHeight);

        ctx.fillStyle = rgbToHex(255, 0, 0);

        ctx.lineWidth = 3;
        ctx.strokeStyle = rgbToHex(0, 255, 0);
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.shadowBlur = 10;
        ctx.shadowColor = rgbToHex(0, 255, 0);
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
            if (e.data.hasTurret) {
                ctx.fillStyle = rgbToHexAlpha(255, 0, 0, 50);
                ctx.strokeStyle = rgbToHexAlpha(0, 0, 0, 50);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(e.position.x, e.position.y, e.data.turret.range, e.data.turret.range, 0, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
            ctx.fillStyle = rgbToHexAlpha(150, 150, 150, 150);
            ctx.beginPath();
            ctx.ellipse(e.position.x, e.position.y, 10, 10, 0, 0, 2 * Math.PI);
            ctx.fill();

        })

        this.shotTraces.forEach(t => {
            ctx.strokeStyle = rgbToHex(255, 255, 255);
            ctx.beginPath();
            ctx.moveTo(t.x1, t.y1);
            ctx.lineTo(t.x2, t.y2);
            ctx.stroke();
        })

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
}