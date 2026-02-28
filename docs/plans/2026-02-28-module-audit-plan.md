# EP17.2 Module Audit Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix module-to-equipment target assignments, add max enchant validation with progressive slot unlocking, and add missing modules.

**Architecture:** Refactor `automatic.ts` to define per-equipment module arrays matching the official reference table. Add a `moduleMaxEnchant` map. Update `equipment.component.ts` to filter enchant dropdowns based on already-selected modules and their max counts, with progressive slot unlocking (slot 2 requires slot 1, slot 3 requires slot 2).

**Tech Stack:** Angular 16, TypeScript, PrimeNG dropdowns

---

### Task 1: Refactor `automatic.ts` — correct module arrays per equipment

**Files:**
- Modify: `src/app/constants/enchant_item/automatic.ts`

**Step 1: Replace the entire file content**

Replace `src/app/constants/enchant_item/automatic.ts` with the correct per-equipment arrays:

```typescript
// ============================================================
// EP17.2 Automatic Modification Modules
// Reference: Divine Pride EP17.2 enchant table
// ============================================================

// --- Epic modules (skill-specific) — Armor A/B only, max 2 ---
export const autoModEpic = [
  'Auto_Module_Db',   // Dragon Breath
  'Auto_Module_Wb',   // Wave Break
  'Auto_Module_Hs',   // Hundred Spiral
  'Auto_Module_Dp',   // Drive Press
  'Auto_Module_Vc',   // Vanishing Cannon
  'Auto_Module_Gg',   // Genesis Gloria
  'Auto_Module_Bc',   // Boost Cannon
  'Auto_Module_If',   // Ice Flame
  'Auto_Module_Ts',   // Tornado Swing
  'Auto_Module_Ct',   // Cannon Tornado
  'Auto_Module_Cm',   // Crazy Mandragora
  'Auto_Module_Ae',   // Acid Explosion
  'Auto_Module_Si',   // Sonic Impact
  'Auto_Module_Cs',   // Cutter Slasher
  'Auto_Module_Bs',   // Berserk Slash
  'Auto_Module_Fr',   // Fatal Raid
  'Auto_Module_Ss',   // Shadow Spell
  'Auto_Module_As',   // Angle Shot
  'Auto_Module_Ce',   // Crimson Strain
  'Auto_Module_Jl',   // Jack Lightning
  'Auto_Module_Cv',   // Comet Vortex
  'Auto_Module_Dbl',  // Double Bolt
  'Auto_Module_Ww',   // Warmer Wave
  'Auto_Module_Dg',   // Diamond Grave
  'Auto_Module_Mg',   // Magnus
  'Auto_Module_Hj',   // Holy Judex
  'Auto_Module_Du',   // Duple Light
  'Auto_Module_Ft',   // Fallen Tiger
  'Auto_Module_Ra',   // Rampage Arrow
  'Auto_Module_Rc',   // Raging Crush
  'Auto_Module_Cl',   // Cluster
  'Auto_Module_Bs2',  // Breeze Shooting
  'Auto_Module_Ab',   // Aimed Storm
  'Auto_Module_Me',   // Metallic Echo
  'Auto_Module_Rev',  // Reverberation
  'Auto_Module_Vs',   // Vulcan Severe
  'Auto_Module_Be',   // Blaze Explosion
  'Auto_Module_Mk',   // Moon Kick
  'Auto_Module_Ff',   // Falling Flash
  'Auto_Module_Ew',   // Esma/Eswhoo
  'Auto_Module_Esp',  // Espa
  'Auto_Module_Cx',   // Curse Explosion
  'Auto_Module_Dh',   // Death Hammer Dance
  'Auto_Module_Fh',   // Fire Howling Tail
  'Auto_Module_Sb',   // Storm Buster Trip
  'Auto_Module_Ps',   // Petal Spear Blade
  'Auto_Module_Csl',  // Cross Slash
  'Auto_Module_Dd',   // Dragon Draft Wind
  'Auto_Module_Sea',  // Power of Sea
  'Auto_Module_Land', // Power of Land
  'Auto_Module_Life', // Power of Life
];

// --- Per-equipment module lists ---

// Armor A/B: Normal(DEF,MDEF) + Rare(ATK,MATK,Shooter) + Unique(armor) + Epic
export const autoArmorModules = [
  'Auto_Module_A',    // Defense (Normal, max 3)
  'Auto_Module_A2',   // Magic Defense (Normal, max 3)
  'Auto_Module_B10',  // Attack Power (Rare, max 2)
  'Auto_Module_B11',  // Magic Power (Rare, max 2)
  'Auto_Module_B12',  // Sharpshooter/Shooter (Rare, max 2)
  'Auto_Module_C2',   // Magical Force (Unique, max 1)
  'Auto_Module_C3',   // Attacker Force (Unique, max 1)
  'Auto_Module_C',    // Range Force (Unique, max 1)
  'Auto_Module_C4',   // Critical Force (Unique, max 1)
  // 'Auto_Module_C5', // Recovery Force (Unique, max 1) — TBD: add to item.json
  // 'Auto_Module_C11',// Mirror Counter (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C6',   // Delay after skill (Unique, max 1)
  'Auto_Module_C8',   // Power Force (Unique, max 1)
  ...autoModEpic,
];

// Engine Wing A/B: Normal(DEF,MDEF) + Rare(Fast,Caster,Critical) + Unique(engine)
export const autoEngineModules = [
  'Auto_Module_A',    // Defense (Normal, max 3)
  'Auto_Module_A2',   // Magic Defense (Normal, max 3)
  // 'Auto_Module_B7', // Fast (Rare, max 2) — TBD: add to item.json
  'Auto_Module_B14',  // Caster (Rare, max 2)
  'Auto_Module_B15',  // Critical (Rare, max 2)
  // 'Auto_Module_C12',// Above All (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C9',   // Powerful (Unique, max 1)
  // 'Auto_Module_C13',// Reflection Reject (Unique, max 1) — TBD: add to item.json
];

// Leg A/B: Normal(DEF,MDEF) + Rare(Vital,Mental,Heal) + Unique(leg) + Legendary
export const autoLegModules = [
  'Auto_Module_A',    // Defense (Normal, max 3)
  'Auto_Module_A2',   // Magic Defense (Normal, max 3)
  // 'Auto_Module_B8', // Vital (Rare, max 2) — TBD: add to item.json
  // 'Auto_Module_B9', // Mental (Rare, max 2) — TBD: add to item.json
  // 'Auto_Module_B16',// Heal (Rare, max 2) — TBD: add to item.json
  'Auto_Module_C7',   // Fixed Casting (Unique, max 1)
  // 'Auto_Module_C14',// Robust (Unique, max 1) — TBD: add to item.json
  // Legendary — TBD: add to item.json
  // 'Auto_Module_L1', // Unlimited Vital
  // 'Auto_Module_L2', // Spell Buster
  // 'Auto_Module_L3', // Firing Shot
  // 'Auto_Module_L4', // Overpower
  // 'Auto_Module_L5', // Fatal Flash
  // 'Auto_Module_L6', // Lucky Strike
];

// Accessory Right (Booster R, Battle Chip R):
// Normal(VIT,LUK,STR,AGI,HP Recovery) + Rare(Spell,ASPD,Fatal,Expert Archer)
// + Unique(Drain Life, Magic Healing, All Force)
export const autoAccRModules = [
  'Auto_Module_A3',   // VIT (Normal, max 2)
  'Auto_Module_A4',   // LUK (Normal, max 2)
  'Auto_Module_A5',   // STR (Normal, max 2)
  'Auto_Module_A6',   // AGI (Normal, max 2)
  // 'Auto_Module_A9', // HP Recovery (Normal, max 2) — TBD: add to item.json
  'Auto_Module_B3',   // Spell (Rare, max 1)
  'Auto_Module_B4',   // Attack Speed (Rare, max 1)
  'Auto_Module_B5',   // Fatal (Rare, max 1)
  'Auto_Module_B6',   // Expert Archer (Rare, max 1)
  // 'Auto_Module_C15',// Drain Life (Unique, max 1) — TBD: add to item.json
  // 'Auto_Module_C16',// Magic Healing (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C10',  // All Force (Unique, max 1)
];

// Accessory Left (Booster L, Battle Chip L):
// Normal(VIT,LUK,INT,DEX,SP Recovery) + Rare(Spell,ASPD,Fatal,Expert Archer)
// + Unique(Drain Soul, Magic Soul, All Force)
export const autoAccLModules = [
  'Auto_Module_A3',   // VIT (Normal, max 2)
  'Auto_Module_A4',   // LUK (Normal, max 2)
  'Auto_Module_A7',   // INT (Normal, max 2)
  'Auto_Module_A8',   // DEX (Normal, max 2)  — was incorrectly in armor/garment/shoes before
  // 'Auto_Module_A10',// SP Recovery (Normal, max 2) — TBD: add to item.json
  'Auto_Module_B3',   // Spell (Rare, max 1)
  'Auto_Module_B4',   // Attack Speed (Rare, max 1)
  'Auto_Module_B5',   // Fatal (Rare, max 1)
  'Auto_Module_B6',   // Expert Archer (Rare, max 1)
  // 'Auto_Module_C17',// Drain Soul (Unique, max 1) — TBD: add to item.json
  // 'Auto_Module_C18',// Magic Soul (Unique, max 1) — TBD: add to item.json
  'Auto_Module_C10',  // All Force (Unique, max 1)
];

// --- Max enchant per module (default is 1 if not listed) ---
export const moduleMaxEnchant: Record<string, number> = {
  // Normal — Defense/MDEF: max 3
  'Auto_Module_A': 3,
  'Auto_Module_A2': 3,
  // Normal — Stats: max 2
  'Auto_Module_A3': 2,   // VIT
  'Auto_Module_A4': 2,   // LUK
  'Auto_Module_A5': 2,   // STR
  'Auto_Module_A6': 2,   // AGI
  'Auto_Module_A7': 2,   // INT
  'Auto_Module_A8': 2,   // DEX
  // Normal — Recovery: max 2  (TBD aegis names)
  // 'Auto_Module_A9': 2,  // HP Recovery
  // 'Auto_Module_A10': 2, // SP Recovery
  // Rare — Armor: max 2
  'Auto_Module_B10': 2,  // Attack Power
  'Auto_Module_B11': 2,  // Magic Power
  'Auto_Module_B12': 2,  // Sharpshooter
  // Rare — Engine: max 2
  // 'Auto_Module_B7': 2, // Fast (TBD)
  'Auto_Module_B14': 2,  // Caster
  'Auto_Module_B15': 2,  // Critical
  // Rare — Leg: max 2
  // 'Auto_Module_B8': 2, // Vital (TBD)
  // 'Auto_Module_B9': 2, // Mental (TBD)
  // 'Auto_Module_B16': 2,// Heal (TBD)
  // Epic — max 2
  ...Object.fromEntries(autoModEpic.map(aegis => [aegis, 2])),
  // Everything else (Rare acc max 1, Unique max 1, Legendary max 1) defaults to 1
};

/** Helper: get max enchant for a module aegisName. Returns 1 if not found. */
export function getModuleMaxEnchant(aegisName: string): number {
  return moduleMaxEnchant[aegisName] ?? 1;
}
```

