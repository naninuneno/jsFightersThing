import {Component, OnInit} from '@angular/core';

import {Fighter} from '../dto/fighter';
import {FightersSharedService} from '../fighters-shared.service';
import {Subscription} from 'rxjs';
import {BackendService} from '../backend.service';
import {Fight} from '../dto/fight';
import {FighterService} from './fighter.service';
import {FightService} from '../fights/fight.service';

@Component({
  selector: 'app-fighter-list',
  templateUrl: './fighter-list.component.html'
})
export class FighterListComponent implements OnInit {
  fighters: Fighter[] = [];
  selectedFighter: Fighter | undefined;
  selectedFighterRecentFights: Fight[] | undefined;
  fightersSubscription: Subscription | undefined;

  constructor(private backendService: BackendService,
              private fightersSharedService: FightersSharedService,
              private fightService: FightService) {
  }

  ngOnInit() {
    this.fightersSubscription = this.fightersSharedService.currentFighters
      .subscribe(fighters => this.fighters = fighters);
    this.fightersSharedService.updateFighters();
  }

  selectFighter(fighter: Fighter) {
    if (this.selectedFighter === fighter) {
      // deselect
      this.selectedFighter = undefined;
      this.selectedFighterRecentFights = undefined;
    } else {
      this.selectedFighter = fighter;
      this.fightService.getRecentFights(fighter)
        .then(fights => this.selectedFighterRecentFights = fights);
    }
  }

  deleteFighter(fighter: Fighter) {
    this.backendService.deleteFighter(fighter)
      .then(deleted => {
        console.log('Deleted fighter: ', deleted);
        this.fightersSharedService.updateFighters();
      });
  }
}
