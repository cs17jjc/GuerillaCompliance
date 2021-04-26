function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function rgbToHexAlpha(r, g, b, a) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(a);
}
function calcDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
function addVector(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}
function calcForce(distance, pmass, boimass) {
  return (0.5 * pmass * boimass) / Math.pow(distance, 2);
}
function calcAngle(ppos, boipos) {
  const deltaX = boipos.x - ppos.x;
  const deltaY = boipos.y - ppos.y;
  return Math.atan2(deltaY, deltaX);
}
function calcComponents(force, angle) {
  return { x: force * Math.cos(angle), y: force * Math.sin(angle) };
}
function copyVector(v) {
  return { x: v.x, y: v.y };
}
function angleMagVector(angle, magnitude) {
  return { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude };
}
function drawRectCenter(ctx, x, y, w, h) {
  ctx.rect(x - w / 2, y - h / 2, w, h);
}
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
function random_item(items) {
  return items[Math.floor(Math.random() * items.length)];
}
function createParticle(pos, xvel, yvel, lifeDec) {
  return { x: pos.x, y: pos.y, xvel: xvel, yvel: yvel, life: 255, lifeDec: lifeDec };
}
function makeRect(x, y, w, h) {
  return { x: x, y: y, w: w, h: h };
}
function copyRect(r) {
  return { x: r.x, y: r.y, w: r.w, h: r.h };
}
function intersectRect(r1, r2) {
  const xIntersection = (r1.x >= r2.x && r1.x <= r2.x + r2.w) || (r2.x >= r1.x && r2.x <= r1.x + r1.w);
  const yIntersection = (r1.y >= r2.y && r1.y <= r2.y + r2.h) || (r2.y >= r1.y && r2.y <= r1.y + r1.h);
  return xIntersection && yIntersection;
}
function tweetFinished(score){      
  var left = (screen.width / 2) - (640 / 2);
            var top = (screen.height / 2) - (380 / 2);

              var shareText = encodeURIComponent("I completed Mirroria by @KiwiSoggy with " + score + " Coins! https://soggykiwi.itch.io/mirroria");
            var shareUrl = "https://twitter.com/intent/tweet?text=" + shareText;

            var popup = window.open(shareUrl, 'name', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + 640 + ', height=' + 380 +', top=' + top + ', left=' + left);
            if (window.focus && popup){
              popup.focus();
            }
}
function createBackgroundImage(levelRadius, levelHeight, tileSize) {
  var bgCanv = document.createElement('canvas');
  bgCanv.width = levelRadius * 2 * tileSize;
  bgCanv.height = levelHeight * tileSize;
  var bgCtx = bgCanv.getContext("2d");
  bgCtx.imageSmoothingEnabled = false;
  for (x = 0; x < bgCanv.width; x += tileSize) {
    for (y = 0; y < bgCanv.height; y += tileSize) {
      var choice = Math.random();
      if (choice < 0.94) {
        bgCtx.drawImage(textures.get("backgroundTile"), x, y, tileSize, tileSize);
      } else if (choice < 0.96) {
        bgCtx.drawImage(textures.get("backgroundTileB"), x, y, tileSize, tileSize);
      } else if (choice < 0.98) {
        bgCtx.drawImage(textures.get("backgroundTileC"), x, y, tileSize, tileSize);
      } else if (choice < 0.99) {
        bgCtx.drawImage(textures.get("backgroundTileD"), x, y, tileSize, tileSize);
      } else {
        bgCtx.drawImage(textures.get("backgroundTileE"), x, y, tileSize, tileSize);
      }
      bgCtx.fillStyle = rgbToHexAlpha(0, 0, 0, Math.trunc(((y / bgCanv.height) * 10)) * 25);
      bgCtx.fillRect(x, y, tileSize, tileSize);
    }
  }

  return bgCanv;
}
function canvasToImage(canvas) {
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
}
function makeWall(x, y, w, h, tex) {
  return { t: "WALL", r: makeRect(x, y, w, h), texture: tex };
}
function makeFloor(x, y, w, h, tex) {
  return { t: "FLOOR", r: makeRect(x, y, w, h), texture: tex };
}
function makeMirror(x, y, w, h, tex) {
  return { t: "MIRROR", r: makeRect(x, y, w, h), texture: tex };
}
function makeShop(x, y, w, h, shopNum, tex, playerSize) {
  var items;
  var prices;
  var text;
  if (shopNum == 0) {
    items = nRandomShopItems(2, ["HEALTH"], 5, 5);
    items.push(makeArmorItem());
    prices = priceItems(items);
    text = [
      { text: "Hello spirit.", side: "L" },
      { text: "Where am I?", side: "R" },
      { text: "This is a Tower of Mirroria.", side: "L" },
      { text: "How did I get here?", side: "R" },
      { text: "When you died,", side: "L" },
      { text: "your soul was captured by the slimes.", side: "L" },
      { text: "I'm dead?", side: "R" },
      { text: "Unfortunately.", side: "L" },
      { text: "But you are still bound to this world.", side: "L" },
      { text: "Your soul is divided.", side: "L" },
      { text: "The void mirror prevents each half from touching.", side: "L" },
      { text: "To leave this world you must recombine.", side: "L" },
      { text: "How do I do that?", side: "R" },
      { text: "These towers extract soul energy.", side: "L" },
      { text: "This energy is beamed to the sludgemines,", side: "L" },
      { text: "and used to produce more slimes.", side: "L" },
      { text: "The transmitter is at the top of the tower.", side: "L" },
      { text: "Destroying the transmitter is the only way,", side: "L" },
      { text: "to create a hole through the mirror.", side: "L" },
      { text: "Thank you.", side: "R" },
      { text: "We have some items that might help.", side: "L" },
      { text: "A health item restores your health when used.", side: "L" },
      { text: "An armor item replenishes one armor when used.", side: "L" },
      { text: "All damage is prevented while you have armor.", side: "L" },
      { text: "We have collected more exotic items higher up.", side: "L" },
      { text: "Do you accept Crypt-O-Currency?", side: "R" },
      { text: "Regular gold coins are fine.", side: "L" }
    ];
  } else if (shopNum == 1) {
    var weapon = makeMediumWeapon(playerSize);
    items = nRandomShopItems(2, ["HEALTH", "ARMOR"], 5, 5);
    items.push(makeHealthItem(15));
    items.push(makeSwordItem(weapon, makeSwordDesc(weapon, true)));
    prices = priceItems(items);
    text = [
      { text: "Are you the same tentacle?", side: "R" },
      { text: "We are, yes.", side: "L" },
      { text: "The sword, you should take it.", side: "L" },
      { text: "You will retain the sword if you perish.", side: "L" },
      { text: "You also retain any gold you collect.", side: "L" },
      { text: "If you cannot afford an item,", side: "L" },
      { text: "it may be worth to 'restart',", side: "L" },
      { text: "and come back with more gold.", side: "L" }
    ];
  } else if (shopNum == 2) {
    var weapon = makeMidWeapon(playerSize);
    items = nRandomShopItems(3, ["HEALTH", "ARMOR"], 10, 30);
    items.push(makeHealthBoostItem(20));
    items.push(makeSwordItem(weapon, makeSwordDesc(weapon, true)));
    prices = priceItems(items);
    text = [
      { text: "When the slimes invaded Mirroria,", side: "L" },
      { text: "the omnislime planted overseers.", side: "L" },
      { text: "Those eyes?", side: "R" },
      { text: "Yes, they track the souls in each tower.", side: "L" },
      { text: "Unknown to them,", side: "L" },
      { text: "this brickwork was occupied.", side: "L" },
      { text: "Can they still see me?", side: "R" },
      { text: "They can,", side: "L" },
      { text: "but they only talk to me now.", side: "L" },
      { text: "However,", side: "L" },
      { text: "When you attack the transmitter,", side: "L" },
      { text: "the omnislime will be summoned.", side: "L" }];
  } else if (shopNum == 3) {
    var weapon1 = makeQuickWeapon1(playerSize);
    var weapon2 = makeHeavyWeapon1(playerSize);
    items = nRandomShopItems(2, ["HEALTH", "ARMOR", "JUMP"], 10, 30);
    items.push(makeHealthItem(20));
    items.push(makeSwordItem(weapon1, makeSwordDesc(weapon1, true)));
    items.push(makeSwordItem(weapon2, makeSwordDesc(weapon2, true)));
    prices = priceItems(items);
    text = [
      { text: "What's up with the green slimes?", side: "R" },
      { text: "Rejects from the sludgemines,", side: "L" },
      { text: "they are the uncorrupted slimes,", side: "L" },
      { text: "still bound with soul energy,", side: "L" },
      { text: "they're left here to be 'recycled'.", side: "L" }];
  } else if (shopNum == 4) {
    var weapon1 = makeQuickWeapon2(playerSize);
    var weapon2 = makeHeavyWeapon2(playerSize);
    items = nRandomShopItems(2, ["HEALTH", "ARMOR", "JUMP"], 10, 30);
    items.push(makeHealthItem(20));
    items.push(makeSwordItem(weapon1, makeSwordDesc(weapon1, true)));
    items.push(makeSwordItem(weapon2, makeSwordDesc(weapon2, true)));
    prices = priceItems(items);
    text = [
      { text: "After the war with your kind,", side: "L" },
      { text: "the Slimehive built these towers,", side: "L" },
      { text: "to rebuild their armies,", side: "L" },
      { text: "from captured warrior's souls.", side: "L" },
      { text: "Were those their weapons?", side: "R" },
      { text: "Yes, two of the most powerful.", side: "L" },
      { text: "Both fell to the omnislime.", side: "L" },
      { text: "It feeds directly from the transmitter,", side: "L" },
      { text: "and shields it from damage.", side: "L" },
      { text: "How do I kill it?", side: "R" },
      { text: "You can't,", side: "L" },
      { text: "but you can stun it for long enough,", side: "L" },
      { text: "to attack the transmitter.", side: "L" }];
  } else if (shopNum == 5) {
    items = nRandomShopItems(3, ["HEALTH", "ARMOR", "HEALTHBOOST", "JUMP"], 20, 30);
    items.push(makeHealthItem(50));
    items.push(makeHealthBoostItem(20));
    prices = priceItems(items);
    text = [
      { text: "This is our last chance to talk.", side: "L" },
      { text: "I appriciate your help.", side: "R" },
      { text: "I hope you find peace.", side: "L" },
      { text: "What will you do afterwards?", side: "R" },
      { text: "With the omnislime gone,", side: "L" },
      { text: "I can leave this cursed tower,", side: "L" },
      { text: "and search for other survivors.", side: "L" },
      { text: "Poggers.", side: "R" }];
  }

  return { t: "SHOP", shopNum: shopNum, r: makeRect(x, y, w, h), texture: tex, items: items, prices: prices, text: text, beenEntered: false };
}
function makeEnenmy(x, y, type, data) {
  return { t: "ENEMY", x: x, y: y, type: type, isDead: false, data: data };
}
function makeSlime(x, y, vx, type, hp, dmg, s, hs, recov) {
  return makeEnenmy(x, y, "SLIME", { type: type, vx: vx, vy: 0, s: s, hp: hp, dmg: dmg, hitTimer: 0, hitspeed: hs, lastHit: 0, recov: recov })
}
function makeTransmitter(x, y, w, h, maxHp, tex) {
  return { t: "TRANSMITTER", r: makeRect(x, y, w, h), texture: tex, maxHp: maxHp, hp: maxHp, lastHit: 0 };
}
function makeCoin(x, y, vx, vy) {
  return { t: "COIN", vx: vx, vy: vy, texture: "coin1", r: makeRect(x, y, 8, 8), collected: false };
}
function makeAnimation(x, y, w, h, tex, lifetime, frames) {
  return { t: "ANIM", r: makeRect(x, y, w, h), frames: frames, texture: tex, lifetime: lifetime, created: Date.now() };
}
function getNextCoinFrame(frame) {
  switch (frame) {
    case "coin1":
      return "coin2";
    case "coin2":
      return "coin3";
    case "coin3":
      return "coin4";
    case "coin4":
      return "coin5";
    case "coin5":
      return "coin6";
    case "coin6":
      return "coin1";
  }
}
function getNextShopFrame(frame) {
  switch (frame) {
    case "shop1":
      return "shop2";
    case "shop2":
      return "shop3";
    case "shop3":
      return "shop4";
    case "shop4":
      return "shop5";
    case "shop5":
      return "shop6";
    case "shop6":
      return "shop7";
    case "shop7":
      return "shop1";
  }
}
function countFloors(map, x, y, size) {
  if (y < 0 || y > map[0].length - 1) {
    return 0;
  }
  var count = 0;
  for (var xx = Math.max(0, x - size); xx <= Math.min(map.length - 1, x + size); xx++) {
    if (map[xx][y] == "FLOOR") {
      count += 1;
    }
  }
  return count;
}
function generateMap(height, levelRadius, tileSize, playerSize) {
  var tileMapLeft = [];
  var tileMapRight = [];
  for (var i = 0; i < levelRadius; i++) {
    tileMapLeft.push(["FLOOR"]);
    tileMapRight.push(["FLOOR"]);
  }
  for (var y = 1; y < height; y++) {
    for (var x = 0; x < levelRadius; x++) {
      if (y == height - 1) {
        tileMapLeft[x].push("FLOOR");
        tileMapRight[x].push("FLOOR");
      } else {
        switch (x) {
          case 0:
            tileMapLeft[x].push("WALL");
            if (y <= 6 && y >= 4) {
              tileMapRight[x].push("EMPTY");
            } else {
              tileMapRight[x].push("MIRRORRIGHT");
            }
            break;
          case levelRadius - 1:
            tileMapRight[x].push("WALL");
            if (y <= 6 && y >= 4) {
              tileMapLeft[x].push("EMPTY");
            } else {
              tileMapLeft[x].push("MIRRORLEFT");
            }
            break;

          default:
            if (y == height - 2 && [2, 4, 6].includes(x)) {
              tileMapLeft[x].push("SlIME");
              tileMapRight[x].push("SLIME");
            } else {
              tileMapLeft[x].push("EMPTY");
              tileMapRight[x].push("EMPTY");
            }
        }
      }
    }
  }

  tileMapRight[levelRadius - 2][height - 3] = "FLOOR";
  tileMapRight[levelRadius - 3][height - 3] = "FLOOR";
  tileMapLeft[levelRadius - 5][height - 5] = "FLOOR";
  tileMapLeft[levelRadius - 6][height - 5] = "FLOOR";
  tileMapLeft[levelRadius - 7][height - 5] = "FLOOR";

  var slimeCooldown = 0;
  for (var i = 0; i < 1; i++) {
    for (var y = height - 8; y >= 5; y -= 3) {
      for (var x = 1; x < levelRadius - 1; x++) {

        var floorsLeft = countFloors(tileMapLeft, x, y + 3, 1);
        var floorsRight = countFloors(tileMapRight, x, y + 3, 1);

        if (floorsLeft + floorsRight >= 1) {
          tileMapLeft[x][y] == "EMPTY";
          tileMapRight[x][y] == "EMPTY";
        } else {
          if (floorsLeft + floorsRight == 0) {
            if (tileMapLeft[x - 1][y] == "FLOOR") {
              tileMapLeft[x][y] = "FLOOR";
            } else if (tileMapRight[x - 1][y] == "FLOOR") {
              tileMapRight[x][y] = "FLOOR";
            } else {
              if (Math.random() > 0.5) {
                tileMapLeft[x][y] = "FLOOR";
              } else {
                tileMapRight[x][y] = "FLOOR";
              }
            }
          }

          if (countFloors(tileMapLeft, x - 1, y, 1) == 2 && countFloors(tileMapLeft, x + 1, y + 3, 1) == 3) {
            tileMapLeft[x][y] = "FLOOR";
            tileMapLeft[x][y + 3] = "EMPTY";
            tileMapRight[x][y + 3] = "EMPTY";
          }
          if (countFloors(tileMapRight, x - 1, y, 1) == 2 && countFloors(tileMapRight, x + 1, y + 3, 1) == 3) {
            tileMapRight[x][y] = "FLOOR";
            tileMapLeft[x][y + 3] = "EMPTY";
            tileMapRight[x][y + 3] = "EMPTY";
          }

          if (floorsLeft > 1) {
            tileMapRight[x][y] = "EMPTY";
          } else if (floorsRight > 1) {
            tileMapLeft[x][y] = "EMPTY";
          }

          if ((y > 10 && Math.random() > 0.3 && slimeCooldown == 0)) {
            if (tileMapLeft[x][y] == "FLOOR") {
              tileMapLeft[x][y - 1] = "SLIME";
              slimeCooldown = levelRadius - 5;
            } else if (tileMapRight[x][y] == "FLOOR") {
              tileMapRight[x][y - 1] = "SLIME";
              slimeCooldown = levelRadius - 5;
            }
          }
        }

        slimeCooldown = Math.max(0, slimeCooldown - 1);
      }
    }
  }

  var shopCooldown = 20;
  var shopCounter = 0;
  var tileMap = new Map();
  for (var y = height - 1; y >= 0; y--) {
    shopCooldown += 1;
    var rowTiles = [];
    for (var x = 0; x < levelRadius; x++) {
      rowTiles.push(tileMapLeft[x][y]);
    }
    for (var x = 0; x < levelRadius; x++) {
      rowTiles.push(tileMapRight[x][y]);
    }
    var row = [];
    for (var x = 0; x < rowTiles.length; x++) {
      switch (rowTiles[x]) {
        case "FLOOR":
          if (rowTiles[x - 1] != "FLOOR") {
            row.push(makeFloor(x * tileSize, y * tileSize, tileSize, tileSize, "floorLeft"));
          } else if (rowTiles[x + 1] != "FLOOR") {
            row.push(makeFloor(x * tileSize, y * tileSize, tileSize, tileSize, "floorRight"));
          } else {

            if (shopCooldown >= (25 - (y < 20 && y > 15 ? 20 : 0))) {
              shopCooldown = 0;
              row.push(makeFloor(x * tileSize, y * tileSize, tileSize, tileSize, "floorMiddleShop"));
              row.push(makeShop(x * tileSize, (y - 1) * tileSize, tileSize, tileSize, shopCounter, "shop1", playerSize));
              shopCounter += 1;
            } else {
              row.push(makeFloor(x * tileSize, y * tileSize, tileSize, tileSize, "floorMiddle"));
            }
          }
          break;
        case "WALL":
          if (x == 0) {
            row.push(makeWall(x * tileSize, y * tileSize, tileSize, tileSize, "wallLeft"));
          } else if (x == (levelRadius * 2) - 1) {
            if (Math.random() > 0.1) {
              row.push(makeWall(x * tileSize, y * tileSize, tileSize, tileSize, "wallRight"));
            } else {
              row.push(makeWall(x * tileSize, y * tileSize, tileSize, tileSize, "wallRightB1"));
            }

          }
          break;
        case "MIRRORLEFT":
          row.push(makeMirror(x * tileSize, y * tileSize, tileSize, tileSize, "mirrorLeft"));
          break;
        case "MIRRORRIGHT":
          row.push(makeMirror(x * tileSize, y * tileSize, tileSize, tileSize, "mirrorRight"));
          break;
        case "SLIME":
          var section = Math.trunc(y / 22);
          //I've been working on this game jam for days, please dont judge me on this.
          if (tileMap.get(y + 1).filter(o => o.t == "SHOP").length >= 1) {
            section = 9999999;
          }
          switch (section) {
            case 6:
              if (Math.random() > 0.8) {
                row.push(makeSlime(x * tileSize, y * tileSize, 1, "small", 6, 0, tileSize * 0.8, 5000, 600));
              } else {
                row.push(makeSlime(x * tileSize, y * tileSize, 1, "small", 2, 0, tileSize * 0.6, 5000, 600));
              }
              break;
            case 5:
              if (Math.random() > 0.7) {
                row.push(makeSlime(x * tileSize, y * tileSize, 1, "small", 2, 0, tileSize * 0.6, 5000, 600));
              } else {
                row.push(makeSlime(x * tileSize, y * tileSize, 2, "medium", 4, 5, tileSize * 0.6, 900, 300));
              }
              break;
            case 4:
              if (Math.random() > 0.5) {
                row.push(makeSlime(x * tileSize, y * tileSize, 2, "medium", 15, 20, tileSize * 0.8, 500, 300));
              } else {
                row.push(makeSlime(x * tileSize, y * tileSize, 2, "medium", 4, 15, tileSize * 0.6, 500, 300));
              }
              break;
            case 3:
              if (Math.random() > 0.5) {
                row.push(makeSlime(x * tileSize, y * tileSize, 2, "medium", 15, 20, tileSize * 0.8, 500, 300));
              } else {
                row.push(makeSlime(x * tileSize, y * tileSize, 2, "medium", 4, 15, tileSize * 0.6, 500, 300));
              }
              break;
            case 2:
              if (Math.random() > 0.5) {
                row.push(makeSlime(x * tileSize, y * tileSize, 2, "medium", 15, 20, tileSize * 0.8, 500, 300));
              } else {
                row.push(makeSlime(x * tileSize, y * tileSize, 2.5, "large", 30, 20, tileSize, 500, 100));
              }
              break;
            case 1:
              if (Math.random() > 0.5) {
                row.push(makeSlime(x * tileSize, y * tileSize, 2, "medium", 15, 20, tileSize * 0.8, 500, 200));
              } else {
                row.push(makeSlime(x * tileSize, y * tileSize, 2.5, "large", 30, 20, tileSize * 0.6, 400, 200));
              }
              break;
            case 0:
              if (Math.random() > 0.2) {
                row.push(makeSlime(x * tileSize, y * tileSize, 2.5, "large", 50, 20, tileSize * 0.8, 400, 200));
              } else {
                row.push(makeSlime(x * tileSize, y * tileSize, 2.5, "large", 40, 20, tileSize * 0.6, 500, 150));
              }
              break;
          }
          break;
      }
    }
    if (y == 4) {
      row.push(makeTransmitter((levelRadius - 1) * tileSize, 4 * tileSize, tileSize * 2, tileSize * 3, 300, "TB1"));
    }
    tileMap.set(y, row);
  }
  return tileMap;
}
function makeMeleeWeapon(name, dmg, rate, texture, hitAreaEast, hitAreaWest) {
  return { t: "MELEE", name: name, d: dmg, rate: rate, texture: texture, he: hitAreaEast, hw: hitAreaWest };
}

