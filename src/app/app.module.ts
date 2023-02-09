import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { KeskialueComponent } from './keskialue/keskialue.component';
import { ReportComponent } from './report/report.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NiClockModule } from 'ni-clock';
import { FeaturesComponent } from './features/features.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PricelistComponent } from './pricelist/pricelist.component'



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    KeskialueComponent,
    ReportComponent,
    FeaturesComponent,
    PricelistComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    FormsModule,
    NiClockModule,
    FontAwesomeModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
