export class GamePC {
    width:number
    height:number
    player:string
    adversary:string
    undoStack:{height:number, width:number, poison:{x:number, y:number}}[]
    redoStack:{height:number, width:number, poison:{x:number, y:number}}[]
    poison:{x:number, y:number} = {x:3, y:1};
    currentHeight:number
    currentWidth:number
    over:boolean = false

  constructor( width:number, height:number) {
    this.width = width;
    this.height = height;
    this.player = "Joueur 1";
    this.adversary = "HardAI";
    this.currentHeight = this.height;
    this.currentWidth = this.width;
    this.undoStack = [];
    this.redoStack = [];
  }

  changePoison(type:string){ // place the poison at the given coordinates
    let xcoord:number = 0;
    let ycoord:number = 0;
    if (type === "random") {
      ycoord = Math.floor(Math.random() * this.currentHeight);
      xcoord = Math.floor(Math.random() * this.currentWidth);
    }
    else if (type === "border"){
      let side = Math.floor(Math.random() * 4); // 0 = Bottom, 1 = Top, 2 = Left, 3 = Right

      if (side < 2) {
        xcoord = Math.floor(Math.random() * this.currentWidth);
        if (side === 0) ycoord = 0;
        else ycoord = this.currentHeight - 1;
      } 
      else {
        ycoord = Math.floor(Math.random() * this.currentHeight);
        if (side === 2) xcoord = 0;
        else xcoord = this.currentWidth - 1;
      }
    }
    else if (type === "corner"){
      xcoord = this.currentWidth - 1;
      ycoord = this.currentHeight - 1;
    }

    this.poison.x = xcoord;
    this.poison.y = ycoord;
  }

  cut(xcoord:number, ycoord:number) {
    this.undoStack.push({height: this.currentHeight, width: this.currentWidth, poison: {x: this.poison.x, y: this.poison.y}});
    if (xcoord != -1 ) {
      if (this.poison.x >= xcoord){
          this.currentWidth = this.currentWidth - xcoord;
          this.poison.x -= xcoord;
      }
      else {
        this.currentWidth = this.currentWidth - (this.currentWidth - xcoord);
      }
    }
    else if (ycoord != -1) {
      if (this.poison.y >= ycoord){
        this.currentHeight = this.currentHeight - ycoord;
          this.poison.y -= ycoord;
      }
      else {
        this.currentHeight = this.currentHeight - (this.currentHeight - ycoord);
      }
    }
    //if (this.adversary !== "Joueur 1"){
    //  this.aiCut = true;
    //}
    if (this.currentHeight*this.currentWidth === 1){
      this.over = true
      console.log(`${this.player} a Gagné!`)
    }
    else this.player = this.player === "Joueur 1" ? "Joueur 2" : "Joueur 1";
  }

  undo() {
    if (this.undoStack.length > 0) {
      const lastState = this.undoStack.pop()!;
      this.redoStack.push({height: this.currentHeight, width: this.currentWidth, poison: {x: this.poison.x, y: this.poison.y}});
      this.currentHeight = lastState.height;
      this.currentWidth = lastState.width;
      this.poison.x = lastState.poison.x;
      this.poison.y = lastState.poison.y;
    }
  }

  redo(){
    if (this.redoStack.length > 0) {
      const lastState = this.redoStack.pop()!;
      this.undoStack.push({height: this.currentHeight, width: this.currentWidth, poison: {x: this.poison.x, y: this.poison.y}});
      this.currentHeight = lastState.height;
      this.currentWidth = lastState.width;
      this.poison.x = lastState.poison.x;
      this.poison.y = lastState.poison.y;
    }
  }

  changeAdversary(adversary:string) {
    this.adversary = adversary;
  }

  adversaryPlay() {

    //await this.wait(1000); // to avoid having the ai play too fast we add a delay of 1 second
    if (this.adversary === "HardAI") {
      this.hardMode();
    }
    //if (this.adversary === "HardAI") {
    //  this.aiCut = false;
    //  this.easyMode();
    //}

    else if (this.adversary === "Joueur 1") {
      this.player = "Joueur 2";
    }
    else if (this.adversary === "Joueur 2") {
      this.player = "Joueur 1";
    }
  }

  hardMode() {// the ai will play in the most optimal way
    
    this.undoStack.push({height: this.currentHeight, width: this.currentWidth, poison: {x: this.poison.x, y: this.poison.y}});
    
    // let's measure the distance between the poison and the borders
    let distTop = this.currentHeight - this.poison.y - 1;
    let distBottom = this.poison.y;
    let distLeft = this.poison.x;
    let distRight = this.currentWidth - this.poison.x - 1;
    console.log(`distTop: ${distTop}, distBottom: ${distBottom}, distLeft: ${distLeft}, distRight: ${distRight}`);

    let doubleSymetry = (distBottom === distTop && distLeft !== distRight || distLeft === distRight && distTop !== distBottom)
    let diagonalSymetry = (distTop === distLeft || distBottom === distRight || distTop === distRight || distBottom === distLeft)
    // this part maintains the symetry of the grid on both the x and y axis
    if (distBottom + distTop === distRight + distLeft) {
      //the grid has a central symetry so we can't do anything but expect a mistake from the player
      console.log("random bullshit go")
      let random = Math.floor(Math.random()*2)
      if (random === 0) { this.currentHeight -= 1 }
      else { this.currentWidth -=1 }
      // so we buy some time
    }

    else if (doubleSymetry || diagonalSymetry) {
      if (doubleSymetry) console.log("a double symetry is possible")
      if (diagonalSymetry) console.log("a diagonal il possible")
      this.currentWidth = 2 * Math.min(distLeft, distRight) + 1;
      this.currentHeight = 2 * Math.min(distTop, distBottom) + 1;
      this.poison = {
        x: Math.floor(this.currentWidth / 2), 
        y: Math.floor(this.currentHeight / 2)
      }     
    }
    // this part maintains the symetry of the grid on a diagonal axis
//    else if () {
//      console.log("a diagonal symetry is possible")
//      if (distTop < distLeft) {
//        console.log("cut left");
//        this.cut(distLeft - distTop, -1);
//      }
//      else if (distTop > distLeft){
//        console.log("cut bottom right");
//        this.cut(-1, this.currentHeight - ( distTop - distLeft));
//      }
//      else if (distBottom < distRight) {
//        console.log("cut bottom right");
//        this.cut(-1, distRight - distBottom);
//      }
//      else if (distRight < distBottom) {
//        console.log("cut top left");
//        this.cut(this.currentWidth - ( distRight - distBottom), -1);
//      }
//      else if (distTop < distRight) {
//        console.log("cut top right");
//        this.cut(-1, distRight - distTop);
//      }
//      else if (distTop > distRight) {
//        console.log("cut bottom left");
//        this.cut(distRight - distTop, -1);
//      }
//      else if (distBottom < distLeft) {
//        console.log("cut bottom left");
//        this.cut(distLeft - distBottom, -1);
//      }
//      else if (distBottom > distLeft) {
//        console.log("cut top right");
//        this.cut(-1, this.currentHeight - ( distBottom - distLeft));
//      }
//    }

    else {
      console.log("not able to act yet");
    }

    
  }
  wait(ms:number) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }
}

