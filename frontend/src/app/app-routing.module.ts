import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeaturesComponent } from './features/features.component';
import { ReportComponent } from './report/report.component';
import { PricelistComponent } from './pricelist/pricelist.component';
import { KeskialueComponent } from './keskialue/keskialue.component';
import { UserInterfaceComponent } from './user-interface/user-interface.component';
import { TargetsComponent } from './targets/targets.component';
import { MainpageComponent } from './mainpage/mainpage.component';

const routes: Routes = [
  // navbar
  {path: 'mainpage', component : MainpageComponent},
  {path: '', component : MainpageComponent},
  {path: 'report', component: ReportComponent},
  // footer jne..
  {path: 'features', component: FeaturesComponent},
  {path: 'pricelist', component: PricelistComponent},
  {path: 'admin-interface', component: KeskialueComponent},
  {path: 'user-interface', component: UserInterfaceComponent},
  {path: 'targets', component: TargetsComponent}


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
