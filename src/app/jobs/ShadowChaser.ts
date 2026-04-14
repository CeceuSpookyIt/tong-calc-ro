import { ClassName } from './_class-name';
import { ActiveSkillModel, AtkSkillFormulaInput, AtkSkillModel, PassiveSkillModel } from './_character-base.abstract';
import { NoLimitFn, ShieldSpellFn } from '../constants/share-active-skills';
import { InfoForClass } from '../models/info-for-class.model';
import { ElementType } from '../constants/element-type.const';
import { DoubleStrafeFn, SnatcherFn, VulturesEyeFn } from '../constants/share-passive-skills';
import { WeaponTypeName } from '../constants/weapon-type-mapper';
import { Stalker } from './Stalker';

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
  51: [6, 3, 7, 6, 3, 5],
  52: [6, 3, 8, 6, 3, 5],
  53: [7, 3, 8, 6, 3, 5],
  54: [7, 4, 8, 6, 3, 5],
  55: [7, 4, 8, 6, 3, 5],
  56: [7, 4, 8, 6, 3, 6],
  57: [7, 4, 8, 6, 4, 6],
  58: [7, 4, 8, 6, 4, 6],
  59: [8, 4, 8, 6, 4, 6],
  60: [8, 5, 8, 6, 4, 6],
  61: [8, 5, 8, 6, 4, 6],
  62: [8, 5, 8, 6, 4, 6],
  63: [8, 5, 8, 6, 4, 6],
  64: [8, 5, 8, 6, 4, 6],
  65: [8, 7, 8, 6, 5, 6],
  66: [8, 7, 8, 6, 5, 6],
  67: [8, 7, 8, 6, 5, 6],
  68: [8, 7, 8, 6, 5, 6],
  69: [8, 7, 8, 6, 5, 6],
  70: [8, 9, 8, 6, 6, 6],
};

export class ShadowChaser extends Stalker {
  protected override CLASS_NAME = ClassName.ShadowChaser;
  protected override JobBonusTable = jobBonusTable;

