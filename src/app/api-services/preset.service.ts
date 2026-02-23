import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, throwError } from 'rxjs';
import {
  BulkOperationRequest,
  GetMyEntirePresetsResponse,
  GetMyPresetsResponse,
  LikeTagResponse,
  PresetWithTagsModel,
  PublishPresetsReponse,
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
      publishName: row.publish_name || '',
      isPublished: row.is_published || false,
      publishedAt: row.published_at || '',
    };
  }

  private mapTagFromDb(row: any) {
    return {
      id: row.id,
      tag: row.tag,
      label: row.tag,
      classId: row.class_id,
      liked: false,
      totalLike: row.total_like || 0,
      publisherId: row.publisher_id,
      createdAt: row.created_at,
      updatedAt: row.created_at,
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
            .select('id, label, class_id, is_published, publish_name, published_at, created_at, updated_at, user_id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
        ),
      ),
      switchMap(({ data, error }) => {
        if (error) throw error;
        const presetIds = (data || []).map((p: any) => p.id);
        if (presetIds.length === 0) return [[]];

        return from(
          this.client.from('preset_tags').select('*').in('preset_id', presetIds),
        ).pipe(
          map(({ data: tagsData, error: tagsError }) => {
            if (tagsError) throw tagsError;
            const tagsByPreset = new Map<string, any[]>();
            for (const tag of tagsData || []) {
              const list = tagsByPreset.get(tag.preset_id) || [];
              list.push(this.mapTagFromDb(tag));
              tagsByPreset.set(tag.preset_id, list);
            }

            return (data || []).map((row: any) => ({
              id: row.id,
              label: row.label,
              classId: row.class_id,
              isPublished: row.is_published || false,
              publishName: row.publish_name || '',
              publishedAt: row.published_at || '',
              createdAt: row.created_at,
              updatedAt: row.updated_at,
              tags: tagsByPreset.get(row.id) || [],
            })) as GetMyPresetsResponse;
          }),
        );
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
      switchMap(({ data, error }) => {
        if (error) throw error;
        const presetIds = (data || []).map((p: any) => p.id);
        if (presetIds.length === 0) return [[]];

        return from(
          this.client.from('preset_tags').select('*').in('preset_id', presetIds),
        ).pipe(
          map(({ data: tagsData, error: tagsError }) => {
            if (tagsError) throw tagsError;
            const tagsByPreset = new Map<string, any[]>();
            for (const tag of tagsData || []) {
              const list = tagsByPreset.get(tag.preset_id) || [];
              list.push(this.mapTagFromDb(tag));
              tagsByPreset.set(tag.preset_id, list);
            }

            return (data || []).map((row: any) => ({
              ...this.mapPresetFromDb(row),
              tags: tagsByPreset.get(row.id) || [],
            })) as GetMyEntirePresetsResponse;
          }),
        );
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

  sharePreset(id: string, body: { publishName: string }): Observable<PresetWithTagsModel> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('presets')
            .update({
              is_published: true,
              publish_name: body.publishName,
              published_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single(),
        ).pipe(
          switchMap(({ data: presetData, error: presetError }) => {
            if (presetError) throw presetError;

            // Create default tag
            return from(
              this.client
                .from('preset_tags')
                .upsert({
                  preset_id: id,
                  tag: 'no_tag',
                  class_id: presetData.class_id,
                  publisher_id: userId,
                })
                .select(),
            ).pipe(
              map(({ data: tagsData, error: tagsError }) => {
                if (tagsError) throw tagsError;
                return {
                  id: presetData.id,
                  label: presetData.label,
                  classId: presetData.class_id,
                  isPublished: presetData.is_published,
                  publishName: presetData.publish_name,
                  publishedAt: presetData.published_at,
                  createdAt: presetData.created_at,
                  updatedAt: presetData.updated_at,
                  tags: (tagsData || []).map((t: any) => this.mapTagFromDb(t)),
                } as PresetWithTagsModel;
              }),
            );
          }),
        ),
      ),
    );
  }

  unsharePreset(id: string): Observable<Omit<RoPresetModel, 'model'>> {
    return from(
      this.client
        .from('presets')
        .update({ is_published: false, publish_name: null, published_at: null })
        .eq('id', id)
        .select('id, user_id, label, class_id, is_published, publish_name, published_at, created_at, updated_at')
        .single(),
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;
        // Delete associated tags
        return from(
          this.client.from('preset_tags').delete().eq('preset_id', id),
        ).pipe(
          map(() => ({
            id: data.id,
            userId: data.user_id,
            label: data.label,
            classId: data.class_id,
            isPublished: false,
            publishName: '',
            publishedAt: '',
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          } as Omit<RoPresetModel, 'model'>)),
        );
      }),
    );
  }

  addPresetTags(id: string, body: BulkOperationRequest): Observable<PresetWithTagsModel> {
    return this.getUserId$().pipe(
      switchMap((userId) => {
        const operations: Promise<any>[] = [];

        // Delete tags
        if (body.deleteTags?.length > 0) {
          operations.push(
            Promise.resolve(this.client.from('preset_tags').delete().eq('preset_id', id).in('id', body.deleteTags)),
          );
        }

        // Create tags
        if (body.createTags?.length > 0) {
          const newTags = body.createTags.map((tag) => ({
            preset_id: id,
            tag,
            publisher_id: userId,
          }));
          operations.push(Promise.resolve(this.client.from('preset_tags').insert(newTags).select()));
        }

        return from(Promise.all(operations));
      }),
      switchMap(() =>
        // Re-fetch preset with tags
        from(
          this.client.from('presets').select('*').eq('id', id).single(),
        ).pipe(
          switchMap(({ data: preset, error: presetError }) => {
            if (presetError) throw presetError;
            return from(
              this.client.from('preset_tags').select('*').eq('preset_id', id),
            ).pipe(
              map(({ data: tags, error: tagsError }) => {
                if (tagsError) throw tagsError;
                return {
                  id: preset.id,
                  label: preset.label,
                  classId: preset.class_id,
                  isPublished: preset.is_published,
                  publishName: preset.publish_name,
                  publishedAt: preset.published_at,
                  createdAt: preset.created_at,
                  updatedAt: preset.updated_at,
                  tags: (tags || []).map((t: any) => this.mapTagFromDb(t)),
                } as PresetWithTagsModel;
              }),
            );
          }),
        ),
      ),
    );
  }

  removePresetTag(params: { presetId: string; tagId: string }): Observable<Omit<RoPresetModel, 'model'>> {
    return from(
      this.client.from('preset_tags').delete().eq('id', params.tagId).eq('preset_id', params.presetId),
    ).pipe(
      switchMap(() =>
        from(
          this.client
            .from('presets')
            .select('id, user_id, label, class_id, is_published, publish_name, published_at, created_at, updated_at')
            .eq('id', params.presetId)
            .single(),
        ),
      ),
      map(({ data, error }) => {
        if (error) throw error;
        return {
          id: data.id,
          userId: data.user_id,
          label: data.label,
          classId: data.class_id,
          isPublished: data.is_published,
          publishName: data.publish_name || '',
          publishedAt: data.published_at || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        } as Omit<RoPresetModel, 'model'>;
      }),
    );
  }

  likePresetTags(tagId: string): Observable<LikeTagResponse> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client.from('preset_tags').select('*').eq('id', tagId).single(),
        ).pipe(
          switchMap(({ data: tag, error }) => {
            if (error) throw error;
            const likes: string[] = tag.likes || [];
            if (!likes.includes(userId)) {
              likes.push(userId);
            }
            return from(
              this.client
                .from('preset_tags')
                .update({ likes, total_like: likes.length })
                .eq('id', tagId)
                .select()
                .single(),
            );
          }),
          map(({ data, error }) => {
            if (error) throw error;
            return {
              id: data.id,
              tag: data.tag,
              classId: data.class_id,
              presetId: data.preset_id,
              totalLike: data.total_like,
              liked: true,
            } as LikeTagResponse;
          }),
        ),
      ),
    );
  }

  unlikePresetTag(tagId: string): Observable<LikeTagResponse> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client.from('preset_tags').select('*').eq('id', tagId).single(),
        ).pipe(
          switchMap(({ data: tag, error }) => {
            if (error) throw error;
            let likes: string[] = tag.likes || [];
            likes = likes.filter((id: string) => id !== userId);
            return from(
              this.client
                .from('preset_tags')
                .update({ likes, total_like: likes.length })
                .eq('id', tagId)
                .select()
                .single(),
            );
          }),
          map(({ data, error }) => {
            if (error) throw error;
            return {
              id: data.id,
              tag: data.tag,
              classId: data.class_id,
              presetId: data.preset_id,
              totalLike: data.total_like,
              liked: false,
            } as LikeTagResponse;
          }),
        ),
      ),
    );
  }

  getPublishPresets(params: { classId: number; tagName: string; skip: number; take: number }): Observable<PublishPresetsReponse> {
    const { classId, tagName, skip, take } = params;

    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('preset_tags')
            .select('*, presets!inner(id, model, publish_name, created_at, is_published)', { count: 'exact' })
            .eq('class_id', classId)
            .eq('tag', tagName || 'no_tag')
            .eq('presets.is_published', true)
            .order('total_like', { ascending: false })
            .range(skip, skip + take - 1),
        ).pipe(
          map(({ data, error, count }) => {
            if (error) throw error;
            const items = (data || []).map((row: any) => {
              const preset = row.presets;
              const likes: string[] = row.likes || [];
              return {
                publishName: preset.publish_name,
                model: preset.model,
                tags: { [row.tag]: row.total_like },
                liked: likes.includes(userId),
                tagId: row.id,
                presetId: preset.id,
                createdAt: preset.created_at,
                publisherName: '',
              };
            });

            return {
              items,
              totalItem: count || 0,
              skip,
              take,
            } as PublishPresetsReponse;
          }),
        ),
      ),
    );
  }
}
