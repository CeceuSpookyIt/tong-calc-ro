import { ClassName } from './_class-name';
import { ActiveSkillModel, AtkSkillFormulaInput, AtkSkillModel, PassiveSkillModel } from './_character-base.abstract';
import { Ninja } from './Ninja';
import { ShadowWarrior } from '../constants/share-active-skills/shadow-warrior';
import { ElementType } from '../constants/element-type.const';
import { AdditionalBonusInput, InfoForClass } from '../models/info-for-class.model';
import { floor } from '../utils';
import { DistortedCrescent, S16thNight } from '../constants/share-active-skills';
import { IllusionShockFn, PureSoulFn, RighthandMasteryFn, S16thNightFn } from '../constants/share-passive-skills';

const jobBonusTable: Record<number, [number, number, number, number, number, number]> = {
  1: [0, 0, 0, 0, 1, 0],
  2: [0, 0, 0, 0, 1, 0],
  3: [0, 0, 0, 1, 1, 0],
  4: [0, 0, 0, 1, 1, 0],
  5: [0, 1, 0, 1, 1, 0],
  6: [0, 1, 1, 1, 1, 0],
  7: [0, 1, 1, 1, 1, 0],
  8: [1, 1, 1, 1, 1, 0],
  9: [1, 1, 1, 1, 1, 1],
  10: [1, 1, 1, 1, 1, 1],
  11: [1, 1, 1, 1, 2, 1],
  12: [2, 1, 1, 1, 2, 1],
  13: [2, 2, 1, 1, 2, 1],
  14: [2, 2, 1, 1, 2, 1],
  15: [2, 2, 1, 2, 2, 1],
  16: [2, 2, 1, 2, 2, 2],
  17: [2, 2, 2, 2, 2, 2],
  18: [2, 2, 2, 2, 2, 2],
  19: [3, 2, 2, 2, 2, 2],
  20: [3, 2, 2, 2, 3, 2],
  21: [3, 3, 2, 2, 3, 2],
  22: [3, 3, 2, 2, 3, 2],
  23: [3, 3, 2, 2, 3, 3],
  24: [3, 3, 3, 2, 3, 3],
  25: [3, 3, 3, 3, 3, 3],
  26: [3, 3, 3, 3, 3, 3],
  27: [3, 3, 3, 3, 4, 3],
  28: [3, 3, 3, 3, 4, 3],
  29: [3, 4, 3, 3, 4, 3],
  30: [3, 4, 3, 3, 4, 3],
  31: [4, 4, 3, 3, 4, 3],
  32: [4, 4, 3, 4, 4, 3],
  33: [4, 4, 3, 4, 4, 3],
  34: [4, 4, 3, 4, 5, 3],
  35: [4, 4, 3, 5, 5, 3],
  36: [4, 4, 3, 5, 5, 3],
  37: [4, 4, 4, 5, 5, 3],
  38: [4, 4, 4, 5, 6, 3],
  39: [5, 4, 4, 5, 6, 3],
  40: [5, 4, 4, 5, 6, 3],
  41: [5, 5, 4, 5, 6, 3],
  42: [5, 5, 4, 6, 6, 3],
  43: [6, 5, 4, 6, 6, 3],
  44: [6, 5, 4, 6, 6, 3],
  45: [6, 5, 4, 6, 7, 3],
  46: [6, 5, 4, 6, 7, 4],
  47: [6, 6, 4, 6, 7, 4],
  48: [7, 6, 4, 6, 7, 4],
  49: [7, 6, 4, 6, 7, 4],
  50: [7, 6, 4, 6, 8, 4],
  51: [7, 6, 4, 6, 8, 4],
  52: [7, 6, 4, 6, 8, 4],
  53: [7, 6, 4, 6, 8, 4],
  54: [7, 6, 4, 6, 8, 4],
  55: [7, 6, 4, 6, 8, 4],
  56: [7, 6, 4, 6, 8, 4],
  57: [7, 6, 4, 6, 8, 4],
  58: [7, 6, 4, 6, 8, 4],
  59: [7, 6, 4, 6, 8, 4],
  60: [7, 6, 4, 6, 8, 4],
  61: [7, 6, 4, 6, 8, 4],
  62: [7, 6, 4, 6, 8, 4],
  63: [7, 6, 4, 6, 8, 4],
  64: [7, 6, 4, 6, 8, 4],
  65: [7, 6, 4, 6, 8, 4],
  66: [7, 6, 4, 6, 8, 4],
  67: [7, 6, 4, 6, 8, 4],
  68: [7, 6, 4, 6, 8, 4],
  69: [7, 6, 4, 6, 8, 4],
  70: [7, 10, 6, 6, 8, 6],
};

