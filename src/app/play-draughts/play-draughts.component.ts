import { ConditionalExpr, ThrowStmt } from '@angular/compiler';
import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { draughtsPiece } from './draughts-piece.interface';


@Component({
  selector: 'app-drafts',
  templateUrl: './play-draughts.component.html',
  styleUrls: ['./play-draughts.component.scss']
})
export class PlayDraughtsComponent implements OnInit {

  row = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  numrow = { A: "", B: "", C: "", D: "", E: "", F: "", G: ""};

  debugMessages = [];

  boardLength = 8; 
  
  boardHeight = 8;

  player = '????';

  adjacents = [];

  currentColour = 'black-piece';

  board = [];

  selected = [];

  possibleTakers = [];

  message = '';
  
  constructor() { }

  ngOnInit(): void {


    for (let i = 0; i < 8; i++) { 
      let numrow = { A: "", B: "", C: "", D: "", E: "", F: "", G: "", H: ""};
      this.board.push(numrow);
    }

    this.assignPieces(0, true, 'black-piece');
    this.assignPieces(1, false, 'black-piece');
    this.assignPieces(2, true, 'black-piece');

    this.assignPieces(5, false, 'white-piece');
    this.assignPieces(6, true, 'white-piece');
    this.assignPieces(7, false, 'white-piece');

    console.log(this.board);
  }

  select(yPos: number, xPos: string, event) {
    
    // Can't select if you've already selected!
    if (!this.selected.length) {
      
      const classes = event.target.className.split(" ");

      const colourInPlay = classes[1];
      this.adjacents = [];
      this.checkAdjacents(classes[1]);

      // If there are any pieces of the in-play colour in adjacents
      // we might *have* to play one of them.
    
      this.possibleTakers = [];

      for (let adjacent of this.adjacents) { 

        const takeable = this.checkTakeable(adjacent, colourInPlay);
        if (takeable) {
          this.possibleTakers.push(takeable);
        }
      }

      const selected: draughtsPiece = {
        yindex: yPos,
        xindex: xPos,
        colour: classes[1]
      }

      if (this.possibleTakers.length) {

        const posibleSelection = yPos+xPos;

        if (this.possibleTakers.includes(posibleSelection)) { 
          this.selected.push(selected);    
        }
        else {
          console.log('Not allowed!');
        }
      }
      else {
        this.selected.push(selected);
      }
    }
  }

  checkTakeable(adjacent: object, colourInPlay: string): string | void { 

    let taker = "";
    let victim = ""; 
    for (let key in adjacent) { 
      if (colourInPlay === adjacent[key]) {
        taker = key;  
      }
      else {
        victim = key;
      } 
    }

    const t = this.getPositionAsObject(taker);
    const v = this.getPositionAsObject(victim);

    if (this.rightDirection(t, v, colourInPlay)) {
      console.log('I am the taker: ', taker);
      if (this.getTarget(t, v)) { 
        return taker;
      } 
    }
    return null;
  }

  getTarget(taker, victim) { 

    const ytarget = taker.y < victim.y ? victim.y + 1 : victim.y - 1
    if (ytarget < 0 || ytarget > 7) {
      return false;
    }
    const xtarget = taker.x < victim.x ? victim.x + 1 : victim.x - 1;
    if (xtarget < 0 || xtarget > 7) {
      return false;
    }
    const letterX = this.row[xtarget];

    if (this.board[ytarget][letterX] !== "") { 
      return false;
    }

    console.log('Target coordinates: ', ytarget, letterX)
    return true;
  }

  rightDirection(taker, victim, colourInPlay): boolean { 
    
    switch(colourInPlay) {
      case 'black-piece':  
        // The vicitim's y position must be one greater than the takers
        if (victim.y - taker.y === 1) {
          return true;
        }
        break;

      case 'white-piece': 
        // The victim's y position must be one less than taker's
        if (taker.y - victim.y === 1) {
          return true;
        }
    }
    return false;
  }

