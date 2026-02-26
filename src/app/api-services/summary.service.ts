import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { SkillRankingEntry } from '../layout/pages/preset-summary/model/skill-ranking.model';
import { SlotRankingEntry } from '../layout/pages/preset-summary/model/slot-ranking.model';

@Injectable({ providedIn: 'root' })
export class SummaryService {
  constructor(private supabaseService: SupabaseService) {}

  getSkillRanking(classId: number, forceRefresh = false): Observable<SkillRankingEntry[]> {
    return from(
      this.supabaseService.client.rpc('get_skill_ranking', {
        p_class_id: classId,
        p_ttl_minutes: 30,
        p_force_refresh: forceRefresh,
      })
    ).pipe(
      map((res) => {
        if (res.error) throw res.error;
        return (res.data ?? []) as SkillRankingEntry[];
      })
    );
  }

  getItemRanking(classId: number, skillName: string, forceRefresh = false): Observable<SlotRankingEntry[]> {
    return from(
      this.supabaseService.client.rpc('get_item_ranking', {
        p_class_id: classId,
        p_skill_name: skillName,
        p_ttl_minutes: 30,
        p_force_refresh: forceRefresh,
      })
    ).pipe(
      map((res) => {
        if (res.error) throw res.error;
        return (res.data ?? []) as SlotRankingEntry[];
      })
    );
  }
}
