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


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    KeskialueComponent,
    ReportComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    FormsModule,
    NiClockModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