export class Oboro extends Ninja {
  protected override CLASS_NAME = ClassName.Oboro;
  protected override JobBonusTable = jobBonusTable;
  protected override initialStatusPoint = 48;

  private readonly classNames2nd = [ClassName.Oboro];

  private readonly atkSkillList2nd: AtkSkillModel[] = [
    {
      label: 'Pétalas Flamejantes Lv10',
      name: 'NJ_KOUENKA',
      value: 'NJ_KOUENKA==10',
      acd: 0,
      fct: 1.4,
      vct: 5.6,
      cd: 0,
      element: ElementType.Fire,
      isMatk: true,
      totalHit: 10,
      formula: (): number => {
        return 90;
      },
    },
    {
      label: 'Grande Floco de Neve Lv10',
      name: 'NJ_HYOUSYOURAKU',
      value: 'NJ_HYOUSYOURAKU==10',
      acd: 0,
      fct: 1.4,
      vct: 5.6,
      cd: 0,
      element: ElementType.Water,
      isMatk: true,
      totalHit: 12,
      formula: (): number => {
        return 70;
      },
    },
    {
      label: 'Grande Floco de Neve Lv10 (in Watery Evasion)',
      name: 'NJ_HYOUSYOURAKU',
      value: 'NJ_HYOUSYOURAKU Water==10',
      acd: 0,
      fct: 1.4,
      vct: 5.6,
      cd: 0,
      element: ElementType.Water,
      isMatk: true,
      totalHit: 12,
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel } = input;

        return 70 + skillLevel * 2;
      },
    },
    {
      label: 'Lâmina de Vento Lv10',
      name: 'NJ_HUUJIN',
      value: 'NJ_HUUJIN==10',
      acd: 0,
      fct: 1.1,
      vct: 4.4,
      cd: 0,
      element: ElementType.Wind,
      isMatk: true,
      totalHit: 6,
      formula: (): number => {
        return 150;
      },
    },
    {
      label: 'Punho do Dragão Lv5',
      name: 'SR_DRAGONCOMBO',
      value: 'SR_DRAGONCOMBO==5',
      acd: 0.5,
      fct: 0.8,
      vct: 2,
      cd: 0.3,
      element: ElementType.Fire,
      isMatk: true,
      hit: 3,
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel } = input;

        return 150 + skillLevel * 150;
      },
    },
    {
      label: 'Grande Floco de Neve Lv5',
      name: 'NJ_HYOUSYOURAKU',
      value: 'NJ_HYOUSYOURAKU==5',
      acd: 0.5,
      fct: 0.8,
      vct: 2.5,
      cd: 0.3,
      element: ElementType.Water,
      isMatk: true,
      hit: 5,
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel } = input;

        return 150 + skillLevel * 150;
      },
    },
    {
      label: 'Brisa Cortante Lv5',
      name: 'NJ_KAMAITACHI',
      value: 'NJ_KAMAITACHI==5',
      acd: 0,
      fct: 0.3,
      vct: 1.2,
      cd: 0,
      element: ElementType.Wind,
      isMatk: true,
      hit: 5,
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel } = input;

        return 100 + skillLevel * 100;
      },
    },
    {
      label: 'Impacto Cruzado Lv10',
      name: 'KO_JYUMONJIKIRI',
      value: 'KO_JYUMONJIKIRI==10',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 3.1,
      hit: 2,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const bonus = this.isSkillActive('SHC_CROSS_SLASH') ? baseLevel * skillLevel : 0;

        return skillLevel * 200 * (baseLevel / 100) + bonus;
      },
    },
  ];

  private readonly activeSkillList2nd: ActiveSkillModel[] = [
    ShadowWarrior,
    S16thNight,
    DistortedCrescent,
    {
      label: '[Debuf] Shadow Wound',
      name: 'SHC_CROSS_SLASH',
      inputType: 'selectButton',
      dropdown: [
        { label: 'Yes', value: 1, isUse: true },
        { label: 'No', value: 0, isUse: false },
      ],
    },
  ];

  private readonly passiveSkillList2nd: PassiveSkillModel[] = [
    {
      label: 'Pétalas Flamejantes',
      name: 'NJ_KOUENKA',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true },
        { label: 'Lv 2', value: 2, isUse: true },
        { label: 'Lv 3', value: 3, isUse: true },
        { label: 'Lv 4', value: 4, isUse: true },
        { label: 'Lv 5', value: 5, isUse: true },
        { label: 'Lv 6', value: 6, isUse: true },
        { label: 'Lv 7', value: 7, isUse: true },
        { label: 'Lv 8', value: 8, isUse: true },
        { label: 'Lv 9', value: 9, isUse: true },
        { label: 'Lv 10', value: 10, isUse: true },
      ],
    },
    {
      label: 'Grande Floco de Neve',
      name: 'NJ_HYOUSYOURAKU',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true },
        { label: 'Lv 2', value: 2, isUse: true },
        { label: 'Lv 3', value: 3, isUse: true },
        { label: 'Lv 4', value: 4, isUse: true },
        { label: 'Lv 5', value: 5, isUse: true },
        { label: 'Lv 6', value: 6, isUse: true },
        { label: 'Lv 7', value: 7, isUse: true },
        { label: 'Lv 8', value: 8, isUse: true },
        { label: 'Lv 9', value: 9, isUse: true },
        { label: 'Lv 10', value: 10, isUse: true },
      ],
    },
    {
      label: 'Lâmina de Vento',
      name: 'NJ_HUUJIN',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true },
        { label: 'Lv 2', value: 2, isUse: true },
        { label: 'Lv 3', value: 3, isUse: true },
        { label: 'Lv 4', value: 4, isUse: true },
        { label: 'Lv 5', value: 5, isUse: true },
        { label: 'Lv 6', value: 6, isUse: true },
        { label: 'Lv 7', value: 7, isUse: true },
        { label: 'Lv 8', value: 8, isUse: true },
        { label: 'Lv 9', value: 9, isUse: true },
        { label: 'Lv 10', value: 10, isUse: true },
      ],
    },
    {
      label: 'Genjutsu: Substituição',
      name: 'KO_GENWAKU',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, skillLv: 1, isUse: true },
        { label: 'Lv 2', value: 2, skillLv: 2, isUse: true },
        { label: 'Lv 3', value: 3, skillLv: 3, isUse: true },
        { label: 'Lv 4', value: 4, skillLv: 4, isUse: true },
        { label: 'Lv 5', value: 5, skillLv: 5, isUse: true },
      ],
    },
    {
      label: 'Genjutsu: Chamado da Morte',
      name: 'KO_JYUSATSU',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, skillLv: 1, isUse: true },
        { label: 'Lv 2', value: 2, skillLv: 2, isUse: true },
        { label: 'Lv 3', value: 3, skillLv: 3, isUse: true },
        { label: 'Lv 4', value: 4, skillLv: 4, isUse: true },
        { label: 'Lv 5', value: 5, skillLv: 5, isUse: true },
      ],
    },
    IllusionShockFn(),
    {
      label: 'Ilusão do Luar',
      name: 'OB_OBOROGENSOU',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, skillLv: 1, isUse: true },
        { label: 'Lv 2', value: 2, skillLv: 2, isUse: true },
        { label: 'Lv 3', value: 3, skillLv: 3, isUse: true },
        { label: 'Lv 4', value: 4, skillLv: 4, isUse: true },
        { label: 'Lv 5', value: 5, skillLv: 5, isUse: true },
      ],
    },
    RighthandMasteryFn(),
    PureSoulFn(),
    S16thNightFn(),
  ];

  constructor() {
    super();

    this.inheritSkills({
      activeSkillList: this.activeSkillList2nd,
      atkSkillList: this.atkSkillList2nd,
      passiveSkillList: this.passiveSkillList2nd,
      classNames: this.classNames2nd,
    });
  }

  override getMasteryAtk(info: InfoForClass): number {
    return this.calcHiddenMasteryAtk(info).totalAtk;
  }

  override getMasteryMatk(info: InfoForClass): number {
    const _16Night = this.activeSkillLv('KO_IZAYOI');
    if (_16Night <= 0) return 0;

    const { model } = info;

    return floor((model.jobLevel * _16Night) / 2);
  }

  override setAdditionalBonus(params: AdditionalBonusInput) {
    const { totalBonus, model } = params;
    if (this.isSkillActive('OB_ZANGETSU')) {
      const bonus = floor(model.level / 3) + 100;
      totalBonus.atk += bonus;
      totalBonus.matk += bonus;
    }

    return totalBonus;
  }
}
