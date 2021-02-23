import { Injectable } from '@angular/core';
import { coordinates } from './../play-draughts/coordinates.interface';

@Injectable({
  providedIn: 'root'
})
export class MoveService {

  row = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  constructor() { 
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
}
