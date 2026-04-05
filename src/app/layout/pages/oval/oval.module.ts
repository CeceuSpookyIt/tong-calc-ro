import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { TabViewModule } from 'primeng/tabview';
import { OvalRoutingModule } from './oval-routing.module';
import { OvalComponent } from './oval.component';

@NgModule({
  declarations: [OvalComponent],
  imports: [CommonModule, TableModule, ChartModule, TabViewModule, OvalRoutingModule],
})
export class OvalModule {}
