import { Component, OnInit } from '@angular/core';
import { RouletteService, RouletteHistoryRow, RouletteEvent } from '../../../api-services/roulette.service';

interface PrizeRanking {
  item: string;
  quantity: number;
  percentage: number;
  tier: 'jackpot' | 'rare' | 'common';
  rateLo: number;
  rateHi: number;
}

interface LuckEntry {
  hash: string;
  spins: number;
  rares: number;
  rarePct: number;
  items: string;
  expected?: number;
}

interface ProbTier {
  name: string;
  desc: string;
  color: string;
  rate: number;
  note: string | null;
  cards: { spins: number; prob: number }[];
}


@Component({
  selector: 'app-oval',
  templateUrl: './oval.component.html',
  styleUrls: ['./oval.component.css'],
})
export class OvalComponent implements OnInit {
  ranking: PrizeRanking[] = [];
  totalSpins = 0;
  totalAccounts = 0;
  totalDays = 0;
  isLoading = true;

  // Existing
  pieData: any;
  pieOptions: any;

  // Trend chart
  trendData: any;
  trendOptions: any;

  // Luck
  luckyAccounts: LuckEntry[] = [];
  unluckyAccounts: LuckEntry[] = [];
  probTiers: ProbTier[] = [];

  // Tabs per event
  events: RouletteEvent[] = [];
  activeTabIndex = 0;
  isLoadingTab = false;

  // Current event tiers (from DB)
  private jackpotItems: string[] = [];
  private rareItems = new Set<string>();

  constructor(private rouletteService: RouletteService) {}