function makeStartWeapon(playerSize) {
  var texture = "sword0";
  return makeMeleeWeapon("Iron Dagger", 2, 800, texture,
    makeRect(playerSize.w, 0, textures.get(texture).height, playerSize.h + 10),
    makeRect(-1 * textures.get(texture).height, -10, textures.get(texture).height, playerSize.h + 10));
}
function makeMediumWeapon(playerSize) {
  var texture = "sword1";
  return makeMeleeWeapon("Iron Sword", 6, 800, texture,
    makeRect(playerSize.w, -10, textures.get(texture).height, playerSize.h + 10),
    makeRect(-1 * textures.get(texture).height, -10, textures.get(texture).height, playerSize.h + 10));
}
function makeMidWeapon(playerSize) {
  var texture = "sword5";
  return makeMeleeWeapon("Steel Sword", 8, 500, texture,
    makeRect(playerSize.w, -10, textures.get(texture).height, playerSize.h + 10),
    makeRect(-1 * textures.get(texture).height, -10, textures.get(texture).height, playerSize.h + 10));
}
function makeQuickWeapon1(playerSize) {
  var texture = "sword6";
  return makeMeleeWeapon("Diamond Sword", 8, 250, texture,
    makeRect(playerSize.w, -10, textures.get(texture).height, playerSize.h + 10),
    makeRect(-1 * textures.get(texture).height, -10, textures.get(texture).height, playerSize.h + 10));
}
function makeHeavyWeapon1(playerSize) {
  var texture = "sword3";
  return makeMeleeWeapon("Sapphire Sword", 16, 500, texture,
    makeRect(playerSize.w, -10, textures.get(texture).height, playerSize.h + 10),
    makeRect(-1 * textures.get(texture).height, -10, textures.get(texture).height, playerSize.h + 10));
}
function makeQuickWeapon2(playerSize) {
  var texture = "sword2";
  return makeMeleeWeapon("TentaBlade", 8, 100, texture,
    makeRect(playerSize.w, -10, textures.get(texture).height, playerSize.h + 10),
    makeRect(-1 * textures.get(texture).height, -10, textures.get(texture).height, playerSize.h + 10));
}
function makeHeavyWeapon2(playerSize) {
  var texture = "sword4";
  return makeMeleeWeapon("BFG 100", 30, 500, texture,
    makeRect(playerSize.w, -10, textures.get(texture).height, playerSize.h),
    makeRect(-1 * textures.get(texture).height, 0, textures.get(texture).height, playerSize.h));
}

