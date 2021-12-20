import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1>Fighters Stuff</h1>
    <mat-accordion>
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Fighters
          </mat-panel-title>
        </mat-expansion-panel-header>
        <app-fighter-list></app-fighter-list>
        <hr>
        <app-fighter-create></app-fighter-create>
      </mat-expansion-panel>
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Events
          </mat-panel-title>
        </mat-expansion-panel-header>
        <app-event-list></app-event-list>
      </mat-expansion-panel>
      <mat-expansion-panel>
        <mat-expansion-panel-header>
          <mat-panel-title>
            Fights
          </mat-panel-title>
        </mat-expansion-panel-header>
        <app-fight-list></app-fight-list>
      </mat-expansion-panel>
    </mat-accordion>
  `
})
export class AppComponent {
}
