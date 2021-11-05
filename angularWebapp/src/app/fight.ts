import {Fighter} from './fighter';

export class Fight {
  constructor(
    public id: number,
    public fighter1: Fighter,
    public fighter2: Fighter,
    public date: string) {
  }
}