**Step 2: Verify it compiles**

Run: `npx ng build --configuration=development 2>&1 | head -20`
Expected: Compilation errors about missing imports in `_enchant_table.ts` (old slot names removed). This is expected — we fix it in Task 2.

**Step 3: Commit**

```bash
git add src/app/constants/enchant_item/automatic.ts
git commit -m "refactor: rewrite automatic module arrays with correct per-equipment targets"
```

---

### Task 2: Update `_enchant_table.ts` — use new arrays + remove duplicates

**Files:**
- Modify: `src/app/constants/enchant_item/_enchant_table.ts:145` (import line)
- Modify: `src/app/constants/enchant_item/_enchant_table.ts:774-783` (remove old entries)
- Modify: `src/app/constants/enchant_item/_enchant_table.ts:1795-1805` (update new entries)

**Step 1: Update the import at line 145**

Replace:
```typescript
import { autoArmorSlot1, autoArmorSlot2, autoArmorSlot3, autoGarmentSlot1, autoGarmentSlot2, autoGarmentSlot3, autoShoesSlot1, autoShoesSlot2, autoShoesSlot3, autoAccRSlot1, autoAccRSlot2, autoAccRSlot3, autoAccLSlot1, autoAccLSlot2, autoAccLSlot3 } from './automatic';
```

