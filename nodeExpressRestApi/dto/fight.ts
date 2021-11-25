import {Fighter} from './fighter';
import {Event} from './event';

export class Fight {
  constructor(
    public id: number,
    public fighter1: Fighter,
    public fighter2: Fighter,
    public weightClass: string,
    public result: string,
    public round: number,
    public time: string,
    public event: Event) {
  }
}
