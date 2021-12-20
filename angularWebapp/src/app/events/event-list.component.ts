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
  numberOfEventFights: number | undefined;

  private static weightComparison(winWeighting: number, lossWeighting: number) {
    return lossWeighting > 0 ? (winWeighting / lossWeighting) : winWeighting / 10;
  }

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
          this.numberOfEventFights = fights.length;
          const calculateFighterPromises = fights.map(fight => this.calculateFighterResultWeights(fight, event.date));
          Promise.all(calculateFighterPromises)
            .then(fightsWithPrediction => fightsWithPrediction.forEach(f => this.selectedEventFights?.push(f)));
        });
    }
  }

  private calculateFighterResultWeights(fight: Fight, eventDate: string): Promise<FightWithPrediction> {
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
    return new Promise<FightWithPrediction>(resolve => {
      Promise.all([
        fighter1WinBreakdownPromise, fighter1LossBreakdownPromise,
        fighter2WinBreakdownPromise, fighter2LossBreakdownPromise])
        .then(results => {
          const fighter1WinResults = results[0];
          const fighter1LossResults = results[1];
          const fighter2WinResults = results[2];
          const fighter2LossResults = results[3];

          const fightWithPrediction = new FightWithPrediction(fight,
            EventListComponent.weightComparison(fighter1WinResults.getKoWeighting(), fighter2LossResults.getKoWeighting()),
            EventListComponent.weightComparison(fighter1WinResults.getSubWeighting(), fighter2LossResults.getSubWeighting()),
            EventListComponent.weightComparison(fighter1WinResults.getDecWeighting(), fighter2LossResults.getDecWeighting()),
            EventListComponent.weightComparison(fighter2WinResults.getKoWeighting(), fighter1LossResults.getKoWeighting()),
            EventListComponent.weightComparison(fighter2WinResults.getSubWeighting(), fighter1LossResults.getSubWeighting()),
            EventListComponent.weightComparison(fighter2WinResults.getDecWeighting(), fighter1LossResults.getDecWeighting()));

          resolve(fightWithPrediction);
        });
    });
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
