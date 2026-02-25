import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedBuildService } from 'src/app/api-services/shared-build.service';
import { AuthService } from 'src/app/api-services/auth.service';
import { SharedBuild } from 'src/app/api-services/models/shared-build.model';
import { RoService } from 'src/app/api-services/ro.service';
import { Observable, Subscription, forkJoin, tap } from 'rxjs';
import { ItemModel } from '../../../models/item.model';
import { PaginatorState } from 'primeng/paginator';
import { ConfirmationService, MessageService } from 'primeng/api';
import { getClassDropdownList } from 'src/app/jobs';

const Characters = getClassDropdownList();

@Component({
  selector: 'app-shared-preset',
  templateUrl: './shared-preset.component.html',
  styleUrls: ['./shared-preset.component.css'],
  providers: [MessageService, ConfirmationService],
})
export class SharedPresetComponent implements OnInit, OnDestroy {
  isLoading = false;
  builds: SharedBuild[] = [];
  totalRecord = 0;
  firstRecord = 0;
  pageOptions = [5, 10, 20];
  pageLimit = this.pageOptions[0];

  allClasses = Characters;
  itemMap: Record<number, ItemModel>;

  selectedClassId = this.allClasses[0].value as number;

  isLoggedIn = false;
  currentUserId: string | null = null;
  showMyBuilds = false;
  likedBuildIds = new Set<string>();

  viewDetail = {} as Record<string, boolean>;

  subscriptions: Subscription[] = [];

  constructor(
    private readonly sharedBuildService: SharedBuildService,
    private readonly authService: AuthService,
    private readonly roService: RoService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    const buildId = this.route.snapshot.params['id'];
    if (buildId) {
      this.router.navigate(['/'], { queryParams: { sharedBuildId: buildId } });
      return;
    }

    const authSub = this.authService.loggedInEvent$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.currentUserId = this.authService.getProfile()?.id || null;
      } else {
        this.currentUserId = null;
      }
    });
    this.subscriptions.push(authSub);

    this.initData().subscribe(() => {
      this.search();
    });
  }

  ngOnDestroy(): void {
    for (const s of this.subscriptions) {
      s?.unsubscribe();
    }
  }

  private initData(): Observable<any> {
    return forkJoin([
      this.roService.getItems<Record<number, ItemModel>>(),
    ]).pipe(
      tap(([items]) => {
        this.itemMap = items;
      }),
    );
  }

  search() {
    this.isLoading = true;
    this.viewDetail = {};

    const params: any = {
      skip: this.firstRecord,
      take: this.pageLimit,
    };
    if (this.selectedClassId) {
      params.classId = this.selectedClassId;
    }
    if (this.showMyBuilds && this.currentUserId) {
      params.userId = this.currentUserId;
    }

    this.sharedBuildService.getSharedBuilds(params).subscribe({
      next: (res) => {
        this.builds = res.items;
        this.totalRecord = res.totalItem;
        this.isLoading = false;

        if (this.isLoggedIn && this.builds.length > 0) {
          const buildIds = this.builds.map((b) => b.id);
          this.sharedBuildService.getLikedBuildIds(buildIds).subscribe({
            next: (likedIds) => {
              this.likedBuildIds = likedIds;
              this.builds.forEach((b) => (b.liked = likedIds.has(b.id)));
            },
            error: () => {},
          });
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onSelectClassChange() {
    this.firstRecord = 0;
    this.search();
  }

  pageChange(event: PaginatorState) {
    this.firstRecord = event.first;
    this.pageLimit = event.rows;
    this.search();
  }

  onShowMyBuildsChange() {
    this.firstRecord = 0;
    this.search();
  }

  likeBuild(buildId: string) {
    this.sharedBuildService.likeBuild(buildId).subscribe(() => {
      this.likedBuildIds.add(buildId);
      const build = this.builds.find((b) => b.id === buildId);
      if (build) {
        build.liked = true;
        build.likeCount = (build.likeCount || 0) + 1;
      }
    });
  }

  unlikeBuild(buildId: string) {
    this.sharedBuildService.unlikeBuild(buildId).subscribe(() => {
      this.likedBuildIds.delete(buildId);
      const build = this.builds.find((b) => b.id === buildId);
      if (build) {
        build.liked = false;
        build.likeCount = Math.max(0, (build.likeCount || 0) - 1);
      }
    });
  }

  copyLink(buildId: string) {
    const url = `${window.location.origin}${window.location.pathname}#/shared-presets/${buildId}`;
    navigator.clipboard.writeText(url).then(() => {
      this.messageService.add({ severity: 'success', summary: 'Link copiado!' });
    });
  }

  importBuild(build: SharedBuild) {
    if (!this.isLoggedIn) {
      this.messageService.add({ severity: 'warn', summary: 'Login necessário para importar' });
      return;
    }
    this.router.navigate(['/'], { queryParams: { sharedBuildId: build.id } });
  }

  deleteBuild(build: SharedBuild) {
    this.confirmationService.confirm({
      message: `Excluir "${build.name}"?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.sharedBuildService.deleteSharedBuild(build.id).subscribe({
          next: () => {
            this.builds = this.builds.filter((b) => b.id !== build.id);
            this.totalRecord--;
            this.messageService.add({ severity: 'success', summary: 'Build excluída' });
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: err?.message });
          },
        });
      },
    });
  }
}
