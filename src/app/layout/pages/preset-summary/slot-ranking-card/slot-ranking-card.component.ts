import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SlotRankingGroup, SlotRankingEntry } from '../model';

@Component({
  selector: 'app-slot-ranking-card',
  templateUrl: './slot-ranking-card.component.html',
})
export class SlotRankingCardComponent {
  @Input() group: SlotRankingGroup;
  @Output() itemClick = new EventEmitter<number>();

  getPercentage(entry: SlotRankingEntry): number {
    if (!this.group.totalBuilds) return 0;
    return Math.ceil((entry.use_count * 100) / this.group.totalBuilds);
  }

  getBarColor(index: number): string {
    const colors = ['orange-500', 'blue-500', 'green-500', 'purple-500', 'pink-500'];
    return colors[index] || 'gray-500';
  }

  onItemClick(itemId: number): void {
    this.itemClick.emit(itemId);
  }
}
