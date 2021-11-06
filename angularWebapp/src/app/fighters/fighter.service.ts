import { Injectable } from '@angular/core';

import { Fighter } from '../dto/fighter';
import { BackendService } from '../backend.service';
import { Logger } from '../logger.service';

@Injectable()
export class FighterService {
  private fighters: Fighter[] = [];

  constructor(
    private backend: BackendService,
    private logger: Logger) { }

  getFighters() {
    this.fighters = [];
    this.backend.getAll(Fighter).then( (fighters: Fighter[]) => {
      this.logger.log(`Fetched ${fighters.length} fighters.`);
      this.fighters.push(...fighters); // fill cache
    });
    return this.fighters;
  }
}
