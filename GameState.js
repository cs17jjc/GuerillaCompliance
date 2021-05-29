class GameState {
    constructor() {
    }
    static initial() {
        return new GameState();
    }

    updateGame(inputsArr, soundToggle) {
        
    }

    update(inputsArr, soundToggle) {
        this.updateGame(inputsArr, soundToggle);
    }

    draw(ctx) {
        ctx.save();
        ctx.restore();
    }
}