function makeHealthItem(strength) {
  return { type: "HEALTH", value: strength, texture: "item1", desc: "+" + strength + " HP" }
}
function makeHealthBoostItem(strength) {
  return { type: "HEALTHBOOST", value: strength, texture: "item2", desc: "+" + strength + " Max HP" }
}
function makeArmorItem() {
  return { type: "ARMOR", texture: "item3", desc: "+1 Armor" }
}
function makeEffectItem(effectType, strength, duration) {
  return { type: "EFFECT", effectType: effectType, strength: strength, duration: duration };
}
function makeJumpItem() {
  return { type: "JUMP", texture: "item4", desc: "Jump" };
}
function makeSwordItem(sword, desc) {
  return { type: "SWORD", texture: sword.texture, desc: desc, sword: sword }
}
function makeSwordDesc(sword, name) {
  return (name ? sword.name + " with " : "") + sword.d + " dmg and " + sword.rate + " cooldown."
}
function randomShopItem(pool, minStrength, range) {
  switch (random_item(pool)) {
    case "HEALTH":
      return makeHealthItem(minStrength + Math.trunc(Math.random() * range));
    case "HEALTHBOOST":
      return makeHealthBoostItem(minStrength + Math.trunc(Math.random() * range))
    case "ARMOR":
      return makeArmorItem();
    case "JUMP":
      return makeJumpItem();
  }
}
function nRandomShopItems(n, pool, min, range) {
  var items = [];
  while (items.length < n) {
    items.push(randomShopItem(pool, min, range));
  }
  return items;
}
function priceItems(items) {
  return items.map(i => {
    switch (i.type) {
      case "HEALTH":
        return 2 + Math.trunc(i.value / 8);
      case "HEALTHBOOST":
        return 20 + Math.trunc(i.value / 10);
      case "JUMP":
        return 10;
      case "ARMOR":
        return 12;
      case "SWORD":
        return Math.trunc((i.sword.d / i.sword.rate) * 1000);
    }
  });
}