With:
```typescript
import { autoArmorModules, autoEngineModules, autoLegModules, autoAccRModules, autoAccLModules } from './automatic';
```

**Step 2: Remove old duplicate entries at lines ~774-783**

Delete these lines (the old `Automatic_Orb*` based entries):
```typescript
  { name: 'Auto_Armor_A', enchants: [null, automaticArmor, automaticArmor, automaticArmor] },
  { name: 'Auto_Armor_B', enchants: [null, automaticArmor, automaticArmor, automaticArmor] },
  { name: 'Auto_Engine_A', enchants: [null, automaticGarment, automaticGarment, automaticGarment] },
  { name: 'Auto_Engine_B', enchants: [null, automaticGarment, automaticGarment, automaticGarment] },
  { name: 'Auto_Leg_A', enchants: [null, automaticBoot, automaticBoot, automaticBoot] },
  { name: 'Auto_Leg_B', enchants: [null, automaticBoot, automaticBoot, automaticBoot] },
  { name: 'Auto_B_R', enchants: [null, automaticAccR, automaticAccR, automaticAccR] },
  { name: 'Auto_B_L', enchants: [null, automaticAccL, automaticAccL, automaticAccL] },
  { name: 'Auto_BC_R', enchants: [null, automaticAccR, automaticAccR, automaticAccR] },
  { name: 'Auto_BC_L', enchants: [null, automaticAccL, automaticAccL, automaticAccL] },
```

