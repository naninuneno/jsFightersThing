import {Component} from '@angular/core';

import {BackendService} from '../backend.service';
import {FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {FightersSharedService} from '../fighters-shared.service';
import {Fighter} from '../dto/fighter';
import {Subscription} from 'rxjs';
import {Fight} from '../dto/fight';

@Component({
  selector: 'app-fight-create',
  templateUrl: './fight-create.component.html'
})
export class FightCreateComponent {

  fighters: Fighter[] = [];
  selectedFighter1: number | undefined;
  selectedFighter2: number | undefined;
  fightersSubscription: Subscription | undefined;
  fightForm = new FormGroup({
    date: new FormControl('', Validators.required)
  });
  isFormValid = false;
  formError = '';

  constructor(private backendService: BackendService, private fightersSharedService: FightersSharedService) {
    this.fightersSubscription = this.fightersSharedService.currentFighters
      .subscribe(fighters => this.fighters = fighters);
  }

  onFighterChange() {
    this.setIsFormValid();
  }

  onDateChange() {
    this.setIsFormValid();
  }

  setIsFormValid() {
    this.isFormValid = !!this.selectedFighter1 && !!this.selectedFighter2 && this.fightForm.valid;
  }

  onSubmit() {
    const fighter1 = this.fighters.find((f) => f.id === this.selectedFighter1);
    const fighter2 = this.fighters.find((f) => f.id === this.selectedFighter2);
    const date = this.fightForm.value.date;
    if (fighter1 === fighter2) {
      this.formError = 'Fighters cannot be the same';
      return;
    }
    if (fighter1 === undefined || fighter2 === undefined) {
      throw new TypeError('Couldn\'t find one of the fighters');
    }

    const fight = new Fight(-1, fighter1, fighter2, date);
    this.backendService.createFight(fight)
      .then(created => {
        console.log('Created fight: ', created);
        this.fightersSharedService.updateFights();
        // TODO this doesn't clear down the fighters selected because they're independent from the form
        this.fightForm.reset();
        this.formError = '';
      });
  }
}
