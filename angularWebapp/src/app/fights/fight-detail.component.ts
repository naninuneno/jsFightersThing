import {Component, Input} from '@angular/core';
import {Fight} from '../dto/fight';

@Component({
  selector: 'app-fight-detail',
  templateUrl: './fight-detail.component.html'
})
export class FightDetailComponent {
  @Input() fight!: Fight;

  constructor() {
  }
}
