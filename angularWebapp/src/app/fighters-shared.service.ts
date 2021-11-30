import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Fighter} from './dto/fighter';
import {FighterService} from './fighters/fighter.service';
import {Fight} from './dto/fight';
import {FightService} from './fights/fight.service';

@Injectable()
export class FightersSharedService {

  private fightersSource = new BehaviorSubject([] as Fighter[]);
  private fightsSource = new BehaviorSubject([] as Fight[]);
  currentFighters = this.fightersSource.asObservable();
  currentFights = this.fightsSource.asObservable();

  constructor(private fighterService: FighterService, private fightService: FightService) {
  }

  updateFighters(startIndex: number, count: number, filterValue: string) {
    this.fighterService.getFighters(startIndex, count, filterValue).then((fighters: Fighter[]) => {
      console.log(`Fetched ${fighters.length} fighters.`);
      this.fightersSource.next(fighters);
    });
  }

  updateFights() {
    const fights = this.fightService.getFights();
    this.fightsSource.next(fights);
  }
}
