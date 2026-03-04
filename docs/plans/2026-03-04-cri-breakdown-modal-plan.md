# CriRate Breakdown Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a modal dialog showing a detailed breakdown of how CriRate is calculated (equipment cri, LUK contribution, skill baseCri), accessible via an info icon next to each CriRate display.

**Architecture:** New `CriBreakdownDialogComponent` receives pre-computed breakdown data and renders it. The `calculator.ts` builds the breakdown from existing `equipStatus` per-slot data. The `battle-dmg-summary` component emits events to trigger the modal from parent.

**Tech Stack:** Angular 16, PrimeNG 16 (DynamicDialog, DialogService), TypeScript

---

### Task 1: Add `getCriBreakdown()` method to `calculator.ts`

This is the core data method. It iterates the per-slot `equipStatus` to find all cri contributions, computes the LUK breakdown, and returns a structured object.

**Files:**
- Create: `src/app/layout/pages/ro-calculator/cri-breakdown.model.ts`
- Modify: `src/app/layout/pages/ro-calculator/calculator.ts`
- Test: `src/app/layout/pages/ro-calculator/calculator.spec.ts`

**Step 1: Create the CriBreakdown interfaces**

Create `src/app/layout/pages/ro-calculator/cri-breakdown.model.ts`:

```typescript
export interface CriBreakdownEntry {
  source: string;
  slot: string;
  value: number;
}

export interface LukBreakdownEntry {
  source: string;
  value: number;
  detail?: string;
}

export type CriBreakdownContext = 'status' | 'basic' | 'skill';

export interface CriBreakdown {
  base: number;
  equipEntries: CriBreakdownEntry[];
  equipTotal: number;
  lukBreakdown: {
    baseLuk: number;
    jobLuk: number;
    entries: LukBreakdownEntry[];
    totalLuk: number;
    criFromLuk: number;
    formula: string;
  };
  extraCriToMonster: number;
  skillBaseCri: number;
  skillBaseCriPercentage: number;
  criShield: number;
  total: number;
  isKatar: boolean;
  context: CriBreakdownContext;
}
```

**Step 2: Add the slot name mapping and `getCriBreakdown()` to calculator.ts**

In `src/app/layout/pages/ro-calculator/calculator.ts`, add import at top:

```typescript
import { CriBreakdown, CriBreakdownEntry, CriBreakdownContext, LukBreakdownEntry } from './cri-breakdown.model';
```

Add a private slot name map (place near the top of the class, after the `equipStatus` declaration around line 224):

