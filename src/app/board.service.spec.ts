import { TestBed } from '@angular/core/testing';

import { BoardService } from './board.service';

describe('BoardServiceService', () => {
  let service: BoardService;

  let boardSize = 8;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('should return a draughts board', () => { 
    const board = service.generateBoard();
    
    expect(typeof board).toBe('object');

    expect(board.length).toBe(boardSize);

    expect(Object.keys(board[0]).length).toBe(boardSize);

  })

  it('should set up the board correctly', () => {

    const board = service.generateBoard();

    const row = board[0];

    expect(row.B.colour).toBe('black-piece');

  })
});
