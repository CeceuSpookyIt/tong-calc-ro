import { ElementType } from '../constants/element-type.const';
import { ClassName } from './_class-name';
import { ActiveSkillModel, AtkSkillFormulaInput, AtkSkillModel, PassiveSkillModel } from './_character-base.abstract';
import { HighWizard } from './HighWizard';

const jobBonusTable: Record<number, [number, number, number, number, number, number]> = {
  1: [0, 0, 0, 1, 0, 0],
  2: [0, 0, 0, 2, 0, 0],
  3: [0, 0, 0, 2, 1, 0],
  4: [0, 0, 0, 2, 1, 0],
  5: [0, 0, 0, 2, 1, 0],
  6: [0, 0, 0, 2, 2, 0],
  7: [0, 0, 0, 3, 2, 0],
  8: [0, 1, 0, 3, 2, 0],
  9: [0, 1, 0, 3, 2, 0],
  10: [0, 1, 0, 3, 2, 0],
  11: [0, 1, 0, 3, 2, 0],
  12: [0, 1, 0, 4, 2, 0],
  13: [0, 1, 0, 4, 3, 0],
  14: [0, 1, 0, 4, 3, 0],
  15: [0, 1, 1, 4, 3, 0],
  16: [0, 1, 1, 4, 3, 0],
  17: [0, 1, 1, 4, 3, 0],
  18: [0, 1, 2, 4, 3, 0],
  19: [0, 1, 2, 4, 4, 0],
  20: [0, 2, 2, 4, 4, 0],
  21: [0, 2, 2, 4, 4, 0],
  22: [0, 2, 2, 4, 4, 0],
  23: [0, 2, 2, 5, 4, 0],
  24: [0, 2, 3, 5, 4, 0],
  25: [0, 2, 4, 5, 4, 0],
  26: [0, 2, 4, 5, 4, 0],
  27: [0, 2, 4, 5, 4, 0],
  28: [0, 2, 4, 5, 5, 0],
  29: [0, 3, 4, 5, 5, 0],
  30: [0, 3, 4, 5, 5, 0],
  31: [0, 3, 4, 5, 5, 1],
  32: [0, 3, 4, 5, 5, 1],
  33: [0, 3, 4, 5, 5, 1],
  34: [1, 3, 4, 5, 5, 1],
  35: [1, 3, 4, 6, 5, 1],
  36: [1, 3, 4, 7, 5, 1],
  37: [1, 3, 4, 7, 5, 1],
  38: [1, 3, 4, 7, 5, 1],
  39: [1, 3, 4, 7, 6, 1],
  40: [1, 4, 4, 7, 6, 1],
  41: [1, 4, 4, 8, 6, 1],
  42: [1, 4, 4, 8, 6, 1],
  43: [1, 4, 4, 8, 6, 1],
  44: [1, 4, 4, 9, 6, 1],
  45: [1, 4, 4, 10, 6, 1],
  46: [1, 4, 4, 10, 6, 1],
  47: [1, 5, 4, 10, 6, 1],
  48: [1, 5, 4, 10, 6, 1],
  49: [1, 5, 4, 10, 6, 1],
  50: [1, 5, 4, 11, 6, 1],
  51: [1, 5, 4, 11, 7, 1],
  52: [1, 5, 5, 11, 7, 1],
  53: [1, 5, 5, 11, 7, 2],
  54: [1, 6, 5, 11, 7, 2],
  55: [1, 6, 5, 12, 7, 2],
  56: [1, 6, 5, 12, 7, 2],
  57: [1, 6, 6, 12, 7, 2],
  58: [1, 7, 6, 12, 7, 2],
  59: [1, 7, 6, 12, 8, 2],
  60: [1, 7, 6, 13, 8, 2],
  61: [1, 7, 6, 13, 8, 2],
  62: [1, 7, 6, 13, 8, 2],
  63: [1, 7, 6, 13, 8, 2],
  64: [1, 7, 6, 13, 8, 2],
  65: [1, 7, 7, 14, 8, 3],
  66: [1, 7, 7, 14, 8, 3],
  67: [1, 7, 7, 14, 8, 3],
  68: [1, 7, 7, 14, 8, 3],
  69: [1, 7, 7, 14, 8, 3],
  70: [1, 7, 8, 15, 8, 4],
};

