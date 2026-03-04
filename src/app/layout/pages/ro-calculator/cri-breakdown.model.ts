export interface CriBreakdownEntry {
  source: string;
  slot: string;
  value: number;
}

export interface LukBreakdownEntry {
  source: string;
  value: number;
  detail?: string;
}

export type CriBreakdownContext = 'status' | 'basic' | 'skill';

export interface CriBreakdown {
  base: number;
  equipEntries: CriBreakdownEntry[];
  equipTotal: number;
  lukBreakdown: {
    baseLuk: number;
    jobLuk: number;
    entries: LukBreakdownEntry[];
    totalLuk: number;
    criFromLuk: number;
    formula: string;
  };
  extraCriToMonster: number;
  skillBaseCri: number;
  skillBaseCriPercentage: number;
  criShield: number;
  total: number;
  isKatar: boolean;
  context: CriBreakdownContext;
}