```typescript
private static readonly SLOT_LABELS: Record<string, string> = {
  weapon: 'Arma',
  weaponCard1: 'Arma Carta 1',
  weaponCard2: 'Arma Carta 2',
  weaponCard3: 'Arma Carta 3',
  weaponCard4: 'Arma Carta 4',
  weaponEnchant0: 'Arma Enc. 0',
  weaponEnchant1: 'Arma Enc. 1',
  weaponEnchant2: 'Arma Enc. 2',
  weaponEnchant3: 'Arma Enc. 3',
  headUpper: 'Topo',
  headUpperCard: 'Topo Carta',
  headUpperEnchant1: 'Topo Enc. 1',
  headUpperEnchant2: 'Topo Enc. 2',
  headUpperEnchant3: 'Topo Enc. 3',
  headMiddle: 'Meio',
  headMiddleCard: 'Meio Carta',
  headMiddleEnchant1: 'Meio Enc. 1',
  headMiddleEnchant2: 'Meio Enc. 2',
  headMiddleEnchant3: 'Meio Enc. 3',
  headLower: 'Baixo',
  headLowerEnchant1: 'Baixo Enc. 1',
  headLowerEnchant2: 'Baixo Enc. 2',
  headLowerEnchant3: 'Baixo Enc. 3',
  armor: 'Armadura',
  armorCard: 'Armadura Carta',
  armorEnchant1: 'Armadura Enc. 1',
  armorEnchant2: 'Armadura Enc. 2',
  armorEnchant3: 'Armadura Enc. 3',
  shield: 'Escudo',
  shieldCard: 'Escudo Carta',
  shieldEnchant1: 'Escudo Enc. 1',
  shieldEnchant2: 'Escudo Enc. 2',
  shieldEnchant3: 'Escudo Enc. 3',
  garment: 'Manto',
  garmentCard: 'Manto Carta',
  garmentEnchant1: 'Manto Enc. 1',
  garmentEnchant2: 'Manto Enc. 2',
  garmentEnchant3: 'Manto Enc. 3',
  boot: 'Sapato',
  bootCard: 'Sapato Carta',
  bootEnchant1: 'Sapato Enc. 1',
  bootEnchant2: 'Sapato Enc. 2',
  bootEnchant3: 'Sapato Enc. 3',
  accLeft: 'Acessório E',
  accLeftCard: 'Acessório E Carta',
  accLeftEnchant1: 'Acessório E Enc. 1',
  accLeftEnchant2: 'Acessório E Enc. 2',
  accLeftEnchant3: 'Acessório E Enc. 3',
  accRight: 'Acessório D',
  accRightCard: 'Acessório D Carta',
  accRightEnchant1: 'Acessório D Enc. 1',
  accRightEnchant2: 'Acessório D Enc. 2',
  accRightEnchant3: 'Acessório D Enc. 3',
  shadowWeapon: 'Shadow Arma',
  shadowWeaponEnchant2: 'Shadow Arma Enc. 2',
  shadowWeaponEnchant3: 'Shadow Arma Enc. 3',
  shadowArmor: 'Shadow Armadura',
  shadowArmorEnchant2: 'Shadow Armadura Enc. 2',
  shadowArmorEnchant3: 'Shadow Armadura Enc. 3',
  shadowShield: 'Shadow Escudo',
  shadowShieldEnchant2: 'Shadow Escudo Enc. 2',
  shadowShieldEnchant3: 'Shadow Escudo Enc. 3',
  shadowBoot: 'Shadow Sapato',
  shadowBootEnchant2: 'Shadow Sapato Enc. 2',
  shadowBootEnchant3: 'Shadow Sapato Enc. 3',
  shadowEarring: 'Shadow Brinco',
  shadowEarringEnchant2: 'Shadow Brinco Enc. 2',
  shadowEarringEnchant3: 'Shadow Brinco Enc. 3',
  shadowPendant: 'Shadow Colar',
  shadowPendantEnchant2: 'Shadow Colar Enc. 2',
  shadowPendantEnchant3: 'Shadow Colar Enc. 3',
  costumeEnchantUpper: 'Costume Enc. Topo',
  costumeEnchantMiddle: 'Costume Enc. Meio',
  costumeEnchantLower: 'Costume Enc. Baixo',
  costumeEnchantGarment: 'Costume Enc. Manto',
  costumeEnchantGarment2: 'Costume Enc. Manto 2',
  costumeEnchantGarment4: 'Costume Enc. Manto 4',
  extra: 'Random Options',
};
```

Add the `getCriBreakdown()` method (place after `getItemSummary()` around line 1707):

