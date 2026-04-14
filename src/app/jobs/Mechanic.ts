import { WeaponTypeName } from '../constants';
import { AdditionalBonusInput, InfoForClass } from '../models/info-for-class.model';
import { Whitesmith } from './Whitesmith';
import { ActiveSkillModel, AtkSkillFormulaInput, AtkSkillModel, PassiveSkillModel } from './_character-base.abstract';
import { ClassName } from './_class-name';
import { isBattleWarrior, isDualCannon } from './summons';

const jobBonusTable: Record<number, [number, number, number, number, number, number]> = {
  1: [0, 0, 0, 0, 0, 1],
  2: [1, 0, 0, 0, 0, 1],
  3: [1, 0, 0, 0, 0, 1],
  4: [1, 0, 0, 0, 0, 1],
  5: [2, 0, 0, 0, 0, 1],
  6: [2, 0, 0, 0, 0, 1],
  7: [2, 0, 0, 0, 0, 2],
  8: [2, 1, 0, 0, 0, 2],
  9: [2, 1, 0, 0, 1, 2],
  10: [2, 1, 0, 1, 1, 2],
  11: [2, 1, 0, 1, 1, 2],
  12: [2, 1, 0, 1, 1, 2],
  13: [2, 1, 0, 2, 1, 2],
  14: [2, 1, 0, 2, 1, 3],
  15: [2, 1, 0, 2, 1, 3],
  16: [2, 1, 0, 2, 1, 3],
  17: [2, 2, 0, 2, 1, 3],
  18: [2, 2, 0, 2, 1, 3],
  19: [2, 2, 1, 2, 1, 3],
  20: [2, 2, 2, 2, 1, 3],
  21: [2, 2, 2, 3, 1, 3],
  22: [2, 2, 2, 3, 2, 3],
  23: [2, 2, 2, 3, 2, 3],
  24: [2, 2, 2, 3, 2, 3],
  25: [2, 2, 3, 3, 2, 3],
  26: [2, 2, 3, 3, 2, 4],
  27: [2, 2, 3, 3, 2, 4],
  28: [2, 2, 3, 3, 2, 4],
  29: [2, 2, 4, 3, 2, 4],
  30: [2, 2, 4, 3, 2, 4],
  31: [3, 2, 4, 3, 2, 4],
  32: [4, 2, 4, 3, 2, 4],
  33: [4, 2, 5, 3, 2, 4],
  34: [4, 2, 5, 3, 2, 5],
  35: [4, 2, 5, 3, 2, 5],
  36: [4, 2, 5, 3, 2, 5],
  37: [4, 2, 5, 4, 2, 5],
  38: [4, 2, 5, 5, 2, 5],
  39: [4, 2, 5, 5, 2, 5],
  40: [4, 2, 5, 5, 2, 5],
  41: [4, 2, 5, 5, 2, 5],
  42: [4, 2, 6, 5, 2, 5],
  43: [4, 2, 7, 5, 2, 5],
  44: [5, 2, 7, 5, 2, 5],
  45: [6, 2, 7, 5, 2, 5],
  46: [6, 2, 7, 5, 2, 5],
  47: [6, 2, 7, 5, 2, 5],
  48: [6, 2, 7, 5, 3, 5],
  49: [6, 3, 7, 5, 3, 5],
  50: [6, 3, 7, 5, 3, 5],
  51: [6, 3, 7, 5, 3, 6],
  52: [7, 3, 7, 5, 3, 6],
  53: [7, 3, 7, 5, 4, 6],
  54: [7, 3, 7, 5, 4, 6],
  55: [7, 3, 7, 6, 4, 6],
  56: [7, 3, 8, 6, 4, 6],
  57: [7, 4, 8, 6, 4, 6],
  58: [7, 4, 8, 6, 4, 6],
  59: [7, 4, 8, 6, 5, 6],
  60: [8, 4, 8, 6, 5, 6],
  61: [8, 4, 8, 6, 5, 6],
  62: [8, 4, 8, 6, 5, 6],
  63: [8, 4, 8, 6, 5, 6],
  64: [8, 4, 8, 6, 5, 6],
  65: [9, 5, 9, 6, 5, 6],
  66: [9, 5, 9, 6, 5, 6],
  67: [9, 5, 9, 6, 5, 6],
  68: [9, 5, 9, 6, 5, 6],
  69: [9, 5, 9, 6, 5, 6],
  70: [10, 6, 10, 6, 5, 6],
};

export class Mechanic extends Whitesmith {
  protected override CLASS_NAME = ClassName.Mechanic;
  protected override JobBonusTable = jobBonusTable;

