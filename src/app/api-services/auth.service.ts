import { Injectable } from '@angular/core';
import { Profile } from './models';
import { Observable, ReplaySubject, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable()
export class AuthService {
  private profileEvent = new ReplaySubject<Profile>(1);
  private profile: Profile;
  public profileEventObs$ = this.profileEvent.asObservable();

  private loggedInSubject = new ReplaySubject<boolean>(1);
  public loggedInEvent$ = this.loggedInSubject.asObservable();
  public isLoggedIn = false;

  constructor(private readonly supabaseService: SupabaseService) {
    this.loggedInEvent$.subscribe((isLoggedIn) => (this.isLoggedIn = isLoggedIn));

    // Listen for auth state changes (login, logout, token refresh)
    this.supabaseService.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = session.user;
        const profile: Profile = {
          id: user.id,
          name: user.user_metadata?.['full_name'] || user.email || '',
          email: user.email || '',
          status: 'active',
          role: 'user',
          createdAt: user.created_at,
          updatedAt: user.updated_at || user.created_at,
        };
        this.storeProfile(profile);
        this.loggedInSubject.next(true);
      } else {
        this.storeProfile({} as any);
        this.loggedInSubject.next(false);
      }
    });

    // Check initial session
    this.initSession();
  }

  private async initSession() {
    // PKCE flow: explicitly exchange the authorization code if present in URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      const { error } = await this.supabaseService.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('PKCE code exchange error:', error);
      }
      // Clean up the URL to remove ?code= parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('code');
      window.history.replaceState({}, '', url.pathname + url.hash);
    }

    const { data: { session } } = await this.supabaseService.auth.getSession();
    if (session?.user) {
      const user = session.user;
      const profile: Profile = {
        id: user.id,
        name: user.user_metadata?.['full_name'] || user.email || '',
        email: user.email || '',
        status: 'active',
        role: 'user',
        createdAt: user.created_at,
        updatedAt: user.updated_at || user.created_at,
      };
      this.storeProfile(profile);
      this.loggedInSubject.next(true);
    } else {
      this.loggedInSubject.next(false);
    }
  }

  async signInWithGoogle() {
    const { error } = await this.supabaseService.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) {
      console.error('Login error:', error);
    }
  }

  logout() {
    this.supabaseService.auth.signOut().then(({ error }) => {
      if (error) {
        console.error('Logout error:', error);
      }
      this.storeProfile({} as any);
      this.loggedInSubject.next(false);
    });
  }

  updateMyProfile(body: { name: string }): Observable<Profile> {
    return from(
      this.supabaseService.auth.updateUser({
        data: { full_name: body.name },
      }),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        if (data.user) {
          const profile: Profile = {
            id: data.user.id,
            name: data.user.user_metadata?.['full_name'] || data.user.email || '',
            email: data.user.email || '',
            status: 'active',
            role: 'user',
            createdAt: data.user.created_at,
            updatedAt: data.user.updated_at || data.user.created_at,
          };
          this.storeProfile(profile);
          return profile;
        }
        return this.profile;
      }),
    );
  }

  private storeProfile(profile: Profile) {
    this.profile = { ...profile };
    this.profileEvent.next(this.profile);
  }

  getProfile() {
    return this.profile;
  }

  async getCurrentUserId(): Promise<string | null> {
    const { data: { session } } = await this.supabaseService.auth.getSession();
    return session?.user?.id || null;
  }
}
