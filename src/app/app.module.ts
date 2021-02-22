import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayDraughtsComponent } from './play-draughts/play-draughts.component';
import { FriendlyNamePipe } from './pipes/friendly-name.pipe';

@NgModule({
  declarations: [
    AppComponent,
    PlayDraughtsComponent,
    FriendlyNamePipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
