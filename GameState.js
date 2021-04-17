class GameState {
    constructor() {
        this.tileSize = 30;
        this.levelHeight = 200;
        this.levelRadius = 12;
        this.levelGeom = generateMap(this.levelHeight,this.levelRadius,this.tileSize);
        this.visableGeom = [];

        this.playerPosition = {x:4*this.tileSize,y:(this.levelHeight-4)*this.tileSize};
        this.playerSize = {w:this.tileSize*0.8,h:this.tileSize*0.9};
        this.playerVelocity = {x:0,y:0};
        this.playerPositionOpposite = {x: (this.levelRadius*this.tileSize) + ((this.levelRadius*this.tileSize) - this.playerPosition.x - this.playerSize.w) ,y:this.playerPosition.y};
        this.playerAnimationTimer = Date.now();

        this.maxHealth = 100;
        this.playerHealth = this.maxHealth;
        this.prevPlayerHealth = this.playerHealth;

        this.cameraYOffset = this.tileSize*7;
        this.cameraY = this.playerPosition.y - canvasHeight + this.cameraYOffset;

        this.jumpTimer = 0;
        this.hasLanded = false;

        this.backgroundImg = createBackgroundImage(this.levelRadius,this.levelHeight,this.tileSize);

        this.gameOver = false;
        this.gameOverTimer = 0;
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
        for(var i = Math.max(0,playerTileY - 20);i<Math.min(playerTileY+8,this.levelHeight);i++){
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
            const pOYJump = {x:this.playerPositionOpposite.x,y:this.playerPositionOpposite.y + this.playerSize.h-2,w:this.playerSize.w,h:2};
            const pYJump = {x:this.playerPosition.x,y:this.playerPosition.y + this.playerSize.h-2,w:this.playerSize.w,h:2};
            if(intersectRect(pYJump,o.r) || intersectRect(pOYJump,o.r)){
                this.hasLanded = true;
            }
            
                
            } else if (Date.now() - o.hitTimer > o.hitspeed){
                var sSX = makeRect(o.x+o.vx,o.y,o.s,o.s);
                var sSY = makeRect(o.x,o.y+o.vy,o.s,o.s);
                if(intersectRect(pX,sSX) || intersectRect(pOX,sSX) || intersectRect(pY,sSY) || intersectRect(pOY,sSY)){
                    o.hitTimer = Date.now();
                    this.playerHealth = Math.max(0,this.playerHealth-o.dmg);
                }
            }
        });
        this.visableGeom.filter(t => t.t == "SLIME").forEach(o => {
            o.vy += 0.1;
            o.move = false;
            var sSX = makeRect(o.x+o.vx,o.y,o.s,o.s-1);
            var sSY = makeRect(o.x-1,o.y+o.vy,o.s+2,o.s);
            var xColSlime = false;
            var yColSlime = false;
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
                o.move = true;
            }

            if(xColSlime ^ !hasFloor){
                o.vx *= -1;
            }
            if(o.move){
                o.x += o.vx;
            }
            o.y += o.vy;
        });

        if(xCollision){
            this.playerVelocity.x = 0;
        } else {
            this.playerVelocity.x *= 0.8;
        }
        if(yCollison){
            this.playerVelocity.y = 0;
        }else{
            this.playerVelocity.y += 0.5;
        }
        if(xCollision && yCollison){
            this.playerVelocity.x = 0;
            this.playerVelocity.y = 0;
        }

        if((this.playerPosition.y-this.cameraY > canvasHeight || this.playerHealth == 0) && !this.gameOver){
            this.gameOver = true
            this.gameOverTimer = Date.now();
        }
        if(!this.gameOver){
            this.playerPosition = addVector(this.playerPosition,this.playerVelocity);
        }
        this.playerPositionOpposite = {x: (this.levelRadius*this.tileSize) + ((this.levelRadius*this.tileSize) - this.playerPosition.x - this.playerSize.w),y:this.playerPosition.y};
        this.cameraY = Math.min(this.cameraY,this.playerPosition.y - canvasHeight + this.cameraYOffset);
    }

    draw(ctx){
        ctx.save();
        ctx.fillStyle = rgbToHex(50,50,250);
        ctx.fillRect(0,0,canvasWidth,canvasHeight)

        ctx.drawImage(this.backgroundImg,((canvasWidth/2) - (this.levelRadius*this.tileSize)),-this.cameraY*0.5);


        this.visableGeom.forEach(o => {
            switch(o.t){
                case "FLOOR":
                    switch(o.d){
                        case "LEFT":
                            ctx.drawImage(textures.get(2),o.r.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.r.y-this.cameraY,o.r.w,o.r.h);
                            break;
                        case "RIGHT":
                            ctx.drawImage(textures.get(3),o.r.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.r.y-this.cameraY,o.r.w,o.r.h);
                            break;
                        case "CENT":
                            ctx.drawImage(textures.get(1),o.r.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.r.y-this.cameraY,o.r.w,o.r.h);
                            break;
                    }
                    break;
                case "WALL":
                    switch(o.d){
                        case "LEFT":
                            ctx.drawImage(textures.get(4),o.r.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.r.y-this.cameraY,o.r.w,o.r.h);
                            break;
                        case "RIGHT":
                            ctx.drawImage(textures.get(5),o.r.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.r.y-this.cameraY,o.r.w,o.r.h);
                            break;
                    }
                    break;
                case "MIRROR":
                    switch(Math.trunc(o.r.x/this.tileSize)){
                        case this.levelRadius-1:
                            ctx.drawImage(textures.get(17),o.r.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.r.y-this.cameraY,o.r.w,o.r.h);
                            break;
                        case this.levelRadius:
                            ctx.drawImage(textures.get(16),o.r.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.r.y-this.cameraY,o.r.w,o.r.h);
                            break;
                    }
                    break;
            }
            });
        this.visableGeom.filter(t => t.t=="SLIME").forEach(o => {
            if(o.dmg == 0){
                ctx.drawImage(textures.get(6),o.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.y-this.cameraY - Math.sin(Date.now()/100)*2,o.s,o.s + Math.sin(Date.now()/100)*2);
            } else {
                if(o.s == this.tileSize-3){
                    ctx.drawImage(textures.get(9),o.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.y-this.cameraY - Math.sin(Date.now()/100)*2,o.s,o.s + Math.sin(Date.now()/100)*2);
                } else {
                    ctx.drawImage(textures.get(12),o.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),o.y-this.cameraY - Math.sin(Date.now()/100)*2,o.s,o.s + Math.sin(Date.now()/100)*2);
                }
            }
        });

        ctx.fillStyle = rgbToHex(0,0,0);
        var paTime = Date.now() - this.playerAnimationTimer;
        if(paTime < 250){
            ctx.drawImage(textures.get(18),this.playerPosition.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),this.playerPosition.y-this.cameraY,this.playerSize.w,this.playerSize.h);
            ctx.drawImage(textures.get(18),this.playerPositionOpposite.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),this.playerPositionOpposite.y-this.cameraY,this.playerSize.w,this.playerSize.h);
        }else if(paTime < 500){
            ctx.drawImage(textures.get(19),this.playerPosition.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),this.playerPosition.y-this.cameraY,this.playerSize.w,this.playerSize.h);
            ctx.drawImage(textures.get(19),this.playerPositionOpposite.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),this.playerPositionOpposite.y-this.cameraY,this.playerSize.w,this.playerSize.h);
        }else if(paTime < 750){
            ctx.drawImage(textures.get(20),this.playerPosition.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),this.playerPosition.y-this.cameraY,this.playerSize.w,this.playerSize.h);
            ctx.drawImage(textures.get(20),this.playerPositionOpposite.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),this.playerPositionOpposite.y-this.cameraY,this.playerSize.w,this.playerSize.h);
        } else{
            ctx.drawImage(textures.get(21),this.playerPosition.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),this.playerPosition.y-this.cameraY,this.playerSize.w,this.playerSize.h);
            ctx.drawImage(textures.get(21),this.playerPositionOpposite.x + ((canvasWidth/2) - (this.levelRadius*this.tileSize)),this.playerPositionOpposite.y-this.cameraY,this.playerSize.w,this.playerSize.h);
        }
        if(paTime >= 1000){
            this.playerAnimationTimer = Date.now();
        }

        ctx.fillStyle = rgbToHex(150,20,20);
        ctx.fillRect(canvasWidth*0.91,canvasHeight*0.2,canvasWidth*0.05,canvasHeight*0.4);
        ctx.fillStyle = rgbToHex(250,20,20);
        var healthOffset = canvasHeight*0.4*(1 - (this.playerHealth/this.maxHealth));
        ctx.fillRect(canvasWidth*0.91,canvasHeight*0.2+healthOffset,canvasWidth*0.05,canvasHeight*0.4-healthOffset);

        if(this.gameOver){
            var ratio = Math.min(1,(Date.now() - this.gameOverTimer)/3000);
            ctx.textAlign = "center";
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.shadowColor = rgbToHexAlpha(100,0,0,Math.trunc(255*ratio));
            ctx.fillStyle = rgbToHexAlpha(220,0,0,Math.trunc(255*ratio));
            ctx.font = "90px Arial";
            ctx.fillText("Game Over", canvasWidth/2, canvasHeight/2 - (25 * ratio));
            ctx.font = "70px Arial";
            ctx.fillText("Press R To Restart", canvasWidth/2, canvasHeight/2 - (25 * ratio)+100);
        }
        ctx.restore();
    }
}