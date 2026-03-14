import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StatBreakdown } from '../stat-breakdown.model';

@Component({
  selector: 'app-stat-breakdown-dialog',
  templateUrl: './stat-breakdown-dialog.component.html',
  styles: [
    `
      .bd-section-header {
        font-weight: 600;
        border-bottom: 1px solid #444;
        padding-bottom: 4px;
        margin-bottom: 6px;
        margin-top: 12px;
      }
      .bd-row {
        display: flex;
        justify-content: space-between;
        padding: 2px 0;
        font-size: 0.875rem;
      }
      .bd-row-source {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .bd-row-slot {
        flex: 0 0 140px;
        text-align: center;
        color: #aaa;
        font-size: 0.8rem;
      }
      .bd-row-value {
        flex: 0 0 60px;
        text-align: right;
        font-weight: 600;
      }
      .bd-subtotal-row {
        display: flex;
        justify-content: space-between;
        font-weight: 600;
        padding-top: 4px;
        border-top: 1px solid #333;
        margin-top: 4px;
      }
      .bd-total-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0 4px;
        border-top: 2px solid #666;
        margin-top: 8px;
        font-weight: 700;
        font-size: 0.95rem;
      }
      .bd-formula {
        color: #aaa;
        font-size: 0.8rem;
        font-style: italic;
      }
      .bd-empty {
        color: #aaa;
        font-size: 0.85rem;
        padding: 2px 0;
      }
      .color-green { color: #4ade80; }
      .color-red { color: #f87171; }
      .color-yellow { color: #facc15; }
      .color-white { color: #fff; }
      .color-muted { color: #aaa; }
    `,
  ],
})
export class StatBreakdownDialogComponent {
  data: StatBreakdown;

  constructor(private config: DynamicDialogConfig) {
    this.data = this.config.data;
  }

  formatValue(value: number | string): string {
    if (typeof value === 'string') return value;
    if (value > 0) return `+${value}`;
    return `${value}`;
  }

  getColorClass(color?: string): string {
    return `color-${color || 'green'}`;
  }
}
