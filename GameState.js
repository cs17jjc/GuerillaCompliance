class GameState {
    constructor() {
        this.tileSize = 30;
        this.levelHeight = 200;
        this.levelRadius = 12;
        this.levelGeom = generateMap(this.levelHeight,this.levelRadius,this.tileSize);
        this.visableGeom = [];
        this.geomAnimationTimer = 0;

        this.playerPosition = {x:4*this.tileSize,y:(this.levelHeight-4)*this.tileSize};
        this.playerSize = {w:this.tileSize*0.8,h:this.tileSize*0.9};
        this.playerVelocity = {x:0,y:0};
        this.playerPositionOpposite = {x: (this.levelRadius*this.tileSize) + ((this.levelRadius*this.tileSize) - this.playerPosition.x - this.playerSize.w) ,y:this.playerPosition.y};
        this.playerAnimationTimer = Date.now();

        this.equipedWeapon;
        this.hitBox;
        this.hitBoxOpp;
        this.attackDir = "";
        this.attackTimer = 0;

        this.maxHealth = 100;
        this.playerHealth = this.maxHealth;
        this.prevPlayerHealth = this.playerHealth;
        this.maxArmor = 3;
        this.playerArmor = this.maxArmor;
        this.prevPlayerArmor = this.playerArmor;
        this.hitTimer = 0;

        this.coins = 0;
        this.lastCoinTimer = 0;
        this.coinUIImage = "coin1";

        this.items = [makeHealthItem(10),makeHealthBoostItem(20),makeArmorItem(),makeArmorItem(),makeArmorItem()];
        this.selectedItem = 0;

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
        var gState = new GameState();
        gState.changeWeapon(makeStartWeapon(gState.playerSize));
        return gState;
    }
    static initial(coins,weapon) {
        var gState = new GameState();
        gState.coins = coins == null ? 0 : parseInt(coins);
        gState.changeWeapon(weapon == null ? makeStartWeapon(gState.playerSize) : weapon);
        return gState;
    }

    playerRects(){
        return [{x:this.playerPosition.x,y:this.playerPosition.y,w:this.playerSize.w,h:this.playerSize.h},
                {x:this.playerPositionOpposite.x,y:this.playerPositionOpposite.y,w:this.playerSize.w,h:this.playerSize.h}]
    }
    godMode(){
        this.equipedWeapon.d = 500;
        this.equipedWeapon.rate = 50;
        this.maxHealth = 100000;
        this.playerHealth = this.maxHealth;
    }
    changeWeapon(newWeapon){
        this.equipedWeapon = newWeapon;
        localStorage.setItem("AJSNDJNSAJKJNDSKJMirroriaWeaponYRYRBHJASKWA",JSON.stringify(this.equipedWeapon));
    }

    update(inputsArr,soundToggle) {

        var canAttack = Date.now() - this.attackTimer > this.equipedWeapon.rate;
        var didAttack = false;
        if(canAttack && !this.gameOver){
            if(inputsArr.includes("LEFTARROW")){
                this.attackTimer = Date.now();
                this.hitBox = copyRect(this.equipedWeapon.hw);
                this.hitBoxOpp = copyRect(this.equipedWeapon.hw);
                didAttack = true;
                this.attackDir = "LEFT";
            }else if(inputsArr.includes("RIGHTARROW")){
                this.attackTimer = Date.now();
                this.hitBox = copyRect(this.equipedWeapon.he);
                this.hitBoxOpp = copyRect(this.equipedWeapon.he);
                didAttack = true;
                this.attackDir = "RIGHT";
            }
        }
        
        
        var playerTileY = Math.trunc(this.playerPosition.y/this.tileSize);
        this.visableGeom = [];
        for(var i = Math.max(0,playerTileY - 20);i<Math.min(playerTileY+8,this.levelHeight);i++){
            this.visableGeom = this.visableGeom.concat(this.levelGeom.get(i).filter(o => {
                //Remove already collected coins from visable area.
                if(o.t != "COIN"){
                    return true;
                } else {
                    return !o.collected;
                }
            }));
        }
        
        if(inputsArr.includes("UP") && Date.now() - this.jumpTimer > 1000 && this.hasLanded){
            this.playerVelocity.y -= 12;
            this.jumpTimer = Date.now();
            this.hasLanded = false;
        }
        if(inputsArr.includes("DOWN") && !this.hasLanded){
            this.playerVelocity.y += 0.2;
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
            if(o.t != "SLIME" && o.t != "COIN"){
                if(intersectRect(pX,o.r) || intersectRect(pOX,o.r)){
                    xCollision = true;
                }
                if(intersectRect(pY,o.r) || intersectRect(pOY,o.r)){
                    yCollison = true;
                }
            const pOYJump = {x:this.playerPositionOpposite.x+3,y:this.playerPositionOpposite.y + this.playerSize.h-2+this.playerVelocity.y,w:this.playerSize.w-6,h:2};
            const pYJump = {x:this.playerPosition.x+3,y:this.playerPosition.y + this.playerSize.h-2+this.playerVelocity.y,w:this.playerSize.w-6,h:2};
            if(intersectRect(pYJump,o.r) || intersectRect(pOYJump,o.r)){
                this.hasLanded = true;
            }
            
                
            } else if (o.t == "SLIME" && Date.now() - o.hitTimer > o.hitspeed){
                var sSX = makeRect(o.x,o.y,o.s,o.s);
                var sSY = makeRect(o.x,o.y,o.s,o.s);
                if((intersectRect(pX,sSX) || intersectRect(pOX,sSX) || intersectRect(pY,sSY) || intersectRect(pOY,sSY)) && !o.isDead && Date.now()-o.lastHit>o.recov){
                    o.hitTimer = Date.now();
                    if(this.playerArmor > 0 && o.dmg > 0){
                        this.playerArmor-=1;
                    } else {
                        this.playerHealth = Math.max(0,this.playerHealth-o.dmg);
                    }
                }
            } else if(o.t == "COIN"){
                var rCX = makeRect(o.r.x+o.vx,o.r.y,o.r.w,o.r.h-1);
                var rCY = makeRect(o.r.x,o.r.y+o.vy,o.r.w,o.r.h);
                var coinColX = false;
                var coinColY = false;
                this.visableGeom.filter(t => t.t != "SLIME" && t.t != "COIN").forEach(t => {
                    if(intersectRect(rCX,t.r)){
                        coinColX = true;
                    }
                    if(intersectRect(rCY,t.r)){
                        coinColY = true;
                    }
                });
                if(coinColX){
                    o.vx = 0;
                } else {
                    o.vx *=0.8;
                }
                if(coinColY){
                    o.vy = 0;
                }else{
                    o.vy += 0.5;
                }
                o.r.x += o.vx;
                o.r.y += o.vy;

                if((intersectRect(pX,o.r) || intersectRect(pOX,o.r) || intersectRect(pY,o.r) || intersectRect(pOY,o.r)) && this.coins < 999){
                    o.collected = true;
                    this.coins += 1;
                    this.lastCoinTimer = Date.now();
                    localStorage.setItem("AJSNDJNSAJKJNDSKJMirroriaCoinsYRYRBHJASKWA",this.coins);
                }
            }
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
        if(!this.gameOver){
            this.playerPosition = addVector(this.playerPosition,this.playerVelocity);
        }
        this.playerPositionOpposite = {x: (this.levelRadius*this.tileSize) + ((this.levelRadius*this.tileSize) - this.playerPosition.x - this.playerSize.w),y:this.playerPosition.y};
        this.cameraY = Math.min(this.cameraY,this.playerPosition.y - canvasHeight + this.cameraYOffset);

        if(didAttack){
            this.hitBox.x += this.playerPosition.x;
            this.hitBox.y += this.playerPosition.y;
            this.hitBoxOpp.x += this.playerPositionOpposite.x;
            this.hitBoxOpp.y += this.playerPositionOpposite.y;
        }

        this.visableGeom.filter(t => t.t == "SLIME").forEach(o => {
            o.vy += 0.1;
            o.move = false;
            var sSX = makeRect(o.x+o.vx,o.y,o.s,o.s-1);
            var sSY = makeRect(o.x-1,o.y+o.vy,o.s+2,o.s);
            var xColSlime = false;
            var yColSlime = false;
            var hasFloor = false;
            this.visableGeom.filter(t => t != o && t.t != "COIN").forEach(t => {

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
            if(!o.isDead){
                if(o.move){
                    o.x += o.vx;
                }
                o.y += o.vy;
            }
            
            var slimeRect = makeRect(o.x,o.y,o.s,o.s);
            if(didAttack && !o.isDead){
                if(intersectRect(slimeRect,this.hitBox) || intersectRect(slimeRect,this.hitBoxOpp)){
                    o.hp -= this.equipedWeapon.d;
                    o.lastHit = Date.now();
                    this.levelGeom.get(Math.trunc(o.y/this.tileSize)).push(makeCoin(o.x,o.y,Math.random()*4*Math.sign(o.vx)+o.vx,-2));
                    if(o.hp <= 0){
                        o.isDead = true;
                    }
                }
            }
        });

        if(!inputs.prevStates.includes("PREVITEM") && inputsArr.includes("PREVITEM") && this.selectedItem > 0){
            this.selectedItem -= 1;
        }
        if(!inputs.prevStates.includes("NEXTITEM") && inputsArr.includes("NEXTITEM") && this.selectedItem < this.items.length-1){
            this.selectedItem += 1;
        }
        if(!inputs.prevStates.includes("USEITEM") && inputsArr.includes("USEITEM") && this.items[this.selectedItem] != null){

            if(canUse(this.items[this.selectedItem],this)){
                useItem(this.items[this.selectedItem],this);
                this.items.splice(this.selectedItem, 1);
                this.selectedItem = Math.min(this.items.length-1,this.selectedItem);
            } else {

            }
            
        }


        if(this.playerHealth < this.prevPlayerHealth){
            this.hitTimer = Date.now();
        }
        this.prevPlayerHealth = this.playerHealth;

        if((this.playerPosition.y-this.cameraY > canvasHeight || this.playerHealth == 0) && !this.gameOver){
            this.gameOver = true
            this.gameOverTimer = Date.now();
        }
    }

    draw(ctx){
        ctx.save();
        ctx.fillStyle = rgbToHex(50,50,250);
        ctx.fillRect(0,0,canvasWidth,canvasHeight)

        var xOffset = ((canvasWidth/2) - (this.levelRadius*this.tileSize));

        ctx.drawImage(this.backgroundImg,xOffset,-this.cameraY*0.5);


        var nextAnimationFrame = Date.now()-this.geomAnimationTimer>200;
        this.visableGeom.filter(t => t.t!="SLIME").forEach(o => {
            ctx.drawImage(textures.get(o.texture),o.r.x + xOffset,o.r.y-this.cameraY,o.r.w,o.r.h);
            if(nextAnimationFrame){
                switch(o.texture){
                    case "wallRightB1":
                        o.texture = "wallRightB2";
                        break;
                    case "wallRightB2":
                        o.texture = "wallRightB3";
                        break;
                    case "wallRightB3":
                        o.texture = "wallRightB4";
                        break;
                    case "wallRightB4":
                        o.texture = "wallRightB5";
                        break;
                    case "wallRightB5":
                        o.texture = "wallRightB6";
                        break;
                    case "wallRightB6":
                        o.texture = "wallRightB1";
                        break;
                    case "coin1":
                    case "coin2":
                    case "coin3":
                    case "coin4":
                    case "coin5":
                    case "coin6":
                        o.texture = getNextCoinFrame(o.texture);
                        break;
                }
                this.geomAnimationTimer = Date.now();
            }
            });
        this.visableGeom.filter(t => t.t=="SLIME").forEach(o => {
            var state = o.isDead ? "Dead" : Date.now() - o.lastHit > o.recov ? "Normal" : "Hit";
            var size = o.dmg == 0 ? "small" : o.s == this.tileSize-3 ? "medium" : "large";
            var bobing = o.isDead ? 0 : Math.sin(Date.now()/100)*2;
            ctx.drawImage(textures.get(size+state),o.x + xOffset,o.y-this.cameraY - bobing,o.s,o.s + bobing);
        });

        ctx.fillStyle = rgbToHex(0,0,0);
        var paTime = Date.now() - this.playerAnimationTimer;
        var jmpTime = Date.now() - this.jumpTimer;
        var squish =  (jmpTime >= 800 ? 0: 1-(jmpTime/800)) * 3;
        if(paTime < 250){
            ctx.drawImage(textures.get("playerFrame1"),this.playerPosition.x + xOffset + squish,this.playerPosition.y-this.cameraY,this.playerSize.w-squish*2,this.playerSize.h);
            ctx.drawImage(textures.get("playerFrame1"),this.playerPositionOpposite.x + xOffset + squish,this.playerPositionOpposite.y-this.cameraY,this.playerSize.w-squish*2,this.playerSize.h);
        }else if(paTime < 500){
            ctx.drawImage(textures.get("playerFrame2"),this.playerPosition.x + xOffset + squish,this.playerPosition.y-this.cameraY,this.playerSize.w-squish*2,this.playerSize.h);
            ctx.drawImage(textures.get("playerFrame2"),this.playerPositionOpposite.x + xOffset + squish,this.playerPositionOpposite.y-this.cameraY,this.playerSize.w-squish*2,this.playerSize.h);
        }else if(paTime < 750){
            ctx.drawImage(textures.get("playerFrame3"),this.playerPosition.x + xOffset + squish,this.playerPosition.y-this.cameraY,this.playerSize.w-squish*2,this.playerSize.h);
            ctx.drawImage(textures.get("playerFrame3"),this.playerPositionOpposite.x + xOffset + squish,this.playerPositionOpposite.y-this.cameraY,this.playerSize.w-squish*2,this.playerSize.h);
        } else{
            ctx.drawImage(textures.get("playerFrame4"),this.playerPosition.x + xOffset + squish,this.playerPosition.y-this.cameraY,this.playerSize.w-squish*2,this.playerSize.h);
            ctx.drawImage(textures.get("playerFrame4"),this.playerPositionOpposite.x + xOffset + squish,this.playerPositionOpposite.y-this.cameraY,this.playerSize.w-squish*2,this.playerSize.h);
        }
        if(paTime >= 1000){
            this.playerAnimationTimer = Date.now();
        }

        ctx.drawImage(textures.get("playerReflection"),xOffset + (this.levelRadius*this.tileSize)-this.tileSize,this.playerPosition.y-this.cameraY,5,this.playerSize.h*(this.playerPosition.x/(this.levelRadius*this.tileSize)));
        ctx.drawImage(textures.get("playerReflection"),xOffset + (this.levelRadius*this.tileSize)+this.tileSize-5,this.playerPositionOpposite.y-this.cameraY,5,this.playerSize.h*(this.playerPosition.x/(this.levelRadius*this.tileSize)));
        


        if(Date.now()-this.attackTimer<this.equipedWeapon.rate){
            var attackRatio = (Date.now()-this.attackTimer)/this.equipedWeapon.rate;
            var swordImg = textures.get(this.equipedWeapon.texture);
            var swordX = xOffset + (this.attackDir=="RIGHT"?this.playerSize.w:0);
            ctx.save();
            ctx.translate(swordX+this.playerPosition.x,this.playerPosition.y+this.playerSize.h/2-this.cameraY);
            if(this.attackDir == "LEFT"){
                ctx.scale(-1, 1);
            }
            ctx.rotate(attackRatio*Math.PI);
            ctx.drawImage(swordImg,0,-swordImg.height);
            ctx.restore();
            ctx.save();
            ctx.translate(swordX+this.playerPositionOpposite.x,this.playerPositionOpposite.y+this.playerSize.h/2-this.cameraY);
            if(this.attackDir == "LEFT"){
                ctx.scale(-1, 1);
            }
            ctx.rotate(attackRatio*Math.PI);
            ctx.drawImage(swordImg,0,-swordImg.height);
            ctx.restore();
        }


        var xHealthBarOffset = Date.now() - this.hitTimer < 500 ? Math.sin((Date.now() - this.hitTimer)/25)*3 : 0;
        ctx.fillStyle = rgbToHex(150,20,20);
        ctx.fillRect(canvasWidth*0.91 + xHealthBarOffset,canvasHeight*0.2,canvasWidth*0.05,canvasHeight*0.4);
        ctx.fillStyle = rgbToHex(250,20,20);
        var healthOffset = canvasHeight*0.4*(1 - (this.playerHealth/this.maxHealth));
        ctx.fillRect(canvasWidth*0.91 + xHealthBarOffset,canvasHeight*0.2+healthOffset,canvasWidth*0.05,canvasHeight*0.4-healthOffset);
        ctx.font = "28px Courier New";
        ctx.textAlign = "center";
        ctx.fillText(Math.round(this.playerHealth),canvasWidth*0.91 + xHealthBarOffset+canvasWidth*0.025,canvasHeight*0.65);

        ctx.font = "28px Courier New";
        ctx.fillStyle = rgbToHex(180,180,180);
        if(this.playerArmor == 3){
            ctx.fillText("🛡️",canvasWidth*0.91 + xHealthBarOffset+canvasWidth*0.025 - 30,canvasHeight*0.72);
        }
        if(this.playerArmor >= 2){
            ctx.fillText("🛡️",canvasWidth*0.91 + xHealthBarOffset+canvasWidth*0.025,canvasHeight*0.72);
        }
        if(this.playerArmor >= 1){
            ctx.fillText("🛡️",canvasWidth*0.91 + xHealthBarOffset+canvasWidth*0.025+30,canvasHeight*0.72);
        }

        ctx.textAlign = "left";
        var coinImageTime = Date.now() - this.lastCoinTimer;
        var spinTime = 500;
        if(coinImageTime < spinTime){
            var frameProg = Math.trunc(coinImageTime/(spinTime/6))+1;
            this.coinUIImage = "coin"+frameProg.toString();
        } else {
            this.coinUIImage = "coin1";
        }
        ctx.drawImage(textures.get(this.coinUIImage),canvasWidth*0.89,canvasHeight*0.1,32,32);
        

        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowColor = rgbToHex(150,50,0);
        ctx.fillStyle = rgbToHex(255,215,0);
        var goldStr = this.coins.toString().padStart(3,"0");
        ctx.font = "28px Courier New";
        ctx.fillText(goldStr,canvasWidth*0.928,canvasHeight*0.15);
        
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