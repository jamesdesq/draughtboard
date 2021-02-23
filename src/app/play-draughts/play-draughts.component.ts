import { Component, OnInit } from '@angular/core';
import { BoardService } from '../services/board.service';
import { draughtsPiece } from './draughts-piece.interface';
import { coordinates } from './coordinates.interface';
import { MoveService } from '../services/move.service';


@Component({
  selector: 'app-drafts',
  templateUrl: './play-draughts.component.html',
  styleUrls: ['./play-draughts.component.scss']
})
export class PlayDraughtsComponent implements OnInit {

  row = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  boardLength = 8; 

  gameStarted = false;
  
  boardHeight = 8;

  player = '?';

  adjacents = [];

  currentColour = 'black-piece';

  board = [];

  takenBlack = 0;
  
  takenWhite = 0;

  selected = [];

  possibleTakers = [];

  messages = [];
  
  constructor(
    private boardService: BoardService,
    private moveService: MoveService,
    ) { 
    this.board = boardService.generateBoard();
  }

  ngOnInit(): void {
  }

  select(yPos: number, xPos: string, event): void {

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
      
      const selected: draughtsPiece = {
        yindex: yPos,
        xindex: xPos,
        colour: classes[1]
      }
      
      this.adjacents = [];

      this.checkAdjacents(selected);

      // If there are any pieces of the in-play colour in adjacents
      // we might *have* to play one of them.
    
      if (classes[3] && classes[3] === 'king') {
        selected.king = true;
      }

      this.populatePossibleTakers();

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

  populatePossibleTakers() {
    this.possibleTakers = [];

    for (let adjacent of this.adjacents) { 

      const takeable = this.checkTakeable(adjacent, this.currentColour);
      if (takeable) {
        this.possibleTakers.push(takeable);
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

    const t = this.moveService.getPositionAsObject(taker);
    const v = this.moveService.getPositionAsObject(victim);

    if (this.moveService.rightDirection(t, v, colourInPlay)) {
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

  move(yPos: number, xPos: string, event): boolean | void {
    if (this.selected.length > 0) { 
      const classes = event.target.className.split(" ");
      if (classes[2] !== 'occupied') { 
        let movable: draughtsPiece = this.selected[0];
        if (this.possibleTakers.length > 0) { 
          this.takePieces(yPos, xPos, movable);
        }
        else if (!this.allowed(movable, [yPos, xPos])) {
          return false;  
        }

        if (this.additionalMoves(movable)) { 
          this.messages.push('There are more pieces to take');
        }
        else { 
          // Clear the last square
          this.board[this.selected[0].yindex][this.selected[0].xindex] = "";
          this.selected = [];
          movable.yindex = yPos;
          movable.xindex = xPos;
          // Check if we need to make it a king
          movable = this.makeKing(yPos, movable);
          this.board[yPos][xPos] = movable;
          // Check if there are any more moves we need to do
          // And flip the colour so it's the other player's turn.
          this.currentColour = this.flipColour(this.currentColour);     
        } 
      }
    }
  }

  additionalMoves(movable: draughtsPiece): boolean { 

    this.adjacents = [];

    this.checkAdjacents(movable);
 
    this.populatePossibleTakers();

    if (this.possibleTakers.length) {
      const posibleSelection = movable.yindex+movable.xindex;
      if (this.possibleTakers.includes(posibleSelection)) { 
        this.messages.push('There are more pieces to take');
        return false;   
      }
    }
    return false;
  }

  makeKing(yPos: number, movable: draughtsPiece): draughtsPiece { 

    if (movable.colour === 'white-piece' && yPos === 0) { 
      movable.king = true; 
    }
    if (movable.colour === 'black-piece' && yPos === 7) {
      movable.king = true;
    }
    return movable;
  }

  takePieces(yPos: number, xPos: string, movable: draughtsPiece):void {

    const target = this.moveService.getPositionAsObject(yPos+xPos);

    const source = this.moveService.getPositionAsObject(movable.yindex+movable.xindex);

    let victimy = 0;
    if (source.y - target.y === -2) {
      // We're moving up the board and we're taking someone 
      victimy = source.y + 1;
      
    }
    if (source.y - target.y === 2) {
      // We're moving up the board and we're taking someone
      victimy = source.y - 1;
    } 

    const victimx = this.leftOrRight(source.x, target.x);

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

  flipColour(colour) { 
    if (colour === 'black-piece') {
      return 'white-piece';
    }
    return 'black-piece';
  }

  checkPiece(yPos: number, xPos: string) {    
    if (this.board[yPos][xPos]['colour']) {
      let classNames = this.board[yPos][xPos]['colour'] + ' occupied'; 
      if (this.board[yPos][xPos]['king']) { 
        classNames += ' king';
      }
      return classNames;
    }
  }

  checkAdjacents(piece: draughtsPiece): void {
    // When we select a piece, we want to make sure there are no other pieces that must be played: 
   for (let yPosition = 0; yPosition < this.board.length; yPosition++) {
     for (let xposition in this.board[yPosition]) { 
       if (this.board[yPosition][xposition].colour === piece.colour) { 
         const adjacent = this.adjacentFactory(yPosition, xposition, piece.colour, false); 
         if (adjacent) { 
           this.adjacents.push(adjacent);
         }
       }  
     }
   }
  }

  adjacentFactory(yPos: number, xPos: string, currentColour: string, king = false): Object | void { 
    const directions = ['left', 'right'];
    directions.forEach((direction) => {
      let adjacent = this.adjacentDirection(yPos, xPos, currentColour, direction);
      if (adjacent) {
        this.adjacents.push(adjacent);
      }
    });
  }

  adjacentDirection(yPos: number, xPos: string, currentColour: string, xDir: string): {} { 
    
    const xIterator = xDir === 'right' ? 1 : -1;
    const yIterator = currentColour === 'black-piece' ? 1 : -1;

    const takeableColor = currentColour === 'black-piece' ? 'white-piece' : 'black-piece';
    
    const takeableY = yPos + yIterator;
    const takeableNumX = this.row.indexOf(xPos) + xIterator;

    if ((takeableY < this.boardLength && takeableNumX < this.boardLength && takeableY >= 0 && takeableNumX >= 0)) { 
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

  allowed(currentPiece: draughtsPiece, target: Array<any>): boolean {  
    const sourceY = currentPiece.yindex;
    const sourceX = this.row.indexOf(currentPiece.xindex);
    const targetY = target[0];
    const targetX = this.row.indexOf(target[1]);

    const allowed = [1, -1];

    if (currentPiece.king) { 
      if (targetY === sourceY || targetY - sourceY < -1 || targetY - sourceY > 1) {  
        return false;
      }  
      if (allowed.indexOf(targetX - sourceX) < 0) { 
        return false;
      }
      return true;     
    }

    let allowedYmove = currentPiece.colour === 'black-piece' ? 1 : -1;

    if (targetY === sourceY || targetY - sourceY != allowedYmove) {
      return false;
    }


    if (allowed.indexOf(targetX - sourceX) < 0) { 
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


 