```typescript
getCriBreakdown(context: CriBreakdownContext, damageSummary: any): CriBreakdown {
  // 1. Collect equip cri entries from equipStatus
  const equipEntries: CriBreakdownEntry[] = [];
  const itemSummaryFull = this.getItemSummary();

  for (const [slot, stats] of Object.entries(itemSummaryFull)) {
    if (slot === 'consumableBonuses') continue;
    const criVal = (stats as any)?.cri;
    if (criVal && criVal !== 0) {
      const itemData = this.equipItem.get(slot as any);
      const source = itemData?.name || slot;
      equipEntries.push({
        source,
        slot: Calculator.SLOT_LABELS[slot] || slot,
        value: criVal,
      });
    }
  }

  // Add class additional bonus cri (e.g., Two Hand Quicken)
  const additionalCri = (this.totalEquipStatus.cri || 0) - equipEntries.reduce((sum, e) => sum + e.value, 0);
  if (additionalCri > 0) {
    equipEntries.push({
      source: 'Skill/Class Bonus',
      slot: 'Skill',
      value: additionalCri,
    });
  }

  // Sort by value descending
  equipEntries.sort((a, b) => b.value - a.value);

  const equipTotal = equipEntries.reduce((sum, e) => sum + e.value, 0);

  // 2. LUK breakdown
  const { luk, jobLuk } = this.model;
  const equipLukDirect = this.totalEquipStatus.luk ?? 0;
  const allStatusVal = this.totalEquipStatus.allStatus ?? 0;
  const totalLuk = luk + (jobLuk ?? 0) + equipLukDirect;

  const lukEntries: LukBreakdownEntry[] = [];

  // Per-item luk and allStatus entries
  for (const [slot, stats] of Object.entries(itemSummaryFull)) {
    if (slot === 'consumableBonuses') continue;
    const s = stats as any;
    if (s?.allStatus && s.allStatus !== 0) {
      const itemData = this.equipItem.get(slot as any);
      lukEntries.push({
        source: itemData?.name || slot,
        value: s.allStatus,
        detail: 'allStatus',
      });
    }
    if (s?.luk && s.luk !== 0) {
      const itemData = this.equipItem.get(slot as any);
      lukEntries.push({
        source: itemData?.name || slot,
        value: s.luk,
      });
    }
  }

  const isActual = context !== 'status';
  const criFromLuk = isActual ? floor(totalLuk * 0.3) : floor(totalLuk / 3);
  const formulaStr = isActual
    ? `floor(${totalLuk} × 0.3) = ${criFromLuk}`
    : `floor(${totalLuk} / 3) = ${criFromLuk}`;

  // 3. Skill-specific data
  const skillBaseCri = damageSummary?.baseSkillCri ?? 0;
  const skillBaseCriPercentage = damageSummary?.baseCriPercentage ?? 1;

  // 4. Extra cri vs monster and criShield
  const extraCriToMonster = damageSummary?.extraCriToMonster ?? 0;
  const criShield = damageSummary?.criShield ?? 0;

  // 5. Compute total
  const isKatar = this.weaponData.data?.typeName === 'katar';
  let total: number;
  if (context === 'status') {
    const base = 1 + equipTotal + criFromLuk;
    total = isKatar ? base * 2 : base;
  } else if (context === 'basic') {
    const base = 1 + equipTotal + criFromLuk;
    total = Math.max(0, (isKatar ? base * 2 : base) + extraCriToMonster - criShield);
  } else {
    // skill
    const base = 1 + equipTotal + criFromLuk + skillBaseCri;
    const adjusted = isKatar
      ? Math.max(0, floor(base - criShield) * skillBaseCriPercentage)
      : Math.max(0, floor(base * skillBaseCriPercentage) - criShield);
    total = floor(adjusted);
  }

  return {
    base: 1,
    equipEntries,
    equipTotal,
    lukBreakdown: {
      baseLuk: luk,
      jobLuk: jobLuk ?? 0,
      entries: lukEntries,
      totalLuk,
      criFromLuk,
      formula: formulaStr,
    },
    extraCriToMonster,
    skillBaseCri: context === 'skill' ? skillBaseCri : 0,
    skillBaseCriPercentage: context === 'skill' ? skillBaseCriPercentage : 1,
    criShield,
    total,
    isKatar,
    context,
  };
}
```

**Step 3: Expose skill cri data from damage-calculator.ts**

In `src/app/layout/pages/ro-calculator/damage-calculator.ts`, in the skill summary return object (around line 1389-1420), add `baseSkillCri`, `baseCriPercentage`, `extraCriToMonster`, and `criShield` to the returned `damageSummary`:

Find the return block that builds the skill summary (around line 1396). It already has fields like `skillCriRateToMonster`. Add these new fields:

```typescript
// Add near the existing skill summary fields (around line 1415-1420):
baseSkillCri: baseSkillCri,
baseCriPercentage: baseCriPercentage,
extraCriToMonster: this.getExtraCriRateToMonster(),
criShield: criShield,
```

**Step 4: Write test for getCriBreakdown**

In `src/app/layout/pages/ro-calculator/calculator.spec.ts`, add:

```typescript
describe('getCriBreakdown', () => {
  it('should return base 1 for empty build', () => {
    const calc = new Calculator(/* mock */);
    // After prepare with minimal data
    const breakdown = calc.getCriBreakdown('status', {});
    expect(breakdown.base).toBe(1);
    expect(breakdown.equipTotal).toBe(0);
    expect(breakdown.lukBreakdown.criFromLuk).toBeGreaterThanOrEqual(0);
    expect(breakdown.total).toBeGreaterThanOrEqual(1);
  });

  it('should use floor(luk/3) for status context', () => {
    const calc = new Calculator(/* mock with luk: 99 */);
    const breakdown = calc.getCriBreakdown('status', {});
    expect(breakdown.lukBreakdown.formula).toContain('/ 3');
  });

  it('should use floor(luk*0.3) for basic context', () => {
    const calc = new Calculator(/* mock with luk: 99 */);
    const breakdown = calc.getCriBreakdown('basic', {});
    expect(breakdown.lukBreakdown.formula).toContain('× 0.3');
  });
});
```

Note: The existing `calculator.spec.ts` has a mock `Calculator` setup. Follow the existing test patterns in that file.

**Step 5: Run tests**

Run: `npm test -- --include="**/calculator.spec.ts"`
Expected: PASS

**Step 6: Commit**

```bash
git add src/app/layout/pages/ro-calculator/cri-breakdown.model.ts src/app/layout/pages/ro-calculator/calculator.ts src/app/layout/pages/ro-calculator/calculator.spec.ts src/app/layout/pages/ro-calculator/damage-calculator.ts
git commit -m "feat: add getCriBreakdown() method to calculator"
```

---

### Task 2: Create `CriBreakdownDialogComponent`

This is a pure display component that receives `CriBreakdown` data via PrimeNG DynamicDialog and renders the formatted breakdown.

**Files:**
- Create: `src/app/layout/pages/ro-calculator/cri-breakdown-dialog/cri-breakdown-dialog.component.ts`
- Create: `src/app/layout/pages/ro-calculator/cri-breakdown-dialog/cri-breakdown-dialog.component.html`
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.module.ts`

**Step 1: Create the component TypeScript file**

Create `src/app/layout/pages/ro-calculator/cri-breakdown-dialog/cri-breakdown-dialog.component.ts`:

```typescript
import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { CriBreakdown } from '../cri-breakdown.model';

@Component({
  selector: 'app-cri-breakdown-dialog',
  templateUrl: './cri-breakdown-dialog.component.html',
  styles: [
    `
      .cri-section-header {
        font-weight: 600;
        border-bottom: 1px solid #444;
        padding-bottom: 4px;
        margin-bottom: 6px;
        margin-top: 12px;
      }
      .cri-row {
        display: flex;
        justify-content: space-between;
        padding: 2px 0;
        font-size: 0.875rem;
      }
      .cri-row-source {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cri-row-slot {
        flex: 0 0 140px;
        text-align: center;
        color: #aaa;
        font-size: 0.8rem;
      }
      .cri-row-value {
        flex: 0 0 50px;
        text-align: right;
        font-weight: 600;
        color: #4ade80;
      }
      .cri-total-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0 4px;
        border-top: 2px solid #666;
        margin-top: 8px;
        font-weight: 700;
        font-size: 0.95rem;
      }
      .cri-formula {
        color: #aaa;
        font-size: 0.8rem;
        font-style: italic;
      }
      .cri-luk-total {
        font-weight: 600;
        padding-top: 4px;
        border-top: 1px solid #333;
        margin-top: 4px;
      }
    `,
  ],
})
export class CriBreakdownDialogComponent {
  data: CriBreakdown;

  constructor(private config: DynamicDialogConfig) {
    this.data = this.config.data;
  }