  ngOnInit(): void {
    this.rouletteService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        if (events.length > 0) {
          this.activeTabIndex = 0;
          this.loadEvent(events[this.activeTabIndex]);
        } else {
          this.isLoading = false;
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onTabChange(event: any): void {
    this.activeTabIndex = event.index;
    this.loadEvent(this.events[this.activeTabIndex]);
  }

  private loadEvent(ev: RouletteEvent): void {
    this.jackpotItems = ev.jackpot_items ?? [];
    this.rareItems = new Set(ev.rare_items ?? []);
    this.isLoadingTab = true;
    this.rouletteService.getHistory(ev.slug).subscribe({
      next: (rows) => {
        this.processData(rows);
        this.isLoading = false;
        this.isLoadingTab = false;
      },
      error: () => {
        this.isLoading = false;
        this.isLoadingTab = false;
      },
    });
  }

  private processData(rows: RouletteHistoryRow[]): void {
    const counts: Record<string, number> = {};

    this.totalSpins = rows.length;
    this.totalAccounts = new Set(rows.map(r => r.account_hash)).size;
    this.totalDays = new Set(rows.map(r => r.prize_date)).size;

    for (const row of rows) {
      const item = row.item.trim();
      if (!item) continue;
      counts[item] = (counts[item] || 0) + 1;
    }

    const totalQty = Object.values(counts).reduce((s, v) => s + v, 0);

    // Build ranking with tiers and CI
    const droppedRanking: PrizeRanking[] = Object.entries(counts)
      .map(([item, quantity]) => {
        const p = totalQty > 0 ? quantity / totalQty : 0;
        const [lo, hi] = this.wilsonCI(p, totalQty);
        const tier = this.rareItems.has(item) ? 'rare' as const : 'common' as const;
        return { item, quantity, percentage: p * 100, tier, rateLo: lo * 100, rateHi: hi * 100 };
      })
      .sort((a, b) => b.quantity - a.quantity);

    // Add jackpot/rare items with 0 drops
    const [, zeroHi] = this.wilsonCI(0, totalQty);
    const jackpotZero: PrizeRanking[] = this.jackpotItems
      .filter(item => !counts[item])
      .map(item => ({ item, quantity: 0, percentage: 0, tier: 'jackpot' as const, rateLo: 0, rateHi: zeroHi * 100 }));
    const rareZero: PrizeRanking[] = [...this.rareItems]
      .filter(item => !counts[item])
      .map(item => ({ item, quantity: 0, percentage: 0, tier: 'rare' as const, rateLo: 0, rateHi: zeroHi * 100 }));

    this.ranking = [...jackpotZero, ...rareZero, ...droppedRanking.filter(r => r.tier === 'rare'), ...droppedRanking.filter(r => r.tier === 'common')];

    // Trend chart
    this.buildTrendChart(rows);

    // Luck leaderboard
    this.buildLuckData(rows, totalQty);

    // Pie chart
    this.buildPieChart(droppedRanking);
  }

  private buildTrendChart(rows: RouletteHistoryRow[]): void {
    const dayMap = new Map<string, { spins: number; accounts: Set<string> }>();

    for (const row of rows) {
      const d = row.prize_date;
      if (!dayMap.has(d)) dayMap.set(d, { spins: 0, accounts: new Set() });
      const entry = dayMap.get(d)!;
      entry.spins++;
      entry.accounts.add(row.account_hash);
    }

    // Sort by date (DD-MM-YYYY → parse)
    const sorted = [...dayMap.entries()].sort((a, b) => {
      const [da, ma, ya] = a[0].split('-').map(Number);
      const [db, mb, yb] = b[0].split('-').map(Number);
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
    });

    const labels = sorted.map(([d]) => {
      const parts = d.split('-');
      return `${parts[0]}/${parts[1]}`;
    });
    const spinsData = sorted.map(([, v]) => v.spins);
    const accountsData = sorted.map(([, v]) => v.accounts.size);

    this.trendData = {
      labels,
      datasets: [
        {
          label: 'Spins',
          data: spinsData,
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54,162,235,0.1)',
          fill: true,
          tension: 0.3,
          yAxisID: 'y',
          pointRadius: 4,
        },
        {
          label: 'Contas únicas',
          data: accountsData,
          borderColor: '#4BC0C0',
          backgroundColor: 'rgba(75,192,192,0.1)',
          fill: true,
          tension: 0.3,
          yAxisID: 'y1',
          pointRadius: 4,
        },
      ],
    };

    this.trendOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#ccc' } },
        tooltip: {
          callbacks: {
            afterBody: (ctx: any[]) => {
              const i = ctx[0].dataIndex;
              const ratio = accountsData[i] > 0 ? (spinsData[i] / accountsData[i]).toFixed(1) : '—';
              return `Spins/conta: ${ratio}`;
            },
          },
        },
      },
      scales: {
        x: { ticks: { color: '#999' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Spins', color: '#36A2EB' },
          ticks: { color: '#36A2EB' },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Contas', color: '#4BC0C0' },
          ticks: { color: '#4BC0C0' },
          grid: { drawOnChartArea: false },
        },
      },
    };
  }