**Step 3: Update the new entries at lines ~1795-1805**

Replace with (same array for all 3 slots — filtering handled in component):
```typescript
  // Automatic Equipment (Ep. 17.2)
  { name: 'Auto_Armor_A', enchants: [null, autoArmorModules, autoArmorModules, autoArmorModules] },
  { name: 'Auto_Armor_B', enchants: [null, autoArmorModules, autoArmorModules, autoArmorModules] },
  { name: 'Auto_Engine_A', enchants: [null, autoEngineModules, autoEngineModules, autoEngineModules] },
  { name: 'Auto_Engine_B', enchants: [null, autoEngineModules, autoEngineModules, autoEngineModules] },
  { name: 'Auto_Leg_A', enchants: [null, autoLegModules, autoLegModules, autoLegModules] },
  { name: 'Auto_Leg_B', enchants: [null, autoLegModules, autoLegModules, autoLegModules] },
  { name: 'Auto_B_R', enchants: [null, autoAccRModules, autoAccRModules, autoAccRModules] },
  { name: 'Auto_B_L', enchants: [null, autoAccLModules, autoAccLModules, autoAccLModules] },
  { name: 'Auto_BC_R', enchants: [null, autoAccRModules, autoAccRModules, autoAccRModules] },
  { name: 'Auto_BC_L', enchants: [null, autoAccLModules, autoAccLModules, autoAccLModules] },
```

**Step 4: Verify it compiles**

