class GameState {
    constructor() {
        this.tileSize = 30;
        this.levelHeight = 150;
        this.levelRadius = 12;

        //this.playerPosition = { x: 4 * this.tileSize, y: (this.levelHeight - 4) * this.tileSize };
        this.playerPosition = { x: 4 * this.tileSize, y: (14) * this.tileSize };
        this.playerSize = { w: this.tileSize * 0.8, h: this.tileSize * 0.9 };
        this.playerVelocity = { x: 0, y: 0 };
        this.playerPositionOpposite = { x: (this.levelRadius * this.tileSize) + ((this.levelRadius * this.tileSize) - this.playerPosition.x - this.playerSize.w), y: this.playerPosition.y };
        this.playerAnimationTimer = Date.now();

        this.levelGeom = generateMap(this.levelHeight, this.levelRadius, this.tileSize, this.playerSize);
        this.visableGeom = [];
        this.geomAnimationTimer = 0;
        this.geomAnimationTimer2 = 0;

        this.equipedWeapon;
        this.hitBox;
        this.hitBoxOpp;
        this.attackDir = "";
        this.attackTimer = 0;

        this.maxHealth = 100;
        this.playerHealth = this.maxHealth;
        this.prevPlayerHealth = this.playerHealth;
        this.maxArmor = 3;
        this.playerArmor = 1;
        this.prevPlayerArmor = this.playerArmor;
        this.hitTimer = 0;

        this.coins = 0;
        this.lastCoinTimer = 0;
        this.coinUIImage = "coin1";

        this.items = [];
        this.selectedItem = 0;

        this.cameraYOffset = this.tileSize * 7;
        this.cameraY = this.playerPosition.y - canvasHeight + this.cameraYOffset;

        this.jumpTimer = 0;
        this.hasLanded = false;

        this.dashTimer = 0;

        this.boss = false;
        this.bossFloor = 11;
        this.spawnBoss = false;

        this.backgroundImg = createBackgroundImage(this.levelRadius, this.levelHeight, this.tileSize);

        this.gameOver = false;
        this.gameOverTimer = 0;
        this.gameWon = true;
        this.gold = 0;

        this.hasEnteredShop = true;
        this.canEnterShop = false;
        this.inShop = false;
        this.selectedShopItem = 0;
        this.currentShop = null;
        this.shopCutsceneTimer = 0;
        this.shopCutscene = false;
        this.currentShopText = [];
        this.shopCutsceneLine = 0;
    }
    static initial() {
        var gState = new GameState();
        gState.changeWeapon(makeStartWeapon(gState.playerSize));
        return gState;
    }
    static initial(coins, weapon) {
        var gState = new GameState();
        gState.coins = coins == null ? 0 : parseInt(coins);
        gState.changeWeapon(weapon == null ? makeStartWeapon(gState.playerSize) : weapon);
        return gState;
    }

    playerRects() {
        return [{ x: this.playerPosition.x, y: this.playerPosition.y, w: this.playerSize.w, h: this.playerSize.h },
        { x: this.playerPositionOpposite.x, y: this.playerPositionOpposite.y, w: this.playerSize.w, h: this.playerSize.h }]
    }
    godMode() {
        this.equipedWeapon.d = 500;
        this.equipedWeapon.rate = 50;
        this.maxHealth = 100000;
        this.playerHealth = this.maxHealth;
    }
    changeWeapon(newWeapon) {
        this.equipedWeapon = newWeapon;
        localStorage.setItem("AJSNDJNSAJKJNDSKJMirroriaWeaponYRYRBHJASKWA", JSON.stringify(this.equipedWeapon));
    }

