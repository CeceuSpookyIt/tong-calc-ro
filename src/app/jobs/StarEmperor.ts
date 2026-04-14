import { InfoForClass } from '../models/info-for-class.model';
import { floor } from '../utils';
import { StarGladiator } from './StarGladiator';
import { ActiveSkillModel, AtkSkillFormulaInput, AtkSkillModel, PassiveSkillModel } from './_character-base.abstract';
import { ClassName } from './_class-name';

const jobBonusTable: Record<number, [number, number, number, number, number, number]> = {
  1: [1, 0, 0, 0, 0, 0],
  2: [1, 0, 0, 0, 1, 0],
  3: [1, 0, 0, 0, 1, 0],
  4: [1, 0, 0, 0, 1, 0],
  5: [1, 1, 0, 0, 1, 0],
  6: [1, 1, 0, 0, 1, 0],
  7: [1, 1, 0, 1, 1, 0],
  8: [2, 1, 0, 1, 1, 0],
  9: [2, 1, 0, 1, 1, 1],
  10: [2, 1, 0, 1, 1, 1],
  11: [2, 1, 0, 1, 2, 1],
  12: [3, 1, 0, 1, 2, 1],
  13: [3, 2, 0, 1, 2, 1],
  14: [3, 2, 0, 1, 2, 1],
  15: [3, 2, 0, 2, 2, 1],
  16: [3, 2, 0, 2, 2, 2],
  17: [3, 2, 1, 2, 2, 2],
  18: [3, 2, 1, 2, 2, 2],
  19: [4, 2, 1, 2, 2, 2],
  20: [4, 2, 1, 2, 3, 2],
  21: [4, 3, 1, 2, 3, 2],
  22: [4, 3, 1, 2, 3, 2],
  23: [5, 3, 1, 2, 3, 2],
  24: [5, 3, 2, 2, 3, 2],
  25: [5, 3, 2, 3, 3, 2],
  26: [5, 3, 2, 3, 3, 2],
  27: [5, 3, 2, 3, 4, 2],
  28: [5, 3, 2, 3, 4, 2],
  29: [5, 4, 2, 3, 4, 2],
  30: [5, 4, 2, 3, 5, 2],
  31: [6, 4, 2, 3, 5, 2],
  32: [6, 4, 2, 3, 5, 2],
  33: [6, 4, 2, 3, 5, 2],
  34: [6, 4, 2, 3, 6, 2],
  35: [6, 5, 2, 3, 6, 2],
  36: [6, 5, 2, 3, 6, 3],
  37: [6, 5, 3, 3, 6, 3],
  38: [6, 5, 3, 3, 7, 3],
  39: [7, 5, 3, 3, 7, 3],
  40: [7, 5, 3, 3, 7, 3],
  41: [7, 6, 3, 3, 7, 3],
  42: [7, 6, 4, 3, 7, 3],
  43: [8, 6, 4, 3, 7, 3],
  44: [8, 6, 4, 3, 7, 3],
  45: [8, 6, 4, 3, 8, 3],
  46: [8, 6, 4, 3, 8, 3],
  47: [8, 7, 4, 3, 8, 3],
  48: [9, 7, 4, 3, 8, 3],
  49: [9, 7, 4, 3, 8, 3],
  50: [9, 7, 4, 3, 9, 3],
  51: [9, 7, 4, 3, 9, 3],
  52: [9, 7, 4, 3, 9, 3],
  53: [9, 7, 4, 3, 9, 3],
  54: [9, 7, 4, 3, 9, 3],
  55: [9, 7, 4, 3, 9, 3],
  56: [10, 7, 4, 3, 9, 3],
  57: [10, 7, 4, 3, 9, 3],
  58: [10, 7, 4, 3, 9, 3],
  59: [10, 8, 4, 3, 9, 3],
  60: [10, 8, 4, 3, 9, 3],
  61: [10, 8, 4, 3, 9, 3],
  62: [10, 8, 4, 3, 9, 3],
  63: [10, 8, 4, 3, 9, 3],
  64: [10, 8, 4, 3, 9, 3],
  65: [11, 9, 5, 3, 9, 3],
  66: [11, 9, 5, 3, 9, 3],
  67: [11, 9, 5, 3, 9, 3],
  68: [11, 9, 5, 3, 9, 3],
  69: [11, 9, 5, 3, 9, 3],
  70: [12, 10, 6, 3, 9, 3],
};

export class StarEmperor extends StarGladiator {
  protected override CLASS_NAME = ClassName.StarEmperor;
  protected override JobBonusTable = jobBonusTable;
  protected override initialStatusPoint = 48;

