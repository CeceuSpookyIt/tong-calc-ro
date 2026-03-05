import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { OvalRoutingModule } from './oval-routing.module';
import { OvalComponent } from './oval.component';

@NgModule({
  declarations: [OvalComponent],
  imports: [CommonModule, TableModule, OvalRoutingModule],
})
export class OvalModule {}
