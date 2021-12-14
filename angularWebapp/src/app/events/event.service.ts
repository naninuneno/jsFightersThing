import {Injectable} from '@angular/core';

import {Event} from '../dto/event';
import {BackendService} from '../backend.service';
import {Fight} from '../dto/fight';

@Injectable()
export class EventService {

  constructor(
    private backend: BackendService) { }

  getEvents(): PromiseLike<Event[]> {
    return this.backend.getEvents();
  }

  getEventFights(event: Event): PromiseLike<Fight[]> {
    return this.backend.getEventFights(event);
  }
}
