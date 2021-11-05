import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FighterDetailComponent } from './fighter-detail.component';
import { FighterListComponent } from './fighter-list.component';
import { SalesTaxComponent } from './sales-tax.component';
import { FighterService } from './fighter.service';
import { BackendService } from './backend.service';
import { Logger } from './logger.service';
import { HttpClientModule } from '@angular/common/http';
import {FighterCreateComponent} from './fighter-create.component';
import { ReactiveFormsModule } from '@angular/forms';
import {FightersSharedService} from './fighters-shared.service';
import {FightService} from './fight.service';
import {FightListComponent} from './fight-list.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  declarations: [
    AppComponent,
    FighterDetailComponent,
    FighterCreateComponent,
    FighterListComponent,
    FightListComponent,
    SalesTaxComponent
  ],
  providers: [
    BackendService,
    FighterService,
    FightService,
    FightersSharedService,
    Logger
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
