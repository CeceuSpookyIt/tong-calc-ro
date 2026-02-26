import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Intercept OAuth tokens from hash BEFORE Angular's HashLocationStrategy destroys them.
// Supabase implicit flow returns tokens as #access_token=...&refresh_token=...
// Angular's HashLocationStrategy treats the hash as a route and redirects to /, losing the tokens.
const hash = window.location.hash;
if (hash && hash.includes('access_token=')) {
  const params = new URLSearchParams(hash.substring(1));
  const tokenData: Record<string, string> = {};
  params.forEach((value, key) => { tokenData[key] = value; });
  sessionStorage.setItem('supabase-auth-callback', JSON.stringify(tokenData));
  // Clear hash to prevent Angular router from consuming it
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
