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
function intersectRect(r1, r2) {
  const xIntersection = (r1.x >= r2.x && r1.x <= r2.x + r2.w) || (r2.x >= r1.x && r2.x <= r1.x + r1.w);
  const yIntersection = (r1.y >= r2.y && r1.y <= r2.y + r2.h) || (r2.y >= r1.y && r2.y <= r1.y + r1.h);
  return xIntersection && yIntersection;
}
function canvasToImage(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	return image;
}
function makeWall(d,x, y, w, h) {
  return { t: "WALL",d:d, r: makeRect(x, y, w, h) };
}
function makeFloor(d,x, y, w, h) {
  return { t: "FLOOR",d:d, r: makeRect(x, y, w, h) };
}
function makeMirror(x, y, w, h) {
  return { t: "MIRROR", r: makeRect(x, y, w, h) };
}
function makeSlime(x, y, vx, hp, loot, dmg, s, hs) {
  return { t: "SLIME", x:x,y:y,vx:vx,vy:0,s:s,hp:hp,loot:loot,dmg:dmg,move:false,hitTimer:0,hitspeed:hs};
}
function countFloors(map,x,y,size){
  if(y < 0 || y > map[0].length-1){
    return 0;
  }
  var count = 0;
  for(var xx = Math.max(0,x-size);xx<=Math.min(map.length-1,x+size);xx++){
    if(map[xx][y]=="FLOOR"){
      count += 1;
    }
  }
  return count;
}
function generateMap(height, levelRadius, tileSize) {
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
  for(var i = 0; i < 1; i ++){
    for (var y = height - 8; y >= 5; y-=3) {
      for (var x = 1; x < levelRadius-1; x++) {
        
        var floorsLeft = countFloors(tileMapLeft,x,y+3,1);
        var floorsRight = countFloors(tileMapRight,x,y+3,1);

        if(floorsLeft + floorsRight >= 1){
          tileMapLeft[x][y] == "EMPTY";
          tileMapRight[x][y] == "EMPTY";
        } else {
          if(floorsLeft + floorsRight == 0){
            if(tileMapLeft[x-1][y] == "FLOOR"){
              tileMapLeft[x][y] = "FLOOR";
            } else if(tileMapRight[x-1][y] == "FLOOR"){
              tileMapRight[x][y] = "FLOOR";
            } else {
              if(Math.random() > 0.5){
                tileMapLeft[x][y] = "FLOOR";
              } else {
                tileMapRight[x][y] = "FLOOR";
              }
            }
          }

          if(countFloors(tileMapLeft,x-1,y,1)==2 && countFloors(tileMapLeft,x+1,y+3,1)==3){
            tileMapLeft[x][y] = "FLOOR";
            tileMapLeft[x][y+3] = "EMPTY";
            tileMapRight[x][y+3] = "EMPTY";
          }
          if(countFloors(tileMapRight,x-1,y,1)==2 && countFloors(tileMapRight,x+1,y+3,1)==3){
            tileMapRight[x][y] = "FLOOR";
            tileMapLeft[x][y+3] = "EMPTY";
            tileMapRight[x][y+3] = "EMPTY";
          }

          if(floorsLeft > 1){
            tileMapRight[x][y] = "EMPTY";
          } else if(floorsRight > 1){
            tileMapLeft[x][y] = "EMPTY";
          }

          if(y < height-10 && Math.random() > 0.5 && slimeCooldown == 0){
            if(tileMapLeft[x][y] == "FLOOR"){
              tileMapLeft[x][y-1] = "SLIME";
              slimeCooldown = 8;
            }else if(tileMapRight[x][y] == "FLOOR"){
              tileMapRight[x][y-1] = "SLIME";
              slimeCooldown = 8;
            }
          }


        }

        slimeCooldown = Math.max(0,slimeCooldown-1);
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
          if(rowTiles[x-1]!="FLOOR"){
            row.push(makeFloor("LEFT",x * tileSize, y * tileSize, tileSize, tileSize));
          } else if(rowTiles[x+1]!="FLOOR"){
            row.push(makeFloor("RIGHT",x * tileSize, y * tileSize, tileSize, tileSize));
          } else {
            row.push(makeFloor("CENT",x * tileSize, y * tileSize, tileSize, tileSize));
          }
          break;
        case "WALL":
          if(x == 0){
            row.push(makeWall("LEFT",x * tileSize, y * tileSize, tileSize, tileSize));
          }else if(x==(levelRadius*2)-1){
            row.push(makeWall("RIGHT",x * tileSize, y * tileSize, tileSize, tileSize));
          }
          break;
        case "MIRRORLEFT":
          row.push(makeMirror(x * tileSize, y * tileSize, tileSize, tileSize));
          break;
        case "MIRRORRIGHT":
          row.push(makeMirror(x * tileSize, y * tileSize, tileSize, tileSize));
          break;
        case "SLIME":
          if(y > height-30){
            row.push(makeSlime(x * tileSize, y * tileSize,1,10,null,0,tileSize - 4,1000));
          } else if(y > height-80){
            var dmg = Math.max(30,Math.trunc(40*Math.random()));
            row.push(makeSlime(x * tileSize, y * tileSize,2,30,null,dmg,tileSize - 3,1500));
          } else if(y > height-90){
            if(Math.random() > 0.5){
              var dmg = Math.max(60,Math.trunc(70*Math.random()));
              row.push(makeSlime(x * tileSize, y * tileSize,4,40,null,dmg,tileSize - 3,900));
            } else {
              var dmg = Math.max(60,Math.trunc(90*Math.random()));
              row.push(makeSlime(x * tileSize, y * tileSize,2,50,null,dmg,tileSize - 2),900);
            }
          }
          break;
      }
    }
    tileMap.set(y, row);
  }
  return tileMap;
}