export class Warlock extends HighWizard {
  protected override CLASS_NAME = ClassName.Warlock;
  protected override JobBonusTable = jobBonusTable;

  private readonly classNames3rd = [ClassName.Only_3rd, ClassName.Warlock];
  private readonly atkSkillList3rd: AtkSkillModel[] = [
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
      name: 'WL_CRIMSONROCK',
      label: 'Meteoro Escarlate Lv5',
      value: 'WL_CRIMSONROCK==5',
      fct: 1,
      vct: 5,
      acd: 0.5,
      cd: 5,
      isMatk: true,
      hit: 7,
      element: ElementType.Fire,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (700 + skillLevel * 600) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_JACKFROST',
      label: 'Esquife de Gelo Lv5',
      value: 'WL_JACKFROST==5',
      acd: 1,
      fct: 1,
      vct: 4,
      cd: 4,
      totalHit: 4,
      isMatk: true,
      element: ElementType.Water,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (1000 + skillLevel * 300) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_JACKFROST',
      label: 'Esquife de Gelo Lv5 (in Frost)',
      value: 'Jack Frost Frost==5',
      acd: 1,
      fct: 1,
      vct: 4,
      cd: 4,
      hit: 4,
      isMatk: true,
      element: ElementType.Water,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (1200 + skillLevel * 600) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_SOULEXPANSION',
      label: 'Impacto Espiritual Lv5',
      value: 'WL_SOULEXPANSION==5',
      acd: 0.5,
      fct: 0,
      vct: 2,
      cd: 0,
      isMatk: true,
      element: ElementType.Ghost,
      hit: 2,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const baseLevel = model.level;

        return (1000 + skillLevel * 200 + status.totalInt) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_CHAINLIGHTNING',
      label: 'Corrente Elétrica Lv5',
      value: 'WL_CHAINLIGHTNING==5',
      acd: 3,
      fct: 1,
      vct: 5.5,
      cd: 0,
      isMatk: true,
      element: ElementType.Wind,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const chainBonus = 900;

        return (500 + skillLevel * 100) * (baseLevel / 100) + chainBonus;
      },
    },
    {
      name: 'WL_EARTHSTRAIN',
      label: 'Abalo Sísmico Lv5',
      value: 'WL_EARTHSTRAIN==5',
      acd: 1,
      fct: 1,
      vct: 6,
      cd: 10,
      isMatk: true,
      hit: 10,
      element: ElementType.Earth,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (1000 + skillLevel * 600) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_FROSTMISTY',
      label: 'Zero Absoluto Lv5',
      value: 'WL_FROSTMISTY==5',
      acd: 1,
      fct: 0.5,
      vct: 4,
      cd: 10,
      isMatk: true,
      hit: 5,
      element: ElementType.Water,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (200 + skillLevel * 100) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_HELLINFERNO',
      label: 'Chamas de Hela Lv5',
      value: 'WL_HELLINFERNO==5',
      fct: 1,
      vct: 3,
      acd: 0.5,
      cd: 3,
      isMatk: true,
      element: ElementType.Fire,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return skillLevel * 400 * (baseLevel / 100);
      },
      part2: {
        label: 'Shadow Dmg',
        isIncludeMain: true,
        element: ElementType.Dark,
        isMatk: true,
        isMelee: false,
        hit: 3,
        formula: (input: AtkSkillFormulaInput): number => {
          const { model, skillLevel } = input;
          const baseLevel = model.level;

          return skillLevel * 600 * (baseLevel / 100);
        },
      },
    },
    {
      name: 'WL_DRAINLIFE',
      label: 'Drenar Vida Lv5',
      value: 'WL_DRAINLIFE==5',
      acd: 0,
      fct: 1,
      vct: 4,
      cd: 2,
      isMatk: true,
      element: ElementType.Neutral,
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const baseLevel = model.level;

        return (skillLevel * 200 + status.totalInt) * (baseLevel / 100);
      },
    },
    // {
    //   name: 'WL_TETRAVORTEX',
    //   label: 'Tetra Vortex Lv10',
    //   value: 'WL_TETRAVORTEX==10',
    //   acd: 0,
    //   fct: 1,
    //   vct: 14,
    //   cd: 15,
    //   isMatk: true,
    //   // getElement(skillValue) {

    //   // },
    //   totalHit: 4,
    //   formula: (input: AtkSkillFormulaInput): number => {
    //     const { model, skillLevel } = input;
    //     const baseLevel = model.level;

    //     return 800 + skillLevel * 400;
    //   },
    // },
    // --- Released variants ---
    {
      name: 'WL_COMET',
      label: 'Cometa Lv5 (Released)',
      value: 'Comet Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      hit: 10,
      element: ElementType.Neutral,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (2500 + skillLevel * 700) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_CRIMSONROCK',
      label: 'Meteoro Escarlate Lv5 (Released)',
      value: 'Crimson Rock Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      hit: 7,
      element: ElementType.Fire,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (700 + skillLevel * 600) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_JACKFROST',
      label: 'Esquife de Gelo Lv5 (Released)',
      value: 'Jack Frost Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      totalHit: 4,
      element: ElementType.Water,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (1000 + skillLevel * 300) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_SOULEXPANSION',
      label: 'Impacto Espiritual Lv5 (Released)',
      value: 'Soul Expansion Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      element: ElementType.Ghost,
      hit: 2,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const baseLevel = model.level;

        return (1000 + skillLevel * 200 + status.totalInt) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_CHAINLIGHTNING',
      label: 'Corrente Elétrica Lv5 (Released)',
      value: 'Chain Lightning Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      element: ElementType.Wind,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;
        const chainBonus = 900;

        return (500 + skillLevel * 100) * (baseLevel / 100) + chainBonus;
      },
    },
    {
      name: 'WL_EARTHSTRAIN',
      label: 'Abalo Sísmico Lv5 (Released)',
      value: 'Earth Strain Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      hit: 10,
      element: ElementType.Earth,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (1000 + skillLevel * 600) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_HELLINFERNO',
      label: 'Chamas de Hela Lv5 (Released)',
      value: 'Hell Inferno Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      element: ElementType.Fire,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return skillLevel * 400 * (baseLevel / 100);
      },
      part2: {
        label: 'Shadow Dmg',
        isIncludeMain: true,
        element: ElementType.Dark,
        isMatk: true,
        isMelee: false,
        hit: 3,
        formula: (input: AtkSkillFormulaInput): number => {
          const { model, skillLevel } = input;
          const baseLevel = model.level;

          return skillLevel * 600 * (baseLevel / 100);
        },
      },
    },
    {
      name: 'WL_DRAINLIFE',
      label: 'Drenar Vida Lv5 (Released)',
      value: 'Drain Life Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      element: ElementType.Neutral,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel, status } = input;
        const baseLevel = model.level;

        return (skillLevel * 200 + status.totalInt) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_FROSTMISTY',
      label: 'Zero Absoluto Lv5 (Released)',
      value: 'Frost Misty Released==5',
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      hit: 5,
      element: ElementType.Water,
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          userRepeat: { defaultRepeat: 1, maxRepeat: 7, label: 'Repetições' },
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { model, skillLevel } = input;
        const baseLevel = model.level;

        return (200 + skillLevel * 100) * (baseLevel / 100);
      },
    },
    {
      name: 'WL_TETRAVORTEX',
      label: 'Tetra Vortex Lv10 (Released)',
      value: 'WL_TETRAVORTEX Released Fire==10',
      levelList: [
        { label: 'Tetra Vortex Lv10 Released (Fogo)', value: 'WL_TETRAVORTEX Released Fire==10' },
        { label: 'Tetra Vortex Lv10 Released (Água)', value: 'WL_TETRAVORTEX Released Water==10' },
        { label: 'Tetra Vortex Lv10 Released (Vento)', value: 'WL_TETRAVORTEX Released Wind==10' },
        { label: 'Tetra Vortex Lv10 Released (Terra)', value: 'WL_TETRAVORTEX Released Earth==10' },
      ],
      acd: 0,
      fct: 0,
      vct: 0,
      cd: 0,
      isMatk: true,
      totalHit: 4,
      getElement(skillValue) {
        const map = {
          'WL_TETRAVORTEX Released Fire==10': ElementType.Fire,
          'WL_TETRAVORTEX Released Water==10': ElementType.Water,
          'WL_TETRAVORTEX Released Wind==10': ElementType.Wind,
          'WL_TETRAVORTEX Released Earth==10': ElementType.Earth,
        };
        return map[skillValue];
      },
      precastSequence: [
        {
          name: 'Memorizar', label: 'Memorizar',
          fct: 1, vct: 5, acd: 0, cd: 0,
          repeat: 1,
        },
        {
          name: 'Summon Element Ball', label: 'Invocar Esfera',
          fct: 0, vct: 2, acd: 1, cd: 0,
          repeat: 1,
        },
      ],
      formula: (input: AtkSkillFormulaInput): number => {
        const { skillLevel } = input;
        return 800 + skillLevel * 400;
      },
    },
  ];
  private readonly activeSkillList3rd: ActiveSkillModel[] = [
    {
      inputType: 'selectButton',
      label: 'Recogn Spell',
      name: 'WL_RECOGNIZEDSPELL',
      dropdown: [
        { label: 'Yes', isUse: true, value: 1, bonus: { spell_maximize: 1 } },
        { label: 'No', isUse: false, value: 0 },
      ],
    },
    {
      inputType: 'selectButton',
      label: 'Comet Amp',
      name: '_CALC_COMET_AMP',
      isDebuff: true,
      dropdown: [
        { label: 'Yes', isUse: true, value: 1, bonus: { comet: 50 } },
        { label: 'No', isUse: false, value: 0 },
      ],
    },
    {
      inputType: 'dropdown',
      label: 'Intensification',
      name: '_CALC_INTENSIFICATION',
      dropdown: [
        { label: '-', isUse: false, value: 0 },
        { label: 'Lv 1', isUse: true, value: 1, bonus: { final_ghost: 40, vct: 10 } },
        { label: 'Lv 2', isUse: true, value: 2, bonus: { final_ghost: 80, vct: 20 } },
        { label: 'Lv 3', isUse: true, value: 3, bonus: { final_ghost: 120, vct: 30 } },
        { label: 'Lv 4', isUse: true, value: 4, bonus: { final_ghost: 160, vct: 40 } },
        { label: 'Lv 5', isUse: true, value: 5, bonus: { final_ghost: 200, vct: 50 } },
      ],
    },
    {
      label: 'Lançar Magia',
      name: 'WL_RELEASE',
      inputType: 'selectButton',
      dropdown: [
        { label: 'Yes', isUse: true, value: 1, bonus: { releasedSkill: 1 } },
        { label: 'No', isUse: false, value: 0 },
      ],
    },
  ];
  protected readonly passiveSkillList3rd: PassiveSkillModel[] = [
    {
      inputType: 'dropdown',
      label: 'Estudo Arcano Avançado',
      name: 'WL_FREEZE_SP',
      isEquipAtk: true,
      dropdown: [
        { label: '-', isUse: false, value: 0 },
        { label: 'Lv 1', isUse: true, value: 1 },
        { label: 'Lv 2', isUse: true, value: 2 },
        { label: 'Lv 3', isUse: true, value: 3 },
        { label: 'Lv 4', isUse: true, value: 4 },
        { label: 'Lv 5', isUse: true, value: 5 },
        { label: 'Lv 6', isUse: true, value: 6 },
        { label: 'Lv 7', isUse: true, value: 7 },
        { label: 'Lv 8', isUse: true, value: 8 },
        { label: 'Lv 9', isUse: true, value: 9 },
        { label: 'Lv 10', isUse: true, value: 10 },
      ],
    },
    {
      inputType: 'dropdown',
      label: 'Radius',
      name: 'WL_RADIUS',
      dropdown: [
        { label: '-', isUse: false, value: 0 },
        { label: 'Lv 1', isUse: true, value: 1, bonus: { fctPercent: 10 * 1 } },
        { label: 'Lv 2', isUse: true, value: 2, bonus: { fctPercent: 10 * 2 } },
        { label: 'Lv 3', isUse: true, value: 3, bonus: { fctPercent: 10 * 3 } },
      ],
    },
    {
      inputType: 'dropdown',
      label: 'Maestria Arcana',
      name: 'WL_RECOGNIZEDSPELL',
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
      inputType: 'dropdown',
      label: 'Impacto Espiritual',
      name: 'WL_SOULEXPANSION',
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
      inputType: 'dropdown',
      label: 'Cometa',
      name: 'WL_COMET',
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
      inputType: 'dropdown',
      label: 'Corrente Elétrica',
      name: 'WL_CHAINLIGHTNING',
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
}