    update(inputsArr, soundToggle) {

        var canAttack = Date.now() - this.attackTimer > this.equipedWeapon.rate;
        var didAttack = false;
        if (canAttack && !this.gameOver && !this.inShop) {
            if (inputsArr.includes("LEFTARROW")) {
                this.attackTimer = Date.now();
                this.hitBox = copyRect(this.equipedWeapon.hw);
                this.hitBoxOpp = copyRect(this.equipedWeapon.hw);
                didAttack = true;
                this.attackDir = "LEFT";
            } else if (inputsArr.includes("RIGHTARROW")) {
                this.attackTimer = Date.now();
                this.hitBox = copyRect(this.equipedWeapon.he);
                this.hitBoxOpp = copyRect(this.equipedWeapon.he);
                didAttack = true;
                this.attackDir = "RIGHT";
            }
        }


        var playerTileY = Math.trunc(this.playerPosition.y / this.tileSize);
        var extendedRender = 0;
        if (this.boss) {
            extendedRender = 15;
        }
        this.visableGeom = [];
        for (var i = Math.max(0, playerTileY - 18 - extendedRender); i < Math.min(playerTileY + 8 + extendedRender, this.levelHeight); i++) {
            this.levelGeom.set(i, this.levelGeom.get(i).filter(o => o.t != "COIN" ? true : !o.collected));
            this.visableGeom = this.visableGeom.concat(this.levelGeom.get(i));
        }

        if (!this.inShop) {
            if (inputsArr.includes("UP") && Date.now() - this.jumpTimer > 1000 && this.hasLanded) {
                this.playerVelocity.y -= 12;
                this.jumpTimer = Date.now();
                this.hasLanded = false;
            }
            if (inputsArr.includes("DOWN") && !this.hasLanded) {
                this.playerVelocity.y += 0.2;
            }
            if (inputsArr.includes("LEFT")) {
                this.playerVelocity.x = 6;
            }
            if (inputsArr.includes("RIGHT")) {
                this.playerVelocity.x = -6;
            }
        }

        if (didAttack) {
            this.hitBox.x += this.playerPosition.x;
            this.hitBox.y += this.playerPosition.y;
            this.hitBoxOpp.x += this.playerPositionOpposite.x;
            this.hitBoxOpp.y += this.playerPositionOpposite.y;
        }

        this.updatePlayerPosition(didAttack);

        if (inputsArr.includes("ENTER") && !inputs.prevStates.includes("ENTER")) {
            if (this.shopCutscene) {
                this.currentShopText.push(this.currentShop.text[this.shopCutsceneLine]);
                this.shopCutsceneLine += 1;
                if (this.shopCutsceneLine == this.currentShop.text.length) {
                    this.shopCutscene = false;
                }
            } else {
                if (!this.inShop && this.canEnterShop) {
                    this.inShop = true;
                    this.shopCutsceneTimer = Date.now();
                    this.shopCutscene = true;
                    this.currentShopText = [this.currentShop.text[0]];
                    this.shopCutsceneLine = 1;
                    this.selectedShopItem = 0;
                }
            }
        }

        if (!this.gameOver) {
            this.playerPosition = addVector(this.playerPosition, this.playerVelocity);
        }
        this.playerPositionOpposite = { x: (this.levelRadius * this.tileSize) + ((this.levelRadius * this.tileSize) - this.playerPosition.x - this.playerSize.w), y: this.playerPosition.y };

        if (this.playerPosition.y > this.bossFloor * this.tileSize && !this.boss && this.hasEnteredShop) {
            this.cameraY = Math.min(this.cameraY, this.playerPosition.y - canvasHeight + this.cameraYOffset);
        } else if (!this.boss) {
            var bossFloorObjY = this.bossFloor + 5;
            var floor = [];
            floor.push(makeWall(0, bossFloorObjY * this.tileSize, this.tileSize, this.tileSize, "wallLeft"));
            for (var floorX = this.tileSize; floorX < (this.tileSize * (this.levelRadius * 2)) - this.tileSize; floorX += this.tileSize) {
                if (floorX == (this.levelRadius - 1) * this.tileSize) {
                    floor.push(makeMirror(floorX, bossFloorObjY * this.tileSize, this.tileSize, this.tileSize, "mirrorLeft"));
                } else if (floorX == this.levelRadius * this.tileSize) {
                    floor.push(makeMirror(floorX, bossFloorObjY * this.tileSize, this.tileSize, this.tileSize, "mirrorRight"));
                } else {
                    floor.push(makeFloor(floorX, bossFloorObjY * this.tileSize, this.tileSize, this.tileSize, "floorMiddle"));
                }
            }
            floor.push(makeWall(((this.levelRadius * 2) - 1) * this.tileSize, bossFloorObjY * this.tileSize, this.tileSize, this.tileSize, "wallRight"));
            this.levelGeom.set(bossFloorObjY, floor);
            this.boss = true;
        }

        if(this.boss){
            if(this.visableGeom.filter(o => o.t == "ENEMY" && o.data.type == "boss" && !o.isDead).length == 0){
                if(Math.random() > 0.5){
                    this.levelGeom.get(3).push(makeSlime(5 * this.tileSize, 3 * this.tileSize, 2.5, "boss", 40, 20, this.tileSize * 0.9, 500, 10000));
                } else {
                    this.levelGeom.get(3).push(makeSlime(16 * this.tileSize, 3 * this.tileSize, 2.5, "boss", 40, 20, this.tileSize * 0.9, 500, 10000));
                }
            }
        }

        this.updateEnemeis(didAttack);

        if (!inputs.prevStates.includes("PREVITEM") && inputsArr.includes("PREVITEM")) {
            if (!this.inShop && this.selectedItem > 0) {
                this.selectedItem -= 1;
            } else if (this.inShop && this.selectedShopItem > 0 && !this.shopCutscene) {
                this.shiftShopItems(-1);
            }
        }
        if (!inputs.prevStates.includes("NEXTITEM") && inputsArr.includes("NEXTITEM")) {
            if (!this.inShop && this.selectedItem < this.items.length - 1) {
                this.selectedItem += 1;
            } else if (this.inShop && this.selectedShopItem < this.currentShop.items.length - 1 && !this.shopCutscene) {
                this.shiftShopItems(1);
            }

        }
        if (!inputs.prevStates.includes("USEITEM") && inputsArr.includes("USEITEM")) {
            if (this.items[this.selectedItem] != null && !this.inShop) {
                if (canUse(this.items[this.selectedItem], this)) {
                    useItem(this.items[this.selectedItem], this);
                    this.items.splice(this.selectedItem, 1);
                    this.selectedItem = Math.max(0, Math.min(this.items.length - 1, this.selectedItem));
                } else {

                }
            } else if (this.inShop) {
                if (this.currentShop.prices[this.selectedShopItem] <= this.coins && !this.shopCutscene) {
                    this.coins -= this.currentShop.prices[this.selectedShopItem]
                    if (this.currentShop.items[this.selectedShopItem].type != "SWORD") {
                        this.items.unshift(this.currentShop.items[this.selectedShopItem]);
                    } else {
                        this.changeWeapon(this.currentShop.items[this.selectedShopItem].sword);
                    }
                    this.currentShop.items.splice(this.selectedShopItem, 1);
                    this.currentShop.prices.splice(this.selectedShopItem, 1);
                    this.shiftShopItems(0);
                    this.lastCoinTimer = Date.now();
                }
            }



        }

        if (this.playerHealth <= 0) {
            this.gameOver = true;
            this.gameOverTimer = Date.now();
        }
        this.prevPlayerHealth = this.playerHealth;

        if ((this.playerPosition.y - this.cameraY > canvasHeight || this.playerHealth == 0) && !this.gameOver) {
            this.gameOver = true
            this.gameOverTimer = Date.now();
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = rgbToHex(50, 50, 250);
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)

        var xHealthBarOffset = Date.now() - this.hitTimer < 250 ? Math.sin((Date.now() - this.hitTimer) / 25) * 2 : 0;
        var xOffset = ((canvasWidth / 2) - (this.levelRadius * this.tileSize));

        ctx.drawImage(this.backgroundImg, xOffset, -this.cameraY * 0.5);

        xOffset += xHealthBarOffset;
        var nextAnimationFrame = Date.now() - this.geomAnimationTimer > 200;
        var nextAnimationFrame2 = Date.now() - this.geomAnimationTimer2 > 100;
        this.visableGeom.filter(t => t.t != "ENEMY" && t.t != "COIN").forEach(o => {
            ctx.drawImage(textures.get(o.texture), o.r.x + xOffset, o.r.y - this.cameraY, o.r.w, o.r.h);
            if (nextAnimationFrame) {
                switch (o.texture) {
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
                    default:
                        if (o.t == "SHOP") {
                            o.texture = getNextShopFrame(o.texture);
                        }
                        break
                }
                this.geomAnimationTimer = Date.now();
            }
            if(o.t == "TRANSMITTER" && nextAnimationFrame2){
                var i = parseInt(o.texture[o.texture.length-1])
                i = (i+1) > 5 ? 1 : i+1;
                o.texture = o.texture.slice(0,-1) + i.toString();
                this.geomAnimationTimer2 = Date.now();
            }
            if (o.t == "SHOP" && this.canEnterShop && !this.inShop) {
                ctx.save();
                ctx.font = "15px Arial New";
                ctx.textAlign = "center";
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                ctx.shadowColor = rgbToHexAlpha(10, 10, 10, 240);
                ctx.fillStyle = rgbToHexAlpha(230, 230, 230, 240);
                ctx.fillText("Press Enter", o.r.x + xOffset + (o.r.w / 2), o.r.y - this.cameraY - 5);
                ctx.restore();
            }
        });

        this.visableGeom.filter(t => t.t == "ENEMY").forEach(o => {
            switch (o.type) {
                case "SLIME":

                    var textureStr = o.isDead ? "Dead" : Date.now() - o.data.lastHit > o.data.recov ? "Normal" : "Hit";
                    textureStr = o.data.type + textureStr;
                    var bobing = o.isDead ? 0 : Math.sin(Date.now() / 100) * 2;
                    if(o.data.type != "boss"){
                        ctx.drawImage(textures.get(textureStr), o.x + xOffset, o.y - this.cameraY - bobing, o.data.s, o.data.s + bobing);
                    } else {
                        ctx.save();
                        ctx.translate(o.x + xOffset + (o.data.s/2),o.y - this.cameraY + (o.data.s/2));
                        ctx.rotate((o.isDead||(Date.now() - o.data.lastHit < o.data.recov)) ? 0 : Math.sin(Date.now() / 200) * 0.2);
                        bobing = (Date.now() - o.data.lastHit > o.data.recov) ? 0 : bobing;
                        ctx.drawImage(textures.get(textureStr), -(o.data.s/2), -bobing-(o.data.s/2), o.data.s, o.data.s + bobing);
                        ctx.restore();
                    }
                    break;
            }
        });

        this.visableGeom.filter(t => t.t == "COIN").forEach(o => {
            ctx.drawImage(textures.get(o.texture), o.r.x + xOffset, o.r.y - this.cameraY, o.r.w, o.r.h);
            if (nextAnimationFrame) {
                o.texture = getNextCoinFrame(o.texture);
            }
        });

        ctx.fillStyle = rgbToHex(0, 0, 0);
        var paTime = Date.now() - this.playerAnimationTimer;
        var jmpTime = Date.now() - this.jumpTimer;
        var squish = (jmpTime >= 800 ? 0 : 1 - (jmpTime / 800)) * 3;
        if (paTime < 250) {
            ctx.drawImage(textures.get("playerFrame1"), this.playerPosition.x + xOffset + squish, this.playerPosition.y - this.cameraY, this.playerSize.w - squish * 2, this.playerSize.h);
            ctx.drawImage(textures.get("playerFrame1"), this.playerPositionOpposite.x + xOffset + squish, this.playerPositionOpposite.y - this.cameraY, this.playerSize.w - squish * 2, this.playerSize.h);
        } else if (paTime < 500) {
            ctx.drawImage(textures.get("playerFrame2"), this.playerPosition.x + xOffset + squish, this.playerPosition.y - this.cameraY, this.playerSize.w - squish * 2, this.playerSize.h);
            ctx.drawImage(textures.get("playerFrame2"), this.playerPositionOpposite.x + xOffset + squish, this.playerPositionOpposite.y - this.cameraY, this.playerSize.w - squish * 2, this.playerSize.h);
        } else if (paTime < 750) {
            ctx.drawImage(textures.get("playerFrame3"), this.playerPosition.x + xOffset + squish, this.playerPosition.y - this.cameraY, this.playerSize.w - squish * 2, this.playerSize.h);
            ctx.drawImage(textures.get("playerFrame3"), this.playerPositionOpposite.x + xOffset + squish, this.playerPositionOpposite.y - this.cameraY, this.playerSize.w - squish * 2, this.playerSize.h);
        } else {
            ctx.drawImage(textures.get("playerFrame4"), this.playerPosition.x + xOffset + squish, this.playerPosition.y - this.cameraY, this.playerSize.w - squish * 2, this.playerSize.h);
            ctx.drawImage(textures.get("playerFrame4"), this.playerPositionOpposite.x + xOffset + squish, this.playerPositionOpposite.y - this.cameraY, this.playerSize.w - squish * 2, this.playerSize.h);
        }
        if (paTime >= 1000) {
            this.playerAnimationTimer = Date.now();
        }

        ctx.drawImage(textures.get("playerReflection"), xOffset + (this.levelRadius * this.tileSize) - this.tileSize, this.playerPosition.y - this.cameraY, 5, this.playerSize.h * (this.playerPosition.x / (this.levelRadius * this.tileSize)));
        ctx.drawImage(textures.get("playerReflection"), xOffset + (this.levelRadius * this.tileSize) + this.tileSize - 5, this.playerPositionOpposite.y - this.cameraY, 5, this.playerSize.h * (this.playerPosition.x / (this.levelRadius * this.tileSize)));



        if (Date.now() - this.attackTimer < this.equipedWeapon.rate) {
            var attackRatio = (Date.now() - this.attackTimer) / this.equipedWeapon.rate;
            var swordImg = textures.get(this.equipedWeapon.texture);
            var swordX = xOffset + (this.attackDir == "RIGHT" ? this.playerSize.w : 0);
            ctx.save();
            ctx.translate(swordX + this.playerPosition.x, this.playerPosition.y + this.playerSize.h / 2 - this.cameraY);
            if (this.attackDir == "LEFT") {
                ctx.scale(-1, 1);
            }
            ctx.rotate(attackRatio * Math.PI);
            ctx.drawImage(swordImg, 0, -swordImg.height);
            ctx.restore();
            ctx.save();
            ctx.translate(swordX + this.playerPositionOpposite.x, this.playerPositionOpposite.y + this.playerSize.h / 2 - this.cameraY);
            if (this.attackDir == "LEFT") {
                ctx.scale(-1, 1);
            }
            ctx.rotate(attackRatio * Math.PI);
            ctx.drawImage(swordImg, 0, -swordImg.height);
            ctx.restore();
        }



        ctx.fillStyle = rgbToHex(150, 20, 20);
        ctx.fillRect(canvasWidth * 0.91, canvasHeight * 0.2, canvasWidth * 0.05, canvasHeight * 0.4);
        ctx.fillStyle = rgbToHex(250, 20, 20);
        var healthOffset = canvasHeight * 0.4 * (1 - (this.playerHealth / this.maxHealth));
        ctx.fillRect(canvasWidth * 0.91, canvasHeight * 0.2 + healthOffset, canvasWidth * 0.05, canvasHeight * 0.4 - healthOffset);
        ctx.font = "28px Courier New";
        ctx.textAlign = "center";
        ctx.fillText(Math.round(this.playerHealth), canvasWidth * 0.91 + xHealthBarOffset + canvasWidth * 0.025, canvasHeight * 0.65);

        ctx.font = "28px Courier New";
        ctx.fillStyle = rgbToHex(180, 180, 180);
        if (this.playerArmor == 3) {
            ctx.fillText("🛡️", canvasWidth * 0.91 + canvasWidth * 0.025 - 30, canvasHeight * 0.72);
        }
        if (this.playerArmor >= 2) {
            ctx.fillText("🛡️", canvasWidth * 0.91 + canvasWidth * 0.025, canvasHeight * 0.72);
        }
        if (this.playerArmor >= 1) {
            ctx.fillText("🛡️", canvasWidth * 0.91 + canvasWidth * 0.025 + 30, canvasHeight * 0.72);
        }

        ctx.textAlign = "center";
        ctx.fillStyle = rgbToHex(50, 50, 50);
        ctx.shadowColor = rgbToHex(0, 0, 0);
        if (this.items[this.selectedItem] != null) {
            ctx.drawImage(textures.get(this.items[this.selectedItem].texture), (canvasWidth * 0.91) + (canvasWidth * 0.025) - 16, canvasHeight * 0.74, 32, 32);
            if (this.items[this.selectedItem - 1] != null) {
                ctx.drawImage(textures.get(this.items[this.selectedItem - 1].texture), (canvasWidth * 0.91) + (canvasWidth * 0.025) - 48, canvasHeight * 0.74, 32, 32);
                ctx.font = "28px Courier New";
                ctx.fillText("Q", (canvasWidth * 0.91) + (canvasWidth * 0.025) - 32, canvasHeight * 0.84, 32, 32);
            }
            if (this.items[this.selectedItem + 1] != null) {
                ctx.drawImage(textures.get(this.items[this.selectedItem + 1].texture), (canvasWidth * 0.91) + (canvasWidth * 0.025) + 16, canvasHeight * 0.74, 32, 32);
                ctx.fillText("E", (canvasWidth * 0.91) + (canvasWidth * 0.025) + 32, canvasHeight * 0.84, 32, 32);
            }
            ctx.font = "15px Courier New";
            ctx.fillText(this.items[this.selectedItem].desc, (canvasWidth * 0.91) + (canvasWidth * 0.025), canvasHeight * 0.88);
            ctx.font = "16px Courier New";
            ctx.fillText("Use:Shift", (canvasWidth * 0.91) + (canvasWidth * 0.025), canvasHeight * 0.92);
        } else {
            ctx.textAlign = "center";
            ctx.font = "15px Courier New";
            ctx.fillText("No Items", (canvasWidth * 0.91) + (canvasWidth * 0.025), canvasHeight * 0.84);
        }

        if (this.gameOver) {
            var ratio = Math.min(1, (Date.now() - this.gameOverTimer) / 3000);
            ctx.textAlign = "center";
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.shadowColor = rgbToHexAlpha(100, 0, 0, Math.trunc(255 * ratio));
            ctx.fillStyle = rgbToHexAlpha(220, 0, 0, Math.trunc(255 * ratio));
            ctx.font = "90px Arial";
            ctx.fillText("Game Over", canvasWidth / 2, canvasHeight / 2 - (25 * ratio));
            ctx.font = "70px Arial";
            ctx.fillText("Press R To Restart", canvasWidth / 2, canvasHeight / 2 - (25 * ratio) + 100);
        }

        if (!this.gameOver && this.inShop) {

            ctx.drawImage(textures.get("shopBG"), 0, 0, canvasWidth, canvasHeight);
            for (var i = 0; i < this.currentShop.items.length; i++) {
                ctx.drawImage(textures.get("shopEl"), 290 + (i * 110), i == this.selectedShopItem ? -80 : 0);
                var itemImg = textures.get(this.currentShop.items[i].texture);
                if (this.currentShop.items[i].type != "SWORD") {
                    ctx.drawImage(itemImg, 297 + (i * 110), 270 + (i == this.selectedShopItem ? -80 : 0), 64, 64);
                } else {
                    ctx.save();
                    ctx.translate(340 + (i * 110), 270 + (i == this.selectedShopItem ? -80 : 0));
                    ctx.rotate(Math.PI / 4);
                    ctx.drawImage(itemImg, 0, 0, 64 * (itemImg.width / itemImg.height), 64);
                    ctx.restore();
                }
                ctx.drawImage(textures.get("coin1"), 296 + (i * 110), 366 + (i == this.selectedShopItem ? -80 : 0), 18, 18);

                ctx.save();
                ctx.textAlign = "left";
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                ctx.shadowColor = rgbToHex(50, 50, 50);
                ctx.fillStyle = rgbToHex(255, 215, 0);
                var goldStr = this.currentShop.prices[i].toString().padStart(3, "0");
                ctx.font = "22px Courier New";
                ctx.fillText(goldStr, 318 + (i * 110), 382 + (i == this.selectedShopItem ? -80 : 0));
                if (i == this.selectedShopItem && !this.shopCutscene) {
                    ctx.shadowColor = rgbToHex(10, 10, 10);
                    ctx.fillStyle = rgbToHex(230, 230, 200);
                    ctx.font = "28px Courier New";
                    ctx.textAlign = "left";
                    ctx.fillText(" E", 330 + (i * 110), 410 + (i == this.selectedShopItem ? -80 : 0));
                    ctx.textAlign = "right";
                    ctx.fillText("Q ", 330 + (i * 110), 410 + (i == this.selectedShopItem ? -80 : 0));
                    ctx.textAlign = "center";
                    ctx.font = "14px Courier New";
                    ctx.fillText("Buy:Shift", 330 + (i * 110), 428 + (i == this.selectedShopItem ? -80 : 0));
                    ctx.restore();
                }
            }
            ctx.fillStyle = rgbToHexAlpha(0, 0, 0, 150);
            ctx.fillRect(230, 500, 550, 24);
            ctx.save();
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowColor = rgbToHex(0, 0, 0);
            ctx.font = "18px Courier New";
            var visableText = this.currentShopText.slice(Math.max(0, this.currentShopText.length - 4));
            //console.log(visableText);
            for (var i = 0; i < visableText.length; i++) {
                if (visableText[i].side == "L") {
                    ctx.textAlign = "left";
                    ctx.fillStyle = rgbToHex(250, 180, 250);
                    ctx.fillText(visableText[i].text, 240, 543 - (25 * (visableText.length - i)));
                } else {
                    ctx.textAlign = "right";
                    ctx.fillStyle = rgbToHex(250, 250, 250);
                    ctx.fillText(visableText[i].text, 780, 543 - (25 * (visableText.length - i)));
                }
            }
            ctx.restore();
        }

        ctx.textAlign = "left";
        var coinImageTime = Date.now() - this.lastCoinTimer;
        var spinTime = 500;
        if (coinImageTime < spinTime) {
            var frameProg = Math.trunc(coinImageTime / (spinTime / 6)) + 1;
            this.coinUIImage = "coin" + frameProg.toString();
        } else {
            this.coinUIImage = "coin1";
        }
        ctx.drawImage(textures.get(this.coinUIImage), canvasWidth * 0.89, canvasHeight * 0.1, 32, 32);

        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowColor = rgbToHex(150, 50, 0);
        ctx.fillStyle = rgbToHex(255, 215, 0);
        var goldStr = this.coins.toString().padStart(3, "0");
        ctx.font = "28px Courier New";
        ctx.fillText(goldStr, canvasWidth * 0.928, canvasHeight * 0.15);

        ctx.restore();
    }

