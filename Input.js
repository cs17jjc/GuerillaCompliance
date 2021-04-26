class Inputs{
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
