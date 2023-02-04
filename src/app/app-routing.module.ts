import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeaturesComponent } from './features/features.component';
import { ReportComponent } from './report/report.component';
import { PricelistComponent } from './pricelist/pricelist.component';

const routes: Routes = [
  // navbar
  {path: 'report', component: ReportComponent},
  // footer
  {path: 'features', component: FeaturesComponent},
  {path: 'pricelist', component: PricelistComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
