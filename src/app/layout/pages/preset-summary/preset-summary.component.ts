import { Component, OnInit } from '@angular/core';
import { getClassDropdownList } from '../../../jobs/_class-list';
import { SummaryService } from 'src/app/api-services/summary.service';
import { RoService } from 'src/app/api-services/ro.service';
import { ItemModel } from '../../../models/item.model';
import { SkillRankingEntry } from './model/skill-ranking.model';
import { SlotRankingEntry, SlotRankingGroup } from './model/slot-ranking.model';
import { prettyItemDesc } from 'src/app/utils';

interface SlotConfig {
  slot: string;
  label: string;
  category: 'equipment' | 'shadow' | 'costume';
}

const SLOT_CONFIG: SlotConfig[] = [
  { slot: 'weapon', label: 'Arma', category: 'equipment' },
  { slot: 'leftWeapon', label: 'Arma Esquerda', category: 'equipment' },
  { slot: 'shield', label: 'Escudo', category: 'equipment' },
  { slot: 'headUpper', label: 'Topo', category: 'equipment' },
  { slot: 'headMiddle', label: 'Meio', category: 'equipment' },
  { slot: 'headLower', label: 'Baixo', category: 'equipment' },
  { slot: 'armor', label: 'Armadura', category: 'equipment' },
  { slot: 'garment', label: 'Capa', category: 'equipment' },
  { slot: 'boot', label: 'Sapato', category: 'equipment' },
  { slot: 'accLeft', label: 'Acessório Esq.', category: 'equipment' },
  { slot: 'accRight', label: 'Acessório Dir.', category: 'equipment' },
  { slot: 'ammo', label: 'Munição', category: 'equipment' },
  { slot: 'pet', label: 'Pet', category: 'equipment' },
  { slot: 'shadowWeapon', label: 'Shadow Arma', category: 'shadow' },
  { slot: 'shadowArmor', label: 'Shadow Armadura', category: 'shadow' },
  { slot: 'shadowShield', label: 'Shadow Escudo', category: 'shadow' },
  { slot: 'shadowBoot', label: 'Shadow Sapato', category: 'shadow' },
  { slot: 'shadowEarring', label: 'Shadow Brinco', category: 'shadow' },
  { slot: 'shadowPendant', label: 'Shadow Colar', category: 'shadow' },
  { slot: 'costumeEnchantUpper', label: 'Costume Topo', category: 'costume' },
  { slot: 'costumeEnchantMiddle', label: 'Costume Meio', category: 'costume' },
  { slot: 'costumeEnchantLower', label: 'Costume Baixo', category: 'costume' },
  { slot: 'costumeEnchantGarment', label: 'Costume Capa', category: 'costume' },
];

const CATEGORY_LABELS: Record<string, string> = {
  equipment: 'Equipamento',
  shadow: 'Shadow',
  costume: 'Costume',
};

@Component({
  selector: 'app-preset-summary',
  templateUrl: './preset-summary.component.html',
  styleUrls: ['./preset-summary.component.css'],
})
export class PresetSummaryComponent implements OnInit {
  allClasses = getClassDropdownList();
  selectedJobId: number;
  selectedSkillName: string;
  selectedItemId: number;
  displaySelectedItem: { id: number; name: string; desc: string } | null = null;

  skillRankings: SkillRankingEntry[] = [];
  slotGroups: SlotRankingGroup[] = [];
  totalBuilds = 0;

  itemMap: Record<string, ItemModel> = {};
  isLoading = false;

  categories = ['equipment', 'shadow', 'costume'];
  categoryLabels = CATEGORY_LABELS;

  constructor(
    private readonly summaryService: SummaryService,
    private readonly roService: RoService,
  ) {}

  ngOnInit(): void {
    this.selectedJobId = this.allClasses[0]?.value as number;
    this.roService.getItems<Record<string, ItemModel>>().subscribe((items) => {
      this.itemMap = items;
      this.loadSkillRanking();
    });
  }

  onJobChange(): void {
    this.skillRankings = [];
    this.slotGroups = [];
    this.selectedSkillName = null;
    this.loadSkillRanking();
  }

  onSkillChange(): void {
    this.slotGroups = [];
    if (this.selectedSkillName) {
      this.loadItemRanking();
    }
  }

  onItemClick(itemId: number): void {
    this.selectedItemId = itemId;
    const item = this.itemMap[itemId];
    if (item) {
      this.displaySelectedItem = {
        id: itemId,
        name: item.name,
        desc: prettyItemDesc(item.description),
      };
    }
  }

  getGroupsByCategory(category: string): SlotRankingGroup[] {
    return this.slotGroups.filter((g) => g.category === category);
  }

  private loadSkillRanking(): void {
    if (!this.selectedJobId) return;
    this.isLoading = true;
    this.summaryService.getSkillRanking(this.selectedJobId).subscribe({
      next: (data) => {
        this.skillRankings = data;
        this.isLoading = false;
        if (data.length > 0) {
          this.selectedSkillName = data[0].skill_name;
          this.loadItemRanking();
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private loadItemRanking(): void {
    if (!this.selectedJobId || !this.selectedSkillName) return;
    this.isLoading = true;

    const skillEntry = this.skillRankings.find((s) => s.skill_name === this.selectedSkillName);
    this.totalBuilds = skillEntry?.build_count ?? 0;

    this.summaryService.getItemRanking(this.selectedJobId, this.selectedSkillName).subscribe({
      next: (entries) => {
        this.slotGroups = this.buildSlotGroups(entries);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private buildSlotGroups(entries: SlotRankingEntry[]): SlotRankingGroup[] {
    for (const entry of entries) {
      const item = this.itemMap[entry.item_id];
      entry.itemName = item?.name ?? `Item #${entry.item_id}`;
    }

    const bySlot: Record<string, { items: SlotRankingEntry[]; cards: SlotRankingEntry[] }> = {};
    for (const entry of entries) {
      if (!bySlot[entry.slot]) bySlot[entry.slot] = { items: [], cards: [] };
      if (entry.type === 'item') {
        bySlot[entry.slot].items.push(entry);
      } else {
        bySlot[entry.slot].cards.push(entry);
      }
    }

    return SLOT_CONFIG
      .map((cfg) => {
        const data = bySlot[cfg.slot];
        if (!data || (data.items.length === 0 && data.cards.length === 0)) return null;
        return {
          slot: cfg.slot,
          slotLabel: cfg.label,
          category: cfg.category,
          items: data.items,
          cards: data.cards,
          totalBuilds: this.totalBuilds,
        } as SlotRankingGroup;
      })
      .filter(Boolean) as SlotRankingGroup[];
  }
}
