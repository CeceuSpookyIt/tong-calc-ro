import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { OvalRoutingModule } from './oval-routing.module';
import { OvalComponent } from './oval.component';

@NgModule({
  declarations: [OvalComponent],
  imports: [CommonModule, TableModule, ChartModule, OvalRoutingModule],
})
export class OvalModule {}
