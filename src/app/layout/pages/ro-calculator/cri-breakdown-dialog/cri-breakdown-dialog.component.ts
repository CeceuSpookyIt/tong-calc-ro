import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CriBreakdown } from '../cri-breakdown.model';

@Component({
  selector: 'app-cri-breakdown-dialog',
  templateUrl: './cri-breakdown-dialog.component.html',
  styles: [
    `
      .cri-section-header {
        font-weight: 600;
        border-bottom: 1px solid #444;
        padding-bottom: 4px;
        margin-bottom: 6px;
        margin-top: 12px;
      }
      .cri-row {
        display: flex;
        justify-content: space-between;
        padding: 2px 0;
        font-size: 0.875rem;
      }
      .cri-row-source {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cri-row-slot {
        flex: 0 0 140px;
        text-align: center;
        color: #aaa;
        font-size: 0.8rem;
      }
      .cri-row-value {
        flex: 0 0 50px;
        text-align: right;
        font-weight: 600;
        color: #4ade80;
      }
      .cri-total-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0 4px;
        border-top: 2px solid #666;
        margin-top: 8px;
        font-weight: 700;
        font-size: 0.95rem;
      }
      .cri-formula {
        color: #aaa;
        font-size: 0.8rem;
        font-style: italic;
      }
      .cri-luk-total {
        font-weight: 600;
        padding-top: 4px;
        border-top: 1px solid #333;
        margin-top: 4px;
      }
    `,
  ],
})
export class CriBreakdownDialogComponent {
  data: CriBreakdown;

  constructor(private config: DynamicDialogConfig) {
    this.data = this.config.data;
  }

  get contextLabel(): string {
    switch (this.data.context) {
      case 'status':
        return 'Status';
      case 'basic':
        return 'Basic ATQ';
      case 'skill':
        return 'Skill';
    }
  }
}
