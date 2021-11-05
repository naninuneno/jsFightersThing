import {Component} from '@angular/core';

import {BackendService} from './backend.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Fighter} from './fighter';
import {FightersSharedService} from './fighters-shared.service';

@Component({
  selector: 'app-fighter-create',
  templateUrl: './fighter-create.component.html'
})
export class FighterCreateComponent {

  constructor(private backendService: BackendService, private fightersSharedService: FightersSharedService) {
  }

  fighterForm = new FormGroup({
    name: new FormControl('', Validators.required)
  });

  onSubmit() {
    const formValue = this.fighterForm.value;
    console.warn(formValue);
    const fighter = new Fighter(-1, formValue.name);
    this.backendService.createFighter(fighter)
      .then(created => {
        console.log('Created fighter: ', created);
        this.fightersSharedService.updateFighters();
        this.fighterForm.reset();
      });
  }
}
