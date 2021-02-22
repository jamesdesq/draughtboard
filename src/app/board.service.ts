import { Injectable } from '@angular/core';
import { draughtsPiece } from './play-draughts/draughts-piece.interface';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  board = [];

  boardLength = 8;

  row =  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  constructor() { }

  generateBoard(): Array<any> { 
    for (let i = 0; i < 8; i++) { 
      let numrow = { A: "", B: "", C: "", D: "", E: "", F: "", G: "", H: ""};
      this.board.push(numrow);
    }

    this.assignPieces(0, false, 'black-piece');
    this.assignPieces(1, true, 'black-piece');
    this.assignPieces(2, false, 'black-piece');

    this.assignPieces(5, true, 'white-piece');
    this.assignPieces(6, false, 'white-piece');
    this.assignPieces(7, true, 'white-piece');

    console.log(this.board);
    return this.board;
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
}
