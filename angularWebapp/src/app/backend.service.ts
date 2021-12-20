import {Injectable, Type} from '@angular/core';

import {Logger} from './logger.service';
import {Fighter} from './dto/fighter';
import {HttpClient} from '@angular/common/http';
import {Fight} from './dto/fight';
import {ResultBreakdown} from './dto/result-breakdown';
import {Event} from './dto/event';

@Injectable()
export class BackendService {
  constructor(private logger: Logger,
              private http: HttpClient) {
  }

  // TODO remove this in favour of specific object type methods
  getFights(): PromiseLike<Fight[]> {
    return this.http.get('http://127.0.0.1:3000/fights', {responseType: 'json'})
      .toPromise()
      .then((fights: any) => {
        return fights.map((fight: any) => new Fight(fight.id, fight.fighter1, fight.fighter2,
          fight.weightClass, fight.result, fight.round, fight.time, fight.event));
      });
  }

  getFighters(startIndex: number, count: number, filterValue: string): PromiseLike<Fighter[]> {
    const endpoint = `http://127.0.0.1:3000/fighters?start=${startIndex}&count=${count}&filter=${filterValue}`;
    console.log(endpoint);
    return this.http.get(endpoint, {responseType: 'json'})
      .toPromise()
      .then((fighters: any) => fighters.map((fighter: any) => new Fighter(fighter.id, fighter.name)));
  }

  getFightersCount(filterValue: string): PromiseLike<number> {
    const endpoint = `http://127.0.0.1:3000/fighters/count?filter=${filterValue}`;
    return this.http.get(endpoint, {responseType: 'json'})
      .toPromise()
      .then((count: any) => count);
  }

  getRecentFights(fighter: Fighter, count: number): PromiseLike<Fight[]> {
    const endpoint = `http://127.0.0.1:3000/fighters/${fighter.id}/recentFights?count=${count}`;
    return this.http.get(endpoint, {responseType: 'json'})
      .toPromise()
      .then((fights: any) => {
        return fights.map((fight: any) => new Fight(fight.id, fight.fighter1, fight.fighter2,
          fight.weightClass, fight.result, fight.round, fight.time, fight.event));
      });
  }

  getResultBreakdown(fighter: Fighter, isWins: boolean, endDate: string): PromiseLike<ResultBreakdown> {
    const endpoint = `http://127.0.0.1:3000/fighters/${fighter.id}/results?isWins=${isWins}&endDate=${endDate}`;
    return this.http.get(endpoint, {responseType: 'json'})
      .toPromise()
      .then((res: any) => {
        return new ResultBreakdown(
          res.koCount, res.subCount, res.decCount, res.koPercentage, res.subPercentage, res.decPercentage);
      });
  }

  getEvents(): PromiseLike<Event[]> {
    const endpoint = 'http://127.0.0.1:3000/events';
    return this.http.get(endpoint, {responseType: 'json'})
      .toPromise()
      .then((events: any) => events.map((event: any) => new Event(event.id, event.date, event.name)));
  }

  getEventFights(event: Event): PromiseLike<Fight[]> {
    const endpoint = `http://127.0.0.1:3000/events/${event.id}/fights`;
    return this.http.get(endpoint, {responseType: 'json'})
      .toPromise()
      .then((fights: any) =>
        fights.map((fight: any) => new Fight(fight.id, fight.fighter1, fight.fighter2,
          fight.weightClass, fight.result, fight.round, fight.time, fight.event)));
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
