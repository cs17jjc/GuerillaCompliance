class GameState {
    constructor() {
        this.gameObjects = [];
        this.wayPoints = new Map();
        this.baseHealth = 100;

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


        gs.gameObjects.push(makeEnemy({x:0,y:canvasHeight/2},"NORM",3,5,0))

        return gs;
    }

    updateGame(inputsArr, soundToggle) {

        this.gameObjects.forEach(e => {
            switch(e.type){
                case "ENEMY":
                    this.updateEnemy(e);
            }
        })

    }

    updateEnemy(enemy){
        var targetPosition = this.wayPoints.get(enemy.data.curWay);
        var distanceToTarget = calcDistance(enemy.position,targetPosition);
        if(distanceToTarget <= 4){
            enemy.data.curWay = Math.min(enemy.data.curWay+1,this.wayPoints.size-1);
        } else {
            var angle = calcAngle(enemy.position,targetPosition);
            var velComp = calcComponents(enemy.data.speed,angle);
            enemy.position.x += velComp.x;
            enemy.position.y += velComp.y;
        }
        if(enemy.data.curWay == this.wayPoints.size-1){
            this.baseHealth -= enemy.data.dmg;
            this.enemyLifespans.push(Date.now() - enemy.data.timeMade);
            enemy.isAlive = false;
        }
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