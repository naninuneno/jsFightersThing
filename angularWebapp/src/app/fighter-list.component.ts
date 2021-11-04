import { Component, OnInit } from '@angular/core';

import { Fighter } from './fighter';
import { FighterService } from './fighter.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector:    'app-fighter-list',
  templateUrl: './fighter-list.component.html',
  providers:  [ FighterService ]
})
export class FighterListComponent implements OnInit {
  fighters: Fighter[] = [];
  selectedFighter: Fighter | undefined;

  constructor(private service: FighterService,
              private http: HttpClient) { }

  ngOnInit() {
    this.fighters = this.service.getFighters();
  }

  selectFighter(fighter: Fighter) { this.selectedFighter = fighter; }

  testRestApi() {
    this.http.get('http://127.0.0.1:3000', {responseType: 'text'})
      .subscribe((data: string) => {
        console.log('first: ', data);
      });
    this.http.get('http://127.0.0.1:3000/users', {responseType: 'text'})
      .subscribe((data: string) => {
        console.log('second: ', data);
      });
  }
}
