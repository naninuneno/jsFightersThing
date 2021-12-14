import {Component, OnInit} from '@angular/core';

import {Fighter} from '../dto/fighter';
import {BackendService} from '../backend.service';
import {Event} from '../dto/event';
import {EventService} from './event.service';
import {Fight} from '../dto/fight';
import {FightService} from '../fights/fight.service';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html'
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  selectedEvent: Fighter | undefined;
  selectedEventFights: FightWithPrediction[] | undefined;

  constructor(private backendService: BackendService,
              private eventService: EventService,
              private fightService: FightService) {
  }

  ngOnInit() {
    this.eventService.getEvents().then(events => this.events = events);
  }

  selectEvent(event: Event) {
    if (this.selectedEvent === event) {
      // deselect
      this.selectedEvent = undefined;
      this.selectedEventFights = undefined;
    } else {
      this.selectedEvent = event;
      this.eventService.getEventFights(event)
        .then(fights => {
          console.log('Event fights: ', fights);
          this.selectedEventFights = [];
          for (const fight of fights) {
            this.calculateFighterResultWeights(fight, event.date);
          }
        });
    }
  }

  private calculateFighterResultWeights(fight: Fight, eventDate: string) {
    const fighter1 = fight.fighter1;
    const fighter2 = fight.fighter2;
    const fighter1WinBreakdownPromise =
      this.fightService.getResultBreakdown(fighter1, true, {endDate: eventDate});
    const fighter1LossBreakdownPromise =
      this.fightService.getResultBreakdown(fighter1, false, {endDate: eventDate});
    const fighter2WinBreakdownPromise =
      this.fightService.getResultBreakdown(fighter2, true, {endDate: eventDate});
    const fighter2LossBreakdownPromise =
      this.fightService.getResultBreakdown(fighter2, false, {endDate: eventDate});
    Promise.all([
      fighter1WinBreakdownPromise, fighter1LossBreakdownPromise,
      fighter2WinBreakdownPromise, fighter2LossBreakdownPromise])
      .then(results => {
        const fighter1WinResults = results[0];
        const fighter1LossResults = results[1];
        const fighter2WinResults = results[2];
        const fighter2LossResults = results[3];

        const fightWithPrediction = new FightWithPrediction(fight,
          this.weightComparison(fighter1WinResults.getKoWeighting(), fighter2LossResults.getKoWeighting()),
          this.weightComparison(fighter1WinResults.getSubWeighting(), fighter2LossResults.getSubWeighting()),
          this.weightComparison(fighter1WinResults.getDecWeighting(), fighter2LossResults.getDecWeighting()),
          this.weightComparison(fighter2WinResults.getKoWeighting(), fighter1LossResults.getKoWeighting()),
          this.weightComparison(fighter2WinResults.getSubWeighting(), fighter1LossResults.getSubWeighting()),
          this.weightComparison(fighter2WinResults.getDecWeighting(), fighter1LossResults.getDecWeighting()));
        this.selectedEventFights?.push(fightWithPrediction);

        // const fighter1SummedComparisonWeight =
        //   this.weightComparison(fighter1WinResults.getKoWeighting(), fighter2LossResults.getKoWeighting()) +
        //   this.weightComparison(fighter1WinResults.getSubWeighting(), fighter2LossResults.getSubWeighting()) +
        //   this.weightComparison(fighter1WinResults.getDecWeighting(), fighter2LossResults.getDecWeighting());
        // const fighter2SummedComparisonWeight =
        //   this.weightComparison(fighter2WinResults.getKoWeighting(), fighter1LossResults.getKoWeighting()) +
        //   this.weightComparison(fighter2WinResults.getSubWeighting(), fighter1LossResults.getSubWeighting()) +
        //   this.weightComparison(fighter2WinResults.getDecWeighting(), fighter1LossResults.getDecWeighting());
        // let fightPredictionBasedOnSummedWeights = 'Prediction based on summed weights: ';
        // if (fighter1SummedComparisonWeight > fighter2SummedComparisonWeight) {
        //   const comparisonPercentDiff = (1 - (fighter2SummedComparisonWeight / fighter1SummedComparisonWeight)) * 100;
        //   fightPredictionBasedOnSummedWeights += 'Fighter 1 win, % certainty: ' + comparisonPercentDiff;
        // } else if (fighter1SummedComparisonWeight < fighter2SummedComparisonWeight) {
        //   const comparisonPercentDiff = (1 - (fighter1SummedComparisonWeight / fighter2SummedComparisonWeight)) * 100;
        //   fightPredictionBasedOnSummedWeights += 'Fighter 2 win, % certainty: ' + comparisonPercentDiff;
        // } else {
        //   fightPredictionBasedOnSummedWeights += 'Equal weighting! No certainty over decision';
        // }
        //
        // let comparisonLog = 'Fighter 1: ' + fighter1.name + ' Fighter 2: ' + fighter2.name;
        // comparisonLog += '\n Fighter 1 summed weight: ' + fighter1SummedComparisonWeight;
        // comparisonLog += '\n Fighter 2 summed weight: ' + fighter2SummedComparisonWeight;
        // comparisonLog += '\n ' + fightPredictionBasedOnSummedWeights;

        // comparisonLog += '\n F1 KO result: ' +
        //   this.weightComparison(fighter1WinResults.getKoWeighting(), fighter2LossResults.getKoWeighting());
        // comparisonLog += '\n F1 Sub result: ' +
        //   this.weightComparison(fighter1WinResults.getSubWeighting(), fighter2LossResults.getSubWeighting());
        // comparisonLog += '\n F1 Dec result: ' +
        //   this.weightComparison(fighter1WinResults.getDecWeighting(), fighter2LossResults.getDecWeighting());
        // comparisonLog += '\n F2 KO result: ' +
        //   this.weightComparison(fighter2WinResults.getKoWeighting(), fighter1LossResults.getKoWeighting());
        // comparisonLog += '\n F2 Sub result: ' +
        //   this.weightComparison(fighter2WinResults.getSubWeighting(), fighter1LossResults.getSubWeighting());
        // comparisonLog += '\n F2 Dec result: ' +
        //   this.weightComparison(fighter2WinResults.getDecWeighting(), fighter1LossResults.getDecWeighting());
        // console.log(comparisonLog);
      });
    // Promise.all([winBreakdownPromise, lossBreakdownPromise])
    //   .then(results => {
    //     let weightLog = 'Fighter: ' + fighter.name;
    //     weightLog += ' - Win KO weight: ' + results[0].getKoWeighting();
    //     weightLog += ' - Win Sub weight: ' + results[0].getSubWeighting();
    //     weightLog += ' - Win Dec weight: ' + results[0].getDecWeighting();
    //     weightLog += ' - Loss KO weight: ' + results[1].getKoWeighting();
    //     weightLog += ' - Loss Sub weight: ' + results[1].getSubWeighting();
    //     weightLog += ' - Loss Dec weight: ' + results[1].getDecWeighting();
    //     console.log(weightLog);
    //   });
  }

  private weightComparison(winWeighting: number, lossWeighting: number) {
    return lossWeighting > 0 ? (winWeighting / lossWeighting) : winWeighting / 10;
  }

  private weightComparisonAsStr(winWeighting: number, lossWeighting: number) {
    const comparisonWeighting = this.weightComparison(winWeighting, lossWeighting);
    return `win weight: ${winWeighting} - vs other loss weight: ${lossWeighting} - comparison weight: ${comparisonWeighting}`;
  }
}

class FightWithPrediction {
  public fighter1SummedWeight: number;
  public fighter2SummedWeight: number;
  public predictionCorrect: boolean;

  constructor(public fight: Fight,
              public fighter1KoWeight: number,
              public fighter1SubWeight: number,
              public fighter1DecWeight: number,
              public fighter2KoWeight: number,
              public fighter2SubWeight: number,
              public fighter2DecWeight: number) {
    this.fighter1SummedWeight = this.fighter1KoWeight + this.fighter1SubWeight + this.fighter1DecWeight;
    this.fighter2SummedWeight = this.fighter2KoWeight + this.fighter2SubWeight + this.fighter2DecWeight;
    this.predictionCorrect = this.fighter1SummedWeight > this.fighter2SummedWeight;
  }
}
