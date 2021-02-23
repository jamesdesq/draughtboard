# Draughts

This project is my attempt to do David Whitney's code kata: 

https://github.com/davidwhitney/CodeDojos/tree/master/Draughts

It was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.2.0.

You can see a [hosted version of the software here](http://jamesd-draughts.s3-website.eu-west-2.amazonaws.com/).

## The rules: 
- Click the "Click to start button" button to find out which player is playing black. Black always plays first
- Click a piece to select it, then click the square you want to move it to
- The rules of draughts state that if a player can take a piece, they must do so. If you have a piece that's able to take one of your opponents pieces, and you try to select a different one, you'll see a message saying that you're not allowed to
- If you get one of your pieces all the way to the opposite side, it will become a king, and be able to move in any direction
- If you take all your opponent's pieces, you've won!

## Still to implement

There's one main requirement still to implement: 

> "If, upon capturing a piece, another piece can be captured, they must also capture any subsequent pieces."

However you should be able to see that on line 189 of the play-draughts.component.ts file there's a function called `additionalMoves`. It reuses the same functions that are used when a player selects a piece, and shouldn't take long to make usable. However, currently it returns false in any situation so it doesn't break anything. 

It's also currently not possible for a king piece to take other pieces when moving against its usual direction.
# Building, testing and deploying
## Development server

If you want to run this locally, clone the repo to your machine, `cd` into the docroot and run `npm install`.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
