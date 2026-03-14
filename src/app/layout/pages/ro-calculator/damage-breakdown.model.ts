export interface DamageStep {
  label: string;
  operation?: string;
  result: number;
  color?: 'green' | 'red' | 'yellow' | 'white' | 'muted';
}

export interface DamageBreakdown {
  title: string;
  steps: DamageStep[];
  minDamage: number;
  maxDamage: number;
  dps?: number;
  dpsLabel?: string;
  extraInfo?: string;
}