  private readonly classNames3rd = [ClassName.StarEmperor];
  private readonly atkSkillList3rd: AtkSkillModel[] = [
    {
      label: 'Eclipse Lunar Lv7',
      name: 'SJ_NEWMOONKICK',
      value: 'SJ_NEWMOONKICK==7',
      acd: 0,
      fct: 1,
      vct: 0,
      cd: 1,
      isMelee: true,
      criDmgPercentage: 0.5,
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel } = input;

        return 700 + skillLevel * 100;
      },
    },
    {
      label: 'Chute Lunar Lv10',
      name: 'SJ_FULLMOONKICK',
      value: 'SJ_FULLMOONKICK==10',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 1,
      isMelee: true,
      criDmgPercentage: 0.5,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const bonus = this.isSkillActive('SJ_LIGHTOFMOON') ? 1.25 : 1;

        return (1100 + skillLevel * 100) * (baseLevel / 100) * bonus;
      },
    },
    {
      label: 'Chute Solar Lv7',
      name: 'SJ_PROMINENCEKICK',
      value: 'SJ_PROMINENCEKICK==7',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMelee: true,
      criDmgPercentage: 0.5,
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel } = input;

        return 150 + skillLevel * 50;
      },
    },
    {
      label: 'Hipernova Lv10',
      name: 'SJ_NOVAEXPLOSING',
      value: 'SJ_NOVAEXPLOSING==10',
      acd: 0.5,
      fct: 0,
      vct: 0,
      cd: 0,
      isMelee: true,
      criDmgPercentage: 0.5,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const bonus = this.isSkillActive('SJ_LIGHTOFSUN') ? 1.25 : 1;

        return (1000 + skillLevel * 220) * (baseLevel / 100) * bonus;
      },
    },
    {
      name: 'SJ_FALLINGSTAR',
      label: 'Chuva Estelar Lv10',
      value: 'SJ_FALLINGSTAR==10',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      hit: 3,
      isMelee: true,
      autoSpellChance: 0.15,
      criDmgPercentage: 0.5,
      totalHit: 2,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const bonus = this.isSkillActive('SJ_LIGHTOFSTAR') ? 1.25 : 1;

        return (100 + skillLevel * 100) * (baseLevel / 100) * bonus;
      },
    },
  ];

  private readonly activeSkillList3rd: ActiveSkillModel[] = [
    {
      label: 'Luz Lunar',
      name: 'SJ_LIGHTOFMOON',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 5', value: 5, skillLv: 5, isUse: true },
      ],
    },
    {
      label: 'Postura Solar',
      name: 'SJ_SUNSTANCE',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 3', value: 3, skillLv: 3, isUse: true, bonus: { atkPercent: 5 } },
      ],
    },
    {
      label: 'Luz Solar',
      name: 'SJ_LIGHTOFSUN',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 5', value: 5, skillLv: 5, isUse: true },
      ],
    },
    {
      label: 'Levitar',
      name: 'SG_FUSION',
      inputType: 'selectButton',
      dropdown: [
        { label: 'Yes', value: 1, skillLv: 1, isUse: true, bonus: { forceCri: 1 } },
        { label: 'No', value: 0, isUse: false },
      ],
    },
    {
      label: 'Postura Estelar',
      name: 'SJ_STARSTANCE',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 3', value: 3, skillLv: 3, isUse: true, bonus: { aspdPercent: 10 } },
      ],
    },
    {
      label: 'Luz Estelar',
      name: 'SJ_LIGHTOFSTAR',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 5', value: 5, skillLv: 5, isUse: true },
      ],
    },
  ];

  private readonly passiveSkillList3rd: PassiveSkillModel[] = [
    {
      label: 'Bênção Solar',
      name: 'SG_SUN_BLESS',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', isUse: false, value: 0 },
        { label: 'Lv 1', isUse: true, value: 1 },
        { label: 'Lv 2', isUse: true, value: 2 },
        { label: 'Lv 3', isUse: true, value: 3 },
        { label: 'Lv 4', isUse: true, value: 4 },
        { label: 'Lv 5', isUse: true, value: 5 },
      ],
    },
    {
      label: 'Bênção Lunar',
      name: 'SG_MOON_BLESS',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', isUse: false, value: 0 },
        { label: 'Lv 1', isUse: true, value: 1 },
        { label: 'Lv 2', isUse: true, value: 2 },
        { label: 'Lv 3', isUse: true, value: 3 },
        { label: 'Lv 4', isUse: true, value: 4 },
        { label: 'Lv 5', isUse: true, value: 5 },
      ],
    },
    {
      label: 'Bênção Estelar',
      name: 'SG_STAR_BLESS',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', isUse: false, value: 0 },
        { label: 'Lv 1', isUse: true, value: 1 },
        { label: 'Lv 2', isUse: true, value: 2 },
        { label: 'Lv 3', isUse: true, value: 3 },
        { label: 'Lv 4', isUse: true, value: 4 },
        { label: 'Lv 5', isUse: true, value: 5 },
      ],
    },
  ];

  constructor() {
    super();

    this.inheritSkills({
      activeSkillList: this.activeSkillList3rd,
      atkSkillList: this.atkSkillList3rd,
      passiveSkillList: this.passiveSkillList3rd,
      classNames: this.classNames3rd,
    });
  }

  getWrathAtkBonus(info: InfoForClass): number {
    if (!this.isSkillActive('_CALC_WRATH_OF')) return 0;

    const { model, status, monster } = info;
    const { level } = model;
    const { totalLuk, totalDex, totalStr } = status;
    const { size } = monster;
    const bonusSize = size === 'l' ? totalStr : 0;

    return Math.floor((level + totalLuk + totalDex + bonusSize) / 3);
  }

  override modifyFinalAtk(currentAtk: number, _params: InfoForClass) {
    const powerLv = this.bonuses.usedSkillMap.get('Power');
    const wratBonus = (100 + this.getWrathAtkBonus(_params)) / 100;

    let totalAtk = currentAtk;
    if (powerLv >= 1) totalAtk = totalAtk + floor(totalAtk * (powerLv * 15 + 10) * 0.01);
    totalAtk = totalAtk * wratBonus;

    return totalAtk;
  }
}
