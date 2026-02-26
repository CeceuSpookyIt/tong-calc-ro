import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListboxModule } from 'primeng/listbox';
import { ButtonModule } from 'primeng/button';
import { PresetSummaryRoutingModule } from './preset-summary-routing.module';
import { PresetSummaryComponent } from './preset-summary.component';
import { SlotRankingCardComponent } from './slot-ranking-card/slot-ranking-card.component';

@NgModule({
  declarations: [PresetSummaryComponent, SlotRankingCardComponent],
  imports: [CommonModule, FormsModule, ListboxModule, ButtonModule, PresetSummaryRoutingModule],
})
export class PresetSummaryModule {}
