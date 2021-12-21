import {BackendService} from '../../app/backend.service';
import {FightersSharedService} from '../../app/fighters-shared.service';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Fighter} from '../../app/dto/fighter';
import {Event} from '../../app/dto/event';
import {FighterListComponent} from '../../app/fighters/fighter-list.component';
import {FighterService} from '../../app/fighters/fighter.service';
import {FightService} from '../../app/fights/fight.service';
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import {ResultBreakdown} from '../../app/dto/result-breakdown';
import any = jasmine.any;
import {Fight} from '../../app/dto/fight';

const backendServiceSpy: BackendService = {} as any;
let fightersSharedService: SpyObj<FightersSharedService>;
let fighterService: SpyObj<FighterService>;
let fightService: SpyObj<FightService>;
let component: FighterListComponent;
const fighter = new Fighter(1, '');
const event = new Event(1, '', '');
const mockRecentFights = [new Fight(1, fighter, fighter, '', '', 1, '', event)];
const mockWinResultBreakdown = new ResultBreakdown(0, 0, 0, 0, 0, 0);
const mockLossResultBreakdown = new ResultBreakdown(1, 0, 0, 0, 0, 0);

describe('FighterListComponent', () => {
  beforeEach(() => {
    fightService = createSpyObj('FightService',
      ['getRecentFights', 'getResultBreakdown']);
    fighterService = createSpyObj('FighterService',
      ['getFightersCount']);
    fightersSharedService = createSpyObj('FightersSharedService', ['updateFighters']);

    fightService.getRecentFights
      .and.returnValue(Promise.resolve(mockRecentFights));
    fightService.getResultBreakdown
      .withArgs(any(Fighter), true)
      .and.returnValue(Promise.resolve(mockWinResultBreakdown));
    fightService.getResultBreakdown
      .withArgs(any(Fighter), false)
      .and.returnValue(Promise.resolve(mockLossResultBreakdown));

    TestBed.configureTestingModule({
      providers: [
        FighterListComponent,
        {provide: BackendService, useValue: backendServiceSpy},
        {provide: FightersSharedService, useValue: fightersSharedService},
        {provide: FighterService, useValue: fighterService},
        {provide: FightService, useValue: fightService}
      ],
    });

    component = TestBed.inject(FighterListComponent);
  });

  it('should select a fight', fakeAsync(() => {
    const fighterToSelect = createTestFighter();

    expect(component.selectedFighter).toBe(undefined);
    expect(component.selectedFighterRecentFights).toBe(undefined);
    expect(component.selectedFighterWinInfo).toBe(undefined);
    expect(component.selectedFighterLossInfo).toBe(undefined);

    component.selectFighter(fighterToSelect);
    // guarantees promises are resolved
    tick();

    expect(component.selectedFighter).toBe(fighterToSelect);
    expect(component.selectedFighterRecentFights).toBe(mockRecentFights);
    expect(component.selectedFighterWinInfo).toBe(mockWinResultBreakdown);
    expect(component.selectedFighterLossInfo).toBe(mockLossResultBreakdown);
  }));

  it('updates page', fakeAsync(() => {
    fighterService.getFightersCount
      .and.returnValue(Promise.resolve(205));
    const pageSize = 10;
    component.pageSize = pageSize;

    expect(component.collectionSize).toBe(0);

    component.updatePage(5);
    tick();

    expect(component.collectionSize).toBe(205);
    const expectedLowerBound = 40;
    const expectedFilterValue = '';
    expect(fightersSharedService.updateFighters)
      .toHaveBeenCalledWith(expectedLowerBound, pageSize, expectedFilterValue);
  }));

  it('changes filter', fakeAsync(() => {
    fighterService.getFightersCount
      .and.returnValue(Promise.resolve(205));
    const pageSize = 10;
    const filterValue = 'filter value';
    component.pageSize = pageSize;

    expect(component.collectionSize).toBe(0);

    component.filterChanged(filterValue);
    tick();

    expect(component.collectionSize).toBe(205);
    expect(component.filterValue).toBe(filterValue);
    const expectedLowerBound = 0;
    expect(fightersSharedService.updateFighters)
      .toHaveBeenCalledWith(expectedLowerBound, pageSize, filterValue);
  }));

  function createTestFighter() {
    return new Fighter(1, 'Name');
  }
});
