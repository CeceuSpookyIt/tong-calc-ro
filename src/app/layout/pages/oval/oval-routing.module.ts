import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OvalComponent } from './oval.component';

@NgModule({
  imports: [RouterModule.forChild([{ path: '', component: OvalComponent }])],
  exports: [RouterModule],
})
export class OvalRoutingModule {}
