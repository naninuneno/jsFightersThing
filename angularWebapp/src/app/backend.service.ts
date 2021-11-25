import {Injectable, Type} from '@angular/core';

import {Logger} from './logger.service';
import {Fighter} from './dto/fighter';
import {HttpClient} from '@angular/common/http';
import {Fight} from './dto/fight';

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
    if (type === Fight) {
      return this.http.get('http://127.0.0.1:3000/fights', {responseType: 'json'})
        .toPromise()
        .then((fights: any) => {
          return fights.map((fight: any) => new Fight(fight.id, fight.fighter1, fight.fighter2,
            fight.weightClass, fight.result, fight.round, fight.time, fight.event));
        });
    }
    const err = new Error('Cannot get object of this type');
    this.logger.error(err);
    throw err;
  }

  getRecentFights(fighter: Fighter): PromiseLike<Fight[]> {
    return this.http.get('http://127.0.0.1:3000/fighters/' + fighter.id + '/recentFights', {responseType: 'json'})
      .toPromise()
      .then((fights: any) => {
        console.log('fs:', fights);
        return fights.map((fight: any) => new Fight(fight.id, fight.fighter1, fight.fighter2,
          fight.weightClass, fight.result, fight.round, fight.time, fight.event));
      });
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

  createFight(fight: Fight): PromiseLike<Fight> {
    return this.http.post('http://127.0.0.1:3000/fights/create',
      {fight}, {responseType: 'json'})
      .toPromise()
      .then((newFight: any) => newFight);
  }

  deleteFight(fight: Fight): PromiseLike<Fight> {
    return this.http.post('http://127.0.0.1:3000/fights/' + fight.id + '/delete',
      {id : fight.id}, {responseType: 'json'})
      .toPromise()
      .then((deletedFight: any) => deletedFight);
  }
}
