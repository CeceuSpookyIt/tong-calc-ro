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

  get skillTime1() {
    return this.totalSummary?.autocast?.onSkillEntries?.length ? this.totalSummary?.autocast?.combinedSkillBattleTime : this.totalSummary?.dmg?.skillBattleTime;
  }
  get skillTime2() {
    return this.totalSummary2?.autocast?.onSkillEntries?.length ? this.totalSummary2?.autocast?.combinedSkillBattleTime : this.totalSummary2?.dmg?.skillBattleTime;
  }
  get basicTime1() {
    return this.totalSummary?.autocast?.onHitEntries?.length ? this.totalSummary?.autocast?.combinedBasicBattleTime : this.totalSummary?.dmg?.basicBattleTime;
  }
  get basicTime2() {
    return this.totalSummary2?.autocast?.onHitEntries?.length ? this.totalSummary2?.autocast?.combinedBasicBattleTime : this.totalSummary2?.dmg?.basicBattleTime;
  }

  getTimeCompareClass(time1: number, time2: number) {
    if (!time1 || !time2 || time1 === time2) return '';
    return time2 < time1 ? 'compare_greater' : 'compare_lower';
  }

  onShowElementalTableClick() {
    this.showElementTableClick.emit(1);
  }
}
