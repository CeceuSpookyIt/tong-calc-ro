import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DamageBreakdown } from '../damage-breakdown.model';

@Component({
  selector: 'app-damage-breakdown-dialog',
  templateUrl: './damage-breakdown-dialog.component.html',
  styles: [
    `
      .dmg-step {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        font-size: 0.875rem;
      }
      .dmg-step-label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .dmg-step-operation {
        flex: 0 0 80px;
        text-align: right;
        color: #aaa;
        font-size: 0.8rem;
      }
      .dmg-step-result {
        flex: 0 0 100px;
        text-align: right;
        font-weight: 600;
      }
      .dmg-total-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0 4px;
        border-top: 2px solid #666;
        margin-top: 8px;
        font-weight: 700;
        font-size: 0.95rem;
      }
      .dmg-dps-row {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        font-weight: 600;
        font-size: 0.9rem;
      }
      .color-green { color: #4ade80; }
      .color-red { color: #f87171; }
      .color-yellow { color: #facc15; }
      .color-white { color: #fff; }
      .color-muted { color: #aaa; }
    `,
  ],
})
export class DamageBreakdownDialogComponent {
  data: DamageBreakdown;

  constructor(private config: DynamicDialogConfig) {
    this.data = this.config.data;
  }

  formatNumber(value: number): string {
    return value?.toLocaleString('en-US') ?? '0';
  }

  getColorClass(color?: string): string {
    return `color-${color || 'green'}`;
  }
}
