# Internal Promo Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the minimal "by PrimeNG" footer with a rotating promotional banner that cross-promotes Instanceiro and Guild Claudinhos.

**Architecture:** One new Angular component (`PromoFooterComponent`) with a hardcoded array of two promos, random selection on init, and component-scoped CSS. Two logo assets copied into `src/assets/images/promo/`. The existing `<app-footer>` in the layout template is swapped for the new `<app-promo-footer>`.

**Tech Stack:** Angular 16, PrimeNG 16, Python (Pillow) for image resize

**Spec:** `docs/superpowers/specs/2026-04-15-internal-promo-footer-design.md`

---

### Task 1: Prepare logo assets

Copy and process the two logo files into the project.

**Files:**
- Create: `src/assets/images/promo/instanceiro.svg`
- Create: `src/assets/images/promo/claudinhos.png`

- [ ] **Step 1: Create the promo assets directory**

```bash
mkdir -p src/assets/images/promo
```

- [ ] **Step 2: Copy and adjust the Instanceiro SVG**

Copy the SVG from the Instanceiro project and adjust the `viewBox` to center the shield visually (crops 47px from top, 20px from sides):

```bash
cp d:/rag/instance-tracker/public/app-icon.svg src/assets/images/promo/instanceiro.svg
```

Then edit `src/assets/images/promo/instanceiro.svg` — change line 1 from:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
```

to:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="472" height="472" viewBox="20 47 472 472" fill="none">
```

- [ ] **Step 3: Resize the Claudinhos PNG to 128x128**

```bash
python -c "
from PIL import Image
img = Image.open('C:/Users/Marcel/Downloads/Generated Image March 10, 2026 - 1_58PM.png').convert('RGBA')
img = img.resize((128, 128), Image.LANCZOS)
img.save('src/assets/images/promo/claudinhos.png')
print(f'Saved 128x128 PNG ({img.size})')
"
```

- [ ] **Step 4: Verify both assets exist and are reasonable sizes**

```bash
ls -la src/assets/images/promo/
```

Expected: `instanceiro.svg` (~1.2KB), `claudinhos.png` (< 50KB).

- [ ] **Step 5: Commit**

```bash
git add src/assets/images/promo/
git commit -m "feat: add Instanceiro and Claudinhos logo assets for promo footer"
```

---

### Task 2: Create PromoFooterComponent — TypeScript

Create the component class with the PromoItem interface and hardcoded promo data.

**Files:**
- Create: `src/app/layout/promo-footer/promo-footer.component.ts`

- [ ] **Step 1: Create the component file**

Create `src/app/layout/promo-footer/promo-footer.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';

interface PromoItem {
  id: string;
  title: string;
  description: string;
  logoSrc: string;
  ctaLabel?: string;
  ctaUrl?: string;
  bgGradient: string;
  titleColor: string;
  isClickable: boolean;
}

@Component({
  selector: 'app-promo-footer',
  templateUrl: './promo-footer.component.html',
  styleUrls: ['./promo-footer.component.css'],
})
export class PromoFooterComponent implements OnInit {
  promos: PromoItem[] = [
    {
      id: 'instanceiro',
      title: 'Instanceiro',
      description: 'Trackeie o cooldown das suas instâncias e o respawn dos MVPs do RO LATAM em tempo real.',
      logoSrc: 'assets/images/promo/instanceiro.svg',
      ctaLabel: 'Acessar →',
      ctaUrl: 'https://instanceiro.vercel.app?utm_source=rocalc&utm_medium=promo-footer',
      bgGradient: 'linear-gradient(90deg, rgba(200,121,65,0.08) 0%, rgba(232,166,101,0.04) 100%)',
      titleColor: '#E8A665',
      isClickable: true,
    },
    {
      id: 'claudinhos',
      title: 'Guild Claudinhos',
      description: 'A guild da turma que faz essa calc — servidor Nidhogg.',
      logoSrc: 'assets/images/promo/claudinhos.png',
      bgGradient: 'linear-gradient(90deg, rgba(168,85,247,0.10) 0%, rgba(250,204,21,0.04) 100%)',
      titleColor: '#FACC15',
      isClickable: false,
    },
  ];

  selectedPromo: PromoItem;

  ngOnInit(): void {
    this.selectedPromo = this.promos[Math.floor(Math.random() * this.promos.length)];
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout/promo-footer/promo-footer.component.ts
git commit -m "feat: add PromoFooterComponent class with hardcoded promo data"
```

---

### Task 3: Create PromoFooterComponent — Template