  private buildLuckData(rows: RouletteHistoryRow[], totalQty: number): void {
    // Per-account stats
    const accountMap = new Map<string, { spins: number; rares: number; rareItems: Record<string, number> }>();

    for (const row of rows) {
      const h = row.account_hash;
      if (!accountMap.has(h)) accountMap.set(h, { spins: 0, rares: 0, rareItems: {} });
      const acc = accountMap.get(h)!;
      acc.spins++;
      if (this.rareItems.has(row.item.trim())) {
        acc.rares++;
        const item = row.item.trim();
        acc.rareItems[item] = (acc.rareItems[item] || 0) + 1;
      }
    }

    const rareRate = [...accountMap.values()].reduce((s, a) => s + a.rares, 0) / totalQty;

    // Lucky: most rares proportionally (min 3 rares)
    this.luckyAccounts = [...accountMap.entries()]
      .filter(([, a]) => a.rares >= 2)
      .map(([hash, a]) => ({
        hash: hash.slice(0, 8),
        spins: a.spins,
        rares: a.rares,
        rarePct: (a.rares / a.spins) * 100,
        items: Object.entries(a.rareItems).map(([item, count]) => `${count}x ${this.shortItemName(item)}`).join(', '),
      }))
      .sort((a, b) => b.rarePct - a.rarePct || b.rares - a.rares)
      .slice(0, 5);

    // Unlucky: most spins with 0 rares
    this.unluckyAccounts = [...accountMap.entries()]
      .filter(([, a]) => a.rares === 0 && a.spins >= 10)
      .map(([hash, a]) => ({
        hash: hash.slice(0, 8),
        spins: a.spins,
        rares: 0,
        rarePct: 0,
        items: '',
        expected: +(a.spins * rareRate).toFixed(1),
      }))
      .sort((a, b) => b.spins - a.spins)
      .slice(0, 5);

    // Probability tiers (Jackpot + Rare only)
    const [, jackpotUpper] = this.wilsonCI(0, totalQty);
    const spinSteps = [1, 5, 10, 15, 20, 30, 50];

    this.probTiers = [];
    if (this.jackpotItems.length > 0) {
      this.probTiers.push({
        name: 'Jackpot',
        desc: this.jackpotItems.map(i => this.shortItemName(i)).join(', '),
        color: '#FF6384',
        rate: jackpotUpper,
        note: 'estimativa (0 drops)',
        cards: spinSteps.map(n => ({ spins: n, prob: (1 - Math.pow(1 - jackpotUpper, n)) * 100 })),
      });
    }
    if (this.rareItems.size > 0) {
      this.probTiers.push({
        name: 'Raro',
        desc: [...this.rareItems].map(i => this.shortItemName(i)).join(', '),
        color: '#FFCE56',
        rate: rareRate,
        note: null,
        cards: spinSteps.map(n => ({ spins: n, prob: (1 - Math.pow(1 - rareRate, n)) * 100 })),
      });
    }
  }

  private buildPieChart(droppedRanking: PrizeRanking[]): void {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#C9CBCF', '#7BC8A4', '#E7E9ED', '#F7464A',
      '#46BFBD', '#FDB45C', '#949FB1', '#4D5360', '#AC64AD',
    ];

    this.pieData = {
      labels: droppedRanking.map(r => r.item),
      datasets: [{
        data: droppedRanking.map(r => r.quantity),
        backgroundColor: droppedRanking.map((_, i) => colors[i % colors.length]),
      }],
    };

    this.pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { color: '#ccc', boxWidth: 10, padding: 6, font: { size: 11 } } },
      },
    };
  }

  private shortItemName(item: string): string {
    // "100x Blacksmith Blessing" → "100xBSB"
    const bsb = item.match(/^(\d+)x\s+Blacksmith Blessing$/i);
    if (bsb) return `${bsb[1]}xBSB`;
    // "[Costume] Xyz" → "Costume"
    if (item.startsWith('[Costume]')) return 'Costume';
    return item;
  }

  private wilsonCI(p: number, n: number, z = 1.96): [number, number] {
    if (n === 0) return [0, 0];
    const d = 1 + (z * z) / n;
    const center = (p + (z * z) / (2 * n)) / d;
    const margin = (z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n)) / d;
    return [Math.max(0, center - margin), Math.min(1, center + margin)];
  }

  tierClass(tier: string): string {
    return tier === 'jackpot' ? 'tier-jackpot' : tier === 'rare' ? 'tier-rare' : 'tier-common';
  }

  tierLabel(tier: string): string {
    return tier === 'jackpot' ? 'Jackpot' : tier === 'rare' ? 'Raro' : 'Comum';
  }

  tierColor(tier: string): string {
    return tier === 'jackpot' ? '#FF6384' : tier === 'rare' ? '#FFCE56' : '#36A2EB';
  }

  probColor(prob: number): string {
    return prob > 80 ? '#4BC0C0' : prob > 50 ? '#FFCE56' : '#FF6384';
  }

  formatProb(prob: number): string {
    return prob < 1 ? prob.toFixed(1) : Math.round(prob).toString();
  }

  get medals(): string[] {
    return ['🥇', '🥈', '🥉', '4.', '5.'];
  }
}