  getPositionAsObject(position: string) { 
    if (position.length === 2) { 
      const numPos = position.split("");
      
      const coordinates = {
        y: Number(numPos[0]),
        x: this.row.indexOf(numPos[1]), 
      }
      return coordinates;
    }   
  }


  move(yPos, xPos, event): boolean | void {
    console.log('I am the length: ', this.selected.length);
    if (this.selected.length > 0) { 
      console.log('I should not happen');
      const classes = event.target.className.split(" ");

      console.log(this.allowed(this.selected[0], [yPos, xPos]));

      if (classes[2] !== 'occupied') { 
        const adjacents = this.adjacentFactory(yPos, xPos, this.selected[0].colour);
        this.selected[0].adjacents = adjacents;
        let movable = this.selected[0];
        if (this.possibleTakers.length > 0) { 
          this.takePieces(yPos, xPos, movable);
        }
        else if (!this.allowed(movable, [yPos, xPos])) {
          return false;  
        }
        // Clear the last square
        this.board[this.selected[0].yindex][this.selected[0].xindex] = "";
        this.selected = [];
        movable.yindex = yPos;
        movable.xindex = xPos;
        this.board[yPos][xPos] = movable;        
      }
    }
  }

  takePieces(yPos, xPos, movable) {

    let target = this.getPositionAsObject(yPos+xPos);

    let source = this.getPositionAsObject(movable.yindex+movable.xindex);

    console.log('I am in takepieces: ', source, target);

    let victimy = 0;
    if (source.y - target.y === -2) {
      // We're moving up the board and we're taking someone 
      victimy = source.y + 1;
      
    }
    if (source.y - target.y === 2) {
      // We're moving up the board and we're taking someone
      victimy = source.y - 1;
    } 

    let victimx = this.leftOrRight(source.x, target.x);

    console.log('The victim is in: ', victimy, this.row[victimx]);
    this.board[victimy][this.row[victimx]] = "";
  } 

  leftOrRight(sourceX, targetX): number { 
    if (sourceX > targetX) { 
      // We're going left
      return sourceX - 1;
    }
    else {
      return sourceX + 1;
    }
  }


  checkAdjacents(colour): void{
 
    // When we select a piece, we want to make sure there are no other pieces that must be played: 

    // colour = this.flipColour(colour);

    for (let i = 0; i < this.board.length; i++) {
      for (let xposition in this.board[i]) { 
        if (this.board[i][xposition].colour === colour) { 
          // if (this.board[i][xposition].adjacents && this.board[i][xposition].adjacents.length) {
            
          const adjacent = this.adjacentFactory(i, xposition, colour, false); 
          
          if (adjacent) { 
            this.adjacents.push(adjacent);
          }
        }  
      }
    }
    // return adjacents;
  }

  flipColour(colour) { 
    if (colour === 'black-piece') {
      return 'white-piece';
    }
    return 'black-piece';
  }

  checkPiece(yPos: number, xPos: string) {    
    if (this.board[yPos][xPos]['colour']) {
      return this.board[yPos][xPos]['colour'] + ' occupied';
    }
  }

 
  adjacentFactory(yPos, xPos, currentColour, king = false): Object | void { 

    let directions = ['left', 'right'];

    directions.forEach((direction) => {
      let adjacent = this.adjacentDirection(yPos, xPos, currentColour, direction);
      console.log('I am the adjacent: ', adjacent);
      if (adjacent) {
        this.adjacents.push(adjacent);
      }
    });


  }

