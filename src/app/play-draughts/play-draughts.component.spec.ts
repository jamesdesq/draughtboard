import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayDraughtsComponent } from './play-draughts.component';

describe('PlayDraughtsComponent', () => {
  let component: PlayDraughtsComponent;
  let fixture: ComponentFixture<PlayDraughtsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayDraughtsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayDraughtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
