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
function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t
}
function radians_to_degrees(radians) {
  var pi = Math.PI;
  return radians * (180 / pi);
}
function tweetFinished(score) {
  var left = (screen.width / 2) - (640 / 2);
  var top = (screen.height / 2) - (380 / 2);

  var shareText = encodeURIComponent("I completed Mirroria by @KiwiSoggy with " + score + " Coins! https://soggykiwi.itch.io/mirroria");
  var shareUrl = "https://twitter.com/intent/tweet?text=" + shareText;

  var popup = window.open(shareUrl, 'name', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + 640 + ', height=' + 380 + ', top=' + top + ', left=' + left);
  if (window.focus && popup) {
    popup.focus();
  }
}

function makeTurretPlatform(position, sector, num) {
  return new GameObject("TURRET_PLATFORM", position, { platformNum: num, hasTurret: false, turret: null, sector: sector });
}

function makeEnemy(position, type, health) {
  return new GameObject("ENEMY", position, { health: health, type: type, curWay: 0, curWayDist: 0, speed: 0, timeMade: 0, angle: 0 })
}

function makeShopFrame(position, w, h, s) {
  return new GameObject("UI_FRAME", position, { width: w, height: h, isVisible: false, side: s });
}

function makeShopButton(position, action, width, height) {
  return new GameObject("UI_BUTTON", position, {action: action, width: width, height: height})
}

function checkRange(enemyTargets, range, position) {
  var retArray = [];
  for (var i = 0; i < enemyTargets.length; i++) {
    if (calcDistance(position, enemyTargets[i].position) < range) {
      retArray.push(enemyTargets[i]);
    }
  }
  return retArray;
}

function targetEnemy(enemyTargets) {
  var enemy = enemyTargets[0];
  for (var i = 1; i < enemyTargets.length; i++) {

    if (enemyTargets[i].data.curWay > enemy.data.curWay) {
      enemy = enemyTargets[i];
    } else if (enemyTargets[i].data.curWay == enemy.data.curWay) {
      if (enemyTargets[i].data.curWayDist < enemy.data.curWayDist) {
        enemy = enemyTargets[i]
      }
    }

  }
  return enemy;
}


function healthToColour(health) {
  var col = ["f94144", "f3722c", "f8961e", "f9844a", "f9c74f", "90be6d", "43aa8b", "4d908e", "577590", "277da1"][health - 1];
  return col;
}

function makeAllPossibleRules() {
  var turretTypes = ["STANDARD", "SNIPER", "MACHINE_GUN", "LASER"];
  var sections = [0, 1, 2, 3];
  var modTypes = ["RANGE", "ACCURACY", "COOLDOWN"];

  var allRules = [
    { type: "PRESERVE", section: 0, health: 8 },
    { type: "PRESERVE", section: 1, health: 6 },
    { type: "PRESERVE", section: 2, health: 4 }
  ];

  var typeCounter = 0;
  var sectionCounter = 0;
  var modCounter = 0;
  while (modCounter < modTypes.length) {
    allRules.push({ type: "EMBARGO", section: sections[sectionCounter], subtype: turretTypes[typeCounter], modifies: modTypes[modCounter], value: modTypes[modCounter] == "COOLDOWN" ? 1.2 : 0.8 });
    typeCounter += 1;
    if (typeCounter == turretTypes.length) {
      typeCounter = 0;
      sectionCounter += 1;
    }
    if (sectionCounter == sections.length) {
      sectionCounter = 0;
      modCounter += 1;
    }
  }

  typeCounter = 0;
  sectionCounter = 0;
  while (sectionCounter < sections.length) {
    allRules.push({ type: "BAN", section: sections[sectionCounter], subtype: turretTypes[typeCounter] });
    typeCounter += 1;
    if (typeCounter == turretTypes.length) {
      typeCounter = 0;
      sectionCounter += 1;
    }
  }

  return allRules;
}

function makeRandomConfig() {
  var platformConfigs = [[0, 0, 0, 0], [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  var config = [];
  for(var i = 0; i < 10; i++){
    config = config.concat(random_item(platformConfigs));
  }
  return config;
}

function averageLifespansForRules(rep,allRules){
  var lifespans = [];
  allRules.forEach(rule => {
    lifespans.push(averageEnemyLifespanForState(rep,rule));
  });

  //Scaling
  var min = Math.min(...lifespans);
  var max = Math.max(...lifespans);
  return lifespans.map(x => (x-min)/(max-min));
}

function averageEnemyLifespanForState(rep, rule) {

  var gs = new GameState();

  if (rule != null) {
    gs.rules.push(rule);
    gs.rulesUpdated = true;
  }

  updateGamestateToMatchRep(gs, rep);

  for (var i = 0; i < 500; i++) {
    gs.upcomingEnemies.push(makeEnemy({ x: -10, y: canvasHeight / 2 }, "NORM", Math.min(10,Math.floor((i+50)/50)) ) );
  }

  gs.spawnEnemies = true;

  while (gs.gameObjects.filter(o => o.type == "ENEMY").length > 0 || gs.spawnEnemies) {
    gs.update([], false);
  }

  return gs.enemyLifespans.reduce((acc, cur) => acc + cur) / gs.enemyLifespans.length;
}

function updateGamestateToMatchRep(gs, rep) {
  gs.gameObjects.filter(o => o.type == "TURRET_PLATFORM").forEach(p => {p.data.hasTurret = false; p.data.turret = null;})
  for (var i = 0; i < rep.length; i++) {
    if (rep[i] == 1) {
      var platform = Math.trunc(i / 4);
      var type = i - (4 * platform);
      switch (type) {
        case 0:
          gs.attachTurret(Turret.standardTurret(), platform);
          break;
        case 1:
          gs.attachTurret(Turret.sniperTurret(), platform);
          break;
        case 2:
          gs.attachTurret(Turret.machineGunTurret(), platform);
          break;
        case 3:
          gs.attachTurret(Turret.laserTurret(), platform);
          break;
      }
    }
  }
}

function getNextRule(model, rep, wave, allRules, currentRules) {

  var pred = Array.from(model.predict(tf.tensor(rep, [1, 40])).dataSync());
  var chosenRule = -1;
  for (var i = 0; i < allRules.length; i++) {
    //Check if rule type is allowed for wave
    if (allRules[i].type == "EMBARGO" || (allRules[i].type == "PRESERVE" && wave > 5) || (allRules[i].type == "BAN" && wave > 10)) {
      //Check rule isn't already added
      if (!currentRules.includes(allRules[i])) {
        if (chosenRule == -1) {
          chosenRule = i;
        } else {
          if (pred[i] > pred[chosenRule]) {
            chosenRule = i;
          }
        }
      }
    }
  }

  return chosenRule == -1 ? null : allRules[chosenRule];

}

function makeModel(inputSize, outputSize) {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [inputSize], units: 10, activation: 'tanh' }));
  model.add(tf.layers.dense({ units: outputSize, activation: 'relu' }));

  model.weights.forEach(w => {
    const newVals = tf.randomNormal(w.shape);
    w.val.assign(newVals);
  });

  model.compile({
    optimizer: 'adam',
    loss: 'meanSquaredError',
    metrics: ['mae']
  });

  return model;
}

