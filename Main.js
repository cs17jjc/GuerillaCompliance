var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
ctx.imageSmoothingEnabled = false;
var canvasWidth = c.width;
var canvasHeight = c.height;

var textures = new Map();
Array.from(document.images).forEach(i => {
    textures.set(i.id, i);
});

var gameState;
var isClicked = false
var clickEvent;
var inputs = Inputs.empty();
inputs.attachInputs();

document.addEventListener('keydown', (e) => {
    inputs.update(e.key, true);
});
document.addEventListener('keyup', (e) => {
    inputs.update(e.key, false);
});
document.addEventListener('click', (e) => {
    isClicked = true;
    clickEvent = e;
});

let mySongData = zzfxM(...bgMusicSong);
let myAudioNode = zzfxP(...mySongData);
myAudioNode.loop = true;
//myAudioNode.start();
var musicToggle = true;
var soundToggle = true;


function draw(ctx) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    gameState.update(inputs.getInputs(), soundToggle);
    gameState.draw(ctx);

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

    inputs.prevStates = inputs.getInputs();
}

var loadedImages = true;
var loadChecker;
loadChecker = setInterval(() => {
    if (loadedImages) {
        clearInterval(loadChecker);
        gameState = GameState.initial();
        //setInterval(() => draw(ctx), 50);
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


