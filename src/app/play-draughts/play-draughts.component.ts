import { ConditionalExpr, ThrowStmt } from '@angular/compiler';
import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { BoardService } from '../board.service';
import { draughtsPiece } from './draughts-piece.interface';
import { coordinates } from './coordinates.interface';


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

  gameStarted = false;
  
  boardHeight = 8;

  player = '????';

  adjacents = [];

  currentColour = 'black-piece';

  board = [];

  takenBlack = 0;
  
  takenWhite = 0;

  selected = [];

  possibleTakers = [];

  messages = [];
  
  constructor(private boardService: BoardService) { 
    this.board = boardService.generateBoard();
  }

  ngOnInit(): void {

  }

  select(yPos: number, xPos: string, event) {

    if (!this.gameStarted) {
      return null;
    }

    const classes = event.target.className.split(" ");
    const colourInPlay = classes[1];
    this.messages = [];

    if (colourInPlay !== this.currentColour) {

      this.messages.push(`It's not your turn!`);
      return null;
    }

    // Can't select if you've already selected!
    if (!this.selected.length) {
      

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
          this.messages.push(`There's another piece you need to play!`);
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
      if (this.getTarget(t, v)) { 
        return taker;
      } 
    }
    return null;
  }

  getTarget(taker: coordinates, victim: coordinates): boolean { 

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

  getPositionAsObject(position: string): coordinates { 
    if (position.length === 2) { 
      const numPos = position.split("");
      
      const coordinates: coordinates = {
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
        this.currentColour = this.flipColour(this.currentColour);       
      }
    }
  }

  takePieces(yPos, xPos, movable) {

    let target = this.getPositionAsObject(yPos+xPos);

    let source = this.getPositionAsObject(movable.yindex+movable.xindex);

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
    if (this.board[victimy][this.row[victimx]].colour === 'white-piece') { 
      this.takenWhite++;
    }
    else {
      this.takenBlack++;
    }

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
    for (let i = 0; i < this.board.length; i++) {
      for (let xposition in this.board[i]) { 
        if (this.board[i][xposition].colour === colour) { 
            
          const adjacent = this.adjacentFactory(i, xposition, colour, false); 
          
          if (adjacent) { 
            this.adjacents.push(adjacent);
          }
        }  
      }
    }
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
    this.player = 'Player ' + player + ' plays first';
    this.gameStarted = true;
  }
}


 
