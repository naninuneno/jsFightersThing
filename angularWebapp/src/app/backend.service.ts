import { Injectable, Type } from '@angular/core';

import { Logger } from './logger.service';
import { Fighter } from './fighter';

const FIGHTERS = [
        new Fighter('Jose Aldo', 'Weather mastery'),
        new Fighter('Conor McGregor', 'Killing them with kindness'),
        new Fighter('Dustin Poirier', 'Manipulates metallic objects')
      ];

@Injectable()
export class BackendService {
  constructor(private logger: Logger) {}

  getAll(type: Type<any>): PromiseLike<any[]> {
    if (type === Fighter) {
      // TODO: get from the database
      return Promise.resolve<Fighter[]>(FIGHTERS);
    }
    const err = new Error('Cannot get object of this type');
    this.logger.error(err);
    throw err;
  }
}