Run: `npx ng build --configuration=development 2>&1 | head -20`
Expected: Build succeeds (or only unrelated warnings).

**Step 5: Commit**

```bash
git add src/app/constants/enchant_item/_enchant_table.ts
git commit -m "fix: update enchant table to use correct per-equipment module arrays"
```

---

### Task 3: Add progressive slot unlocking + max enchant filtering

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/equipment/equipment.component.ts:7` (add import)
- Modify: `src/app/layout/pages/ro-calculator/equipment/equipment.component.ts:178-205` (refactor `setEnchantList`)
- Modify: `src/app/layout/pages/ro-calculator/equipment/equipment.component.ts:256-261` (handle enchant change cascade)
- Modify: `src/app/layout/pages/ro-calculator/equipment/equipment.component.html:246,275` (slot 2/3 disabled conditions)

**Step 1: Add import for `getModuleMaxEnchant`**

At line 7 of `equipment.component.ts`, add:
```typescript
import { getEnchants } from 'src/app/constants/enchant_item';
import { getModuleMaxEnchant } from 'src/app/constants/enchant_item/automatic';
```

**Step 2: Add helper to check if an equipment is automatic**

Add a property to the component class (after `gradeList`):

```typescript
  private isAutoEquipment = false;
```

**Step 3: Refactor `setEnchantList()` method**

Replace the `setEnchantList()` method (lines 178-205) with:

```typescript
  private setEnchantList() {
    const { aegisName, name, canGrade } = this.getItem();
    const enchants = getEnchants(aegisName) ?? getEnchants(name);

    const [e1, e2, e3, e4] = Array.isArray(enchants) ? enchants : [];

    // Detect if this is automatic equipment (module system)
    this.isAutoEquipment = aegisName?.startsWith('Auto_') ?? false;

    const mapToDropdown = (list: string[]) =>
      (list ?? [])
        .map((a: any) => this.mapEnchant.get(a))
        .filter(Boolean)
        .map((a: any) => ({ label: a.name, value: a.id, aegisName: a.aegisName }));

    this.enchant1List = mapToDropdown(e1);
    this.enchant2List = mapToDropdown(e2);
    this.enchant3List = mapToDropdown(e3);
    this.enchant4List = mapToDropdown(e4);

    this.gradeList = canGrade ? getGradeList() : [];

    // For automatic equipment, apply max enchant filtering
    if (this.isAutoEquipment) {
      this.filterAutoEnchantLists();
    }

    // Clear invalid selections
    for (const idx of [1, 2, 3, 4]) {
      const enchantList = this[`enchant${idx}List`] as DropdownModel[];
      const property = `enchant${idx}Id`;
      const currentEnchantValue = this[property];
      if (this.itemId && currentEnchantValue != null && !enchantList.find((a) => a.value === currentEnchantValue)) {
        this[property] = undefined;
        this.onSelectItem(property);
      }
    }
  }
```

**Step 4: Add the `filterAutoEnchantLists()` method**

Add after `setEnchantList()`:

```typescript
  /**
   * For automatic equipment: filter enchant slot 2/3 based on already-selected modules
   * and their max enchant limits. Also enforces progressive unlocking.
   */
  private filterAutoEnchantLists() {
    // Helper: get aegisName for an enchant item ID
    const getAegis = (itemId: number | undefined): string | undefined => {
      if (!itemId) return undefined;
      const item = this.items?.[itemId];
      return item?.aegisName;
    };

    const enchant1Aegis = getAegis(this.enchant1Id);
    const enchant2Aegis = getAegis(this.enchant2Id);

    // Count how many times each aegisName appears in selected slots
    const countSelected = (upToSlot: number): Record<string, number> => {
      const counts: Record<string, number> = {};
      const slots = [enchant1Aegis, enchant2Aegis];
      for (let i = 0; i < upToSlot; i++) {
        const aegis = slots[i];
        if (aegis) {
          counts[aegis] = (counts[aegis] || 0) + 1;
        }
      }
      return counts;
    };

    // Filter a dropdown list: remove modules that reached max enchant
    const filterByMax = (list: any[], counts: Record<string, number>) => {
      return list.filter(item => {
        const aegis = item.aegisName;
        if (!aegis) return true;
        const max = getModuleMaxEnchant(aegis);
        const used = counts[aegis] || 0;
        return used < max;
      });
    };

    // Slot 2: filter based on slot 1 selection
    if (this.enchant1Id) {
      const counts1 = countSelected(1);
      this.enchant2List = filterByMax(this.enchant2List, counts1);
    } else {
      this.enchant2List = [];
    }

    // Slot 3: filter based on slot 1+2 selections
    if (this.enchant1Id && this.enchant2Id) {
      const counts2 = countSelected(2);
      this.enchant3List = filterByMax(this.enchant3List, counts2);
    } else {
      this.enchant3List = [];
    }
  }