    updatePlayerPosition(didAttack) {
        //handles:
        //player collision with enviroment
        //player collision with coins
        //coin collsion with enviroment
        var xCollision = false;
        var yCollison = false;
        this.canEnterShop = false;
        const pX = { x: this.playerPosition.x + this.playerVelocity.x, y: this.playerPosition.y, w: this.playerSize.w, h: this.playerSize.h - 1 };
        const pY = { x: this.playerPosition.x, y: this.playerPosition.y + this.playerVelocity.y, w: this.playerSize.w, h: this.playerSize.h };
        const pOX = { x: this.playerPositionOpposite.x - this.playerVelocity.x, y: this.playerPositionOpposite.y, w: this.playerSize.w, h: this.playerSize.h - 1 };
        const pOY = { x: this.playerPositionOpposite.x, y: this.playerPositionOpposite.y + this.playerVelocity.y, w: this.playerSize.w, h: this.playerSize.h };
        this.visableGeom.filter(o => o.t != "ENEMY").forEach(o => {

            if (o.t != "COIN" && o.t != "SHOP" && o.t != "TRANSMITTER") {
                if (intersectRect(pX, o.r) || intersectRect(pOX, o.r)) {
                    xCollision = true;
                }
                if (intersectRect(pY, o.r) || intersectRect(pOY, o.r)) {
                    yCollison = true;
                }
                const pOYJump = { x: this.playerPositionOpposite.x + 3, y: this.playerPositionOpposite.y + this.playerSize.h - 2 + this.playerVelocity.y, w: this.playerSize.w - 6, h: 2 };
                const pYJump = { x: this.playerPosition.x + 3, y: this.playerPosition.y + this.playerSize.h - 2 + this.playerVelocity.y, w: this.playerSize.w - 6, h: 2 };
                if (intersectRect(pYJump, o.r) || intersectRect(pOYJump, o.r)) {
                    this.hasLanded = true;
                }
            } else if (o.t == "COIN") {
                var rCX = makeRect(o.r.x + o.vx, o.r.y, o.r.w, o.r.h - 1);
                var rCY = makeRect(o.r.x, o.r.y + o.vy, o.r.w, o.r.h);
                var coinColX = false;
                var coinColY = false;
                this.visableGeom.filter(t => !["SHOP", "COIN", "ENEMY"].includes(t.t)).forEach(t => {
                    if (intersectRect(rCX, t.r)) {
                        coinColX = true;
                    }
                    if (intersectRect(rCY, t.r)) {
                        coinColY = true;
                    }
                });
                if (coinColX) {
                    o.vx = 0;
                } else {
                    o.vx *= 0.8;
                }
                if (coinColY) {
                    o.vy = 0;
                } else {
                    o.vy += 0.5;
                }
                o.r.x += o.vx;
                o.r.y += o.vy;

                if ((intersectRect(pX, o.r) || intersectRect(pOX, o.r) || intersectRect(pY, o.r) || intersectRect(pOY, o.r)) && this.coins < 999) {
                    o.collected = true;
                    this.coins += 1;
                    this.lastCoinTimer = Date.now();
                    localStorage.setItem("AJSNDJNSAJKJNDSKJMirroriaCoinsYRYRBHJASKWA", this.coins);
                }
            } else if (o.t == "SHOP") {
                if ((intersectRect(pX, o.r) || intersectRect(pOX, o.r) || intersectRect(pY, o.r) || intersectRect(pOY, o.r)) && !this.inShop && o.items.length > 0) {
                    this.canEnterShop = true;
                    this.currentShop = o;
                }
            } else if (o.t == "TRANSMITTER"){
                if(o.hp > 0){
                    if (intersectRect(pX, o.r) || intersectRect(pOX, o.r)) {
                        xCollision = true;
                    }
                    if (didAttack) {
                        if (intersectRect(o.r, this.hitBox) || intersectRect(o.r, this.hitBoxOpp)) {
                            if(Date.now() - o.lastHit > 1000){
                                o.hp -= this.equipedWeapon.d;
                                o.lastHit = Date.now();
                            }
                            console.log(o.hp);
                        }
                    }
                }
            }
        });

        if (xCollision) {
            this.playerVelocity.x = 0;
        } else {
            this.playerVelocity.x *= 0.8;
        }
        if (yCollison) {
            this.playerVelocity.y = 0;
        } else {
            this.playerVelocity.y += 0.5;
        }
        if (xCollision && yCollison) {
            this.playerVelocity.x = 0;
            this.playerVelocity.y = 0;
        }
    }

