import {Injectable} from '@angular/core';

import {Fighter} from '../dto/fighter';
import {BackendService} from '../backend.service';

@Injectable()
export class FighterService {

  constructor(
    private backend: BackendService) { }

  getFighters(startIndex: number, count: number, filterValue: string): PromiseLike<Fighter[]> {
    return this.backend.getFighters(startIndex, count, filterValue);
  }

  getFightersCount(filterValue: string): PromiseLike<number> {
    return this.backend.getFightersCount(filterValue);
  }
}
