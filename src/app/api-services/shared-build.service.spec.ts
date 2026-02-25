import { SharedBuildService } from './shared-build.service';

describe('SharedBuildService', () => {
  let service: SharedBuildService;
  let mockSupabaseService: any;
  let mockAuthService: any;
  let mockQueryBuilder: any;

  const mockBuildRow = {
    id: 'build-123',
    name: 'My Test Build',
    class_id: 4054,
    model: { class: 4054, level: 175 },
    monster_id: 1002,
    monster_name: 'Poring',
    skill_name: 'Storm Gust',
    metrics: { dps: 1000, maxDamage: 2000, minDamage: 500, aspd: 190, hitPerSecs: 3, totalHit: 5, criRate: 30, criDmg: 40, vct: 1, fct: 0.5, acd: 0.2, hp: 50000, sp: 3000 },
    created_at: '2026-02-25T00:00:00Z',
    updated_at: '2026-02-25T00:00:00Z',
    user_id: 'user-abc',
  };

  function makeReturnSelf(name: string): jasmine.Spy {
    const spy = jasmine.createSpy(name);
    spy.and.callFake(function(this: any) { return mockQueryBuilder; });
    return spy;
  }

  beforeEach(() => {
    // Create a chainable mock query builder
    mockQueryBuilder = {
      select: makeReturnSelf('select'),
      insert: makeReturnSelf('insert'),
      update: makeReturnSelf('update'),
      delete: makeReturnSelf('delete'),
      eq: makeReturnSelf('eq'),
      in: makeReturnSelf('in'),
      order: makeReturnSelf('order'),
      range: makeReturnSelf('range'),
      single: jasmine.createSpy('single').and.returnValue(Promise.resolve({ data: mockBuildRow, error: null })),
    };

    // Make the builder thenable (for `from(query)` calls without `.single()`)
    const defaultResolveFn = (resolve: any) => resolve({ data: [mockBuildRow], error: null, count: 1 });
    Object.defineProperty(mockQueryBuilder, 'then', {
      get: () => defaultResolveFn,
      configurable: true,
    });

    mockSupabaseService = {
      client: {
        from: jasmine.createSpy('from').and.returnValue(mockQueryBuilder),
      },
    };

    mockAuthService = {
      getCurrentUserId: jasmine.createSpy('getCurrentUserId').and.returnValue(Promise.resolve('user-abc')),
    };

    service = new SharedBuildService(mockSupabaseService, mockAuthService);
  });

  // ─── mapBuildFromDb (tested via getSharedBuild) ───────────────────────────

  describe('mapBuildFromDb', () => {
    it('correctly maps snake_case DB columns to camelCase model', (done) => {
      mockQueryBuilder.single.and.returnValue(Promise.resolve({ data: mockBuildRow, error: null }));

      service.getSharedBuild('build-123').subscribe((build) => {
        expect(build.id).toBe('build-123');
        expect(build.name).toBe('My Test Build');
        expect(build.classId).toBe(4054);
        expect(build.monsterId).toBe(1002);
        expect(build.monsterName).toBe('Poring');
        expect(build.skillName).toBe('Storm Gust');
        expect(build.metrics).toBeDefined();
        expect(build.createdAt).toBe('2026-02-25T00:00:00Z');
        expect(build.updatedAt).toBe('2026-02-25T00:00:00Z');
        expect(build.userId).toBe('user-abc');
        done();
      });
    });

    it('maps null optional fields correctly', (done) => {
      const rowWithNulls = {
        ...mockBuildRow,
        monster_id: null,
        monster_name: null,
        skill_name: null,
        metrics: null,
      };
      mockQueryBuilder.single.and.returnValue(Promise.resolve({ data: rowWithNulls, error: null }));

      service.getSharedBuild('build-123').subscribe((build) => {
        expect(build.monsterId).toBeNull();
        expect(build.monsterName).toBeNull();
        expect(build.skillName).toBeNull();
        expect(build.metrics).toBeNull();
        done();
      });
    });
  });

  // ─── getSharedBuild ───────────────────────────────────────────────────────

  describe('getSharedBuild', () => {
    it('calls supabase with correct table and id', (done) => {
      mockQueryBuilder.single.and.returnValue(Promise.resolve({ data: mockBuildRow, error: null }));

      service.getSharedBuild('build-123').subscribe(() => {
        expect(mockSupabaseService.client.from).toHaveBeenCalledWith('shared_builds');
        expect(mockQueryBuilder.select).toHaveBeenCalledWith('*');
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'build-123');
        expect(mockQueryBuilder.single).toHaveBeenCalled();
        done();
      });
    });

    it('throws when supabase returns an error', (done) => {
      const mockError = { message: 'Not found', code: 'PGRST116' };
      mockQueryBuilder.single.and.returnValue(Promise.resolve({ data: null, error: mockError }));

      service.getSharedBuild('nonexistent').subscribe({
        error: (err) => {
          expect(err).toBe(mockError);
          done();
        },
      });
    });
  });

  // ─── createSharedBuild ────────────────────────────────────────────────────

  describe('createSharedBuild', () => {
    it('calls supabase insert with authenticated user_id', (done) => {
      mockQueryBuilder.single.and.returnValue(Promise.resolve({ data: mockBuildRow, error: null }));

      const request = {
        name: 'My Test Build',
        model: { class: 4054, level: 175 } as any,
        monsterId: 1002,
        monsterName: 'Poring',
        skillName: 'Storm Gust',
        metrics: mockBuildRow.metrics,
      };

      service.createSharedBuild(request).subscribe(() => {
        expect(mockAuthService.getCurrentUserId).toHaveBeenCalled();
        expect(mockSupabaseService.client.from).toHaveBeenCalledWith('shared_builds');
        expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
          jasmine.objectContaining({
            user_id: 'user-abc',
            name: 'My Test Build',
            monster_id: 1002,
            monster_name: 'Poring',
            skill_name: 'Storm Gust',
          }),
        );
        done();
      });
    });

    it('throws when user is not authenticated', (done) => {
      mockAuthService.getCurrentUserId.and.returnValue(Promise.resolve(null));

      service.createSharedBuild({ name: 'Build', model: {} as any }).subscribe({
        error: (err) => {
          expect(err.message).toBe('Not authenticated');
          done();
        },
      });
    });
  });

  // ─── deleteSharedBuild ────────────────────────────────────────────────────

  describe('deleteSharedBuild', () => {
    it('calls supabase delete with correct id', (done) => {
      const deleteThenableResolve = (resolve: any) => resolve({ error: null });
      Object.defineProperty(mockQueryBuilder, 'then', {
        get: () => deleteThenableResolve,
        configurable: true,
      });

      service.deleteSharedBuild('build-123').subscribe(() => {
        expect(mockSupabaseService.client.from).toHaveBeenCalledWith('shared_builds');
        expect(mockQueryBuilder.delete).toHaveBeenCalled();
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'build-123');
        done();
      });
    });

    it('throws when supabase returns an error', (done) => {
      const mockError = { message: 'Delete failed' };
      const deleteThenableResolve = (resolve: any) => resolve({ error: mockError });
      Object.defineProperty(mockQueryBuilder, 'then', {
        get: () => deleteThenableResolve,
        configurable: true,
      });

      service.deleteSharedBuild('build-123').subscribe({
        error: (err) => {
          expect(err).toBe(mockError);
          done();
        },
      });
    });
  });

  // ─── likeBuild ────────────────────────────────────────────────────────────

  describe('likeBuild', () => {
    it('inserts into shared_build_likes with user_id and build_id', (done) => {
      const likeThenableResolve = (resolve: any) => resolve({ error: null });
      Object.defineProperty(mockQueryBuilder, 'then', {
        get: () => likeThenableResolve,
        configurable: true,
      });

      service.likeBuild('build-123').subscribe(() => {
        expect(mockAuthService.getCurrentUserId).toHaveBeenCalled();
        expect(mockSupabaseService.client.from).toHaveBeenCalledWith('shared_build_likes');
        expect(mockQueryBuilder.insert).toHaveBeenCalledWith(
          jasmine.objectContaining({
            build_id: 'build-123',
            user_id: 'user-abc',
          }),
        );
        done();
      });
    });

    it('throws when user is not authenticated', (done) => {
      mockAuthService.getCurrentUserId.and.returnValue(Promise.resolve(null));

      service.likeBuild('build-123').subscribe({
        error: (err) => {
          expect(err.message).toBe('Not authenticated');
          done();
        },
      });
    });
  });

  // ─── unlikeBuild ──────────────────────────────────────────────────────────

  describe('unlikeBuild', () => {
    it('deletes from shared_build_likes with correct build_id and user_id', (done) => {
      const unlikeThenableResolve = (resolve: any) => resolve({ error: null });
      Object.defineProperty(mockQueryBuilder, 'then', {
        get: () => unlikeThenableResolve,
        configurable: true,
      });

      service.unlikeBuild('build-123').subscribe(() => {
        expect(mockAuthService.getCurrentUserId).toHaveBeenCalled();
        expect(mockSupabaseService.client.from).toHaveBeenCalledWith('shared_build_likes');
        expect(mockQueryBuilder.delete).toHaveBeenCalled();
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('build_id', 'build-123');
        expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user-abc');
        done();
      });
    });

    it('throws when user is not authenticated', (done) => {
      mockAuthService.getCurrentUserId.and.returnValue(Promise.resolve(null));

      service.unlikeBuild('build-123').subscribe({
        error: (err) => {
          expect(err.message).toBe('Not authenticated');
          done();
        },
      });
    });
  });
});
