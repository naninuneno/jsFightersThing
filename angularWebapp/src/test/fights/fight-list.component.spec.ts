import {FightListComponent} from '../../app/fights/fight-list.component';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import {BackendService} from '../../app/backend.service';
import {FightersSharedService} from '../../app/fighters-shared.service';
import {TestBed} from '@angular/core/testing';
import {Fight} from '../../app/dto/fight';
import {Fighter} from '../../app/dto/fighter';
import {Event} from '../../app/dto/event';

// let backendServiceSpy: SpyObj<BackendService>;
// let fightersSharedService: SpyObj<FightersSharedService>;
const backendServiceSpy: BackendService = {} as any;
const fightersSharedService: FightersSharedService = {} as any;
let component: FightListComponent;

describe('FightListComponent', () => {
  beforeEach(() => {
    // backendServiceSpy = createSpyObj('BackendService', {});
    // backendServiceSpy.load.and.returnValue(of(mock1))
    // fightersSharedService = createSpyObj('FightersSharedService', {});
    // fightersSharedService.getUsers.and.returnValue(of(mock2));

    TestBed.configureTestingModule({
      providers: [
        FightListComponent,
        {provide: BackendService, useValue: backendServiceSpy},
        {provide: FightersSharedService, useValue: fightersSharedService},
      ],
    });

    component = TestBed.inject(FightListComponent);
  });

  it('should select a fight', () => {
    const fightToSelect = createTestFight();

    expect(component.selectedFight).toBe(undefined);

    component.selectFight(fightToSelect);

    expect(component.selectedFight).toBe(fightToSelect);
  });

  it('should deselect fight if same fight is selected', () => {
    const fightToSelect = createTestFight();

    expect(component.selectedFight).toBe(undefined);
    component.selectFight(fightToSelect);
    expect(component.selectedFight).toBe(fightToSelect);

    component.selectFight(fightToSelect);

    expect(component.selectedFight).toBe(undefined);
  });

  function createTestFight() {
    const fighter = new Fighter(1, 'Name');
    const event = new Event(1, '', '');
    return new Fight(1, fighter, fighter, '', '', 1, '', event);
  }
});
