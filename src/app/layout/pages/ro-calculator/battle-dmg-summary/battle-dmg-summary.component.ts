import { Component, EventEmitter, Input, Output } from '@angular/core';
import { formatBattleTime } from '../../../../utils/format-battle-time';

@Component({
  selector: 'app-battle-dmg-summary',
  templateUrl: './battle-dmg-summary.component.html',
  styleUrls: ['./battle-dmg-summary.component.css', '../ro-calculator.component.css'],
})
export class BattleDmgSummaryComponent {
  @Input({ required: true }) model = {} as any;
  @Input({ required: true }) totalSummary = {} as any;
  @Input({ required: true }) totalSummary2 = {} as any;
  @Input({ required: true }) isCalculating: boolean;
  @Input({ required: true }) isEnableCompare: boolean;
  @Input({ required: true }) isInProcessingPreset: boolean;
  @Input({ required: true }) selectedChances: any[];
  @Input({ required: true }) hideBasicAtk: boolean;
  @Input({ required: true }) showLeftWeapon: boolean;

  @Output() showElementTableClick = new EventEmitter<any>();
  @Output() statBreakdownClick = new EventEmitter<string>();

  formatTime = formatBattleTime;

  constructor() {}

  onShowElementalTableClick() {
    this.showElementTableClick.emit(1);
  }
}
