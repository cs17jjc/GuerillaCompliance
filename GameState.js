class GameState {
    constructor() {
        this.tileSize = 30;
        this.levelHeight = 150;
        this.levelRadius = 12;

        this.playerPosition = { x: 4 * this.tileSize, y: (this.levelHeight - 4) * this.tileSize };
        //this.playerPosition = { x: 4 * this.tileSize, y: (14) * this.tileSize };

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
        this.prevCoins = 0;
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
        this.bossWake = false;
        this.bossObj;
        this.bossSpawnTimer = 0;
        this.bossLeft = true;

        this.backgroundImg = createBackgroundImage(this.levelRadius, this.levelHeight, this.tileSize);

        this.gameOver = false;
        this.gameOverTimer = 0;
        this.gameWon = false;
        this.gameWonTimer = false;
        this.gold = 0;

        this.endGame = false;
        this.endGameTimer = Date.now();

        this.hasEnteredShop = true;
        this.canEnterShop = false;
        this.inShop = false;
        this.selectedShopItem = 0;
        this.currentShop = null;
        this.shopCutsceneTimer = 0;
        this.shopCutscene = false;
        this.currentShopText = [];
        this.shopCutsceneLine = 0;
        this.lastShopNum = -1;
    }
    static initial() {
        var gState = new GameState();
        gState.changeWeapon(makeStartWeapon(gState.playerSize));
        return gState;
    }
    static initial(coins, weapon, lastShopNum) {
        var gState = new GameState();
        gState.lastShopNum = lastShopNum;
        gState.coins = coins == null ? 0 : parseInt(coins);
        gState.changeWeapon(weapon == null ? makeStartWeapon(gState.playerSize) : weapon);
        if (lastShopNum != -1) {
            var lastShop = Array.from(gState.levelGeom.values()).flat().filter(o => o.shopNum == lastShopNum)[0];
            gState.playerPosition = { x: lastShop.r.x, y: lastShop.r.y };
        }
        return gState;
    }

    playerRects() {
        return [{ x: this.playerPosition.x, y: this.playerPosition.y, w: this.playerSize.w, h: this.playerSize.h },
        { x: this.playerPositionOpposite.x, y: this.playerPositionOpposite.y, w: this.playerSize.w, h: this.playerSize.h }]
    }
    godMode() {
        this.maxHealth = 100000;
        this.playerHealth = this.maxHealth;
    }
    changeWeapon(newWeapon) {
        this.equipedWeapon = newWeapon;
        localStorage.setItem("AJSNDJNSAJKJNDSKJMirroriaWeaponYRYRBHJASKWA", JSON.stringify(this.equipedWeapon));
    }

    updateGame(inputsArr, soundToggle) {

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
            this.levelGeom.set(i, this.levelGeom.get(i)
                .filter(o => o.t != "COIN" ? true : !o.collected)
                .filter(o => o.t != "ENEMY" ? true : !o.isDead || Date.now() - o.data.lastHit < 2000)
                .filter(o => o.t != "SHOP" ? true : !this.spawnBoss)
                .filter(o => o.t != "ENEMY" ? true : o.data.type == "boss" ? !o.isDead : true)
                .filter(o => o.t != "ANIM" ? true : Date.now() - o.created < o.lifetime));
            this.visableGeom = this.visableGeom.concat(this.levelGeom.get(i));
        }


        if (!this.inShop) {
            if (inputsArr.includes("UP") && Date.now() - this.jumpTimer > 1000 && this.hasLanded) {
                this.playerVelocity.y -= 12;
                this.jumpTimer = Date.now();
                this.hasLanded = false;
                zzfx(...[soundToggle ? 1 : 0, , 426, , .04, .23, 1, 1.15, -9.6, , , , , , .7]).start();
            }
            if (inputsArr.includes("DOWN") && !this.hasLanded) {
                this.playerVelocity.y += 0.2;
            }
            //Change input direction based on which side the player position is
            //This can change due to shop respawn
            if (this.playerPosition.x > this.levelRadius * this.tileSize) {
                if (inputsArr.includes("RIGHT")) {
                    this.playerVelocity.x = 6;
                }
                if (inputsArr.includes("LEFT")) {
                    this.playerVelocity.x = -6;
                }
            } else {
                if (inputsArr.includes("LEFT")) {
                    this.playerVelocity.x = 6;
                }
                if (inputsArr.includes("RIGHT")) {
                    this.playerVelocity.x = -6;
                }
            }

        }

        if (didAttack) {
            zzfx(...[soundToggle ? 1.73 : 0, , 300, .04, , .05, , 1.37, 5.3, , , , , , , , .05, , .03]).start();
            this.hitBox.x += this.playerPosition.x;
            this.hitBox.y += this.playerPosition.y;
            this.hitBoxOpp.x += this.playerPositionOpposite.x;
            this.hitBoxOpp.y += this.playerPositionOpposite.y;
        }


        this.updatePlayerPosition(didAttack, soundToggle);


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
                    this.lastShopNum = this.currentShop.shopNum;
                }
            }
        }


        this.playerPosition = addVector(this.playerPosition, this.playerVelocity);
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

        if (this.spawnBoss) {
            if (this.visableGeom.filter(o => o.t == "ENEMY" && o.data.type == "boss" && !o.isDead).length == 0) {
                if (this.bossLeft) {
                    this.bossObj = makeSlime(5 * this.tileSize, 3 * this.tileSize, 4 * (Math.random > 0.5 ? -1 : 1), "boss", 50, 20, this.tileSize * 1.1, 500, 8000);
                } else {
                    this.bossObj = makeSlime(16 * this.tileSize, 3 * this.tileSize, 4 * (Math.random > 0.5 ? -1 : 1), "boss", 50, 20, this.tileSize * 1.1, 500, 8000);
                }
                this.bossLeft = !this.bossLeft;
                this.levelGeom.get(3).push(this.bossObj);
            }
        }

        this.updateEnemeis(didAttack, soundToggle);

        if (((Date.now() - this.bossSpawnTimer) > 8000) && this.spawnBoss && ((Date.now() - this.bossObj.data.lastHit) > this.bossObj.data.recov)) {
            if (Math.random() > 0.5) {
                this.levelGeom.get(3).push(makeSlime(this.bossObj.x, this.bossObj.y, 2, "medium", 15, 20, this.tileSize * 0.8, 500, 200));
            } else {
                this.levelGeom.get(3).push(makeSlime(this.bossObj.x, this.bossObj.y, 2.5, "large", 30, 20, this.tileSize * 0.6, 400, 200));
            }
            this.bossSpawnTimer = Date.now();
        }

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
                    zzfx(...[soundToggle ? 1.19 : 0, , 389, .01, .1, .24, 2, 2.04, , -3.7, , , .1, , -137, .6, , , .01, .54]).start();
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

        if (this.coins > this.prevCoins) {
            zzfx(...[soundToggle ? 1.07 : 0, 0, 801, .01, .04, .08, , .96, , , 100, .04, , , , , , .72, .09, .01]).start();
        }
        this.prevCoins = this.coins;


        if (this.playerHealth <= 0) {
            this.gameOver = true;
            this.gameOverTimer = Date.now();
        }
        this.prevPlayerHealth = this.playerHealth;

        if ((this.playerPosition.y - this.cameraY > canvasHeight || this.playerHealth == 0) && !this.gameOver) {
            this.gameOver = true
            this.gameOverTimer = Date.now();
        }

        if (this.gameWon && (Date.now() - this.gameWonTimer < 5000)) {
            this.makeEndExplosions(10, soundToggle);
        }

    }

    update(inputsArr, soundToggle) {
        this.updateGame(inputsArr, soundToggle);
    }

    makeEndExplosions(num, soundToggle) {
        zzfx(...[soundToggle ? 2.22 : 0, , 30, , .31, .43, 4, .33, .1, , , , , .8, , .4, .11, .51, .01]).start();
        for (var i = 0; i < num; i++) {
            var x = ((this.levelRadius - 2) * this.tileSize) + (Math.random() * 3 * this.tileSize);
            var y = (3 * this.tileSize) + (Math.random() * 4 * this.tileSize);

            this.levelGeom.get(4).push(makeAnimation(x, y, this.tileSize, this.tileSize, "Exp1", 500, 3));
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
        this.visableGeom.filter(t => t.t != "ENEMY" && t.t != "COIN" && t.t != "ANIM").forEach(o => {
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
            if (o.t == "TRANSMITTER") {
                if (this.spawnBoss && !this.gameWon) {
                    var overlayAlpha = (1 - (o.hp / o.maxHp));
                    ctx.save();
                    ctx.globalAlpha = overlayAlpha;
                    ctx.drawImage(textures.get("TBOverlay"), o.r.x + xOffset, o.r.y - this.cameraY, o.r.w, o.r.h);
                    ctx.restore();
                    if (Date.now() - o.lastHit < 1000) {
                        var alpha = Math.abs(Math.sin((Date.now() - o.lastHit) / 100) * 200);
                        ctx.fillStyle = rgbToHexAlpha(255, 0, 0, Math.trunc(alpha));
                        ctx.fillRect(o.r.x + xOffset, o.r.y - this.cameraY, o.r.w, o.r.h)
                    } else if (Date.now() - this.bossObj.data.lastHit > this.bossObj.data.recov) {
                        ctx.fillStyle = rgbToHexAlpha(0, 0, 255, 100);
                        ctx.fillRect(o.r.x + xOffset - 5, o.r.y - this.cameraY, o.r.w + 10, o.r.h);
                    }
                }
                if (nextAnimationFrame2) {
                    if (o.hp <= 0) {
                        o.texture = "TBDes";
                    } else {
                        var i = parseInt(o.texture[o.texture.length - 1])
                        i = (i + 1) > 5 ? 1 : i + 1;
                        o.texture = o.texture.slice(0, -1) + i.toString();
                    }
                }
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
            if (nextAnimationFrame2) {
                this.geomAnimationTimer2 = Date.now();
            }
        });

        this.visableGeom.filter(t => t.t == "ENEMY").forEach(o => {
            switch (o.type) {
                case "SLIME":

                    var textureStr = o.isDead ? "Dead" : Date.now() - o.data.lastHit > o.data.recov ? "Normal" : "Hit";
                    textureStr = o.data.type + textureStr;
                    var bobing = o.isDead ? 0 : Math.sin(Date.now() / 100) * 2;
                    if (o.data.type != "boss") {
                        ctx.drawImage(textures.get(textureStr), o.x + xOffset, o.y - this.cameraY - bobing, o.data.s, o.data.s + bobing);
                    } else {
                        ctx.save();
                        ctx.translate(o.x + xOffset + (o.data.s / 2), o.y - this.cameraY + (o.data.s / 2));
                        ctx.rotate((o.isDead || (Date.now() - o.data.lastHit < o.data.recov)) ? 0 : Math.sin(Date.now() / 200) * 0.2);
                        bobing = (Date.now() - o.data.lastHit > o.data.recov) ? 0 : bobing;
                        ctx.drawImage(textures.get(textureStr), -(o.data.s / 2), -bobing - (o.data.s / 2), o.data.s, o.data.s + bobing);
                        ctx.restore();
                        if (((Date.now() - o.data.lastHit) < o.data.recov) && !o.isDead) {
                            var zs = Math.round(((Date.now() - o.data.lastHit) / o.data.recov) * 3);
                            ctx.fillStyle = rgbToHexAlpha(250, 250, 250, 150);
                            ctx.font = "19px Courier New";
                            ctx.textAlign = "left";
                            if (zs < 3) {
                                ctx.fillText("Z", o.x + xOffset + o.data.s - 5, o.y - this.cameraY - bobing + 5);
                            }
                            if (zs < 2) {
                                ctx.fillText("Z", o.x + xOffset + o.data.s + 5, o.y - this.cameraY - bobing - 5);
                            }
                            if (zs < 1) {
                                ctx.fillText("Z", o.x + xOffset + o.data.s + 15, o.y - this.cameraY - bobing - 15);
                            }
                        }
                    }
                    break;
            }
        });

        this.visableGeom.filter(t => t.t == "COIN" || t.t == "ANIM").forEach(o => {
            ctx.drawImage(textures.get(o.texture), o.r.x + xOffset, o.r.y - this.cameraY, o.r.w, o.r.h);
            if (nextAnimationFrame && o.t == "COIN") {
                o.texture = getNextCoinFrame(o.texture);
            }
            if (nextAnimationFrame2 && o.t == "ANIM") {
                var i = parseInt(o.texture[o.texture.length - 1])
                i = (i + 1) > o.frames ? 1 : i + 1;
                o.texture = o.texture.slice(0, -1) + i.toString();
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

        if (!this.gameWon) {
            ctx.drawImage(textures.get("playerReflection"), xOffset + (this.levelRadius * this.tileSize) - this.tileSize, this.playerPosition.y - this.cameraY, 5, this.playerSize.h * (Math.min(this.playerPosition.x, this.playerPositionOpposite.x) / (this.levelRadius * this.tileSize)) + 5);
            ctx.drawImage(textures.get("playerReflection"), xOffset + (this.levelRadius * this.tileSize) + this.tileSize - 5, this.playerPositionOpposite.y - this.cameraY, 5, this.playerSize.h * (Math.min(this.playerPosition.x, this.playerPositionOpposite.x) / (this.levelRadius * this.tileSize)) + 5);
        }


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
            ctx.fillText("Press R To Respawn", canvasWidth / 2, canvasHeight / 2 - (25 * ratio) + 100);
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
            if (this.shopCutscene) {
                ctx.textAlign = "center";
                ctx.font = "18px Courier New";
                ctx.shadowColor = rgbToHex(10, 10, 10);
                ctx.fillStyle = rgbToHex(255, 255, 255);
                ctx.fillText("Press Enter.",canvasWidth*0.52,canvasHeight*0.74)
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

        if (this.gameWon && (Date.now() - this.gameWonTimer) < 500) {
            var alp = Math.trunc(((Date.now() - this.gameWonTimer) / 500) * 255)
            ctx.fillStyle = rgbToHexAlpha(255, 255, 255, alp);
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        ctx.restore();
    }

    updatePlayerPosition(didAttack, soundToggle) {
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

            if (o.t != "COIN" && o.t != "SHOP" && o.t != "TRANSMITTER" && o.t != "ANIM") {
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
            } else if (o.t == "TRANSMITTER") {
                if ((intersectRect(pX, o.r) || intersectRect(pOX, o.r)) && (!this.gameWon || (Date.now() - this.gameWonTimer < 5000))) {
                    xCollision = true;
                }
                if (o.hp > 0) {
                    if (didAttack) {
                        if (intersectRect(o.r, this.hitBox) || intersectRect(o.r, this.hitBoxOpp)) {
                            if (Date.now() - o.lastHit > 1000) {
                                if (this.spawnBoss) {
                                    if (Date.now() - this.bossObj.data.lastHit < this.bossObj.data.recov) {
                                        o.hp -= this.equipedWeapon.d;
                                        o.lastHit = Date.now();
                                        this.makeEndExplosions(10, soundToggle);
                                    }
                                } else {
                                    this.spawnBoss = true;
                                    o.hp -= this.equipedWeapon.d;
                                    o.lastHit = Date.now();
                                    this.makeEndExplosions(10, soundToggle);
                                }

                                if (o.hp <= 0) {
                                    this.gameWon = true;
                                    this.gameWonTimer = Date.now();
                                    this.spawnBoss = false;
                                    this.visableGeom.filter(o => o.type == "SLIME").forEach(s => {
                                        s.isDead = true;
                                        s.hp = 0;
                                        s.data.lastHit = Date.now();
                                    });
                                }
                            }
                        }
                    }
                }
            }
        });

        if (intersectRect(pX, pOX)) {
            this.endGame = true;
            this.endGameTimer = Date.now();
        }

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

    updateEnemeis(didAttack, soundToggle) {
        this.visableGeom.filter(t => t.t == "ENEMY").forEach(o => {
            switch (o.type) {
                case "SLIME":
                    this.updateSlime(o, didAttack, soundToggle);
                    break;
            }
        });
    }

    updateSlime(o, didAttack, soundToggle) {
        //Handles:
        //Slime movement
        //Slime collision with enviroment
        //Slime interaction with weapon
        o.data.vy += 0.5;
        var sSX = makeRect(o.x + o.data.vx, o.y, o.data.s, o.data.s - 1);
        var sSY = makeRect(o.x - 1, o.y + o.data.vy, o.data.s + 2, o.data.s + 1);
        var sSYFloor = makeRect(o.x - 1, o.y + o.data.s - 5, o.data.s + 2, 7);
        var sSYTop = makeRect(o.x - 1, o.y - 5, o.data.s + 2, 5);
        var xColSlime = false;
        var yColSlime = false;
        var yColFloor = false;
        var yColTop = false;
        var hasFloor = false;
        this.visableGeom.filter(t => t != o && !["COIN", "ENEMY", "SHOP", "ANIM"].includes(t.t)).forEach(t => {

            if (intersectRect(t.r, sSY)) {
                yColSlime = true;
            }

            if (intersectRect(t.r, sSX)) {
                xColSlime = true;
            }

            if (intersectRect(t.r, sSYFloor)) {
                yColFloor = true;
            }
            if (intersectRect(t.r, sSYTop)) {
                yColTop = true;
            }

            if (t.t == "FLOOR") {
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


        if (xColSlime) {
            o.data.vx *= -1;
            zzfx(...[(soundToggle && Math.random() > 0.8) ? 0.2 : 0, .45, 551, .03, .03, 0, 1, .78, , -68, -102, .24, , .5, -4.4, , , .7, .02, .14]).start();
        } else if (!hasFloor && yColSlime) {
            if (o.data.type != "boss") {
                o.data.vx *= -1;
                zzfx(...[(soundToggle && Math.random() > 0.8) ? 0.2 : 0, .45, 551, .03, .03, 0, 1, .78, , -68, -102, .24, , .5, -4.4, , , .7, .02, .14]).start();
            }
        }
        if (yColSlime) {
            o.data.vy = 0;
        }
        if (o.data.type == "boss" && (Math.random() > 0.5) && yColFloor && !yColTop && (Date.now() - o.data.lastHit > o.data.recov)) {
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
                if (o.data.type != "boss" || (Date.now() - o.data.lastHit > o.data.recov)) {
                    if (o.data.type != "boss" && this.coins < 999) {
                        for (var i = 0; i < this.equipedWeapon.d; i += 3) {
                            this.levelGeom.get(Math.trunc(o.y / this.tileSize)).push(makeCoin(o.x, o.y, (-8 + (Math.random() * 16)) + o.data.vx, -2 + (Math.random() * -6)));
                        }
                    }
                    zzfx(...[soundToggle ? 1.99 : 0, , 700 - (o.data.s * 10), , .01, 0, 3, 1.96, -60, , , , , , , , .06]).start();
                    o.data.hp -= this.equipedWeapon.d;
                    o.data.lastHit = Date.now();

                    if (o.data.hp <= 0) {
                        o.isDead = true;
                        zzfx(...[soundToggle ? 1.11 : 0, , 173, , , .31, 2, 2.85, -5.4, 4.6, , , , .3, , .3, , .64, .07, .12]).start();
                    }
                }

            }
        }

        const pRect = makeRect(this.playerPosition.x, this.playerPosition.y, this.playerSize.w, this.playerSize.h);
        const pORect = makeRect(this.playerPositionOpposite.x, this.playerPositionOpposite.y, this.playerSize.w, this.playerSize.h);
        if ((intersectRect(pRect, slimeRect) || intersectRect(pORect, slimeRect))) {
            if ((Date.now() - o.data.hitTimer > o.data.hitspeed) && (Date.now() - o.data.lastHit > o.data.recov) && !o.isDead && (o.data.dmg > 0)) {
                if (this.playerArmor == 0) {
                    this.playerHealth = Math.max(0, this.playerHealth - o.data.dmg);
                    zzfx(...[soundToggle ? 2.07 : 0, , 100 + (400 * (this.playerHealth / this.maxHealth)), , , .09, , 2.66, , -4.1, , , , 1.2, , .2, .19, .71, .02]).start();
                } else {
                    this.playerArmor = Math.max(0, this.playerArmor - 1);
                    zzfx(...[soundToggle ? 2.07 : 0, , 500, , , .09, , 2.66, , -4.1, , , , 1.2, , .2, .19, .71, .02]).start();
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