export class GamePC {
    width:number
    height:number
    player:string
    chocolate:number[]
    poison:{x:number, y:number} = {x:0, y:5};
    currentHeight:number
    currentWidth:number

  constructor( width:number, height:number) {
    this.width = width;
    this.height = height;
    this.player = "player 1";
    this.chocolate = Array.from({length: width * height}, () => 1);
    this.currentHeight = this.height;
    this.currentWidth = this.width;
  }

  changePoison(xcoord:number, ycoord:number){ // place the poison at the given coordinates
    this.chocolate[xcoord + ycoord * this.width] = 2;
    this.chocolate[this.poison.x + this.poison.y * this.width] = 1;
  }

  
}