import { Component, OnInit } from '@angular/core';
import { RouletteService, RouletteHistoryRow } from '../../../api-services/roulette.service';

interface PrizeRanking {
  item: string;
  quantity: number;
  percentage: number;
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
  pieData: any;
  pieOptions: any;

  constructor(private rouletteService: RouletteService) {}

  ngOnInit(): void {
    this.rouletteService.getHistory().subscribe({
      next: (rows) => {
        this.processData(rows);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private processData(rows: RouletteHistoryRow[]): void {
    const counts: Record<string, number> = {};

    this.totalSpins = rows.length;
    this.totalAccounts = new Set(rows.map(r => r.account_hash)).size;
    this.totalDays = new Set(rows.map(r => r.prize_date)).size;

    for (const row of rows) {
      // Mantém item original (ex: "5x Dark Refining Hammer") e conta ocorrências
      const item = row.item.trim();
      if (!item) continue;
      counts[item] = (counts[item] || 0) + 1;
    }

    const totalQty = Object.values(counts).reduce((s, v) => s + v, 0);

    this.ranking = Object.entries(counts)
      .map(([item, quantity]) => ({
        item,
        quantity,
        percentage: totalQty > 0 ? (quantity / totalQty) * 100 : 0,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#C9CBCF', '#7BC8A4', '#E7E9ED', '#F7464A',
      '#46BFBD', '#FDB45C', '#949FB1', '#4D5360', '#AC64AD',
    ];

    this.pieData = {
      labels: this.ranking.map(r => r.item),
      datasets: [{
        data: this.ranking.map(r => r.quantity),
        backgroundColor: this.ranking.map((_, i) => colors[i % colors.length]),
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
}
