import { Component, OnInit } from '@angular/core';
import { RouletteService, RoulettePrizeRow } from '../../../api-services/roulette.service';

interface PrizeRanking {
  item: string;
  quantity: number;
  percentage: number;
}

interface DailyPrize {
  date: string;
  items: Record<string, number>;
  totalSpins: number;
}

@Component({
  selector: 'app-oval',
  templateUrl: './oval.component.html',
  styleUrls: ['./oval.component.css'],
})
export class OvalComponent implements OnInit {
  ranking: PrizeRanking[] = [];
  dailyData: DailyPrize[] = [];
  totalSpins = 0;
  totalSubmissions = 0;
  isLoading = true;

  constructor(private rouletteService: RouletteService) {}

  ngOnInit(): void {
    this.rouletteService.getPrizes().subscribe({
      next: (rows) => {
        this.totalSubmissions = rows.length;
        this.processData(rows);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private processData(rows: RoulettePrizeRow[]): void {
    const totals: Record<string, number> = {};
    const dailyMap: Record<string, { items: Record<string, number>; totalSpins: number }> = {};
    let totalQty = 0;

    for (const row of rows) {
      this.totalSpins += row.spins;

      if (!dailyMap[row.date]) {
        dailyMap[row.date] = { items: {}, totalSpins: 0 };
      }
      dailyMap[row.date].totalSpins += row.spins;

      for (const prize of row.prizes) {
        const m = prize.match(/^(\d+)\s*x\s*(.+)$/i);
        if (m) {
          const qty = parseInt(m[1]);
          const item = m[2].trim();
          totals[item] = (totals[item] || 0) + qty;
          dailyMap[row.date].items[item] = (dailyMap[row.date].items[item] || 0) + qty;
          totalQty += qty;
        }
      }
    }

    this.ranking = Object.entries(totals)
      .map(([item, quantity]) => ({
        item,
        quantity,
        percentage: totalQty > 0 ? (quantity / totalQty) * 100 : 0,
      }))
      .sort((a, b) => b.quantity - a.quantity);

    this.dailyData = Object.entries(dailyMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
