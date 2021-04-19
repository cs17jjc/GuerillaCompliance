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
function makeEnenmy(x, y, type, data) {
  return { t: "ENEMY", x: x, y: y, type: type, isDead: false, data: data };
}
function makeSlime(x, y, vx, type, hp, dmg, s, hs, recov) {
  return makeEnenmy(x, y, "SLIME", { type: type, vx: vx, vy: 0, s: s, hp: hp, dmg: dmg, hitTimer: 0, hitspeed: hs, lastHit: 0, recov: recov })
}
function makeCoin(x, y, vx, vy) {
  return { t: "COIN", vx: vx, vy: vy, texture: "coin1", r: makeRect(x, y, 8, 8), collected: false };

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
function generateMap(height, levelRadius, tileSize, bossHeightTrigger) {
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
            tileMapRight[x].push("MIRRORRIGHT");
            break;
          case levelRadius - 1:
            tileMapRight[x].push("WALL");
            tileMapLeft[x].push("MIRRORLEFT");
            break;

          default:
            tileMapLeft[x].push("EMPTY");
            tileMapRight[x].push("EMPTY");
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

          if (y < height - 10 && y > 10 && Math.random() > 0.5 && slimeCooldown == 0) {
            if (tileMapLeft[x][y] == "FLOOR") {
              tileMapLeft[x][y - 1] = "SLIME";
              slimeCooldown = levelRadius - 2;
            } else if (tileMapRight[x][y] == "FLOOR") {
              tileMapRight[x][y - 1] = "SLIME";
              slimeCooldown = levelRadius - 2;
            }
          }


        }

        slimeCooldown = Math.max(0, slimeCooldown - 1);
      }
    }
  }

  var tileMap = new Map();
  for (var y = 0; y < height; y++) {
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
            row.push(makeFloor(x * tileSize, y * tileSize, tileSize, tileSize, "floorMiddle"));
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
          var section = Math.trunc(y / (height / 3));
          switch (section) {
            case 2:
              row.push(makeSlime(x * tileSize, y * tileSize, 1, "small", 10, 0, tileSize * 0.6, 5000, 600));
              break;
            case 1:
              row.push(makeSlime(x * tileSize, y * tileSize, 1, "medium", 10, 10, tileSize * 0.8, 800, 500));
              break;
            case 0:
              row.push(makeSlime(x * tileSize, y * tileSize, 1, "large", 10, 20, tileSize, 500, 400));
              break;
          }
          break;
      }
    }
    tileMap.set(y, row);
  }
  return tileMap;
}
function makeMeleeWeapon(dmg, rate, texture, hitAreaEast, hitAreaWest) {
  return { t: "MELEE", d: dmg, rate: rate, texture: texture, he: hitAreaEast, hw: hitAreaWest };
}

function makeStartWeapon(playerSize) {
  return makeMeleeWeapon(5, 500, "sword1",
    makeRect(playerSize.w, 0, 20, playerSize.h),
    makeRect(-20, 0, 20, playerSize.h));
}
function makeMediumWeapon(playerSize) {
  return makeMeleeWeapon(8, 400, "sword1",
    makeRect(playerSize.w, 0, 30, playerSize.h),
    makeRect(-30, 0, 30, playerSize.h));
}
function makeGodWeapon(playerSize) {
  return makeMeleeWeapon(50, 200, "sword2",
    makeRect(playerSize.w, 0, 30, playerSize.h),
    makeRect(-30, 0, 30, playerSize.h));
}
function makeFarmingWeapon(playerSize) {
  return makeMeleeWeapon(2, 100, "sword2",
    makeRect(playerSize.w, 0, 20, playerSize.h),
    makeRect(-20, 0, 20, playerSize.h));
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
      gState.playerVelocity.y -= 12;
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
