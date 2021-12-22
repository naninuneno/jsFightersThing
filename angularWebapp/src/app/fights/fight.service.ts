import {Injectable} from '@angular/core';

import {BackendService} from '../backend.service';
import {Logger} from '../logger.service';
import {Fight} from '../dto/fight';
import {Fighter} from '../dto/fighter';
import {ResultBreakdown} from '../dto/result-breakdown';

@Injectable()
export class FightService {
  private fights: Fight[] = [];

  constructor(
    private backend: BackendService,
    private logger: Logger) {
  }

  getFights() {
    this.fights = [];
    this.backend.getFights().then((fights: Fight[]) => {
      this.logger.log(`Fetched ${fights.length} fights.`);
      this.fights.push(...fights);
    });
    return this.fights;
  }

  getRecentFights(fighter: Fighter, count: number): PromiseLike<Fight[]> {
    return this.backend.getRecentFights(fighter, count);
  }

  getResultBreakdown(fighter: Fighter, isWins: boolean, options?: { startDate?: string, endDate?: string }): PromiseLike<ResultBreakdown> {
    let startDate = options?.startDate;
    let endDate = options?.endDate;
    if (!startDate) {
      const longAgo = new Date();
      longAgo.setFullYear(1980, 1, 1);
      startDate = longAgo.toISOString().split('T')[0];
    }
    if (!endDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      endDate = tomorrow.toISOString().split('T')[0];
    }
    return this.backend.getResultBreakdown(fighter, isWins, startDate, endDate);
  }
}
