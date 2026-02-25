import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, throwError } from 'rxjs';
import {
  GetMyEntirePresetsResponse,
  GetMyPresetsResponse,
  RoPresetModel,
} from './models';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable()
export class PresetService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly authService: AuthService,
  ) {}

  private get client() {
    return this.supabaseService.client;
  }

  private getUserId$(): Observable<string> {
    return from(this.authService.getCurrentUserId()).pipe(
      switchMap((id) => (id ? [id] : throwError(() => new Error('Not authenticated')))),
    );
  }

  private mapPresetFromDb(row: any): RoPresetModel {
    return {
      id: row.id,
      userId: row.user_id,
      label: row.label,
      model: row.model,
      classId: row.class_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  getPreset(presetId: string): Observable<RoPresetModel> {
    return from(
      this.client.from('presets').select('*').eq('id', presetId).single(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapPresetFromDb(data);
      }),
    );
  }

  getMyPresets(): Observable<GetMyPresetsResponse> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('presets')
            .select('id, label, class_id, created_at, updated_at, user_id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
        ),
      ),
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((row: any) => ({
          id: row.id,
          label: row.label,
          classId: row.class_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })) as GetMyPresetsResponse;
      }),
    );
  }

  getEntirePresets(): Observable<GetMyEntirePresetsResponse> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('presets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
        ),
      ),
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((row: any) => this.mapPresetFromDb(row)) as GetMyEntirePresetsResponse;
      }),
    );
  }

  createPreset(preset: Pick<RoPresetModel, 'label' | 'model'>): Observable<RoPresetModel> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('presets')
            .insert({
              user_id: userId,
              label: preset.label,
              model: preset.model as any,
              class_id: (preset.model as any)?.class ?? null,
            })
            .select()
            .single(),
        ),
      ),
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapPresetFromDb(data);
      }),
    );
  }

  bulkCreatePresets(bulkPreset: { bulkData: any[] }): Observable<RoPresetModel[]> {
    return this.getUserId$().pipe(
      switchMap((userId) => {
        const rows = bulkPreset.bulkData.map((item) => ({
          user_id: userId,
          label: item.label,
          model: item.model,
          class_id: item.model?.class ?? null,
        }));
        return from(this.client.from('presets').insert(rows).select());
      }),
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((row: any) => this.mapPresetFromDb(row));
      }),
    );
  }

  updatePreset(id: string, preset: Partial<Pick<RoPresetModel, 'label' | 'model'>>): Observable<RoPresetModel> {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (preset.label !== undefined) updateData.label = preset.label;
    if (preset.model !== undefined) {
      updateData.model = preset.model;
      updateData.class_id = (preset.model as any)?.class ?? null;
    }

    return from(
      this.client.from('presets').update(updateData).eq('id', id).select().single(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapPresetFromDb(data);
      }),
    );
  }

  deletePreset(id: string): Observable<RoPresetModel> {
    return from(
      this.client.from('presets').delete().eq('id', id).select().single(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapPresetFromDb(data);
      }),
    );
  }
}