    updateEnemeis(didAttack) {
        this.visableGeom.filter(t => t.t == "ENEMY").forEach(o => {
            switch (o.type) {
                case "SLIME":
                    this.updateSlime(o, didAttack);
                    break;
            }
        });
    }

    updateSlime(o, didAttack) {
        //Handles:
        //Slime movement
        //Slime collision with enviroment
        //Slime interaction with weapon
        o.data.vy += 0.5;
        var sSX = makeRect(o.x + o.data.vx, o.y, o.data.s, o.data.s - 1);
        var sSY = makeRect(o.x - 1, o.y + o.data.vy, o.data.s + 2, o.data.s);
        var xColSlime = false;
        var yColSlime = false;
        var hasFloor = false;
        this.visableGeom.filter(t => t != o && !["COIN", "ENEMY", "SHOP"].includes(t.t)).forEach(t => {

            if (intersectRect(t.r, sSY)) {
                yColSlime = true;
            }

            if (intersectRect(t.r, sSX)) {
                xColSlime = true;
            }

            if(t.t == "FLOOR"){
                var slimeTileX = Math.trunc(o.x / this.tileSize);
                var slimeTileY = Math.trunc(o.y / this.tileSize);
                if (o.data.vx > 0) {
                    if (t.r.x == (slimeTileX + 1) * this.tileSize && t.r.y == (slimeTileY + 1) * this.tileSize) {
                        hasFloor = true;
                    }
                } else {
                    slimeTileX = Math.trunc((o.x + o.data.s) / this.tileSize);
                    if (t.r.x == (slimeTileX - 1) * this.tileSize && t.r.y == (slimeTileY + 1) * this.tileSize) {
                        hasFloor = true;
                    }
                }
            }
            
        });

        
        if(xColSlime){
            o.data.vx *= -1;
        }
        if(!hasFloor){
            if(o.data.type != "boss"){
                o.data.vx *= -1;
            }
        }
        if(yColSlime){
            o.data.vy = 0;
        }
        if(o.data.type == "boss" && (Math.random() > 0.9) && hasFloor && (Date.now() - o.data.lastHit > o.data.recov)){
            o.data.vy = -12;
        }

        if (!o.isDead) {
            if (Date.now() - o.data.lastHit > o.data.recov) {
                o.x += o.data.vx;
            }
            o.y += o.data.vy;
        }

        var slimeRect = makeRect(o.x, o.y, o.data.s, o.data.s);
        if (didAttack && !o.isDead) {
            if (intersectRect(slimeRect, this.hitBox) || intersectRect(slimeRect, this.hitBoxOpp)) {
                if(o.data.type != "boss" || (Date.now() - o.data.lastHit > o.data.recov)){
                    for (var i = 0; i < this.equipedWeapon.d; i += 3) {
                        this.levelGeom.get(Math.trunc(o.y / this.tileSize)).push(makeCoin(o.x, o.y, Math.random() * 6 * Math.sign(o.data.vx) + o.data.vx, -2 + (Math.random() * -4)));
                    }
                    o.data.hp -= this.equipedWeapon.d;
                    o.data.lastHit = Date.now();
    
                    if (o.data.hp <= 0) {
                        o.isDead = true;
                    }
                }
                
            }
        }

        const pRect = makeRect(this.playerPosition.x, this.playerPosition.y, this.playerSize.w, this.playerSize.h);
        const pORect = makeRect(this.playerPositionOpposite.x, this.playerPositionOpposite.y, this.playerSize.w, this.playerSize.h);
        if ((intersectRect(pRect, slimeRect) || intersectRect(pORect, slimeRect))) {
            if ((Date.now() - o.data.hitTimer > o.data.hitspeed) && (Date.now() - o.data.lastHit > o.data.recov) &&  !o.isDead && (o.data.dmg > 0)) {
                if (this.playerArmor == 0) {
                    this.playerHealth = Math.max(0, this.playerHealth - o.data.dmg);
                } else {
                    this.playerArmor = Math.max(0, this.playerArmor - 1);
                }
                this.hitTimer = Date.now();
                o.data.hitTimer = Date.now();
                this.inShop = false;
                this.shopCutscene = false;
            }
        }
    }

    shiftShopItems(dir) {
        if (this.currentShop.items.length == 0) {
            this.inShop = false;
            return;
        }
        this.selectedShopItem = Math.min(this.currentShop.items.length - 1, Math.max(0, this.selectedShopItem + dir));
        if (this.currentShop.items[this.selectedShopItem].type == "SWORD") {
            this.currentShopText.push({ text: this.currentShop.items[this.selectedShopItem].desc, side: "L" });
            this.currentShopText.push({ text: "My " + this.equipedWeapon.name + " has " + makeSwordDesc(this.equipedWeapon, false), side: "R" });
        } else {
            this.currentShopText.push({ text: "This item gives " + this.currentShop.items[this.selectedShopItem].desc, side: "L" });
        }

    }


}