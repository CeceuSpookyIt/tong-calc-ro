import { ClassName } from './_class-name';
import { ActiveSkillModel, AtkSkillFormulaInput, AtkSkillModel, PassiveSkillModel } from './_character-base.abstract';
import { ElementType } from '../constants/element-type.const';
import { Gunslinger } from './Gunslinger';

const jobBonusTable: Record<number, [number, number, number, number, number, number]> = {
  1: [0, 0, 0, 0, 0, 0],
  2: [0, 0, 0, 0, 1, 0],
  3: [0, 0, 0, 0, 1, 0],
  4: [0, 0, 0, 1, 1, 0],
  5: [0, 0, 0, 1, 1, 0],
  6: [0, 0, 1, 1, 1, 0],
  7: [0, 0, 1, 1, 2, 0],
  8: [0, 0, 1, 2, 2, 0],
  9: [0, 1, 1, 2, 2, 0],
  10: [0, 1, 1, 2, 2, 1],
  11: [0, 1, 1, 2, 2, 1],
  12: [0, 1, 1, 2, 2, 1],
  13: [0, 1, 2, 2, 2, 1],
  14: [0, 1, 2, 3, 2, 1],
  15: [0, 1, 2, 3, 2, 1],
  16: [0, 2, 2, 3, 2, 1],
  17: [0, 2, 2, 3, 3, 1],
  18: [0, 2, 2, 4, 3, 1],
  19: [0, 2, 3, 4, 3, 1],
  20: [0, 2, 3, 4, 3, 2],
  21: [0, 2, 3, 4, 3, 2],
  22: [0, 2, 3, 4, 3, 2],
  23: [0, 2, 4, 4, 3, 2],
  24: [0, 2, 4, 4, 4, 2],
  25: [1, 2, 4, 4, 4, 2],
  26: [1, 2, 4, 5, 4, 2],
  27: [1, 3, 4, 5, 4, 2],
  28: [1, 3, 4, 5, 4, 2],
  29: [1, 3, 4, 5, 4, 2],
  30: [1, 3, 4, 5, 4, 3],
  31: [1, 3, 5, 5, 4, 3],
  32: [1, 3, 5, 5, 4, 3],
  33: [1, 3, 5, 5, 5, 3],
  34: [1, 3, 5, 6, 5, 3],
  35: [2, 3, 5, 6, 5, 3],
  36: [2, 3, 5, 6, 5, 3],
  37: [2, 3, 5, 6, 5, 3],
  38: [2, 3, 5, 6, 6, 3],
  39: [2, 3, 5, 6, 6, 3],
  40: [2, 4, 5, 6, 6, 3],
  41: [2, 4, 5, 6, 6, 4],
  42: [2, 4, 5, 6, 6, 4],
  43: [2, 4, 5, 6, 7, 4],
  44: [2, 4, 6, 6, 7, 4],
  45: [2, 4, 6, 7, 7, 4],
  46: [2, 4, 6, 7, 7, 4],
  47: [2, 4, 6, 7, 7, 4],
  48: [2, 4, 6, 7, 7, 4],
  49: [2, 4, 6, 7, 7, 4],
  50: [3, 4, 6, 7, 7, 4],
  51: [3, 5, 6, 7, 7, 4],
  52: [3, 5, 6, 7, 7, 5],
  53: [3, 5, 6, 7, 7, 5],
  54: [3, 5, 6, 8, 7, 5],
  55: [3, 5, 6, 8, 8, 5],
  56: [3, 5, 6, 8, 8, 5],
  57: [3, 6, 6, 8, 8, 5],
  58: [3, 6, 6, 8, 8, 5],
  59: [3, 6, 6, 8, 8, 5],
  60: [3, 6, 6, 8, 8, 5],
  61: [3, 6, 6, 8, 8, 5],
  62: [3, 6, 6, 8, 8, 5],
  63: [3, 6, 6, 8, 10, 5],
  64: [3, 6, 6, 8, 10, 6],
  65: [3, 6, 6, 8, 10, 6],
  66: [3, 6, 6, 8, 10, 6],
  67: [3, 6, 6, 8, 10, 6],
  68: [3, 6, 6, 8, 10, 6],
  69: [3, 6, 6, 8, 10, 6],
  70: [3, 8, 6, 8, 11, 7],
};

