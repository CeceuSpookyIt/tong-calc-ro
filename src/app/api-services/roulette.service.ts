import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface RouletteHistoryRow {
  id: string;
  created_at: string;
  event_slug: string;
  account_hash: string;
  prize_date: string;
  prize_time: string;
  item: string;
  qty: number;
}

export interface RouletteEvent {
  slug: string;
  name: string;
  jackpot_items: string[];
  rare_items: string[];
}

@Injectable({ providedIn: 'root' })
export class RouletteService {
  private cache = new Map<string, RouletteHistoryRow[]>();

  constructor(private supabaseService: SupabaseService) {}

  getEvents(): Observable<RouletteEvent[]> {
    return from(this.fetchEvents());
  }

  getHistory(eventSlug: string): Observable<RouletteHistoryRow[]> {
    const cached = this.cache.get(eventSlug);
    if (cached) return of(cached);
    return from(this.fetchAllRows(eventSlug));
  }

  private async fetchEvents(): Promise<RouletteEvent[]> {
    const { data, error } = await this.supabaseService.client
      .from('roulette_events')
      .select('slug, name, jackpot_items, rare_items')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as RouletteEvent[];
  }

  private async fetchAllRows(eventSlug: string): Promise<RouletteHistoryRow[]> {
    const PAGE_SIZE = 1000;
    const all: RouletteHistoryRow[] = [];
    let offset = 0;
    let done = false;

    while (!done) {
      const { data, error } = await this.supabaseService.client
        .from('roulette_history')
        .select('*')
        .eq('event_slug', eventSlug)
        .order('prize_date', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;

      const rows = (data ?? []) as RouletteHistoryRow[];
      all.push(...rows);

      if (rows.length < PAGE_SIZE) {
        done = true;
      } else {
        offset += PAGE_SIZE;
      }
    }

    this.cache.set(eventSlug, all);
    return all;
  }
}
