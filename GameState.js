class GameState {
    constructor() {
        this.gameObjects = [];
        this.wayPoints = new Map();
    }
    static initial() { 
        var gs = new GameState();

        gs.wayPoints.set(0,{x:canvasWidth*0.1,y:canvasHeight*0.1})
        gs.wayPoints.set(1,{x:canvasWidth*0.4,y:canvasHeight*0.1})
        gs.wayPoints.set(2,{x:canvasWidth*0.4,y:canvasHeight*0.9})
        gs.wayPoints.set(3,{x:canvasWidth*0.7,y:canvasHeight*0.9})
        gs.wayPoints.set(4,{x:canvasWidth*0.7,y:canvasHeight*0.1})
        gs.wayPoints.set(5,{x:canvasWidth*0.9,y:canvasHeight*0.1})
        gs.wayPoints.set(6,{x:canvasWidth*0.9,y:canvasHeight*0.9})

        gs.gameObjects.push(makeEnemy({x:0,y:canvasHeight/2},"NORM",0))

        return gs;
    }

    updateGame(inputsArr, soundToggle) {


    }

    update(inputsArr, soundToggle) {
        this.updateGame(inputsArr, soundToggle);
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = rgbToHex(255,0,0);
        Array.from(this.wayPoints.values()).forEach(w => {
            ctx.fillRect(w.x-2,w.y-2,4,4);
        })

        ctx.fillStyle = rgbToHex(0,255,0);
        this.gameObjects.filter(o => o.type == "ENEMY").forEach(e => {
            
        })

        ctx.restore();
    }
}