  get contextLabel(): string {
    switch (this.data.context) {
      case 'status':
        return 'Status';
      case 'basic':
        return 'Basic ATQ';
      case 'skill':
        return 'Skill';
    }
  }
}
```

**Step 2: Create the component HTML template**

Create `src/app/layout/pages/ro-calculator/cri-breakdown-dialog/cri-breakdown-dialog.component.html`:

```html
<div *ngIf="data">
  <!-- Equipment Section -->
  <div class="cri-section-header">
    Equipamentos ({{ data.equipTotal }})
  </div>
  <div *ngFor="let entry of data.equipEntries" class="cri-row">
    <span class="cri-row-source">{{ entry.source }}</span>
    <span class="cri-row-slot">{{ entry.slot }}</span>
    <span class="cri-row-value">+{{ entry.value }}</span>
  </div>
  <div *ngIf="data.equipEntries.length === 0" class="cri-row" style="color: #aaa;">
    Nenhum equipamento com CRI
  </div>

  <!-- LUK Section -->
  <div class="cri-section-header">
    LUK → Cri ({{ data.lukBreakdown.criFromLuk }})
  </div>
  <div class="cri-row">
    <span class="cri-row-source">Base LUK</span>
    <span class="cri-row-slot"></span>
    <span class="cri-row-value" style="color: #fff;">{{ data.lukBreakdown.baseLuk }}</span>
  </div>
  <div *ngFor="let entry of data.lukBreakdown.entries" class="cri-row">
    <span class="cri-row-source">
      {{ entry.source }}
      <span *ngIf="entry.detail" class="cri-formula">({{ entry.detail }})</span>
    </span>
    <span class="cri-row-slot"></span>
    <span class="cri-row-value">+{{ entry.value }}</span>
  </div>
  <div *ngIf="data.lukBreakdown.jobLuk > 0" class="cri-row">
    <span class="cri-row-source">Job Bonus</span>
    <span class="cri-row-slot"></span>
    <span class="cri-row-value">+{{ data.lukBreakdown.jobLuk }}</span>
  </div>
  <div class="cri-row cri-luk-total">
    <span class="cri-row-source">Total LUK</span>
    <span class="cri-row-slot"></span>
    <span class="cri-row-value" style="color: #fff;">{{ data.lukBreakdown.totalLuk }}</span>
  </div>
  <div class="cri-row">
    <span class="cri-row-source cri-formula">{{ data.lukBreakdown.formula }}</span>
    <span class="cri-row-slot"></span>
    <span class="cri-row-value">{{ data.lukBreakdown.criFromLuk }}</span>
  </div>

  <!-- Katar doubling note -->
  <div *ngIf="data.isKatar" class="cri-row" style="color: #facc15; margin-top: 4px;">
    <span class="cri-row-source">Katar ×2</span>
    <span class="cri-row-slot"></span>
    <span class="cri-row-value" style="color: #facc15;">×2</span>
  </div>

  <!-- Skill Section (only for skill context) -->
  <ng-container *ngIf="data.context === 'skill' && data.skillBaseCri > 0">
    <div class="cri-section-header">
      Skill Cri
    </div>
    <div class="cri-row">
      <span class="cri-row-source">Base Skill Cri</span>
      <span class="cri-row-slot"></span>
      <span class="cri-row-value">+{{ data.skillBaseCri }}</span>
    </div>
    <div *ngIf="data.skillBaseCriPercentage !== 1" class="cri-row">
      <span class="cri-row-source">baseCriPercentage</span>
      <span class="cri-row-slot"></span>
      <span class="cri-row-value" style="color: #facc15;">×{{ data.skillBaseCriPercentage }}</span>
    </div>
  </ng-container>

  <!-- Extra cri vs monster (basic/skill only) -->
  <ng-container *ngIf="data.context !== 'status' && (data.extraCriToMonster > 0 || data.criShield > 0)">
    <div class="cri-section-header">
      vs Monstro
    </div>
    <div *ngIf="data.extraCriToMonster > 0" class="cri-row">
      <span class="cri-row-source">Cri vs Race/Element/Size</span>
      <span class="cri-row-slot"></span>
      <span class="cri-row-value">+{{ data.extraCriToMonster }}</span>
    </div>
    <div *ngIf="data.criShield > 0" class="cri-row">
      <span class="cri-row-source">Monster CriShield</span>
      <span class="cri-row-slot"></span>
      <span class="cri-row-value" style="color: #f87171;">-{{ data.criShield }}</span>
    </div>
  </ng-container>

  <!-- Total -->
  <div class="cri-total-row">
    <span>CriRate ({{ contextLabel }})</span>
    <span style="color: #4ade80;">{{ data.total }}</span>
  </div>