```

**Step 5: Handle enchant selection changes with cascade re-filtering**

In the `onSelectItem()` method, after the existing `else` block (around line 256), add cascade logic for enchant changes:

```typescript
    // After the existing else block that emits changes,
    // add re-filtering for automatic equipment enchant slots:
    if (this.isAutoEquipment && (itemType === 'enchant1Id' || itemType === 'enchant2Id')) {
      // Re-run filtering for subsequent slots
      const { aegisName, name } = this.getItem();
      const enchants = getEnchants(aegisName) ?? getEnchants(name);
      const [e1, e2, e3] = Array.isArray(enchants) ? enchants : [];

      const mapToDropdown = (list: string[]) =>
        (list ?? [])
          .map((a: any) => this.mapEnchant.get(a))
          .filter(Boolean)
          .map((a: any) => ({ label: a.name, value: a.id, aegisName: a.aegisName }));

      // Rebuild base lists before filtering
      if (itemType === 'enchant1Id') {
        this.enchant2List = mapToDropdown(e2);
        this.enchant3List = mapToDropdown(e3);
      } else if (itemType === 'enchant2Id') {
        this.enchant3List = mapToDropdown(e3);
      }

      this.filterAutoEnchantLists();

      // Clear downstream selections if they're no longer valid
      if (itemType === 'enchant1Id') {
        if (!this.enchant1Id) {
          // Slot 1 cleared → clear slot 2 and 3
          if (this.enchant2Id) {
            this.enchant2Id = undefined;
            this.onSelectItem('enchant2Id');
          }
          if (this.enchant3Id) {
            this.enchant3Id = undefined;
            this.onSelectItem('enchant3Id');
          }
        } else if (this.enchant2Id && !this.enchant2List.find(a => a.value === this.enchant2Id)) {
          this.enchant2Id = undefined;
          this.onSelectItem('enchant2Id');
        }
      }
      if (itemType === 'enchant2Id') {
        if (!this.enchant2Id) {
          if (this.enchant3Id) {
            this.enchant3Id = undefined;
            this.onSelectItem('enchant3Id');
          }
        } else if (this.enchant3Id && !this.enchant3List.find(a => a.value === this.enchant3Id)) {
          this.enchant3Id = undefined;
          this.onSelectItem('enchant3Id');
        }
      }
    }
