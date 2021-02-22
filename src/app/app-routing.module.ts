import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlayDraughtsComponent } from './play-draughts/play-draughts.component';

const routes: Routes = [
  {path: '', component: PlayDraughtsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
