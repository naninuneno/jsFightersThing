import {Injectable} from '@angular/core';

import {Fighter} from './fighter';
import {BackendService} from './backend.service';
import {Logger} from './logger.service';
import {Fight} from './fight';

@Injectable()
export class FightService {
  private fights: Fight[] = [];

  constructor(
    private backend: BackendService,
    private logger: Logger) {
  }

  getFights() {
    this.fights = [];
    this.backend.getAll(Fight).then((fights: Fight[]) => {
      this.logger.log(`Fetched ${fights.length} fights.`);
      this.fights.push(...fights);
    });
    return this.fights;
  }
}
