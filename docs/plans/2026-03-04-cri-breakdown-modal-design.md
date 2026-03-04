# CriRate Breakdown Modal — Design Document

## Goal

Add a modal dialog that shows a detailed breakdown of how CriRate is calculated, accessible via an info icon next to each CriRate display in the UI (status panel, basic ATQ, skill DPS). This helps users understand exactly where their crit rate comes from.

## Context

CriRate confuses many users because it aggregates contributions from:
- Equipment cards and enchants (e.g., Insígnia do Talento, Módulo Crítico, Pedra de Crítico)
- Active skills (e.g., Two Hand Quicken +12 cri for two-hand swords)
- LUK stat (including allStatus bonuses from items/consumables)
- Costume enchant set bonuses (e.g., Mortal 1+2+3+4 set)
- Random options (user-entered extra bonuses)
- Skill-specific baseCri (e.g., Focused Arrow Strike +50)
- Monster criShield reduction

The existing tooltip (`statDeltaTooltips['cri_row']`) only shows per-item cri values without the LUK contribution or final formula.

## Architecture

### Data Model

```typescript
interface CriBreakdownEntry {
  source: string;    // item/skill name
  slot: string;      // human-readable slot (e.g., "Armadura Carta")
  value: number;     // cri contribution
}

interface LukBreakdownEntry {
  source: string;    // item/consumable name
  value: number;     // LUK contributed
  detail?: string;   // e.g., "allStatus +10 per refine"
}

interface CriBreakdown {
  base: 1;
  equipEntries: CriBreakdownEntry[];
  equipTotal: number;
  lukBreakdown: {
    baseLuk: number;
    jobLuk: number;
    entries: LukBreakdownEntry[];
    totalLuk: number;
    criFromLuk: number;
    formula: string;       // e.g., "floor(154 / 3) = 51"
  };
  extraCriToMonster: number;  // race/element/size cri bonuses (basic/skill only)
  skillBaseCri?: number;      // skill-specific baseCri (skill context only)
  criDmgPercentage?: number;  // skill criDmgPercentage (skill context only)
  criShield: number;          // monster's cri shield
  total: number;
  context: 'status' | 'basic' | 'skill';
}
```

### New Component: `CriBreakdownDialogComponent`

**Location:** `src/app/layout/pages/ro-calculator/cri-breakdown-dialog/`

**Files:**
- `cri-breakdown-dialog.component.ts`
- `cri-breakdown-dialog.component.html`

**Behavior:**
- Receives `CriBreakdown` data via PrimeNG DynamicDialogConfig
- Renders 3 sections: Equipment, LUK, and (optionally) Skill
- Shows final formula at bottom
- Pure display component, no calculation logic

### Data Source: `calculator.ts` → `getCriBreakdown(context)`

New public method that:
1. Iterates `equipStatus` slots, collects entries where `cri > 0`
2. Maps slot keys to human-readable names (e.g., `armorCard` → "Armadura Carta")
3. Computes LUK breakdown from `totalEquipStatus.luk`, `totalEquipStatus.allStatus`, `model.luk`, job bonus
4. Calls appropriate criFromLuk formula based on context
5. For 'basic'/'skill' contexts, includes `getExtraCriRateToMonster()` and criShield

### Exposure from `damage-calculator.ts`

Need to expose (via public getters or parameters):
- `getBaseCriRate(isActual)` result components (currently private)
- `getExtraCriRateToMonster()` result (currently private)
- criShield value
- For skill context: the selected skill's `baseCri` and `baseCriPercentage`

### Integration Points

**Status panel** (`ro-calculator.component.html` ~line 374):
- Add `<i class="pi pi-info-circle">` next to CriRate value
- `(click)="openCriBreakdown('status')"`

**Basic ATQ** (`battle-dmg-summary.component.html` ~line 434):
- Add icon next to CriRate label
- `@Output() criBreakdownClick = new EventEmitter<string>()`
- Emits `'basic'` on click

**Skill DPS** (`battle-dmg-summary.component.html` ~line 218):
- Same pattern, emits `'skill'` on click

**ro-calculator.component.ts**:
- `openCriBreakdown(context)`: calls `calculator.getCriBreakdown(context)`, opens dialog via `dialogService.open()`

## UI Layout

```
┌──────────────────────────────────────────────┐
│  CriRate Breakdown                       [X] │
├──────────────────────────────────────────────┤
│                                              │
│  ── Equipamentos (118) ───────────────────── │
│  Insígnia do Talento 5   Head Enc.1     +15  │
│  Carta Raposa Raivosa    Armor Carta    +15  │
│  Pedra de Crítico 4      Acc.E Enc.2    +14  │
│  Two Hand Quicken        Skill          +12  │
│  Módulo Crítico          Garment Enc.1  +10  │
│  Módulo Crítico          Garment Enc.2  +10  │
│  Mortal 4 (set)          Costume Enc.   +10  │
│  Módulo Força Crítica    Armor Enc.3     +5  │
│  Carta Bafinho Caótico   Boot Carta      +5  │
│  Carta Aquecedor Ominoso Acc.E Carta     +3  │
│  Carta Aquecedor Ominoso Acc.D Carta     +3  │
│  Random Options          Extra           +4  │
│                                              │
│  ── LUK → Cri (51) ──────────────────────── │
│  Base LUK                              125   │
│  Bolinho Divino (allStatus)            +10   │
│  Colar Sombrio Total +10 (allStatus)   +10   │
│  Memorável Poder das Runas (allStatus)  +1   │
│  SOR +5                                 +5   │
│  SOR +3                                 +3   │
│  Job Bonus (job lv 1)                   +0   │
│  Total LUK:                            154   │
│  floor(154 / 3) =                       51   │
│                                              │
│  ═══════════════════════════════════════════  │
│  Base (1) + Equip (118) + LUK (51) = 170    │
└──────────────────────────────────────────────┘
```

For 'skill' context, an additional section appears:
```
│  ── Skill: Focused Arrow Strike ──────────── │
│  Base Skill Cri                         +50  │
│  baseCriPercentage                     ×1.0  │
```

For 'basic'/'skill' context, extra cri vs monster and criShield appear if non-zero.

## Style

- Dark theme, consistent with project
- Positive values in green (#4ADE80)
- Compact width: ~420px
- Section headers with subtle dividers
- Monospace alignment for values column
- Icon trigger: `pi pi-info-circle` in muted blue, cursor pointer, small size

## Files Changed

| File | Change |
|------|--------|
| `calculator.ts` | New `getCriBreakdown(context)` method, slot name mapping |
| `damage-calculator.ts` | Expose cri-related private data via getters |
| `ro-calculator.component.ts` | `openCriBreakdown()` method |
| `ro-calculator.component.html` | Info icon on status panel CriRate |
| `battle-dmg-summary.component.ts` | New `@Output() criBreakdownClick` |
| `battle-dmg-summary.component.html` | Info icons on Basic/Skill CriRate |
| **New:** `cri-breakdown-dialog.component.ts` | Dialog component |
| **New:** `cri-breakdown-dialog.component.html` | Dialog template |

## Testing

- Unit test: `getCriBreakdown()` returns correct structure for a mock build
- Manual E2E: open a shared build, click the icon, verify breakdown matches expected values
