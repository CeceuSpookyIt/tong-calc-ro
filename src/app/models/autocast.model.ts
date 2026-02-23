export type AutocastTrigger = 'onhit' | 'onhurt' | 'onskill';

export interface AutocastEntry {
  skillName: string;
  skillLevel: number;
  chancePercent: number;
  trigger: AutocastTrigger;
  sourceItemName: string;
  useLearned?: boolean;
}

export interface AutocastDamageSummary {
  skillName: string;
  skillLevel: number;
  chancePercent: number;
  trigger: AutocastTrigger;
  sourceItemName: string;
  minDamage: number;
  maxDamage: number;
  avgDamage: number;
  dps: number;
  isMatk: boolean;
  element: string;
}