</div>
```

**Step 3: Register component in module**

In `src/app/layout/pages/ro-calculator/ro-calculator.module.ts`:

Add import at top:
```typescript
import { CriBreakdownDialogComponent } from './cri-breakdown-dialog/cri-breakdown-dialog.component';
```

Add to `declarations` array (around line 95, after `BattleDmgSummaryComponent`):
```typescript
CriBreakdownDialogComponent,
```

**Step 4: Verify build compiles**

Run: `npx ng build --configuration=development 2>&1 | tail -5`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/app/layout/pages/ro-calculator/cri-breakdown-dialog/ src/app/layout/pages/ro-calculator/ro-calculator.module.ts
git commit -m "feat: add CriBreakdownDialogComponent"
```

---

### Task 3: Add info icon to status panel

Add the clickable info icon next to CriRate in the status panel and wire it to open the modal.

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.html`
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.ts`

**Step 1: Add `openCriBreakdown()` method to ro-calculator.component.ts**

At the top of the file, add import:
```typescript
import { CriBreakdownDialogComponent } from './cri-breakdown-dialog/cri-breakdown-dialog.component';
import { CriBreakdownContext } from './cri-breakdown.model';
```

Add this method (place near other dialog methods like `openPresetManagement()` around line 1660):

```typescript
openCriBreakdown(context: CriBreakdownContext) {
  const breakdown = this.calculator.getCriBreakdown(context, this.totalSummary?.dmg);
  this.dialogService.open(CriBreakdownDialogComponent, {
    header: 'CriRate Breakdown',
    width: '420px',
    contentStyle: { overflow: 'auto', 'max-height': '80vh' },
    baseZIndex: 10000,
    dismissableMask: true,
    data: breakdown,
  });
}
```

**Step 2: Add icon to status panel HTML**

In `src/app/layout/pages/ro-calculator/ro-calculator.component.html`, find the CriRate display (around line 374-378):

```html
<div class="col-12" [pTooltip]="statDeltaTooltips['cri_row']" [escape]="false" tooltipPosition="right">
  CriRate:
  <span class="font-semibold px-1 summary_stat_atk">{{ totalSummary?.calc?.totalCri || 0 }}</span>
  Dmg: <span class="font-semibold px-1 summary_stat_atk">{{ totalSummary?.criDmg || 0 }} %</span>
</div>
```

Replace with:

```html
<div class="col-12" [pTooltip]="statDeltaTooltips['cri_row']" [escape]="false" tooltipPosition="right">
  CriRate:
  <span class="font-semibold px-1 summary_stat_atk">{{ totalSummary?.calc?.totalCri || 0 }}</span>
  <i class="pi pi-info-circle" style="cursor:pointer;color:#60a5fa;font-size:0.75rem;vertical-align:middle;" (click)="openCriBreakdown('status'); $event.stopPropagation()"></i>
  Dmg: <span class="font-semibold px-1 summary_stat_atk">{{ totalSummary?.criDmg || 0 }} %</span>
</div>
```

**Step 3: Verify in browser**

Run: `npm start` (if not already running)
Navigate to http://localhost:4200, load any build, click the info icon next to CriRate in the status panel.
Expected: Modal opens showing equipment cri breakdown and LUK formula.

**Step 4: Commit**

```bash
git add src/app/layout/pages/ro-calculator/ro-calculator.component.ts src/app/layout/pages/ro-calculator/ro-calculator.component.html
git commit -m "feat: add cri breakdown icon to status panel"
```

---

### Task 4: Add info icons to Basic ATQ and Skill CriRate

Wire the battle-dmg-summary component to emit events that trigger the modal.

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/battle-dmg-summary/battle-dmg-summary.component.ts`
- Modify: `src/app/layout/pages/ro-calculator/battle-dmg-summary/battle-dmg-summary.component.html`
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.html` (bind event)

**Step 1: Add @Output to battle-dmg-summary.component.ts**

In `src/app/layout/pages/ro-calculator/battle-dmg-summary/battle-dmg-summary.component.ts`, add to imports:

```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';
```

Add the new Output (after existing `@Output() showElementTableClick`):

```typescript
@Output() criBreakdownClick = new EventEmitter<string>();
```

**Step 2: Add icon to Basic ATQ CriRate in HTML**

In `src/app/layout/pages/ro-calculator/battle-dmg-summary/battle-dmg-summary.component.html`, find the Basic ATQ CriRate (around line 434-443):