  protected readonly classNames3rd = [ClassName.Only_3rd, ClassName.Mechanic];
  protected readonly atkSkillList3rd: AtkSkillModel[] = [
    {
      name: 'NC_AXETORNADO',
      label: 'Fúria do Furacão  Lv5',
      value: 'NC_AXETORNADO==5',
      values: ['[Improved] NC_AXETORNADO==5'],
      acd: 0.5,
      fct: 0,
      vct: 0,
      cd: 2,
      hit: 6,
      isMelee: true,
      isExcludeCannanball: true,
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel, model, status } = input;
        const baseLevel = model.level;
        const totalVit = status.totalVit;

        if (this.isSkillActive('MT_AXE_STOMP')) {
          return (230 + skillLevel * 250 + totalVit * 2) * (baseLevel / 100);
        }

        return (200 + skillLevel * 180 + totalVit) * (baseLevel / 100);
      },
    },
    {
      name: 'NC_BOOSTKNUCKLE',
      label: 'Punho Foguete Lv5',
      value: 'NC_BOOSTKNUCKLE==5',
      acd: 0,
      fct: 0,
      vct: 0.5,
      cd: 0,
      isExcludeCannanball: true,
      totalHit: () => (isDualCannon(this.abrLv) ? 2 : 1),
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel, model, status } = input;
        const baseLevel = model.level;
        const { totalDex } = status;

        return (100 + skillLevel * 200 + totalDex) * (baseLevel / 100);
      },
    },
    {
      name: 'NC_VULCANARM',
      label: 'Metralhadora Lv3',
      value: 'NC_VULCANARM==3',
      acd: 0.1,
      fct: 0,
      vct: 0.2,
      cd: 0.1,
      isExcludeCannanball: true,
      totalHit: () => (isDualCannon(this.abrLv) ? 2 : 1),
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel, model, status } = input;
        const baseLevel = model.level;
        const { totalDex } = status;

        return (skillLevel * 140 + totalDex) * (baseLevel / 100);
      },
    },
    {
      name: 'NC_AXEBOOMERANG',
      label: 'Arremesso de Machado Lv5',
      value: 'NC_AXEBOOMERANG==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 3,
      isExcludeCannanball: true,
      verifyItemFn: ({ weapon }) => {
        const requires: WeaponTypeName[] = ['axe', 'twohandAxe'];
        if (requires.some(wType => weapon.isType(wType))) return '';

        return requires.join(', ');
      },
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, weapon } = input;
        if (weapon.data?.typeName !== 'axe' && weapon.data?.typeName !== 'twohandAxe') return 0;

        const baseLevel = model.level;
        const weaponWeight = weapon?.data?.weight || 0;

        return (weaponWeight + 250 + skillLevel * 50) * (baseLevel / 100);
      },
    },
    {
      name: 'NC_ARMSCANNON',
      label: 'Canhão Lv5',
      value: 'NC_ARMSCANNON==5',
      values: ['[Improved] NC_ARMSCANNON==5', 'NC_ARMSCANNON==1', 'NC_ARMSCANNON==2', 'NC_ARMSCANNON==3', 'NC_ARMSCANNON==4'],
      acd: 1,
      fct: 0.1,
      vct: 2,
      cd: 0.3,
      isHDefToSDef: true,
      isIgnoreRes: true,
      isHit100: true,
      totalHit: () => (isDualCannon(this.abrLv) ? 2 : 1),
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel, model } = input;
        const baseLevel = model.level;

        return (400 + skillLevel * 300) * (baseLevel / 100);
      },
    },
    {
      name: 'NC_POWERSWING',
      label: 'Brandir Machado Lv10',
      value: 'NC_POWERSWING==1',
      values: ['[Improved] NC_POWERSWING==10'],
      acd: 1,
      fct: 0,
      vct: 0,
      cd: 0,
      isMelee: true,
      isExcludeCannanball: true,
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel, model, status } = input;
        const baseLevel = model.level;
        const { totalDex, totalStr } = status;

        if (isBattleWarrior(this.abrLv)) {
          return (500 + skillLevel * 150 + (totalDex + totalStr) / 2) * (baseLevel / 100);
        }

        return (300 + skillLevel * 100 + (totalDex + totalStr) / 2) * (baseLevel / 100);
      },
    },
  ];
  protected readonly activeSkillList3rd: ActiveSkillModel[] = [
    {
      label: 'Licença de Pilotagem',
      name: 'NC_MADOLICENCE',
      inputType: 'selectButton',
      dropdown: [
        { label: 'Yes', value: 1, isUse: true },
        { label: 'No', value: 0, isUse: false },
      ],
    },
  ];

  protected readonly passiveSkillList3rd: PassiveSkillModel[] = [
    {
      label: 'Perícia com Machado e Espada',
      name: 'AM_AXEMASTERY',
      inputType: 'dropdown',
      isMasteryAtk: true,
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
      label: 'Sabedoria de Hefesto',
      name: 'NC_RESEARCHFE',
      inputType: 'dropdown',
      isMasteryAtk: true,
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true, bonus: { x_atk_element_fire: 10, x_sofDef: 10 } },
        { label: 'Lv 2', value: 2, isUse: true, bonus: { x_atk_element_fire: 20, x_sofDef: 20 } },
        { label: 'Lv 3', value: 3, isUse: true, bonus: { x_atk_element_fire: 30, x_sofDef: 30 } },
        { label: 'Lv 4', value: 4, isUse: true, bonus: { x_atk_element_fire: 40, x_sofDef: 40 } },
        { label: 'Lv 5', value: 5, isUse: true, bonus: { x_atk_element_fire: 50, x_sofDef: 50 } },
      ],
    },
    {
      label: 'Arremesso de Machado',
      name: 'NC_AXEBOOMERANG',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true },
        { label: 'Lv 2', value: 2, isUse: true },
        { label: 'Lv 3', value: 3, isUse: true },
        { label: 'Lv 4', value: 4, isUse: true },
        { label: 'Lv 5', value: 5, isUse: true },
      ],
    },
    {
      label: 'Inundação de Magma',
      name: 'MH_MAGMA_FLOW',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true },
        { label: 'Lv 2', value: 2, isUse: true },
        { label: 'Lv 3', value: 3, isUse: true },
        { label: 'Lv 4', value: 4, isUse: true },
        { label: 'Lv 5', value: 5, isUse: true },
      ],
    },
    {
      label: 'Brandir Machado',
      name: 'NC_POWERSWING',
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
      label: 'Licença de Pilotagem',
      name: 'NC_MADOLICENCE',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true },
        { label: 'Lv 2', value: 2, isUse: true },
        { label: 'Lv 3', value: 3, isUse: true },
        { label: 'Lv 4', value: 4, isUse: true },
        { label: 'Lv 5', value: 5, isUse: true },
      ],
    },
    {
      label: 'Canhão',
      name: 'NC_ARMSCANNON',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true },
        { label: 'Lv 2', value: 2, isUse: true },
        { label: 'Lv 3', value: 3, isUse: true },
        { label: 'Lv 4', value: 4, isUse: true },
        { label: 'Lv 5', value: 5, isUse: true },
      ],
    },
    {
      label: 'Campo Protetor',
      name: 'NC_NEUTRALBARRIER',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true },
        { label: 'Lv 2', value: 2, isUse: true },
        { label: 'Lv 3', value: 3, isUse: true },
      ],
    },
    {
      label: 'Bate Estaca',
      name: 'NC_PILEBUNKER',
      inputType: 'dropdown',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true },
        { label: 'Lv 2', value: 2, isUse: true },
        { label: 'Lv 3', value: 3, isUse: true },
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

  override getMasteryAtk(info: InfoForClass): number {
    const { weapon, monster } = info;
    const weaponType = weapon?.data?.typeName;
    const { element } = monster;
    const bonuses = this.bonuses?.masteryAtks || {};

    const { totalAtk } = this.calcHiddenMasteryAtk(info);

    let sum = totalAtk;
    for (const [, bonus] of Object.entries(bonuses)) {
      sum += bonus[`x_${weaponType}_atk`] || 0;
      sum += bonus[`x_atk_element_${element}`] || 0;
    }

    if (this.isSkillActive('NC_MADOLICENCE')) {
      sum += this.learnLv('NC_MADOLICENCE') * 15;
    }

    if (weaponType === 'axe' || weaponType === 'twohandAxe') {
      sum += this.learnLv('AM_AXEMASTERY') * 5;
    } else if (weaponType === 'mace' || weaponType === 'twohandMace') {
      sum += this.learnLv('AM_AXEMASTERY') * 4;
    }

    return sum;
  }

  override setAdditionalBonus(params: AdditionalBonusInput) {
    const { totalBonus, weapon } = params;
    const { typeName } = weapon.data;

    const { masteryAtks, equipAtks } = this.bonuses;

    const prefixCondition = `${typeName}_`;
    for (const [_skillName, bonus] of Object.entries({ ...(masteryAtks || {}), ...(equipAtks || {}) })) {
      for (const [attr, value] of Object.entries(bonus)) {
        if (attr.startsWith(prefixCondition)) {
          const actualAttr = attr.replace(prefixCondition, '');
          totalBonus[actualAttr] += value;
        }
      }
    }

    const weaponType = weapon?.data?.typeName;
    if (weaponType === 'axe' || weaponType === 'twohandAxe') {
      totalBonus.hit = (totalBonus.hit || 0) + this.learnLv('AM_AXEMASTERY') * 3;
    } else if (weaponType === 'mace' || weaponType === 'twohandMace') {
      totalBonus.hit = (totalBonus.hit || 0) + this.learnLv('AM_AXEMASTERY') * 2;
    }

    return totalBonus;
  }

  protected get abrLv() {
    return this.activeSkillLv('_CALC_MEISTER_ABR_LIST');
  }
}