  protected readonly classNames3rd = [ClassName.Only_3rd, ClassName.ShadowChaser];
  protected readonly atkSkillList3rd: AtkSkillModel[] = [
    {
      name: 'SM_FATALBLOW',
      label: 'Ataque Fatal Lv10',
      value: 'SM_FATALBLOW==10',
      values: ['[Improved] SM_FATALBLOW==10'],
      acd: 0.5,
      fct: 0,
      vct: 0,
      cd: 0,
      isMelee: true,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const baseLevel = model.level;
        const totalAgi = status.totalAgi;

        if (this.isSkillActive('ABC_ABYSS_DAGGER')) {
          return (skillLevel * 150 + totalAgi * 3) * (baseLevel / 100);
        }

        return (skillLevel * 120 + totalAgi * 2) * (baseLevel / 100);
      },
    },
    {
      name: 'SC_TRIANGLESHOT',
      label: 'Disparo Triplo Lv10',
      value: 'SC_TRIANGLESHOT==10',
      values: ['[Improved] SC_TRIANGLESHOT==10'],
      acd: 0.32,
      fct: 0,
      vct: 0,
      cd: 0.2,
      hit: 3,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const baseLevel = model.level;
        const { totalAgi } = status;

        return (230 * skillLevel + 3 * totalAgi) * (baseLevel / 100);
      },
    },
    {
      name: 'SC_FEINTBOMB',
      label: 'Cópia Explosiva Lv10',
      value: 'SC_FEINTBOMB==10',
      acd: 0,
      fct: 0,
      vct: 1,
      cd: 5,
      isMelee: true,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const { level: baseLevel, jobLevel } = model;
        const { totalDex } = status;

        return (1 + skillLevel) * (totalDex / 2) * (jobLevel / 10) * (baseLevel / 120);
      },
    },
    {
      name: 'RA_ARROWSTORM',
      label: 'Tempestade de Flechas Lv10',
      value: 'RA_ARROWSTORM==10',
      acd: 0,
      fct: 0.3,
      vct: 2,
      cd: 3.2,
      hit: 3,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const fearBreezeBonus = this.isSkillActive('RA_FEARBREEZE') ? 70 : 0;

        return (200 + (180 + fearBreezeBonus) * skillLevel) * (baseLevel / 100);
      },
    },
    {
      name: 'SO_PSYCHIC_WAVE',
      label: 'Onda Psíquica',
      value: 'SO_PSYCHIC_WAVE==5',
      fct: (lv) => 1.1 - lv * 0.1,
      vct: (lv) => 7 + lv,
      cd: 5,
      acd: 1,
      totalHit: ({ skillLevel: lv }) => 2 + lv,
      isMatk: true,
      levelList: [
        { label: 'Onda Psíquica Lv1', value: 'SO_PSYCHIC_WAVE==1' },
        { label: 'Onda Psíquica Lv2', value: 'SO_PSYCHIC_WAVE==2' },
        { label: 'Onda Psíquica Lv3', value: 'SO_PSYCHIC_WAVE==3' },
        { label: 'Onda Psíquica Lv4', value: 'SO_PSYCHIC_WAVE==4' },
        { label: 'Onda Psíquica Lv5', value: 'SO_PSYCHIC_WAVE==5' },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const baseLevel = model.level;
        const totalInt = status.totalInt;

        return (70 * skillLevel + 3 * totalInt) * (baseLevel / 100);
      },
      finalDmgFormula(input) {
        const weaponType = input.weapon.data?.typeName;
        if (weaponType === 'book' || weaponType === 'rod' || weaponType === 'twohandRod') {
          return input.damage * 2;
        }

        return input.damage;
      },
    },
    {
      name: 'WL_COMET',
      label: 'Cometa Lv5',
      value: 'WL_COMET==5',
      acd: 1.5,
      fct: 2,
      vct: 10,
      cd: 20,
      isMatk: true,
      hit: 10,
      element: ElementType.Neutral,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (2500 + skillLevel * 700) * (baseLevel / 100);
      },
    },
    {
      name: 'WZ_METEOR',
      label: 'Chuva de Meteoros',
      value: 'WZ_METEOR==3',
      acd: 1,
      fct: 1.5,
      vct: 6.3,
      cd: (lv) => 2 + lv * 0.5,
      isMatk: true,
      element: ElementType.Fire,
      totalHit: ({ skillLevel: lv }) => ({ 1: 2, 2: 3, 3: 3, 4: 4, 5: 4, 6: 5, 7: 5, 8: 6, 9: 6, 10: 7 }[lv]),
      levelList: [
        { label: 'Chuva de Meteoros Lv1', value: 'WZ_METEOR==1' },
        { label: 'Chuva de Meteoros Lv2', value: 'WZ_METEOR==2' },
        { label: 'Chuva de Meteoros Lv3', value: 'WZ_METEOR==3' },
        { label: 'Chuva de Meteoros Lv4', value: 'WZ_METEOR==4' },
        { label: 'Chuva de Meteoros Lv5', value: 'WZ_METEOR==5' },
        { label: 'Chuva de Meteoros Lv6', value: 'WZ_METEOR==6' },
        { label: 'Chuva de Meteoros Lv7', value: 'WZ_METEOR==7' },
        { label: 'Chuva de Meteoros Lv8', value: 'WZ_METEOR==8' },
        { label: 'Chuva de Meteoros Lv9', value: 'WZ_METEOR==9' },
        { label: 'Chuva de Meteoros Lv10', value: 'WZ_METEOR==10' },
      ],
      formula: (): number => {
        return 125;
      },
    },
    {
      name: 'WM_SEVERE_RAINSTORM',
      label: 'Temporal de Flechas',
      value: 'WM_SEVERE_RAINSTORM==5',
      values: [
        '[Improved] WM_SEVERE_RAINSTORM==1',
        '[Improved] WM_SEVERE_RAINSTORM==2',
        '[Improved] WM_SEVERE_RAINSTORM==3',
        '[Improved] WM_SEVERE_RAINSTORM==4',
        '[Improved] WM_SEVERE_RAINSTORM==5',
      ],
      acd: 1,
      fct: 0.5,
      vct: (lv) => 1 + lv * 0.5,
      cd: (lv) => 4.5 + lv * 0.5,
      totalHit: 12,
      levelList: [
        { label: 'Temporal de Flechas Lv1', value: 'WM_SEVERE_RAINSTORM==1' },
        { label: 'Temporal de Flechas Lv2', value: 'WM_SEVERE_RAINSTORM==2' },
        { label: 'Temporal de Flechas Lv3', value: 'WM_SEVERE_RAINSTORM==3' },
        { label: 'Temporal de Flechas Lv4', value: 'WM_SEVERE_RAINSTORM==4' },
        { label: 'Temporal de Flechas Lv5', value: 'WM_SEVERE_RAINSTORM==5' },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { weapon, status, skillLevel, model } = input;
        const baseLevel = model.level;
        const { totalDex, totalAgi } = status;
        const weaType = weapon.data.typeName;
        const weaMultiMap: Partial<Record<WeaponTypeName, number>> = {
          bow: 100,
          instrument: 120,
          whip: 120,
        };
        const extra = weaMultiMap[weaType] || 0;

        return ((totalDex + totalAgi) / 2 + skillLevel * extra) * (baseLevel / 100);
      },
    },
    {
      name: 'RK_IGNITIONBREAK',
      label: 'Impacto Flamejante Lv5',
      value: 'RK_IGNITIONBREAK==5',
      values: ['[Improved 2nd] RK_IGNITIONBREAK==5'],
      acd: 0,
      fct: 0,
      vct: 1,
      cd: 2,
      isMelee: true,
      canCri: true,
      criDmgPercentage: 0.5,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return skillLevel * 450 * (baseLevel / 100);
      },
    },
    {
      name: 'WM_REVERBERATION',
      label: 'Ressonância Lv5',
      value: 'WM_REVERBERATION==5',
      acd: 0.5,
      fct: 0.5,
      vct: 1.5,
      cd: 0,
      isMatk: true,
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel, model } = input;
        const baseLevel = model.level;

        return (700 + skillLevel * 300) * (baseLevel / 100);
      },
    },
    {
      name: 'LG_RAYOFGENESIS',
      label: 'Luz da Criação Lv10',
      value: 'LG_RAYOFGENESIS==10',
      acd: 1,
      fct: 0.5,
      vct: 6.5,
      cd: 2,
      hit: 7,
      isMatk: true,
      getElement: () => {
        if (this.isSkillActive('LG_INSPIRATION')) return ElementType.Neutral;

        return ElementType.Holy;
      },
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const baseLevel = model.level;
        const totalInt = status.totalInt;
        if (this.isSkillActive('LG_INSPIRATION')) {
          return (skillLevel * 300 + totalInt * 3) * (baseLevel / 100);
        }

        return (skillLevel * 230 + totalInt * 2) * (baseLevel / 100);
      },
    },
  ];

  protected readonly activeSkillList3rd: ActiveSkillModel[] = [
    {
      label: 'Preservar',
      name: 'ST_PRESERVE',
      inputType: 'selectButton',
      dropdown: [
        { label: 'Yes', value: 10, isUse: true },
        { label: 'No', value: 0, isUse: false },
      ],
    },
    {
      label: 'Desejo das Sombras Lv10',
      name: 'SC_AUTOSHADOWSPELL',
      inputType: 'selectButton',
      dropdown: [
        { label: 'Yes', value: 10, isUse: true, bonus: { matk: 50 } },
        { label: 'No', value: 0, isUse: false },
      ],
    },
    ShieldSpellFn(),
    NoLimitFn(),
    {
      inputType: 'selectButton',
      label: 'Mystical Amp 5',
      name: 'HW_MAGICPOWER',
      isEquipAtk: true,
      dropdown: [
        { label: 'Yes', isUse: true, value: 5, bonus: { mysticAmp: 25 } },
        { label: 'No', isUse: false, value: 0 },
      ],
    },
  ];

  protected readonly passiveSkillList3rd: PassiveSkillModel[] = [
    VulturesEyeFn(),
    DoubleStrafeFn(),
    {
      inputType: 'dropdown',
      label: 'Perícia com Espada',
      name: 'SM_SWORD',
      isMasteryAtk: true,
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true, bonus: { atk: 4 } },
        { label: 'Lv 2', value: 2, isUse: true, bonus: { atk: 8 } },
        { label: 'Lv 3', value: 3, isUse: true, bonus: { atk: 12 } },
        { label: 'Lv 4', value: 4, isUse: true, bonus: { atk: 16 } },
        { label: 'Lv 5', value: 5, isUse: true, bonus: { atk: 20 } },
        { label: 'Lv 6', value: 6, isUse: true, bonus: { atk: 24 } },
        { label: 'Lv 7', value: 7, isUse: true, bonus: { atk: 28 } },
        { label: 'Lv 8', value: 8, isUse: true, bonus: { atk: 32 } },
        { label: 'Lv 9', value: 9, isUse: true, bonus: { atk: 36 } },
        { label: 'Lv 10', value: 10, isUse: true, bonus: { atk: 40 } },
      ],
    },
    SnatcherFn(),
    {
      inputType: 'dropdown',
      label: 'Apunhalar',
      name: 'RG_BACKSTAP',
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
      inputType: 'dropdown',
      label: 'Intimidate',
      name: 'RG_INTIMIDATE',
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
      inputType: 'dropdown',
      label: 'Plágio',
      name: 'RG_PLAGIARISM',
      isEquipAtk: true,
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true, bonus: { aspdPercent: 1 } },
        { label: 'Lv 2', value: 2, isUse: true, bonus: { aspdPercent: 2 } },
        { label: 'Lv 3', value: 3, isUse: true, bonus: { aspdPercent: 3 } },
        { label: 'Lv 4', value: 4, isUse: true, bonus: { aspdPercent: 4 } },
        { label: 'Lv 5', value: 5, isUse: true, bonus: { aspdPercent: 5 } },
        { label: 'Lv 6', value: 6, isUse: true, bonus: { aspdPercent: 6 } },
        { label: 'Lv 7', value: 7, isUse: true, bonus: { aspdPercent: 7 } },
        { label: 'Lv 8', value: 8, isUse: true, bonus: { aspdPercent: 8 } },
        { label: 'Lv 9', value: 9, isUse: true, bonus: { aspdPercent: 9 } },
        { label: 'Lv 10', value: 10, isUse: true, bonus: { aspdPercent: 10 } },
      ],
    },
    {
      inputType: 'dropdown',
      label: 'Redemoinho de Absorção',
      name: 'SC_MAELSTROM',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true },
        { label: 'Lv 2', value: 2, isUse: true },
        { label: 'Lv 3', value: 3, isUse: true },
      ],
    },
    {
      inputType: 'dropdown',
      label: 'Cópia Explosiva',
      name: 'SC_FEINTBOMB',
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
      inputType: 'dropdown',
      label: 'Escapar',
      name: 'SC_ESCAPE',
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
      inputType: 'dropdown',
      label: 'Vínculo Sombrio',
      name: 'SC_SHADOWFORM',
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
      inputType: 'dropdown',
      label: 'Mimetismo',
      name: 'SC_REPRODUCE',
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

  override calcSkillDmgByTotalHit(params: { finalDamage: number; skill: AtkSkillModel; info: InfoForClass }) {
    const { finalDamage, skill, info } = params;
    const isDagger = info.weapon.data?.typeName === 'dagger';
    if (skill.name === 'SM_FATALBLOW' && isDagger) {
      return finalDamage * 2;
    }

    return super.calcSkillDmgByTotalHit(params);
  }
}
