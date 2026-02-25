import { Injectable } from '@angular/core';
import { Observable, from, map, switchMap, throwError } from 'rxjs';
import {
  CreateSharedBuildRequest,
  SharedBuild,
  SharedBuildListResponse,
  UpdateSharedBuildRequest,
} from './models/shared-build.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable()
export class SharedBuildService {
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

  private mapBuildFromDb(row: any): SharedBuild {
    return {
      id: row.id,
      name: row.name,
      classId: row.class_id,
      model: row.model,
      monsterId: row.monster_id ?? null,
      monsterName: row.monster_name ?? null,
      skillName: row.skill_name ?? null,
      metrics: row.metrics ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userId: row.user_id,
      likeCount: row.likeCount ?? 0,
    };
  }

  getSharedBuild(id: string): Observable<SharedBuild> {
    return from(
      this.client.from('shared_builds').select('*').eq('id', id).single(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapBuildFromDb(data);
      }),
    );
  }

  getSharedBuilds(params: { classId?: number; userId?: string; skip: number; take: number }): Observable<SharedBuildListResponse> {
    const { classId, userId, skip, take } = params;

    let query = this.client
      .from('shared_builds')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (classId !== undefined) {
      query = query.eq('class_id', classId);
    }
    if (userId !== undefined) {
      query = query.eq('user_id', userId);
    }

    return from(query).pipe(
      switchMap(({ data, error, count }) => {
        if (error) throw error;
        const builds = data || [];
        const buildIds = builds.map((b: any) => b.id);

        if (buildIds.length === 0) {
          return [{ items: [], totalItem: count || 0, skip, take }];
        }

        return from(
          this.client
            .from('shared_build_likes')
            .select('build_id')
            .in('build_id', buildIds),
        ).pipe(
          map(({ data: likesData, error: likesError }) => {
            if (likesError) throw likesError;

            // Count likes per build in JS
            const likeCountMap = new Map<string, number>();
            for (const like of likesData || []) {
              const current = likeCountMap.get(like.build_id) || 0;
              likeCountMap.set(like.build_id, current + 1);
            }

            const items = builds.map((row: any) => ({
              ...this.mapBuildFromDb(row),
              likeCount: likeCountMap.get(row.id) || 0,
            }));

            return {
              items,
              totalItem: count || 0,
              skip,
              take,
            } as SharedBuildListResponse;
          }),
        );
      }),
    );
  }

  createSharedBuild(request: CreateSharedBuildRequest): Observable<SharedBuild> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('shared_builds')
            .insert({
              user_id: userId,
              name: request.name,
              model: request.model as any,
              class_id: (request.model as any)?.class ?? null,
              monster_id: request.monsterId ?? null,
              monster_name: request.monsterName ?? null,
              skill_name: request.skillName ?? null,
              metrics: request.metrics ?? null,
            })
            .select()
            .single(),
        ),
      ),
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapBuildFromDb(data);
      }),
    );
  }

  updateSharedBuild(id: string, request: UpdateSharedBuildRequest): Observable<SharedBuild> {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (request.name !== undefined) updateData.name = request.name;
    if (request.model !== undefined) {
      updateData.model = request.model;
      updateData.class_id = (request.model as any)?.class ?? null;
    }
    if (request.monsterId !== undefined) updateData.monster_id = request.monsterId;
    if (request.monsterName !== undefined) updateData.monster_name = request.monsterName;
    if (request.skillName !== undefined) updateData.skill_name = request.skillName;
    if (request.metrics !== undefined) updateData.metrics = request.metrics;

    return from(
      this.client.from('shared_builds').update(updateData).eq('id', id).select().single(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return this.mapBuildFromDb(data);
      }),
    );
  }

  deleteSharedBuild(id: string): Observable<void> {
    return from(
      this.client.from('shared_builds').delete().eq('id', id),
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
    );
  }

  likeBuild(buildId: string): Observable<void> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('shared_build_likes')
            .insert({ build_id: buildId, user_id: userId }),
        ),
      ),
      map(({ error }) => {
        if (error) throw error;
      }),
    );
  }

  unlikeBuild(buildId: string): Observable<void> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('shared_build_likes')
            .delete()
            .eq('build_id', buildId)
            .eq('user_id', userId),
        ),
      ),
      map(({ error }) => {
        if (error) throw error;
      }),
    );
  }

  getLikedBuildIds(buildIds: string[]): Observable<Set<string>> {
    return this.getUserId$().pipe(
      switchMap((userId) =>
        from(
          this.client
            .from('shared_build_likes')
            .select('build_id')
            .in('build_id', buildIds)
            .eq('user_id', userId),
        ),
      ),
      map(({ data, error }) => {
        if (error) throw error;
        return new Set<string>((data || []).map((row: any) => row.build_id));
      }),
    );
  }
}
