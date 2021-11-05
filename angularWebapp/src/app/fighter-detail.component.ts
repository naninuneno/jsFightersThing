import {Component, Input} from '@angular/core';

import {Fighter} from './fighter';
import {BackendService} from './backend.service';

@Component({
  selector: 'app-fighter-detail',
  templateUrl: './fighter-detail.component.html'
})
export class FighterDetailComponent {
  @Input() fighter!: Fighter;

  constructor(private backendService: BackendService) {
  }

  onSubmit() {
    this.backendService.updateFighter(this.fighter)
      .then(fighter => {
        console.log('Updated fighter: ', fighter);
      });
  }
}
