import { ElementType } from './element-type.const';

export interface AutocastSkillDef {
  name: string;
  isMatk: boolean;
  isMelee: boolean;
  element: ElementType;
  hit: number;
  totalHit: number;
  formula: (params: { skillLevel: number; baseLevel: number; str?: number }) => number;
}

export const AUTOCAST_SKILL_REGISTRY: Record<string, AutocastSkillDef> = {
  'Fire Bolt': {
    name: 'Fire Bolt',
    isMatk: true,
    isMelee: false,
    element: ElementType.Fire,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel }) => skillLevel * 100,
  },
  'Cold Bolt': {
    name: 'Cold Bolt',
    isMatk: true,
    isMelee: false,
    element: ElementType.Water,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel }) => skillLevel * 100,
  },
  'Lightening Bolt': {
    name: 'Lightening Bolt',
    isMatk: true,
    isMelee: false,
    element: ElementType.Wind,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel }) => skillLevel * 100,
  },
  'Fire Ball': {
    name: 'Fire Ball',
    isMatk: true,
    isMelee: false,
    element: ElementType.Fire,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel }) => 70 + skillLevel * 10,
  },
  'Soul Strike': {
    name: 'Soul Strike',
    isMatk: true,
    isMelee: false,
    element: ElementType.Ghost,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel }) => {
      const hits = Math.floor((skillLevel + 1) / 2);
      return hits * 100;
    },
  },
  'Frost Nova': {
    name: 'Frost Nova',
    isMatk: true,
    isMelee: false,
    element: ElementType.Water,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel }) => 110 + skillLevel * 10,
  },
  'Meteor Storm': {
    name: 'Meteor Storm',
    isMatk: true,
    isMelee: false,
    element: ElementType.Fire,
    hit: 2,
    totalHit: 2,
    formula: () => 125,
  },
  'Lord of Vermilion': {
    name: 'Lord of Vermilion',
    isMatk: true,
    isMelee: false,
    element: ElementType.Wind,
    hit: 1,
    totalHit: 4,
    formula: () => 250,
  },
  'Storm Gust': {
    name: 'Storm Gust',
    isMatk: true,
    isMelee: false,
    element: ElementType.Water,
    hit: 1,
    totalHit: 3,
    formula: () => 200,
  },
  'Jupitel Thunder': {
    name: 'Jupitel Thunder',
    isMatk: true,
    isMelee: false,
    element: ElementType.Wind,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel }) => skillLevel * 100,
  },
  'Bash': {
    name: 'Bash',
    isMatk: false,
    isMelee: true,
    element: ElementType.Neutral,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel }) => 100 + skillLevel * 30,
  },
  'Sonic Blow': {
    name: 'Sonic Blow',
    isMatk: false,
    isMelee: true,
    element: ElementType.Neutral,
    hit: 1,
    totalHit: 8,
    formula: ({ skillLevel }) => skillLevel * 50,
  },
  'Bowling Bash': {
    name: 'Bowling Bash',
    isMatk: false,
    isMelee: true,
    element: ElementType.Neutral,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel }) => 100 + skillLevel * 40,
  },
  'Double Strafe': {
    name: 'Double Strafe',
    isMatk: false,
    isMelee: false,
    element: ElementType.Neutral,
    hit: 1,
    totalHit: 2,
    formula: ({ skillLevel }) => 90 + skillLevel * 10,
  },
  'Heal': {
    name: 'Heal',
    isMatk: true,
    isMelee: false,
    element: ElementType.Holy,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel, baseLevel }) => skillLevel * 10 * (baseLevel / 100),
  },
  'Sonic Wave': {
    name: 'Sonic Wave',
    isMatk: false,
    isMelee: false,
    element: ElementType.Neutral,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel, baseLevel }) => (1050 + skillLevel * 150) * (baseLevel / 100),
  },
  'Runic Explosion': {
    name: 'Runic Explosion',
    isMatk: false,
    isMelee: true,
    element: ElementType.Neutral,
    hit: 1,
    totalHit: 1,
    formula: ({ skillLevel, baseLevel, str }) => (skillLevel + (str || 0) / 8) * 140 * (baseLevel / 100),
  },
};
