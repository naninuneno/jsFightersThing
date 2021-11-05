import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Fighters Stuff</h1>
    <app-fighter-list></app-fighter-list>
    <app-fighter-create></app-fighter-create>
  `
})
export class AppComponent { }