```html
<div class="col-6">
  <app-calc-value
    [enableCompare]="isEnableCompare && totalSummary2?.dmg"
    label="CriRate:"
    styleClass="summary_damage"
    styleClass2="summary_compare"
    [max]="totalSummary?.dmg?.criRateToMonster"
    [max2]="totalSummary2?.dmg?.criRateToMonster"
  ></app-calc-value>
</div>
```

Replace with:

```html
<div class="col-6" style="display:flex;align-items:center;">
  <app-calc-value
    [enableCompare]="isEnableCompare && totalSummary2?.dmg"
    label="CriRate:"
    styleClass="summary_damage"
    styleClass2="summary_compare"
    [max]="totalSummary?.dmg?.criRateToMonster"
    [max2]="totalSummary2?.dmg?.criRateToMonster"
    style="flex:1;"
  ></app-calc-value>
  <i class="pi pi-info-circle" style="cursor:pointer;color:#60a5fa;font-size:0.75rem;margin-left:2px;" (click)="criBreakdownClick.emit('basic')"></i>
</div>
```

**Step 3: Add icon to Skill CriRate in HTML**

Find the Skill CriRate display (around line 218-227):

```html
<div class="col-6" [hidden]="!totalSummary?.dmg?.skillCanCri">
  <app-calc-value
    [enableCompare]="isEnableCompare && totalSummary2?.dmg"
    label="CriRate:"
    styleClass="summary_damage"
    styleClass2="summary_compare"
    [max]="totalSummary?.dmg?.skillCriRateToMonster"
    [max2]="totalSummary2?.dmg?.skillCriRateToMonster"
  ></app-calc-value>
</div>
```

Replace with:

```html
<div class="col-6" [hidden]="!totalSummary?.dmg?.skillCanCri" style="display:flex;align-items:center;">
  <app-calc-value
    [enableCompare]="isEnableCompare && totalSummary2?.dmg"
    label="CriRate:"
    styleClass="summary_damage"
    styleClass2="summary_compare"
    [max]="totalSummary?.dmg?.skillCriRateToMonster"
    [max2]="totalSummary2?.dmg?.skillCriRateToMonster"
    style="flex:1;"
  ></app-calc-value>
  <i class="pi pi-info-circle" style="cursor:pointer;color:#60a5fa;font-size:0.75rem;margin-left:2px;" (click)="criBreakdownClick.emit('skill')"></i>
</div>
```

**Step 4: Bind event in parent template**

In `src/app/layout/pages/ro-calculator/ro-calculator.component.html`, find where `<app-battle-dmg-summary` is used (search for `app-battle-dmg-summary`). Add the event binding:

```html
(criBreakdownClick)="openCriBreakdown($event)"
```

to the existing `<app-battle-dmg-summary>` tag.

**Step 5: Verify in browser**

Navigate to http://localhost:4200, load a build with a cri skill (e.g., Focused Arrow Strike). Click the info icons next to CriRate in:
1. Basic ATQ section → modal should show `basic` context (floor × 0.3, no skill cri)
2. Skill section → modal should show `skill` context (floor × 0.3, skill baseCri, baseCriPercentage)

**Step 6: Commit**

```bash
git add src/app/layout/pages/ro-calculator/battle-dmg-summary/ src/app/layout/pages/ro-calculator/ro-calculator.component.html
git commit -m "feat: add cri breakdown icons to basic ATQ and skill sections"
```

---

### Task 5: Run full tests and verify

**Step 1: Run unit tests**

Run: `npm test`
Expected: All tests pass (88/88 or more)

**Step 2: Manual E2E verification**

Load the RK build: http://localhost:4200/#/shared-presets/8e579653-17a1-4eba-8bb3-54b98969eef1

1. Click info icon next to status CriRate (170) → verify:
   - Equipment total = 118, LUK formula = floor(154/3) = 51
   - Total = 1 + 118 + 51 = 170

2. Click info icon next to Basic ATQ CriRate → verify:
   - Uses floor(154 × 0.3) = 46

3. Click info icon next to Skill CriRate → verify:
   - Shows Ignition Break context (canCri: true, baseCri if any)

**Step 3: Run lint**

Run: `npm run lint`
Expected: No new errors

**Step 4: Build production**

Run: `npx ng build --configuration=development`
Expected: Build succeeds

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address review feedback for cri breakdown modal"
```