export class Rebellion extends Gunslinger {
  protected override CLASS_NAME = ClassName.Rebellion;
  protected override JobBonusTable = jobBonusTable;
  protected override initialStatusPoint = 48;

  private readonly classNames2nd = [ClassName.Rebellion];
  private readonly atkSkillList2nd: AtkSkillModel[] = [
    {
      label: 'Expurgar Lv10',
      name: 'RL_R_TRIP',
      value: 'RL_R_TRIP==10',
      acd: 1,
      fct: 0,
      vct: 0,
      cd: 1,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (skillLevel * 200 + 500) * (baseLevel / 100);
      },
    },
    {
      label: 'Descarregar Tambor Lv10',
      name: 'RL_FIREDANCE',
      value: 'RL_FIREDANCE==10',
      acd: 0.5,
      fct: 0,
      vct: 0,
      cd: 0,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const desperadoLv = this.learnLv('GS_DESPERADO');

        return (skillLevel * 100 + 200 + desperadoLv * 20) * (baseLevel / 100);
      },
    },
    {
      label: 'Disparo Perfurante Lv10',
      name: 'LG_CANNONSPEAR',
      value: 'LG_CANNONSPEAR==10',
      acd: 0.4,
      fct: 0.7,
      vct: 1,
      cd: 1.6,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (skillLevel * 100 + 1500) * (baseLevel / 100);
      },
    },
    {
      label: 'Lançar Míssil Lv10',
      name: 'RL_D_TAIL',
      value: 'RL_D_TAIL==10',
      acd: 1,
      fct: 0,
      vct: 3,
      cd: 3.5,
      element: ElementType.Neutral,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const crimsonMarker = this.bonuses.activeSkillNames.has('Crimson Marker') ? 2 : 1;

        return crimsonMarker * (skillLevel * 200 + 500) * (baseLevel / 100);
      },
    },
    {
      label: 'Execução Lv10 (0 coin)',
      name: 'RL_HAMMER_OF_GOD',
      value: 'RL_HAMMER_OF_GOD_0==10',
      acd: 0.5,
      fct: 0,
      vct: 0,
      cd: 20,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const crimsonMarker = this.bonuses.activeSkillNames.has('Crimson Marker') ? 450 : 150;

        return (skillLevel * 100 + crimsonMarker * 0) * (baseLevel / 100);
      },
    },
    {
      label: 'Execução Lv10 (10 coins)',
      name: 'RL_HAMMER_OF_GOD',
      value: 'RL_HAMMER_OF_GOD==10',
      acd: 0.5,
      fct: 0,
      vct: 0,
      cd: 20,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const crimsonMarker = this.bonuses.activeSkillNames.has('Crimson Marker') ? 450 : 150;

        return (skillLevel * 100 + crimsonMarker * 10) * (baseLevel / 100);
      },
    },
    {
      label: 'Rajada Estilhaçante Lv5',
      name: 'RL_S_STORM',
      value: 'RL_S_STORM==5',
      acd: 0,
      fct: 1,
      vct: 1,
      cd: 2,
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel } = input;

        return 1700 + skillLevel * 200;
      },
    },
  ];

  private readonly activeSkillList2nd: ActiveSkillModel[] = [
    {
      isEquipAtk: true,
      inputType: 'selectButton',
      label: 'Platinum Altar 10',
      name: 'RL_P_ALTER',
      dropdown: [
        { label: 'Yes', value: 1, isUse: true, bonus: { atk: 150 } },
        { label: 'No', value: 0, isUse: false },
      ],
    },
    {
      inputType: 'selectButton',
      label: 'Hot Barrel 5',
      name: 'RL_HEAT_BARREL',
      isEquipAtk: true,
      dropdown: [
        { label: 'Yes', value: 5, isUse: true, bonus: { flatDmg: 160, aspd: 5 } },
        { label: 'No', value: 0, isUse: false },
      ],
    },
    {
      isMasteryAtk: true,
      inputType: 'selectButton',
      label: 'Farta Fortuna',
      name: 'RL_RICHS_COIN',
      dropdown: [
        { label: 'Yes', value: 1, isUse: true, bonus: { atk: 30 } },
        { label: 'No', value: 0, isUse: false },
      ],
    },
    {
      label: 'Rajada Estilhaçante',
      name: 'RL_S_STORM',
      inputType: 'selectButton',
      dropdown: [
        { label: 'Yes', value: 1, isUse: true },
        { label: 'No', value: 0, isUse: false },
      ],
    },
    {
      label: 'Marcar em Brasa',
      name: 'RL_C_MARKER',
      inputType: 'selectButton',
      dropdown: [
        { label: 'Yes', value: 1, isUse: true },
        { label: 'No', value: 0, isUse: false },
      ],
    },
  ];

  private readonly passiveSkillList2nd: PassiveSkillModel[] = [
    {
      inputType: 'dropdown',
      label: 'Desperado',
      name: 'GS_DESPERADO',
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
      label: 'Ignição',
      name: 'RL_FLICKER',
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
      label: 'Saque Rápido',
      name: 'RL_QD_SHOT',
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
      isEquipAtk: true,
      inputType: 'dropdown',
      label: 'Olhos de Serpente',
      name: 'GS_SNAKEEYE',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true, bonus: { hit: 1 } },
        { label: 'Lv 2', value: 2, isUse: true, bonus: { hit: 2 } },
        { label: 'Lv 3', value: 3, isUse: true, bonus: { hit: 3 } },
        { label: 'Lv 4', value: 4, isUse: true, bonus: { hit: 4 } },
        { label: 'Lv 5', value: 5, isUse: true, bonus: { hit: 5 } },
        { label: 'Lv 6', value: 6, isUse: true, bonus: { hit: 6 } },
        { label: 'Lv 7', value: 7, isUse: true, bonus: { hit: 7 } },
        { label: 'Lv 8', value: 8, isUse: true, bonus: { hit: 8 } },
        { label: 'Lv 9', value: 9, isUse: true, bonus: { hit: 9 } },
        { label: 'Lv 10', value: 10, isUse: true, bonus: { hit: 10 } },
      ],
    },
    {
      isEquipAtk: true,
      inputType: 'dropdown',
      label: 'Ataque Concentrado',
      name: 'GS_SINGLEACTION',
      dropdown: [
        { label: '-', value: 0, isUse: false },
        { label: 'Lv 1', value: 1, isUse: true, bonus: { hit: 1 * 2, skillAspd: 1 } },
        { label: 'Lv 2', value: 2, isUse: true, bonus: { hit: 2 * 2, skillAspd: 1 } },
        { label: 'Lv 3', value: 3, isUse: true, bonus: { hit: 3 * 2, skillAspd: 2 } },
        { label: 'Lv 4', value: 4, isUse: true, bonus: { hit: 4 * 2, skillAspd: 2 } },
        { label: 'Lv 5', value: 5, isUse: true, bonus: { hit: 5 * 2, skillAspd: 3 } },
        { label: 'Lv 6', value: 6, isUse: true, bonus: { hit: 6 * 2, skillAspd: 3 } },
        { label: 'Lv 7', value: 7, isUse: true, bonus: { hit: 7 * 2, skillAspd: 4 } },
        { label: 'Lv 8', value: 8, isUse: true, bonus: { hit: 8 * 2, skillAspd: 4 } },
        { label: 'Lv 9', value: 9, isUse: true, bonus: { hit: 9 * 2, skillAspd: 5 } },
        { label: 'Lv 10', value: 10, isUse: true, bonus: { hit: 10 * 2, skillAspd: 5 } },
      ],
    },
    {
      label: 'Reação em Cadeia',
      name: 'GS_CHAINACTION',
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
      name: 'RL_P_ALTER',
      label: 'Proteção de Platina',
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
      name: 'RL_HEAT_BARREL',
      label: 'Furor',
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
      name: 'RL_FIRE_RAIN',
      label: 'Disparo Labareda',
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
}
