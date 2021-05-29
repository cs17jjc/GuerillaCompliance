class GameState {
    constructor() {
        this.gameObjects = [];
        this.wayPoints = new Map();
        this.baseHealth = 100;

        this.upcomingEnemies = [];
        this.enemySpawnRate = 25;
        this.spawnEnemies = false;
        this.spawnedFrameCounter = 0;

        this.enemyLifespans = [];
    }
    static initial() { 
        var gs = new GameState();

        gs.wayPoints.set(0,{x:canvasWidth*-0.01,y:canvasHeight*0.5})

        gs.wayPoints.set(1,{x:canvasWidth*0.14,y:canvasHeight*0.5})
        gs.wayPoints.set(2,{x:canvasWidth*0.14,y:canvasHeight*0.1})

        gs.wayPoints.set(3,{x:canvasWidth*0.38,y:canvasHeight*0.1})
        gs.wayPoints.set(4,{x:canvasWidth*0.38,y:canvasHeight*0.9})

        gs.wayPoints.set(5,{x:canvasWidth*0.56,y:canvasHeight*0.9})
        gs.wayPoints.set(6,{x:canvasWidth*0.56,y:canvasHeight*0.1})

        gs.wayPoints.set(7,{x:canvasWidth*0.8,y:canvasHeight*0.1})
        gs.wayPoints.set(8,{x:canvasWidth*0.8,y:canvasHeight*0.5})

        gs.wayPoints.set(9,{x:canvasWidth*1.01,y:canvasHeight*0.5})


        var enems = [];
        enems.push(makeEnemy({x:-1,y:canvasHeight/2},"NORM",10,3,5,0));
        enems.push(makeEnemy({x:-1,y:canvasHeight/2},"NORM",10,4,5,0));
        enems.push(makeEnemy({x:-1,y:canvasHeight/2},"NORM",10,2,5,0));
        enems.push(makeEnemy({x:-1,y:canvasHeight/2},"NORM",10,2,5,0));
        enems.push(makeEnemy({x:-1,y:canvasHeight/2},"NORM",10,4,5,0));

        gs.upcomingEnemies = enems;
        gs.spawnEnemies = true;

        return gs;
    }

    updateGame(inputsArr, soundToggle) {

        if(this.spawnEnemies && this.upcomingEnemies.length > 0){
            if(this.spawnedFrameCounter == this.enemySpawnRate){
                this.gameObjects.push(this.upcomingEnemies.pop());
                this.spawnedFrameCounter = 0;
            } else {
                this.spawnedFrameCounter += 1;
            }
        }

        this.gameObjects.forEach(e => {
            switch(e.type){
                case "ENEMY":
                    this.updateEnemy(e);
                case "TURRET":
                    this.updateTurret(e);
            }
        })
        this.gameObjects = this.gameObjects.filter(o => o.isAlive);

    }

    updateEnemy(enemy){
        if(enemy.data.health <= 0){
            this.enemyLifespans.push(Date.now() - enemy.data.timeMade);
            enemy.isAlive = false;
        } else {
            var targetPosition = this.wayPoints.get(enemy.data.curWay);
            var distanceToTarget = calcDistance(enemy.position,targetPosition);
            enemy.data.curWayDist = distanceToTarget;
            if(distanceToTarget <= 4){

                if(enemy.data.curWay == this.wayPoints.size-1){
                    this.baseHealth -= enemy.data.dmg;
                    this.enemyLifespans.push(Date.now() - enemy.data.timeMade);
                    enemy.isAlive = false;
                }

                enemy.data.curWay = Math.min(enemy.data.curWay+1,this.wayPoints.size-1);
            } else {
                var angle = calcAngle(enemy.position,targetPosition);
                var velComp = calcComponents(enemy.data.speed,angle);
                enemy.position.x += velComp.x;
                enemy.position.y += velComp.y;
            }
            
        }
    }

    updateTurret(turret){
        var enemyTargets = Array.from(this.gameObjects.filter(o => o.type == "ENEMY"));
        var enemiesInRange = checkRange(enemyTargets, turret.range, turret.position);

    }

    checkRange(targets, range, position){
        var retArray;
        for(i = 0; i < enemyTargets.length; i++){
            if(calcDistance(position, enemyTargets[i]) < range){
                retArray.add(enemyTargets[i]);
            }
        }
        return retArray;
    }

    update(inputsArr, soundToggle) {
        this.updateGame(inputsArr, soundToggle);
    }

    draw(ctx) {
        ctx.save();

        ctx.fillStyle = rgbToHex(50,200,50);
        ctx.fillRect(0,0,canvasWidth/3-50,canvasHeight);

        ctx.fillStyle = rgbToHex(200,50,50);
        ctx.fillRect(canvasWidth/3-50,0,canvasWidth/3+50,canvasHeight/2);

        ctx.fillStyle = rgbToHex(50,50,200);
        ctx.fillRect(canvasWidth/3-50,canvasHeight/2,canvasWidth/3+50,canvasHeight/2);

        ctx.fillStyle = rgbToHex(50,50,50);
        ctx.fillRect((canvasWidth/3)*2,0,canvasWidth/3,canvasHeight);

        ctx.fillStyle = rgbToHex(255,0,0);
        Array.from(this.wayPoints.values()).forEach(w => {
            ctx.fillRect(w.x-2,w.y-2,4,4);
        })

        ctx.fillStyle = rgbToHex(0,255,0);
        this.gameObjects.filter(o => o.type == "ENEMY").forEach(e => {
            ctx.fillRect(e.position.x-5,e.position.y-5,10,10);
        })

        ctx.restore();
    }
}