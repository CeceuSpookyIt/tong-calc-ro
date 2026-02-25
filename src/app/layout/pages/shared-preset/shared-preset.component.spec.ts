import { of } from 'rxjs';
import { SharedPresetComponent } from './shared-preset.component';

describe('SharedPresetComponent', () => {
  let component: SharedPresetComponent;
  let mockSharedBuildService: any;
  let mockAuthService: any;
  let mockRoService: any;
  let mockMessageService: any;
  let mockConfirmationService: any;
  let mockRoute: any;
  let mockRouter: any;

  beforeEach(() => {
    mockSharedBuildService = {
      getSharedBuilds: jasmine.createSpy('getSharedBuilds'),
      getLikedBuildIds: jasmine.createSpy('getLikedBuildIds'),
      likeBuild: jasmine.createSpy('likeBuild'),
      unlikeBuild: jasmine.createSpy('unlikeBuild'),
      deleteSharedBuild: jasmine.createSpy('deleteSharedBuild'),
    };

    mockAuthService = {
      loggedInEvent$: { subscribe: jasmine.createSpy('subscribe') },
      getProfile: jasmine.createSpy('getProfile').and.returnValue({ id: 'user-1' }),
      isLoggedIn: false,
    };

    mockRoService = {
      getItems: jasmine.createSpy('getItems'),
    };

    mockMessageService = {
      add: jasmine.createSpy('add'),
    };

    mockConfirmationService = {
      confirm: jasmine.createSpy('confirm'),
    };

    mockRoute = {
      snapshot: { params: {} },
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
    };

    // Constructor order: SharedBuildService, AuthService, RoService,
    //                    MessageService, ConfirmationService, ActivatedRoute, Router
    component = new SharedPresetComponent(
      mockSharedBuildService,
      mockAuthService,
      mockRoService,
      mockMessageService,
      mockConfirmationService,
      mockRoute,
      mockRouter,
    );
  });

  // Test 1: Initial state
  it('should have correct initial state', () => {
    expect(component.builds).toEqual([]);
    expect(component.isLoading).toBe(false);
    expect(component.showMyBuilds).toBe(false);
    expect(component.totalRecord).toBe(0);
  });

  // Test 2: copyLink copies URL to clipboard
  it('should copy link to clipboard', () => {
    spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
    component.copyLink('build-123');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      jasmine.stringContaining('shared-presets/build-123'),
    );
  });

  // Test 3: importBuild requires login
  it('should show warning when importing without login', () => {
    component.isLoggedIn = false;
    component.importBuild({ id: 'b1' } as any);
    expect(mockMessageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'warn' }),
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  // Test 4: importBuild navigates when logged in
  it('should navigate to calculator when importing with login', () => {
    component.isLoggedIn = true;
    component.importBuild({ id: 'b1' } as any);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/'], {
      queryParams: { sharedBuildId: 'b1' },
    });
  });

  // Test 5: likeBuild updates build state
  it('should update build liked state after liking', () => {
    mockSharedBuildService.likeBuild.and.returnValue(of(undefined));
    component.builds = [{ id: 'b1', liked: false, likeCount: 5 } as any];
    component.likeBuild('b1');
    expect(component.builds[0].liked).toBe(true);
    expect(component.builds[0].likeCount).toBe(6);
  });

  // Test 6: unlikeBuild updates build state
  it('should update build liked state after unliking', () => {
    mockSharedBuildService.unlikeBuild.and.returnValue(of(undefined));
    component.builds = [{ id: 'b1', liked: true, likeCount: 5 } as any];
    component.likedBuildIds = new Set(['b1']);
    component.unlikeBuild('b1');
    expect(component.builds[0].liked).toBe(false);
    expect(component.builds[0].likeCount).toBe(4);
  });

  // Test 7: onSelectClassChange resets pagination
  it('should reset pagination on class change', () => {
    component.firstRecord = 10;
    spyOn(component, 'search');
    component.onSelectClassChange();
    expect(component.firstRecord).toBe(0);
    expect(component.search).toHaveBeenCalled();
  });

  // Test 8: onShowMyBuildsChange resets pagination
  it('should reset pagination on my builds toggle', () => {
    component.firstRecord = 10;
    spyOn(component, 'search');
    component.onShowMyBuildsChange();
    expect(component.firstRecord).toBe(0);
    expect(component.search).toHaveBeenCalled();
  });

  // Test 9: deleteBuild calls confirmation
  it('should show confirmation dialog before deleting', () => {
    component.deleteBuild({ id: 'b1', name: 'Test Build' } as any);
    expect(mockConfirmationService.confirm).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: jasmine.stringContaining('Test Build'),
      }),
    );
  });
});
