export type BreakdownContext = 'status' | 'basic' | 'skill';

export interface BreakdownEntry {
  source: string;
  slot?: string;
  value: number | string;
  detail?: string;
  color?: 'green' | 'red' | 'yellow' | 'white' | 'muted';
}

export interface BreakdownSection {
  label: string;
  entries: BreakdownEntry[];
  subtotal?: number;
  formula?: string;
  emptyMessage?: string;
}

export interface StatBreakdown {
  title: string;
  sections: BreakdownSection[];
  totalLabel: string;
  totalValue: string;
}
