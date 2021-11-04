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

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  declarations: [
    AppComponent,
    FighterDetailComponent,
    FighterListComponent,
    SalesTaxComponent
  ],
  providers: [
    BackendService,
    FighterService,
    Logger
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