  adjacentDirection(yPos, xPos, currentColour, xDir): {} { 
    
    let xIterator = xDir === 'right' ? 1 : -1;
    let yIterator = currentColour === 'black-piece' ? 1 : -1;

    let takeableColor = currentColour === 'black-piece' ? 'white-piece' : 'black-piece';
    
    let takeableY = yPos + yIterator;
    let takeableNumX = this.row.indexOf(xPos) + xIterator;

    if ((takeableY < 8 && takeableNumX < 8 && takeableY >= 0 && takeableNumX >= 0)) { 
      let takeableX = this.row[takeableNumX];
      if (this.board[takeableY][takeableX]['colour'] === takeableColor) {     
        // Add the moved piece to the takeable piece because it works both ways
        // this.debugMessages.push(`The ${currentColour} piece has been moved to ${yPos}${xPos}`);
        // this.debugMessages.push(`We looked in ${takeableY}${takeableX} and found a ${takeableColor} piece`);
        const takeableLocation = takeableY+takeableX;
        const takingLocation = yPos+xPos;
        return {
          [takeableLocation]: takeableColor,
          [takingLocation]  : currentColour, 
        }
      }
    }
  }

  allowed(currentPiece, target): boolean {  
    console.log('current: ' , currentPiece, 'target: ', target);
    const sourceY = currentPiece.yindex;
    const sourceX = this.row.indexOf(currentPiece.xindex);
    const targetY = target[0];
    const targetX = this.row.indexOf(target[1]);

    let allowedYmove = currentPiece.colour === 'black-piece' ? 1 : -1;

    if (targetY === sourceY || targetY - sourceY != allowedYmove) {
      console.log('oh dear');
      return false;
    }

    const allowed = [1, -1];

    console.log('Target and source' , targetX, sourceX);

    if (allowed.indexOf(targetX - sourceX) < 0) { 
      console.log('Oh dear, Not allowed');
      return false;
    }  
    return true;
  }


  getSquareColour(input) { 
    let i = input[0];
    let j = this.row.indexOf(input[1]);

    if (j % 2 === 0) { 
      if (i % 2 === 0) {
        return "black";
      }
    }
    else { 
      if (i % 2 !== 0) {
        return "black";
      }
    }
  }

  tossCoin() {
    let player = Math.floor(Math.random() * 2) + 1;
    this.player = 'Player ' + player;
  }

  assignPieces(row: number, leftAlign: boolean, colour: 'black-piece' | 'white-piece') {

    const piece: draughtsPiece = { 
      colour: colour,
      adjacents: []
    }
    
    for (let i = 0; i < this.boardLength; i++) { 
      if (leftAlign) { 
        if (i % 2 !== 0) {
          piece.yindex = row;
          piece.xindex = this.row[i]; 
          this.board[row][this.row[i]] = piece;
        }
      }
      else { 
        if (i % 2 === 0) {
          piece.yindex = row;
          piece.xindex = this.row[i];
          this.board[row][this.row[i]] = piece;
        }
      }
    }    
  }

  haveTo(currentPiece, target, xDir, yDir) {

    console.log('Start position', currentPiece);

    let xIterator = xDir = 'right' ? 1 : -1;

    let yIterator = yDir = 'down' ? 1 : -1;

    
      let takeableY = currentPiece[0][0] + yIterator;
      let takeableNumX = this.row.indexOf(currentPiece[0][1]) + xIterator;

      if ((takeableY < 8 && takeableNumX < 8 && takeableY >= 0 && takeableNumX >= 0)) { 
        let takeableX = this.row[takeableNumX];

        if (this.board[takeableY][takeableX] === 'white-piece') { 
          let landableY = takeableY + yIterator;
          let landableNumX = takeableNumX + xIterator;
  
          if (landableY < 8 && landableNumX < 8 && landableY >= 0 && landableNumX >= 0) { 
            let landableX = this.row[landableNumX];
            if (this.board[landableY][landableX] === "") { 
              
              console.log('LandableX: ', landableX == target[1]);
              console.log('LandableY: ', landableY == target[0]);
              console.log('Target ', target);
              if (target[1] == landableX && target[0] == landableY) { 
  
                console.log("Do we get here?");
                // this.board[takeableY][takeableX] = "";
                return currentPiece;
              }             
            }
          }
        }
      }

    return false; 
  }
 }

 
