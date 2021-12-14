import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {NgSelectModule} from '@ng-select/ng-select';
import {AppComponent} from './app.component';
import {FighterDetailComponent} from './fighters/fighter-detail.component';
import {FighterListComponent} from './fighters/fighter-list.component';
import {FighterService} from './fighters/fighter.service';
import {BackendService} from './backend.service';
import {Logger} from './logger.service';
import {HttpClientModule} from '@angular/common/http';
import {FighterCreateComponent} from './fighters/fighter-create.component';
import {ReactiveFormsModule} from '@angular/forms';
import {FightersSharedService} from './fighters-shared.service';
import {FightService} from './fights/fight.service';
import {FightListComponent} from './fights/fight-list.component';
import {FightDetailComponent} from './fights/fight-detail.component';
import {FightCreateComponent} from './fights/fight-create.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {EventListComponent} from './events/event-list.component';
import {EventService} from './events/event.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgSelectModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    NgbModule
  ],
  declarations: [
    AppComponent,
    FighterDetailComponent,
    FighterCreateComponent,
    FighterListComponent,
    FightListComponent,
    EventListComponent,
    FightDetailComponent,
    FightCreateComponent
  ],
  providers: [
    BackendService,
    FighterService,
    FightService,
    EventService,
    FightersSharedService,
    Logger
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
