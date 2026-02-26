export interface SlotRankingEntry {
  slot: string;
  type: 'item' | 'card';
  item_id: number;
  use_count: number;
  rank: number;
  itemName?: string;
}

export interface SlotRankingGroup {
  slot: string;
  slotLabel: string;
  category: 'equipment' | 'shadow' | 'costume';
  items: SlotRankingEntry[];
  cards: SlotRankingEntry[];
  totalBuilds: number;
}