function useItem(item, gState) {
  switch (item.type) {
    case "HEALTH":
      gState.playerHealth = Math.min(gState.maxHealth, gState.playerHealth + item.value);
      break;
    case "HEALTHBOOST":
      gState.maxHealth += item.value;
      gState.playerHealth = gState.maxHealth;
      break;
    case "ARMOR":
      gState.playerArmor += 1;
      break;
    case "JUMP":
      gState.playerVelocity.y = -12;
      gState.jumpTimer = Date.now();
      gState.hasLanded = false;
      break;
  }
}

function canUse(item, gState) {
  switch (item.type) {
    case "HEALTH":
      return gState.playerHealth != gState.maxHealth;
    case "HEALTHBOOST":
      return gState.maxHealth < 300;
    case "ARMOR":
      return gState.playerArmor < gState.maxArmor;
    default:
      return Date.now() - gState.jumpTimer > 500;
  }
}
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
    static initial(coins, weapon, lastShopNum) {
        var gState = new GameState();
        gState.lastShopNum = lastShopNum;
        gState.coins = coins == null ? 0 : parseInt(coins);
        gState.prevCoins = gState.coins;
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
        if (canAttack && !this.gameOver && !this.inShop && !this.endGame) {
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


        if (!this.inShop && !this.endGame) {
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

        if(this.endGame && (Date.now() - this.endGameTimer) < 5000){
            this.playerPosition.x = (this.levelRadius*this.tileSize) - (this.playerSize.w/2);
            this.playerPosition.y -= 2;
            this.playerPositionOpposite = this.playerPosition;
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

        if (this.gameWon && (Date.now() - this.gameWonTimer < 5000)) {
            this.makeEndExplosions(10, soundToggle);
        }

    }

    update(inputsArr, soundToggle) {
        this.updateGame(inputsArr, soundToggle);
    }

    makeEndExplosions(num, soundToggle) {
        zzfx(...[soundToggle ? 1 : 0, , 30, , .31, .43, 4, .33, .1, , , , , .8, , .4, .11, .51, .01]).start();
        for (var i = 0; i < num; i++) {
            var x = ((this.levelRadius - 2) * this.tileSize) + (Math.random() * 3 * this.tileSize);
            var y = (3 * this.tileSize) + (Math.random() * 4 * this.tileSize);

            this.levelGeom.get(4).push(makeAnimation(x, y, this.tileSize, this.tileSize, "Exp1", 500, 3));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.drawImage(textures.get("Background"), 0, -this.cameraY * 0.143,canvasWidth,textures.get("Background").height);

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

        ctx.save();
        ctx.fillStyle = rgbToHex(0, 0, 0);
        var paTime = Date.now() - this.playerAnimationTimer;
        var jmpTime = Date.now() - this.jumpTimer;
        var squish = (jmpTime >= 800 ? 0 : 1 - (jmpTime / 800)) * 3;
        if(this.endGame){
            ctx.globalAlpha = Math.max(0,1-((Date.now()-this.endGameTimer)/3000));
        }
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
        ctx.restore();
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
        ctx.fillStyle = rgbToHex(250, 250, 250);
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
            ctx.fillText("Shift to Use", (canvasWidth * 0.91) + (canvasWidth * 0.025), canvasHeight * 0.92);
        } else {
            ctx.textAlign = "center";
            ctx.font = "15px Courier New";
            ctx.fillText("No Items", (canvasWidth * 0.91) + (canvasWidth * 0.025), canvasHeight * 0.84);
        }
        ctx.fillStyle = rgbToHex(0, 0, 0);

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
                    ctx.fillText("Shift to Buy", 330 + (i * 110), 428 + (i == this.selectedShopItem ? -80 : 0));
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
        this.visableGeom.filter(o => o.t != "ENEMY" && this.endGameTimer).forEach(o => {

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

        if (intersectRect(pX, pOX) && !this.endGame) {
            this.endGame = true;
            this.endGameTimer = Date.now();
            this.playerVelocity = {x:0,y:0};
            zzfx(...[soundToggle ? 1.12 : 0,,420,,.04,3,,.61,,,534,.06,.2,,,,.01,.94,.08,.11]).start(); 
        }

        if (xCollision) {
            this.playerVelocity.x = 0;
        } else {
            this.playerVelocity.x *= 0.8;
        }
        if (yCollison) {
            this.playerVelocity.y = 0;
        } else if(!this.endGame) {
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


}class Inputs{
    constructor(currentStates,namesKeycode){
        this.currentStates = currentStates;
        this.prevStates = [];
        this.namesKeycode = namesKeycode;
    }
    static empty(){
        return new Inputs(new Map(), new Map());
    }
    attachInput(name,keyCode){
        this.namesKeycode.set(name,keyCode);
        this.currentStates.set(keyCode,false);
    }
    update(keyCode,value){
        this.currentStates.set(keyCode.toLowerCase(),value);
    }
    attachInputs(){
        this.attachInput("UP",'w');
        this.attachInput("DOWN",'s');
        this.attachInput("LEFT",'a');
        this.attachInput("RIGHT",'d');

        this.attachInput("UPARROW",'ArrowUp'.toLowerCase());
        this.attachInput("DOWNARROW",'ArrowDown'.toLowerCase());
        this.attachInput("LEFTARROW",'ArrowLeft'.toLowerCase());
        this.attachInput("RIGHTARROW",'ArrowRight'.toLowerCase());

        this.attachInput("NEXTITEM",'e');
        this.attachInput("PREVITEM",'q');
        this.attachInput("USEITEM",'Shift'.toLowerCase());

        this.attachInput("RESTART",'r');
        this.attachInput("ESC",'Escape'.toLowerCase());
        this.attachInput("MUTE",'m');
        this.attachInput("CLEARSTORAGE",'+');
    }
    getInputs(){
        const nameKeys = Array.from(this.namesKeycode.keys());
        const namesValue = nameKeys.map(n => {return {name:n,value:this.currentStates.get(this.namesKeycode.get(n))}});
        const inputsArr = namesValue.filter(nv => {return nv.value}).map(nv => {return nv.name});
        return inputsArr;
    }
}
// zzfx() - the universal entry point -- returns a AudioBufferSourceNode
zzfx=(...t)=>zzfxP(zzfxG(...t))

// zzfxP() - the sound player -- returns a AudioBufferSourceNode
zzfxP=(...t)=>{let e=zzfxX.createBufferSource(),f=zzfxX.createBuffer(t.length,t[0].length,zzfxR);t.map((d,i)=>f.getChannelData(i).set(d)),e.buffer=f,g=zzfxX.createGain(),g.gain.setValueAtTime(-0.5, zzfxX.currentTime),g.connect(zzfxX.destination),e.connect(g),e.connect(zzfxX.destination);return e}

// zzfxG() - the sound generator -- returns an array of sample data
zzfxG=(q=1,k=.05,c=220,e=0,t=0,u=.1,r=0,F=1,v=0,z=0,w=0,A=0,l=0,B=0,x=0,G=0,d=0,y=1,m=0,C=0)=>{let b=2*Math.PI,H=v*=500*b/zzfxR**2,I=(0<x?1:-1)*b/4,D=c*=(1+2*k*Math.random()-k)*b/zzfxR,Z=[],g=0,E=0,a=0,n=1,J=0,K=0,f=0,p,h;e=99+zzfxR*e;m*=zzfxR;t*=zzfxR;u*=zzfxR;d*=zzfxR;z*=500*b/zzfxR**3;x*=b/zzfxR;w*=b/zzfxR;A*=zzfxR;l=zzfxR*l|0;for(h=e+m+t+u+d|0;a<h;Z[a++]=f)++K%(100*G|0)||(f=r?1<r?2<r?3<r?Math.sin((g%b)**3):Math.max(Math.min(Math.tan(g),1),-1):1-(2*g/b%2+2)%2:1-4*Math.abs(Math.round(g/b)-g/b):Math.sin(g),f=(l?1-C+C*Math.sin(2*Math.PI*a/l):1)*(0<f?1:-1)*Math.abs(f)**F*q*zzfxV*(a<e?a/e:a<e+m?1-(a-e)/m*(1-y):a<e+m+t?y:a<h-d?(h-a-d)/u*y:0),f=d?f/2+(d>a?0:(a<h-d?1:(h-a)/d)*Z[a-d|0]/2):f),p=(c+=v+=z)*Math.sin(E*x-I),g+=p-p*B*(1-1E9*(Math.sin(a)+1)%2),E+=p-p*B*(1-1E9*(Math.sin(a)**2+1)%2),n&&++n>A&&(c+=w,D+=w,n=0),!l||++J%l||(c=D,v=H,n=n||1);return Z}

// zzfxV - global volume
zzfxV=.3

// zzfxR - global sample rate
zzfxR=44100

// zzfxX - the common audio context
zzfxX=new(window.AudioContext||webkitAudioContext);

//! ZzFXM (v2.0.3) | (C) Keith Clark | MIT | https://github.com/keithclark/ZzFXM
zzfxM=(n,f,t,e=125)=>{let l,o,z,r,g,h,x,a,u,c,d,i,m,p,G,M=0,R=[],b=[],j=[],k=0,q=0,s=1,v={},w=zzfxR/e*60>>2;for(;s;k++)R=[s=a=d=m=0],t.map((e,d)=>{for(x=f[e][k]||[0,0,0],s|=!!f[e][k],G=m+(f[e][0].length-2-!a)*w,p=d==t.length-1,o=2,r=m;o<x.length+p;a=++o){for(g=x[o],u=o==x.length+p-1&&p||c!=(x[0]||0)|g|0,z=0;z<w&&a;z++>w-99&&u?i+=(i<1)/99:0)h=(1-i)*R[M++]/2||0,b[r]=(b[r]||0)-h*q+h,j[r]=(j[r++]||0)+h*q+h;g&&(i=g%1,q=x[1]||0,(g|=0)&&(R=v[[c=x[M=0]||0,g]]=v[[c,g]]||(l=[...n[c]],l[2]*=2**((g-12)/12),g>0?zzfxG(...l):[])))}m=G});return[b,j]};
var bgMusicSong = [[[,0,50,,.4,0,2,.2,,,9,,,.1,.12,,.2],[.8,0,2100,,,.2,3,3,,,-400,,,2],[,0,420,.01,.03,.17,,.4,,,,,,,,,.2],[3,0,43,,,.25,,,,,,,,2],[.8,0,2100,.01,,.2,3,.3,,,-400,,,2,,,,.66]],[[[,,1,,,,,,,,,,,,,,,,3,,,,,,,,,,,,,,,,4,,,,,,,,,,,,,,,,4,,,,,,,,3,,,,,,,,],[,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],[1,-1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],[,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,]],[[,,1,,,,,,,,,,,,,,,,3,,,,,,,,,,,,,,,,4,,,,,,,,,,,,,,,,4,,,,,,,,3,,,,,,,,],[2,-.3,1,,,,3,,,,4,,,,3,,,,1,,,,3,,,,6,,,,4,,,,1,,,,3,,,,4,,,,3,,,,1,,,,3,,,,8,,,,3,,,,],[1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,],[,1,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,]],[[,,1,,,,,,,,,,,,,,,,3,,,,,,,,,,,,,,,,4,,,,,,,,,,,,,,,,4,,,,,,,,3,,,,,,,,],[2,-.3,1,,,,3,,,,4,,,,3,,,,1,,,,3,,,,6,,,,4,,,,1,,,,3,,,,4,,,,3,,,,1,,,,3,,,,8,,,,3,,,,],[1,-.1,,,,,,,,,13,,,,,,,,,,,,,,,,13,,,,,,,,,,,,,,,,13,,,,13,,,,,,,,,,,,13,,,,,,,,],[3,.1,13,,,,,,,,,,13,,,,,,13,,,,13,,,,,,,,,,13,,13,,,,,,13,,,,13,,,,,,13,,,,,,13,,,,,,,,,,]],[[,,1,,,,,,,,,,,,,,,,3,,,,,,,,,,,,,,,,4,,,,,,,,,,,,,,,,4,,,,,,,,3,,,,,,,,],[2,-.3,1,,,,3,,,,4,,,,3,,,,1,,,,3,,,,6,,,,4,,,,1,,,,3,,,,4,,,,3,,,,1,,,,3,,,,8,,,,3,,,,],[1,-.1,,,,,,,,,13,,,,,,,,,,,,,,,,13,,,,,,,,,,,,,,,,13,,,,13,,,,,,,,,,,,13,,,,,,,,],[3,.1,13,,,,,,,,,,13,,,,,,13,,,,13,,,,,,,,,,13,,13,,,,,,13,,,,13,,,,,,13,,,,,,13,,,,,,,,,,],[4,,24,,,,,,,,24,,,,,,,,24,,,,,,,,24,,,,,,24,,24,,,,,,,,24,,,,24,,24,,24,,,,24,,,,24,,,,,,,,]],[[,,1,,,,,,,,,,,,,,,,3,,,,,,,,,,,,,,,,4,,,,,,,,,,,,,,,,4,,,,,,,,3,,,,,,,,],[2,-.3,1,,,,3,,,,4,,,,3,,,,1,,,,3,,,,6,,,,4,,,,1,,,,3,,,,4,,,,3,,,,1,,,,3,,,,8,,,,3,,,,],[1,-.1,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,],[3,.1,13,,,,,,13,,13,,,,,,,,13,,,,,,13,,13,,,,,,,,13,,,,,,13,,13,,,,,,,,13,,,,,,13,,13,,,,,,,,],[4,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,]],[[,,1,,,,,,,,,,,,,,,,3,,,,,,,,,,,,,,,,4,,,,,,,,,,,,,,,,4,,,,,,,,3,,,,,,,,],[2,-.3,13,,,,15,,,,16,,,,15,,,,13,,,,15,,,,18,,,,16,,,,13,,,,15,,,,16,,,,15,,,,13,,,,15,,,,20,,,,15,,,,],[1,-.1,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,],[3,.1,13,,,,,,13,,13,,,,,,,,13,,,,,,13,,13,,,,,,,,13,,,,,,13,,13,,,,,,,,13,,,,,,13,,13,,,,,,,,],[4,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,24,,,,]],[[,,1,,,,,,,,,,,,,,,,3,,,,,,,,,,,,,,,,4,,,,,,,,,,,,,,,,4,,,,,,,,3,,,,,,,,],[2,-.3,13,,,,,,,,16,,,,,,,,13,,,,,,,,18,,,,,,,,13,,,,,,,,16,,,,,,,,13,,,,,,,,20,,,,,,,,],[1,-.1,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,],[3,.1,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,13,,,,,,,,],[4,,,,,,24,,,,,,,,24,,,,,,,,24,,,,,,,,24,,,,,,,,24,,,,,,,,24,,,,,,,,24,,,,,,,,24,,,,]]],[0,1,1,2,2,3,3,5,4,5,4,6,3,6,5,4,6],160,{"title":"New Song","instruments":["Bass","Hihat Open","Hall Brass","Bass Drum 2","Hihat Open"],"patterns":["Pattern 0","Pattern 1","Pattern 2","Pattern 3","Pattern 4","Pattern 5","Pattern 6"]}];var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.imageSmoothingEnabled = false;
var canvasWidth = c.width;
var canvasHeight = c.height;

var textures = new Map();
Array.from(document.images).forEach(i => {
    textures.set(i.id, i);
});

var gameState;
var inputs = Inputs.empty();
inputs.attachInput("ENTER", 'Enter'.toLowerCase());

document.addEventListener('keydown', (e) => {
    inputs.update(e.key, true);
});
document.addEventListener('keyup', (e) => {
    inputs.update(e.key, false);
});

let mySongData = zzfxM(...bgMusicSong);
let myAudioNode = zzfxP(...mySongData);
myAudioNode.loop = true;
myAudioNode.start();
var musicToggle = true;
var soundToggle = true;

var paused = false;

var playing = false;


function draw(ctx) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (!this.paused && !gameState.gameOver && (!gameState.endGame || (Date.now() - gameState.endGameTimer) < 3000)) {
        gameState.update(inputs.getInputs(), soundToggle);
    }
    ctx.save();
    gameState.draw(ctx);
    ctx.restore();
    if (this.paused) {
        ctx.textAlign = 'left'
        ctx.font = "99px Courier New";
        ctx.fillStyle = rgbToHex(250, 250, 250);
        ctx.fillText("PAUSED", canvasWidth * 0.32, canvasHeight * 0.4);
    }
    ctx.textAlign = 'left'
    ctx.font = "15px Courier New";
    ctx.fillStyle = rgbToHex(0, 0, 0);
    ctx.fillText("Toggle M", canvasWidth * 0.01, canvasHeight * 0.92);
    if (soundToggle) {
        ctx.font = "23px Courier New";
        ctx.fillText("🔊", canvasWidth * 0.01, canvasHeight * 0.98);
    }
    if (musicToggle) {
        ctx.font = "40px Courier New";
        ctx.fillText("♬", canvasWidth * 0.05, canvasHeight * 0.98);
    }

    if (!inputs.prevStates.includes("ESC") && inputs.getInputs().includes("ESC")) {
        if (gameState.inShop) {
            gameState.inShop = false;
            gameState.shopCutscene = false;
        } else {
            if (!gameState.spawnBoss) {
                this.paused = !this.paused;
            }
        }
    }

    if (!inputs.prevStates.includes("RESTART") && inputs.getInputs().includes("RESTART")) {
        var coins = localStorage.getItem("AJSNDJNSAJKJNDSKJMirroriaCoinsYRYRBHJASKWA");
        var weapon = JSON.parse(localStorage.getItem("AJSNDJNSAJKJNDSKJMirroriaWeaponYRYRBHJASKWA"));
        gameState = GameState.initial(coins, weapon, gameState.lastShopNum);
    }

    if (!inputs.prevStates.includes("CLEARSTORAGE") && inputs.getInputs().includes("CLEARSTORAGE")) {
        gameState.coins = 0;
        gameState.equipedWeapon = makeStartWeapon(gameState.playerSize);
        localStorage.setItem("AJSNDJNSAJKJNDSKJMirroriaCoinsYRYRBHJASKWA", 0);
        localStorage.setItem("AJSNDJNSAJKJNDSKJMirroriaWeaponYRYRBHJASKWA", JSON.stringify(gameState.equipedWeapon));
    }

    if (!inputs.prevStates.includes("MUTE") && inputs.getInputs().includes("MUTE")) {
        if (musicToggle && soundToggle) {
            soundToggle = !soundToggle;
        } else if (musicToggle && !soundToggle) {
            musicToggle = !musicToggle;
        } else if (!musicToggle && !soundToggle) {
            soundToggle = !soundToggle;
        } else if (!musicToggle && soundToggle) {
            musicToggle = !musicToggle;
        }

        if (!musicToggle) {
            myAudioNode.disconnect();
        } else {
            var g = zzfxX.createGain();
            g.gain.setValueAtTime(-0.5, zzfxX.currentTime);
            g.connect(zzfxX.destination);
            myAudioNode.connect(g);
            myAudioNode.connect(zzfxX.destination);
        }
    }

    if (!playing) {
        ctx.fillStyle = rgbToHexAlpha(0, 0, 0, 220);
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        var scale = 5;
        ctx.drawImage(textures.get("MirroriaImg"), (canvasWidth / 2) - ((118 * scale) / 2), canvasHeight * 0.05, 118 * scale, 33 * scale);
        ctx.fillStyle = rgbToHex(250, 250, 250);
        ctx.font = "20px Courier New";
        ctx.textAlign = 'center';
        ctx.fillText("WASD to Move.", canvasWidth / 2, canvasHeight * 0.45);
        ctx.fillText("Left and Right Arrow Keys to Attack.", canvasWidth / 2, canvasHeight * 0.55);
        ctx.fillText("Q and E to Switch Item.", canvasWidth / 2, canvasHeight * 0.65);
        ctx.fillText("Shift to Use Item.", canvasWidth / 2, canvasHeight * 0.75);
        ctx.font = "24px Courier New";
        ctx.fillText("Press Enter to Start.", canvasWidth / 2, canvasHeight * 0.85);
        if (inputs.getInputs().includes("ENTER") && !inputs.prevStates.includes("ENTER")) {
            playing = true;
            inputs.attachInputs();
        }
    }
    if (gameState.endGame && (Date.now() - gameState.endGameTimer) > 5000) {
        ctx.drawImage(textures.get("EndImg"), 0, 0);
        var ratio = Math.min(1, ((Date.now() - gameState.endGameTimer) - 5000) / 1000);
        ctx.fillStyle = rgbToHexAlpha(250, 250, 250, Math.trunc(255 * ratio));
        ctx.font = "25px Courier New";
        ctx.textAlign = 'center';
        ctx.fillText("Thanks For Playing!", canvasWidth * 0.52, canvasHeight * 0.5 - (50 * ratio));
        ctx.font = "20px Courier New";
        ctx.fillText("Press Enter to Replay.", canvasWidth * 0.52, canvasHeight * 0.58 - (50 * ratio));
        ctx.fillStyle = rgbToHex(29, 161, 242);
        ctx.fillText("Press E to Tweet score.", canvasWidth * 0.52, canvasHeight * 0.64 - (50 * ratio));
        ctx.font = "15px Courier New";
        ctx.fillText("This will open a popup.", canvasWidth * 0.52, canvasHeight * 0.67 - (50 * ratio));
        if (inputs.getInputs().includes("ENTER") && !inputs.prevStates.includes("ENTER")) {
            playing = false;
            inputs = Inputs.empty();
            inputs.attachInput("ENTER", 'Enter'.toLowerCase());
            var coins = localStorage.getItem("AJSNDJNSAJKJNDSKJMirroriaCoinsYRYRBHJASKWA");
            var weapon = JSON.parse(localStorage.getItem("AJSNDJNSAJKJNDSKJMirroriaWeaponYRYRBHJASKWA"));
            gameState = GameState.initial(coins, weapon, -1);
        }
        if(inputs.getInputs().includes("NEXTITEM") && !inputs.prevStates.includes("NEXTITEM")){
            tweetFinished(gameState.coins);
        }
    }

    inputs.prevStates = inputs.getInputs();
}

var loadedImages = false;
var loadChecker;
loadChecker = setInterval(() => {
    if (loadedImages) {
        clearInterval(loadChecker);
        var coins = localStorage.getItem("AJSNDJNSAJKJNDSKJMirroriaCoinsYRYRBHJASKWA");
        var weapon = JSON.parse(localStorage.getItem("AJSNDJNSAJKJNDSKJMirroriaWeaponYRYRBHJASKWA"));
        gameState = GameState.initial(coins, weapon, -1);
        setInterval(() => draw(ctx), 50);
    } else {
        loadedImages = true;
        ctx.fillStyle = rgbToHex(0, 0, 0);
        ctx.fillText("Loading", canvasWidth / 2, canvasHeight / 2);
        Array.from(textures.keys()).forEach(i => {
            if (!textures.get(i).complete) {
                loadedImages = false;
            }
        })
    }
}, 50);
