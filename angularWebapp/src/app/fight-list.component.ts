import {Component, OnInit} from '@angular/core';
import {FightersSharedService} from './fighters-shared.service';
import {Subscription} from 'rxjs';
import {BackendService} from './backend.service';
import {Fight} from './fight';

@Component({
  selector: 'app-fight-list',
  templateUrl: './fight-list.component.html'
})
export class FightListComponent implements OnInit {
  fights: Fight[] = [];
  selectedFight: Fight | undefined;
  fightsSubscription: Subscription | undefined;

  constructor(private backendService: BackendService,
              private fightersSharedService: FightersSharedService) {
  }

  ngOnInit() {
    this.fightsSubscription = this.fightersSharedService.currentFights
      .subscribe(fights => this.fights = fights);
    this.fightersSharedService.updateFights();
  }

  selectFight(fight: Fight) {
    if (this.selectedFight === fight) {
      // deselect
      this.selectedFight = undefined;
    } else {
      this.selectedFight = fight;
    }
  }

  // deleteFight(fighter: Fighter) {
  //   this.backendService.deleteFight(fighter)
  //     .then(deleted => {
  //       console.log('Deleted fight: ', deleted);
  //       this.fightersSharedService.updateFights();
  //     });
  // }
}
