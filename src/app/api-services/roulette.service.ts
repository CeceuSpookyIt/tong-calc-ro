import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface RoulettePrizeRow {
  id: string;
  created_at: string;
  event_slug: string;
  date: string;
  spins: number;
  prizes: string[];
}

@Injectable({ providedIn: 'root' })
export class RouletteService {
  constructor(private supabaseService: SupabaseService) {}

  getPrizes(eventSlug?: string): Observable<RoulettePrizeRow[]> {
    let query = this.supabaseService.client
      .from('roulette_prizes')
      .select('*')
      .order('date', { ascending: true });

    if (eventSlug) {
      query = query.eq('event_slug', eventSlug);
    }

    return from(query).pipe(
      map((res) => {
        if (res.error) throw res.error;
        return (res.data ?? []) as RoulettePrizeRow[];
      })
    );
  }
}