Create the HTML template with conditional rendering for both promo types.

**Files:**
- Create: `src/app/layout/promo-footer/promo-footer.component.html`

- [ ] **Step 1: Create the template file**

Create `src/app/layout/promo-footer/promo-footer.component.html`:

```html
<div class="promo-footer" *ngIf="selectedPromo">
  <a
    *ngIf="selectedPromo.isClickable"
    class="promo-row promo-clickable"
    [style.background]="selectedPromo.bgGradient"
    [href]="selectedPromo.ctaUrl"
    target="_blank"
    rel="noreferrer noopener"
  >
    <ng-container *ngTemplateOutlet="promoContent"></ng-container>
  </a>
  <div
    *ngIf="!selectedPromo.isClickable"
    class="promo-row"
    [style.background]="selectedPromo.bgGradient"
  >
    <ng-container *ngTemplateOutlet="promoContent"></ng-container>
  </div>

  <ng-template #promoContent>
    <div class="promo-logo">
      <img [src]="selectedPromo.logoSrc" [alt]="selectedPromo.title" />
    </div>
    <div class="promo-copy">
      <div class="promo-title" [style.color]="selectedPromo.titleColor">
        {{ selectedPromo.title }}
        <span class="promo-label">outros projetos da casa</span>
      </div>
      <div class="promo-desc">{{ selectedPromo.description }}</div>
    </div>
    <span *ngIf="selectedPromo.ctaLabel" class="promo-cta">
      {{ selectedPromo.ctaLabel }}
    </span>
  </ng-template>

  <div class="promo-baseline">© 2026 — RO LATAM Calculator</div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout/promo-footer/promo-footer.component.html
git commit -m "feat: add PromoFooterComponent template with conditional CTA rendering"
```

---

### Task 4: Create PromoFooterComponent — CSS

Create the component-scoped styles.

**Files:**
- Create: `src/app/layout/promo-footer/promo-footer.component.css`

- [ ] **Step 1: Create the CSS file**

Create `src/app/layout/promo-footer/promo-footer.component.css`:

```css
.promo-footer {
  border-top: 1px solid var(--surface-border);
}

.promo-row {
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s ease;
}

.promo-clickable {
  cursor: pointer;
}

.promo-clickable:hover {
  background: rgba(200, 121, 65, 0.14) !important;
}

.promo-logo {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
}

.promo-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.promo-copy {
  flex: 1;
  min-width: 0;
}

.promo-title {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 2px;
}

.promo-label {
  display: inline-block;
  background: rgba(255, 255, 255, 0.06);
  color: #6c7079;
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 8px;
  vertical-align: middle;
  font-weight: 400;
}

.promo-desc {
  font-size: 12px;
  color: var(--text-color-secondary);
  line-height: 1.4;
}

.promo-cta {
  background: #C87941;
  color: #1a1d24;
  padding: 7px 14px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.promo-baseline {
  padding: 6px 16px;
  color: var(--text-color-secondary);
  font-size: 11px;
  text-align: center;
  border-top: 1px solid var(--surface-border);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout/promo-footer/promo-footer.component.css
git commit -m "feat: add PromoFooterComponent styles with hover and gradient support"
```

---

### Task 5: Wire into layout

Register the component in the layout module and swap it into the layout template.

**Files:**
- Modify: `src/app/layout/app.layout.module.ts`
- Modify: `src/app/layout/app.layout.component.html`

- [ ] **Step 1: Register PromoFooterComponent in AppLayoutModule**

In `src/app/layout/app.layout.module.ts`, add the import at the top (after the existing component imports):

```typescript
import { PromoFooterComponent } from './promo-footer/promo-footer.component';
```

Then add `PromoFooterComponent` to the `declarations` array:

```typescript
declarations: [
    AppMenuitemComponent,
    AppTopBarComponent,
    AppFooterComponent,
    AppMenuComponent,
    AppSidebarComponent,
    AppLayoutComponent,
    PromoFooterComponent,
],
```

- [ ] **Step 2: Replace `<app-footer>` in layout template**

In `src/app/layout/app.layout.component.html`, change:

```html
    <app-footer></app-footer>
```

to:

```html
    <app-promo-footer></app-promo-footer>
```

- [ ] **Step 3: Build to verify no errors**

```bash
npx ng build --configuration=development 2>&1 | tail -5
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout/app.layout.module.ts src/app/layout/app.layout.component.html
git commit -m "feat: wire PromoFooterComponent into layout, replacing app-footer"
```

