import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Fighter} from './fighter';
import {FighterService} from './fighter.service';
import {Fight} from './fight';
import {FightService} from './fight.service';

@Injectable()
export class FightersSharedService {

  private fightersSource = new BehaviorSubject([] as Fighter[]);
  private fightsSource = new BehaviorSubject([] as Fight[]);
  currentFighters = this.fightersSource.asObservable();
  currentFights = this.fightsSource.asObservable();

  constructor(private fighterService: FighterService, private fightService: FightService) { }

  updateFighters() {
    const fighters = this.fighterService.getFighters();
    this.fightersSource.next(fighters);
  }

  updateFights() {
    const fights = this.fightService.getFights();
    this.fightsSource.next(fights);
  }
}
