import {Component, OnInit} from '@angular/core';

import {Fighter} from './fighter';
import {FightersSharedService} from './fighters-shared.service';
import {Subscription} from 'rxjs';
import {BackendService} from './backend.service';

@Component({
  selector: 'app-fighter-list',
  templateUrl: './fighter-list.component.html'
})
export class FighterListComponent implements OnInit {
  fighters: Fighter[] = [];
  selectedFighter: Fighter | undefined;
  fightersSubscription: Subscription | undefined;

  constructor(private backendService: BackendService,
              private fightersSharedService: FightersSharedService) {
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
    } else {
      this.selectedFighter = fighter;
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
