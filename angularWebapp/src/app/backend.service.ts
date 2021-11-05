import {Injectable, Type} from '@angular/core';

import {Logger} from './logger.service';
import {Fighter} from './fighter';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class BackendService {
  constructor(private logger: Logger,
              private http: HttpClient) {
  }

  getAll(type: Type<any>): PromiseLike<any[]> {
    if (type === Fighter) {
      return this.http.get('http://127.0.0.1:3000/fighters', {responseType: 'json'})
        .toPromise()
        .then((fighters: any) => fighters.map((fighter: any) => new Fighter(fighter.id, fighter.name)));
    }
    const err = new Error('Cannot get object of this type');
    this.logger.error(err);
    throw err;
  }

  createFighter(fighter: Fighter): PromiseLike<Fighter> {
    return this.http.post('http://127.0.0.1:3000/fighters/create',
      {fighter}, {responseType: 'json'})
      .toPromise()
      .then((newFighter: any) => newFighter);
  }

  updateFighter(fighter: Fighter): PromiseLike<Fighter> {
    return this.http.post('http://127.0.0.1:3000/fighters/' + fighter.id,
      {fighter}, {responseType: 'json'})
      .toPromise()
      .then((updatedFighter: any) => updatedFighter);
  }

  deleteFighter(fighter: Fighter): PromiseLike<Fighter> {
    return this.http.post('http://127.0.0.1:3000/fighters/' + fighter.id + '/delete',
      {id : fighter.id}, {responseType: 'json'})
      .toPromise()
      .then((deletedFighter: any) => deletedFighter);
  }
}