---

### Task 6: Unit test

Add a basic spec for the PromoFooterComponent.

**Files:**
- Create: `src/app/layout/promo-footer/promo-footer.component.spec.ts`

- [ ] **Step 1: Write the test file**

Create `src/app/layout/promo-footer/promo-footer.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PromoFooterComponent } from './promo-footer.component';

describe('PromoFooterComponent', () => {
  let component: PromoFooterComponent;
  let fixture: ComponentFixture<PromoFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromoFooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PromoFooterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should select a promo on init', () => {
    fixture.detectChanges();
    expect(component.selectedPromo).toBeTruthy();
    expect(['instanceiro', 'claudinhos']).toContain(component.selectedPromo.id);
  });

  it('should have exactly 2 promos', () => {
    expect(component.promos.length).toBe(2);
  });

  it('should render the promo title', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('.promo-title');
    expect(title?.textContent).toContain(component.selectedPromo.title);
  });

  it('should render a CTA button only for clickable promos', () => {
    // Force Instanceiro (clickable)
    component.selectedPromo = component.promos.find(p => p.id === 'instanceiro')!;
    fixture.detectChanges();
    const cta = fixture.nativeElement.querySelector('.promo-cta');
    expect(cta).toBeTruthy();
    expect(cta.textContent).toContain('Acessar');

    // Force Claudinhos (not clickable)
    component.selectedPromo = component.promos.find(p => p.id === 'claudinhos')!;
    fixture.detectChanges();
    const ctaAfter = fixture.nativeElement.querySelector('.promo-cta');
    expect(ctaAfter).toBeNull();
  });

  it('should wrap clickable promo in an anchor tag with UTM', () => {
    component.selectedPromo = component.promos.find(p => p.id === 'instanceiro')!;
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.promo-clickable');
    expect(link).toBeTruthy();
    expect(link.href).toContain('utm_source=rocalc');
    expect(link.target).toBe('_blank');
  });

  it('should render selo (non-clickable) as div, not anchor', () => {
    component.selectedPromo = component.promos.find(p => p.id === 'claudinhos')!;
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a.promo-clickable');
    const div = fixture.nativeElement.querySelector('.promo-row:not(a)');
    expect(link).toBeNull();
    expect(div).toBeTruthy();
  });

  it('should display the label tag', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.promo-label');
    expect(label?.textContent?.trim()).toBe('outros projetos da casa');
  });

  it('should display the copyright baseline', () => {
    fixture.detectChanges();
    const baseline = fixture.nativeElement.querySelector('.promo-baseline');
    expect(baseline?.textContent).toContain('© 2026');
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx ng test --watch=false --browsers=ChromeHeadless 2>&1 | tail -20
```

Expected: All tests pass. If any fail, fix the component/template to match.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout/promo-footer/promo-footer.component.spec.ts
git commit -m "test: add unit tests for PromoFooterComponent"
```

---

### Task 7: Visual verification in browser

Start the dev server and manually verify both promo variants render correctly.

**Files:** None (verification only)

- [ ] **Step 1: Start dev server**

```bash
npm start
```

Open http://localhost:4200 in a browser.

- [ ] **Step 2: Verify the promo banner is visible in the footer area**

Scroll to the bottom. One of the two promos should be showing:
- **Instanceiro**: copper gradient, shield+clock logo, "Acessar →" button, `cursor: pointer` on hover
- **Claudinhos**: purple gradient, hood+orb logo, no button, default cursor

- [ ] **Step 3: Refresh multiple times to see both promos**

Refresh the page 5-10 times. Both promos should appear roughly equally (50/50 random).

- [ ] **Step 4: Verify Instanceiro link and UTM**

When Instanceiro is showing:
1. Hover over the banner — background should lighten
2. Click the banner or the "Acessar →" button
3. Verify it opens `https://instanceiro.vercel.app?utm_source=rocalc&utm_medium=promo-footer` in a new tab

- [ ] **Step 5: Verify Claudinhos is not clickable**

When Claudinhos is showing:
1. Hover — cursor should stay default (no pointer)
2. No link, no CTA button

- [ ] **Step 6: Check the label and copyright**

Both promos should show:
- "outros projetos da casa" label tag next to the title
- "© 2026 — RO LATAM Calculator" baseline below the banner

- [ ] **Step 7: Run full test suite to check for regressions**

```bash
npx ng test --watch=false --browsers=ChromeHeadless 2>&1 | tail -20
```

Expected: All existing tests + new promo footer tests pass.
