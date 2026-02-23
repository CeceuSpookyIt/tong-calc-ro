import { Injectable } from '@angular/core';
import { Observable, from, of, shareReplay, map, catchError, switchMap } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { aggregatePresets, AggregatedSummary, PresetRow } from './summary-aggregator';

const EMPTY: AggregatedSummary = {
  totalSummary: {},
  jobSkillSummary: {},
  presetSummary: {},
  jobSummary: {},
};

@Injectable()
export class SummaryService {
  private cachedTotalSummary$: Observable<any>;
  private cachedJobSkillSummary$: Observable<any>;
  private cachedJobPresetSummary$: Observable<any>;
  private cachedJobSummary$: Observable<any>;

  constructor(private supabaseService: SupabaseService) {
    const aggregated$ = this.fetchAndAggregate().pipe(shareReplay(1));

    this.cachedTotalSummary$ = aggregated$.pipe(map((a) => a.totalSummary));
    this.cachedJobSkillSummary$ = aggregated$.pipe(map((a) => a.jobSkillSummary));
    this.cachedJobPresetSummary$ = aggregated$.pipe(map((a) => a.presetSummary));
    this.cachedJobSummary$ = aggregated$.pipe(map((a) => a.jobSummary));
  }

  private fetchAndAggregate(): Observable<AggregatedSummary> {
    return from(
      this.supabaseService.client
        .from('presets')
        .select('user_id, model, class_id')
        .eq('is_published', true),
    ).pipe(
      switchMap(({ data, error }) => {
        if (error || !data || data.length === 0) {
          return of(EMPTY);
        }
        return of(aggregatePresets(data as PresetRow[]));
      }),
      catchError(() => of(EMPTY)),
    );
  }

  getTotalSummary<T>(): Observable<T> {
    return this.cachedTotalSummary$;
  }

  getJobSkillSummary<T>(): Observable<T> {
    return this.cachedJobSkillSummary$;
  }

  getJobPresetSummary<T>(): Observable<T> {
    return this.cachedJobPresetSummary$;
  }

  getJobSummary<T>(): Observable<T> {
    return this.cachedJobSummary$;
  }
}
