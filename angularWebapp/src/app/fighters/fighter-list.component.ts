import {Component, OnInit} from '@angular/core';

import {Fighter} from '../dto/fighter';
import {FightersSharedService} from '../fighters-shared.service';
import {Subscription} from 'rxjs';
import {BackendService} from '../backend.service';
import {Fight} from '../dto/fight';
import {FightService} from '../fights/fight.service';
import {FighterService} from './fighter.service';

@Component({
  selector: 'app-fighter-list',
  templateUrl: './fighter-list.component.html'
})
export class FighterListComponent implements OnInit {
  fighters: Fighter[] = [];
  selectedFighter: Fighter | undefined;
  selectedFighterRecentFights: Fight[] | undefined;
  fightersSubscription: Subscription | undefined;
  page = 1;
  pageSize = 10;
  collectionSize = 0;
  filterValue = '';

  constructor(private backendService: BackendService,
              private fightersSharedService: FightersSharedService,
              private fighterService: FighterService,
              private fightService: FightService) {
  }

  ngOnInit() {
    // TODO find out more about subscribe - logging fighters.length is 0 but logging fighters shows the full array.. v weird
    this.fightersSubscription = this.fightersSharedService.currentFighters
      .subscribe(fighters => this.fighters = fighters);
    this.updateFighters();
  }

  selectFighter(fighter: Fighter) {
    if (this.selectedFighter === fighter) {
      // deselect
      this.selectedFighter = undefined;
      this.selectedFighterRecentFights = undefined;
    } else {
      this.selectedFighter = fighter;
      this.fightService.getRecentFights(fighter, 100)
        .then(fights => this.selectedFighterRecentFights = fights);
    }
  }

  updatePage(page: number) {
    this.page = page;
    this.updateFighters();
  }

  filterChanged(filterValue: string) {
    this.filterValue = filterValue;
    this.updateFighters();
  }

  deleteFighter(fighter: Fighter) {
    // TODO remove?
    console.log('should remove delete functionality now that fetch stuff is in');
    // this.backendService.deleteFighter(fighter)
    //   .then(deleted => {
    //     console.log('Deleted fighter: ', deleted);
    //     this.fightersSharedService.updateFighters();
    //   });
  }

  private updateFighters() {
    this.fighterService.getFightersCount(this.filterValue).then(count => {
      console.log('Fighters count: ', count);
      this.collectionSize = count;
    });

    const fightersToDisplayLowerBound = (this.page - 1) * this.pageSize;
    this.fightersSharedService.updateFighters(fightersToDisplayLowerBound, this.pageSize, this.filterValue);
  }
}
