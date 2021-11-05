import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Fighter} from './fighter';
import {FighterService} from './fighter.service';

@Injectable()
export class FightersSharedService {

  private fightersSource = new BehaviorSubject([] as Fighter[]);
  currentFighters = this.fightersSource.asObservable();

  constructor(private fighterService: FighterService) { }

  updateFighters() {
    const fighters = this.fighterService.getFighters();
    this.fightersSource.next(fighters);
  }
}
