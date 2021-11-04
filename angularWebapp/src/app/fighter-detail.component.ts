import { Component, Input } from '@angular/core';

import { Fighter } from './fighter';

@Component({
  selector: 'app-fighter-detail',
  templateUrl: './fighter-detail.component.html'
})
export class FighterDetailComponent {
  @Input() fighter!: Fighter;
}