```

**Step 6: Update template disabled conditions**

In `equipment.component.html`, update slot 2 disabled (line ~246):
```html
[disabled]="enchant2List.length === 0 || !itemId || (isAutoEquipment && !enchant1Id)"
```

Note: The `isAutoEquipment` property needs to be made public. Change the declaration to:
```typescript
isAutoEquipment = false;
```

Update slot 3 disabled (line ~275):
```html
[disabled]="enchant3List.length === 0 || !itemId || (isAutoEquipment && !enchant2Id)"
```

**Step 7: Add `aegisName` to the DropdownModel**

Check if `DropdownModel` needs an `aegisName` field. If it doesn't have one, the `filterByMax` approach needs to use a reverse lookup from item ID to aegisName via `this.items`. Alternatively, extend the local dropdown items with aegisName.

Check `src/app/models/dropdown.model.ts`. If it only has `label` and `value`, use a local extended type instead:

```typescript
interface EnchantDropdownItem extends DropdownModel {
  aegisName?: string;
}
```

And change `enchant1List` through `enchant4List` types to `EnchantDropdownItem[]`.

**Step 8: Build and verify**

Run: `npx ng build --configuration=development 2>&1 | head -30`
Expected: Build succeeds.

**Step 9: Commit**

```bash
git add src/app/layout/pages/ro-calculator/equipment/equipment.component.ts src/app/layout/pages/ro-calculator/equipment/equipment.component.html
git commit -m "feat: add progressive slot unlock and max enchant filtering for automatic modules"
```

---

### Task 4: Manual smoke test

**Step 1: Start dev server**

Run: `npm start`

**Step 2: Test in browser**

Open http://localhost:4200 and test these scenarios:

1. **Armor A-type**: Select it → verify enchant 1 shows Defense, MDEF, ATK Power, Magic Power, Shooter, Magical Force, Attacker Force, Range Force, Critical Force, Delay after skill, Power Force, + all Epic modules. Verify NO stat modules (VIT, STR, etc.), NO Caster/Critical/Fast.

2. **Engine Wing A-type**: Verify enchant 1 shows Defense, MDEF, Caster, Critical, Powerful. Verify NO ATK Power, NO Epic modules.

3. **Leg A-type**: Verify enchant 1 shows Defense, MDEF, Fixed Casting. Verify NO Epic modules, NO stat modules.

4. **Booster R**: Verify enchant 1 shows VIT, LUK, STR, AGI, Spell, ASPD, Fatal, Expert Archer, All Force. Verify NO INT, NO DEX, NO SP Recovery.

5. **Booster L**: Verify enchant 1 shows VIT, LUK, INT, DEX, Spell, ASPD, Fatal, Expert Archer, All Force. Verify NO STR, NO AGI, NO HP Recovery.

6. **Progressive unlock**: Select Armor A, pick Defense in slot 1 → verify slot 2 opens. Pick Defense in slot 2 → verify slot 3 opens. Verify Defense still available in slot 3 (max 3). Now pick Defense in slot 3 — verify it works.

7. **Max enchant limit**: Select Armor A, pick Magical Force (max 1) in slot 1. Verify slot 2 does NOT show Magical Force. Pick ATK Power (max 2) in slot 2. Verify slot 3 still shows ATK Power (only 1 used, max 2).

8. **Cascade clearing**: Select Armor A, fill all 3 slots. Clear slot 1 → verify slots 2 and 3 are cleared too.

**Step 3: Commit (if any fixes needed)**

```bash
git commit -am "fix: address smoke test findings for module audit"
```

---

### Task 5 (Future): Add missing modules to item.json

This task is deferred — it requires looking up each missing module on Divine Pride to get correct aegisName, stats, and scripts. The `automatic.ts` file has `TBD` comments marking where to uncomment once items are added.

Missing modules to research and add:
- **Normal**: HP Recovery, SP Recovery
- **Rare**: Fast, Vital, Mental, Heal
- **Unique**: Recovery Force, Mirror Counter, Above All, Drain Life, Drain Soul, Magic Healing, Magic Soul, Robust, Reflection Reject
- **Legendary**: Unlimited Vital, Spell Buster, Firing Shot, Overpower, Fatal Flash, Lucky Strike

For each:
1. Look up on Divine Pride: `https://www.divine-pride.net/database/item/{id}`
2. Get aegisName, name, script bonuses
3. Add to `item.json`
4. Uncomment the corresponding line in `automatic.ts`
5. Add max enchant entry in `moduleMaxEnchant` if not default (1)
