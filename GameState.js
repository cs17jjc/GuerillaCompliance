class GameState {
    constructor() {
        this.tileSize = 30;
        this.levelHeight = 100;
        this.levelRadius = 12;
        this.levelGeom = generateMap(this.levelHeight,this.levelRadius,this.tileSize);
        this.visableGeom = [];

        this.playerPosition = {x:4*this.tileSize,y:(this.levelHeight-4)*this.tileSize};
        this.playerSize = {w:this.tileSize*0.8,h:this.tileSize*0.9};
        this.playerVelocity = {x:0,y:0};
        this.playerPositionOpposite = {x: (this.levelRadius*this.tileSize) + ((this.levelRadius*this.tileSize) - this.playerPosition.x - this.playerSize.w) ,y:this.playerPosition.y};

        this.cameraYOffset = 200;
        this.cameraY = this.playerPosition.y - canvasHeight + this.cameraYOffset;

        this.jumpTimer = 0;
        this.hasLanded = false;

        this.gameOver = false;
        this.gameWon = true;
        this.gold = 0;
    }
    static initial() {
        return new GameState();
    }

    playerRects(){
        return [{x:this.playerPosition.x,y:this.playerPosition.y,w:this.playerSize.w,h:this.playerSize.h},
                {x:this.playerPositionOpposite.x,y:this.playerPositionOpposite.y,w:this.playerSize.w,h:this.playerSize.h}]
    }

    update(inputsArr,soundToggle) {
        
        var playerTileY = Math.trunc(this.playerPosition.y/this.tileSize);
        this.visableGeom = [];
        for(var i = Math.max(0,playerTileY - 10);i<Math.min(playerTileY+10,this.levelHeight);i++){
            this.visableGeom = this.visableGeom.concat(this.levelGeom.get(i));
        }
        
        if(inputsArr.includes("UP") && Date.now() - this.jumpTimer > 1000 && this.hasLanded){
            this.playerVelocity.y -= 12;
            this.jumpTimer = Date.now();
            this.hasLanded = false;
        }
        if(inputsArr.includes("LEFT")){
            this.playerVelocity.x = 6;
        }
        if(inputsArr.includes("RIGHT")){
            this.playerVelocity.x = -6;
        }

        var xCollision = false;
        var yCollison = false;

        this.visableGeom.forEach(o => {
            const pX = {x:this.playerPosition.x + this.playerVelocity.x,y:this.playerPosition.y,w:this.playerSize.w,h:this.playerSize.h-1};
            const pY = {x:this.playerPosition.x,y:this.playerPosition.y + this.playerVelocity.y,w:this.playerSize.w,h:this.playerSize.h};
            
            const pOX = {x:this.playerPositionOpposite.x - this.playerVelocity.x,y:this.playerPositionOpposite.y,w:this.playerSize.w,h:this.playerSize.h-1};
            const pOY = {x:this.playerPositionOpposite.x,y:this.playerPositionOpposite.y + this.playerVelocity.y,w:this.playerSize.w,h:this.playerSize.h};
            if(o.t != "SLIME"){
                if(intersectRect(pX,o.r) || intersectRect(pOX,o.r)){
                    xCollision = true;
                }
                if(intersectRect(pY,o.r) || intersectRect(pOY,o.r)){
                    yCollison = true;
                }
            } else {
                const sSX = makeRect(o.x + o.vx,o.y,o.s,o.s-1);
                const sSY = makeRect(o.x-2,o.y + o.vy,o.s+2,o.s);

                var yColSlime = false;
                var xColSlime = false;

                if(intersectRect(pX,sSX) || intersectRect(pOX,sSX)){
                    xCollision = true;
                    xColSlime = true;
                }
                if(intersectRect(pY,sSY) || intersectRect(pOY,sSY)){
                    yCollison = true;
                }
                
                
                var hasFloor = false;
                this.visableGeom.filter(t => t != o).forEach(t => {

                    if(t.t == "SLIME"){
                        const sX = makeRect(t.x + t.vx,t.y,t.s,t.s);

                        if(intersectRect(sX,sSX)){
                            o.vx *= -1;
                        }
                    } else {
                        if(intersectRect(t.r,sSY)){
                           yColSlime = true;
                        }
                        
                        if(intersectRect(t.r,sSX)){
                            xColSlime = true;
                        }
                        
                        var slimeTileX = Math.trunc(o.x/this.tileSize);
                        var slimeTileY = Math.trunc(o.y/this.tileSize);
                        if(o.vx > 0){
                            if(t.r.x==(slimeTileX+1)*this.tileSize && t.r.y==(slimeTileY+1)*this.tileSize){
                                hasFloor = true;
                            }
                        } else {
                            slimeTileX = Math.trunc((o.x+o.s)/this.tileSize);
                            if(t.r.x==(slimeTileX-1)*this.tileSize && t.r.y==(slimeTileY+1)*this.tileSize){
                                hasFloor = true;
                            }
                        }
                    }
                });

                if(yColSlime){
                    o.vy = 0;
                } else {
                    o.vy += 0.1;
                }

                if(xColSlime ^ !hasFloor){
                    o.vx *= -1;
                }

                o.x += o.vx;
                o.y += o.vy;

            }

        });

        if(xCollision){
            this.playerVelocity.x = 0;
        } else {
            this.playerVelocity.x *= 0.8;
        }
        if(yCollison){
            this.playerVelocity.y = 0;
            this.hasLanded = true;
        }else{
            this.playerVelocity.y += 0.5;
        }
        if(xCollision && yCollison){
            this.playerVelocity.x = 0;
            this.playerVelocity.y = 0;
        }

        this.playerPosition = addVector(this.playerPosition,this.playerVelocity);
        this.playerPositionOpposite = {x: (this.levelRadius*this.tileSize) + ((this.levelRadius*this.tileSize) - this.playerPosition.x - this.playerSize.w),y:this.playerPosition.y};
        this.cameraY = Math.min(this.cameraY,this.playerPosition.y - canvasHeight + this.cameraYOffset);
    }

    draw(ctx){
        ctx.save();

        this.visableGeom.filter(t => t.t=="WALL" || t.t=="FLOOR" || t.t.includes("MIRROR")).forEach(o => {
            ctx.fillStyle = rgbToHex(0,0,0);
            ctx.fillRect(o.r.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.r.y-this.cameraY,o.r.w,o.r.h);
        });
        this.visableGeom.filter(t => t.t=="SLIME").forEach(o => {
            ctx.fillStyle = rgbToHex(0,150,0);
            ctx.fillRect(o.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.y-this.cameraY,o.s,o.s);
        });

        ctx.fillStyle = rgbToHex(0,0,0);
        ctx.fillRect(this.playerPosition.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),this.playerPosition.y-this.cameraY,this.playerSize.w,this.playerSize.h);
        ctx.fillRect(this.playerPositionOpposite.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),this.playerPositionOpposite.y-this.cameraY,this.playerSize.w,this.playerSize.h);

        ctx.restore();
    }
}