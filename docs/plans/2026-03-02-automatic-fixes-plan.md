# Automatic Equipment Fixes & Module UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 3 bugs in the EP17.2 Automatic equipment system and add module grouping UX.

**Architecture:** All changes are isolated to `item.json` (data), `automatic.ts` (constants), `equipment.component.ts/.html` (UI), and `ro-calculator.component.html` (bindings). No new services or modules needed.

**Tech Stack:** Angular 16, PrimeNG 16, TypeScript, item.json data file

---

## Task 1: Fix EQUIP[] combo name mismatch

**Files:**
- Modify: `src/assets/demo/data/item.json`

**Context:** Six Auto equipment items have `EQUIP[...]` conditions using Portuguese item names (pre-rename). `isEquipItem()` in `calculator.ts` does an exact match against item names, so combos never activate. The fix is purely in `item.json`.

**Step 1: Apply the 12 string fixes in item.json**

Find and replace these exact strings in the `script` fields of the listed item IDs:

| Item ID | Field | Find | Replace |
|---|---|---|---|
| 450127 | atk2 | `Asa-Motor Automática Tipo A` | `Automatic Engine Wing Type A` |
| 450127 | acd | `Asa-Motor Automática Tipo B` | `Automatic Engine Wing Type B` |
| 450128 | aspdPercent | `Asa-Motor Automática Tipo A` | `Automatic Engine Wing Type A` |
| 450128 | matk2 | `Asa-Motor Automática Tipo B` | `Automatic Engine Wing Type B` |
| 470022 | atkPercent | `Armadura Automática Tipo A` | `Automatic Armor Type A` |
| 470022 | aspdPercent | `Armadura Automática Tipo B` | `Automatic Armor Type B` |
| 470023 | spPercent | `Armadura Automática Tipo A` | `Automatic Armor Type A` |
| 470023 | matkPercent | `Armadura Automática Tipo B` | `Automatic Armor Type B` |
| 480020 | criDmg | `Perna Automática Tipo A` | `Automatic Leg Type A` |
| 480020 | vct | `Perna Automática Tipo B` | `Automatic Leg Type B` |
| 480021 | range | `Perna Automática Tipo A` | `Automatic Leg Type A` |
| 480021 | m_element_all | `Perna Automática Tipo B` | `Automatic Leg Type B` |

The item.json is ~7.7 MB. Use a script or targeted editor search rather than opening the whole file manually. Example verification:

```bash
node -e "
const fs = require('fs');
const items = JSON.parse(fs.readFileSync('src/assets/demo/data/item.json', 'utf8'));
const autoIds = ['450127','450128','470022','470023','480020','480021'];
autoIds.forEach(id => console.log(id, JSON.stringify(items[id].script)));
"
```

Expected output should show English names in all EQUIP[] conditions after the fix.

**Step 2: Verify no Portuguese auto names remain**

```bash
node -e "
const fs = require('fs');
const raw = fs.readFileSync('src/assets/demo/data/item.json', 'utf8');
const ptNames = ['Asa-Motor Automática', 'Armadura Automática', 'Perna Automática'];
ptNames.forEach(n => {
  const idx = raw.indexOf(n);
  if (idx >= 0) console.log('STILL PRESENT:', n, 'at index', idx);
  else console.log('OK - not found:', n);
});
"
```

Expected: all three lines print `OK - not found`.

**Step 3: Commit**

```bash
git add src/assets/demo/data/item.json
git commit -m "fix: correct EQUIP[] combo conditions to use English item names"
```

---

## Task 2: Fix epic modules appearing in Engine Wing slots

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/equipment/equipment.component.ts`

**Context:** Epic (skill-specific) modules are incorrectly available in the Engine Wing A/B module dropdowns. The enchant table and `autoEngineModules` data are correct (no epics). The bug is a runtime state issue — likely the `enchant2List/3List/4List` arrays are not being reset before `setEnchantList()` rebuilds them when switching items.

**Step 1: Add explicit reset at the start of setEnchantList()**

In `equipment.component.ts`, find `setEnchantList()` (around line 180). At the very start of the function body, before any other logic, add explicit resets:

```typescript
private setEnchantList() {
  // Reset all lists before rebuilding to prevent stale state from prior item
  this.enchant1List = [];
  this.enchant2List = [];
  this.enchant3List = [];
  this.enchant4List = [];
  this.isAutoEquipment = false;

  const { aegisName, name, canGrade } = this.getItem();
  // ... rest of existing code unchanged
```

**Step 2: Run dev server and manually verify**

```bash
npm start
```

1. Select Automatic Armor Type A in the Armor slot — verify epic modules appear in module dropdowns ✓
2. Change the Armor slot item to a non-auto armor — verify module dropdowns disappear ✓
3. Select Automatic Engine Wing Type A in the Garment slot — verify only 5 modules appear: DEF, MDEF, Caster, Critical, Powerful — NO skill-specific modules ✓
4. Switch garment from Engine Wing A to Engine Wing B — still only 5 modules ✓

**Step 3: Commit**

```bash
git add src/app/layout/pages/ro-calculator/equipment/equipment.component.ts
git commit -m "fix: reset enchant lists before rebuild to prevent stale modules in engine wing slots"
```

---

## Task 3: Add missing Leg modules to item.json

**Files:**
- Modify: `src/assets/demo/data/item.json`
- Modify: `src/app/constants/enchant_item/automatic.ts`

**Context:** The following modules exist in the game for Leg A/B but are missing from item.json. They are commented out in `autoLegModules`. Fetch their scripts from Divine Pride.

Missing modules:
- B8 = Vital (Rare, max 2) — HP/VIT focused
- B9 = Mental (Rare, max 2) — SP/INT focused
- B16 = Heal (Rare, max 2) — healing focused
- C14 = Robust (Unique, max 1)
- L1 = Unlimited Vital (Legendary, max 1)
- L2 = Spell Buster (Legendary, max 1)
- L3 = Firing Shot (Legendary, max 1)
- L4 = Overpower (Legendary, max 1)
- L5 = Fatal Flash (Legendary, max 1)
- L6 = Lucky Strike (Legendary, max 1)

**Step 1: Find item IDs via Divine Pride**

Search Divine Pride for each module by name. The existing modules follow a pattern:
- ID range: ~1000100–1000210
- Use the existing module IDs as reference to find nearby IDs

The Divine Pride API key is stored in project memory. Search endpoint:
`https://www.divine-pride.net/api/database/Item/{id}?apiKey={key}`

Or search by name: `https://www.divine-pride.net/database/item?name=Automatic+Modification+Module+Vital`

**Step 2: Add each module to item.json**

For each missing module, add an entry in the same format as existing modules. Example structure:

```json
"1000XXX": {
  "id": 1000XXX,
  "aegisName": "Auto_Module_B8",
  "name": "Automatic Modification Module (Vital)",
  "itemTypeId": 4,
  "itemSubTypeId": 801,
  "script": {
    "vit": ["3"],
    "hpPercent": ["1"]
  }
}
```

The `itemTypeId` for enchant items is `4` (ENCHANT). Verify with existing modules.

**Step 3: Uncomment modules in autoLegModules**

In `src/app/constants/enchant_item/automatic.ts`, update `autoLegModules`:

```typescript
export const autoLegModules = [
  'Auto_Module_A',    // Defense (Normal, max 3)
  'Auto_Module_A2',   // Magic Defense (Normal, max 3)
  'Auto_Module_B8',   // Vital (Rare, max 2)
  'Auto_Module_B9',   // Mental (Rare, max 2)
  'Auto_Module_B16',  // Heal (Rare, max 2)
  'Auto_Module_C7',   // Fixed Casting (Unique, max 1)
  'Auto_Module_C14',  // Robust (Unique, max 1)
  'Auto_Module_L1',   // Unlimited Vital (Legendary, max 1)
  'Auto_Module_L2',   // Spell Buster (Legendary, max 1)
  'Auto_Module_L3',   // Firing Shot (Legendary, max 1)
  'Auto_Module_L4',   // Overpower (Legendary, max 1)
  'Auto_Module_L5',   // Fatal Flash (Legendary, max 1)
  'Auto_Module_L6',   // Lucky Strike (Legendary, max 1)
];
```

**Step 4: Add max enchant values**

In `moduleMaxEnchant`, add:

```typescript
// Rare — Leg: max 2
'Auto_Module_B8': 2,   // Vital
'Auto_Module_B9': 2,   // Mental
'Auto_Module_B16': 2,  // Heal
// Unique and Legendary default to 1 (no entry needed, covered by ?? 1 fallback)
```

**Step 5: Verify**

```bash
node -e "
const fs = require('fs');
const items = JSON.parse(fs.readFileSync('src/assets/demo/data/item.json', 'utf8'));
const legModules = ['Auto_Module_B8','Auto_Module_B9','Auto_Module_B16','Auto_Module_C14',
  'Auto_Module_L1','Auto_Module_L2','Auto_Module_L3','Auto_Module_L4','Auto_Module_L5','Auto_Module_L6'];
legModules.forEach(aegis => {
  const found = Object.values(items).find(i => i.aegisName === aegis);
  console.log(aegis, found ? 'OK: ' + found.name : 'MISSING');
});
"
```

**Step 6: Commit**

```bash
git add src/assets/demo/data/item.json src/app/constants/enchant_item/automatic.ts
git commit -m "feat: add missing Rare/Unique/Legendary modules for Automatic Leg equipment"
```

---

## Task 4: Add module rarity and class maps to automatic.ts

**Files:**
- Modify: `src/app/constants/enchant_item/automatic.ts`

**Context:** The UX grouping feature needs two new lookup maps: rarity of each module, and which job classes each Epic module belongs to. These are pure data — no logic changes.

**Step 1: Add ModuleRarity type and moduleRarityMap**

Add after `moduleMaxEnchant` in `automatic.ts`:

```typescript
export type ModuleRarity = 'Normal' | 'Rare' | 'Unique' | 'Epic' | 'Legendary';

export const moduleRarityMap: Record<string, ModuleRarity> = {
  // Normal
  'Auto_Module_A': 'Normal',
  'Auto_Module_A2': 'Normal',
  'Auto_Module_A3': 'Normal',
  'Auto_Module_A4': 'Normal',
  'Auto_Module_A5': 'Normal',
  'Auto_Module_A6': 'Normal',
  'Auto_Module_A7': 'Normal',
  'Auto_Module_A8': 'Normal',
  // Rare
  'Auto_Module_B3': 'Rare',
  'Auto_Module_B4': 'Rare',
  'Auto_Module_B5': 'Rare',
  'Auto_Module_B6': 'Rare',
  'Auto_Module_B8': 'Rare',
  'Auto_Module_B9': 'Rare',
  'Auto_Module_B10': 'Rare',
  'Auto_Module_B11': 'Rare',
  'Auto_Module_B12': 'Rare',
  'Auto_Module_B13': 'Rare',
  'Auto_Module_B14': 'Rare',
  'Auto_Module_B15': 'Rare',
  'Auto_Module_B16': 'Rare',
  // Unique
  'Auto_Module_C': 'Unique',
  'Auto_Module_C2': 'Unique',
  'Auto_Module_C3': 'Unique',
  'Auto_Module_C4': 'Unique',
  'Auto_Module_C6': 'Unique',
  'Auto_Module_C7': 'Unique',
  'Auto_Module_C8': 'Unique',
  'Auto_Module_C9': 'Unique',
  'Auto_Module_C10': 'Unique',
  'Auto_Module_C14': 'Unique',
  // Epic — all in autoModEpic
  ...Object.fromEntries(autoModEpic.map(a => [a, 'Epic' as ModuleRarity])),
  // Legendary
  'Auto_Module_L1': 'Legendary',
  'Auto_Module_L2': 'Legendary',
  'Auto_Module_L3': 'Legendary',
  'Auto_Module_L4': 'Legendary',
  'Auto_Module_L5': 'Legendary',
  'Auto_Module_L6': 'Legendary',
};
```

**Step 2: Add moduleClassMap**

This maps each Epic module to the job class(es) that use those skills. Import `ClassName` at the top of the file:

```typescript
import { ClassName } from '../../jobs/_class-name';
```

Then add:

```typescript
export const moduleClassMap: Record<string, ClassName[]> = {
  // Rune Knight / Dragon Knight
  'Auto_Module_Db': [ClassName.RuneKnight, ClassName.DragonKnight],   // Dragon Breath
  'Auto_Module_Wb': [ClassName.RuneKnight, ClassName.DragonKnight],   // Sonic Wave / Ignition Break
  'Auto_Module_Hs': [ClassName.RuneKnight, ClassName.DragonKnight],   // Clashing Spiral / Hundred Spears
  // Royal Guard / Imperial Guard
  'Auto_Module_Dp': [ClassName.RoyalGuard, ClassName.ImperialGuard],  // Earth Drive / Shield Press
  'Auto_Module_Vc': [ClassName.RoyalGuard, ClassName.ImperialGuard],  // Vanishing Point / Cannon Spear
  // Archbishop / Cardinal
  'Auto_Module_Gg': [ClassName.ArchBishop, ClassName.Cardinal],       // Gloria Domini / Genesis Ray
  'Auto_Module_Mg': [ClassName.ArchBishop, ClassName.Cardinal],       // Magnus Exorcismus / Adoramus
  'Auto_Module_Hj': [ClassName.ArchBishop, ClassName.Cardinal, ClassName.Inquisitor], // Holy Light / Judex
  'Auto_Module_Du': [ClassName.ArchBishop, ClassName.Cardinal],       // Duple Light / Basilica
  // Sura / Inquisitor
  'Auto_Module_Ft': [ClassName.Sura, ClassName.Inquisitor],           // Tiger Cannon / Fallen Empire
  'Auto_Module_Ra': [ClassName.Sura],                                 // Rampage Blast / Knuckle Arrow
  'Auto_Module_Rc': [ClassName.Sura],                                 // Raging Thrust / Chain Crush Combo
  // Mechanic / Meister
  'Auto_Module_Bc': [ClassName.Mechanic, ClassName.Meister],          // Knuckle Boost / Arm Cannon
  'Auto_Module_If': [ClassName.Mechanic, ClassName.Meister],          // Ice Launcher / Flame Launcher
  'Auto_Module_Ts': [ClassName.Mechanic, ClassName.Meister],          // Axe Tornado / Power Swing
  // Genetic / Biolo
  'Auto_Module_Ct': [ClassName.Genetic, ClassName.Biolo],             // Cart Tornado / Cart Cannon
  'Auto_Module_Cm': [ClassName.Genetic, ClassName.Biolo],             // Crazy Vines / Mandragora
  'Auto_Module_Ae': [ClassName.Genetic, ClassName.Biolo],             // Acid Bomb / Spore Explosion
  // Guillotine Cross / Shadow Cross
  'Auto_Module_Si': [ClassName.GuillotineCross, ClassName.ShadowCross], // Sonic Blow / Cross Impact
  'Auto_Module_Cs': [ClassName.GuillotineCross, ClassName.ShadowCross], // Cross Ripper / Rolling Cutter
  'Auto_Module_Bs': [ClassName.GuillotineCross, ClassName.ShadowCross], // Soul Destroyer / Counter Slash
  'Auto_Module_Fr': [ClassName.ShadowCross],                          // Fatal Menace / Sightless Mind
  'Auto_Module_Csl': [ClassName.GuillotineCross, ClassName.ShadowCross], // Cross Slash
  // Shadow Chaser / Abyss Chaser
  'Auto_Module_Ss': [ClassName.ShadowChaser, ClassName.AbyssChaser],  // Shadow Spell (m_element_all)
  'Auto_Module_Cx': [ClassName.ShadowChaser, ClassName.AbyssChaser],  // Curse Explosion
  // Ranger / Windhawk
  'Auto_Module_As': [ClassName.Ranger, ClassName.Windhawk],           // Triangle Shot / range
  'Auto_Module_Cl': [ClassName.Ranger, ClassName.Windhawk],           // Bomb Cluster
  'Auto_Module_Bs2': [ClassName.Ranger, ClassName.Windhawk],          // Focused Arrow Strike
  'Auto_Module_Ab': [ClassName.Ranger, ClassName.Windhawk],           // Aimed Bolt / Arrow Storm
  // Warlock / Arch Mage
  'Auto_Module_Ce': [ClassName.Warlock, ClassName.ArchMage],          // Crimson Rock / Earth Strain
  'Auto_Module_Jl': [ClassName.Warlock, ClassName.ArchMage],          // Jack Frost / Chain Lightning
  'Auto_Module_Cv': [ClassName.Warlock, ClassName.ArchMage],          // Comet / Tetra Vortex
  'Auto_Module_Dbl': [ClassName.Warlock, ClassName.ArchMage],         // Fire/Cold/Lightning Bolt
  'Auto_Module_Ww': [ClassName.Warlock, ClassName.ArchMage],          // Psychic Wave / Warmer
  'Auto_Module_Dg': [ClassName.Warlock, ClassName.ArchMage],          // Diamond Dust / Earth Grave
  // Minstrel / Troubadour / Wanderer / Trouvere
  'Auto_Module_Me': [ClassName.Minstrel, ClassName.Troubadour, ClassName.Wanderer, ClassName.Trouvere],
  'Auto_Module_Rev': [ClassName.Minstrel, ClassName.Troubadour, ClassName.Wanderer, ClassName.Trouvere],
  'Auto_Module_Vs': [ClassName.Minstrel, ClassName.Troubadour, ClassName.Wanderer, ClassName.Trouvere],
  // Star Emperor / Sky Emperor
  'Auto_Module_Be': [ClassName.StarEmperor, ClassName.SkyEmperor],    // Blaze Kick / Solar Explosion
  'Auto_Module_Mk': [ClassName.StarEmperor, ClassName.SkyEmperor],    // New Moon / Full Moon Kick
  'Auto_Module_Ff': [ClassName.StarEmperor, ClassName.SkyEmperor],    // Flash Kick / Falling Stars
  // Soul Reaper / Soul Ascetic
  'Auto_Module_Ew': [ClassName.SoulReaper, ClassName.SoulAscetic],    // Esma / Eswhoo
  'Auto_Module_Esp': [ClassName.SoulReaper, ClassName.SoulAscetic],   // Espa
  // Rebellion / Night Watch
  'Auto_Module_Dh': [ClassName.Rebellion, ClassName.NightWatch],      // Desperado / Fire Dance / God's Hammer
  'Auto_Module_Fh': [ClassName.Rebellion, ClassName.NightWatch],      // Fire Rain / Howling Mine / Dragon Tail
  'Auto_Module_Sb': [ClassName.Rebellion, ClassName.NightWatch],      // Shatter Storm / Vanishing Buster / Round Trip
  // Kagerou / Oboro / Shinkiro / Shiranui
  'Auto_Module_Ps': [ClassName.Kagerou, ClassName.Oboro, ClassName.Shinkiro, ClassName.Shiranui],
  'Auto_Module_Dd': [ClassName.Kagerou, ClassName.Oboro, ClassName.Shinkiro, ClassName.Shiranui],
  // Spirit Handler (Doram)
  'Auto_Module_Sea': [ClassName.SpiritHandler],                       // Tuna Party / Tasty Shrimp Party
  'Auto_Module_Land': [ClassName.SpiritHandler],                      // Silvervine Stem Spear / Catnip Meteor
  'Auto_Module_Life': [ClassName.SpiritHandler],                      // Picky Peck / Lunatic Carrot Beat
};
```

**Step 3: Add moduleClassOrder**

Defines the display order of class sub-groups within Epic. Use the same order as `getClassDropdownList()`:

```typescript
export const moduleClassOrder: ClassName[] = [
  ClassName.RoyalGuard, ClassName.ImperialGuard,
  ClassName.RuneKnight, ClassName.DragonKnight,
  ClassName.ArchBishop, ClassName.Cardinal,
  ClassName.Sura, ClassName.Inquisitor,
  ClassName.Ranger, ClassName.Windhawk,
  ClassName.Minstrel, ClassName.Troubadour,
  ClassName.Wanderer, ClassName.Trouvere,
  ClassName.GuillotineCross, ClassName.ShadowCross,
  ClassName.ShadowChaser, ClassName.AbyssChaser,
  ClassName.Warlock, ClassName.ArchMage,
  ClassName.Mechanic, ClassName.Meister,
  ClassName.Genetic, ClassName.Biolo,
  ClassName.SoulReaper, ClassName.SoulAscetic,
  ClassName.StarEmperor, ClassName.SkyEmperor,
  ClassName.Rebellion, ClassName.NightWatch,
  ClassName.Kagerou, ClassName.Oboro,
  ClassName.Shinkiro, ClassName.Shiranui,
  ClassName.SpiritHandler,
];
```

**Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add src/app/constants/enchant_item/automatic.ts
git commit -m "feat: add moduleRarityMap, moduleClassMap, moduleClassOrder for module grouping UX"
```

---

## Task 5: Add grouped module lists to EquipmentComponent

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/equipment/equipment.component.ts`

**Context:** Add the `activeClassName` input and the `toGroupedModuleList()` helper. The flat lists (`enchant2List` etc.) continue to be used for filtering logic. Grouped lists (`enchant2GroupedList` etc.) are derived from the flat lists and used for display only.

**Step 1: Add imports**

At the top of `equipment.component.ts`, add:

```typescript
import { ClassName } from 'src/app/jobs/_class-name';
import {
  ModuleRarity,
  moduleRarityMap,
  moduleClassMap,
  moduleClassOrder,
} from 'src/app/constants/enchant_item/automatic';
```

**Step 2: Add @Input and grouped list properties**

In the component class, after `isAutoEquipment = false;`:

```typescript
@Input() activeClassName?: ClassName;

enchant2GroupedList: any[] = [];
enchant3GroupedList: any[] = [];
enchant4GroupedList: any[] = [];
```

**Step 3: Add toGroupedModuleList() method**

Add as a private method in the component class:

```typescript
private toGroupedModuleList(flat: any[], activeClassName?: ClassName): any[] {
  if (!flat.length) return [];

  // Separate by rarity
  const byRarity: Record<ModuleRarity, any[]> = {
    Normal: [], Rare: [], Unique: [], Epic: [], Legendary: [],
  };

  for (const item of flat) {
    const rarity = moduleRarityMap[item.aegisName] ?? 'Epic';
    byRarity[rarity].push(item);
  }

  const groups: any[] = [];

  // Normal, Rare, Unique, Legendary — flat children
  for (const rarity of ['Normal', 'Rare', 'Unique'] as ModuleRarity[]) {
    if (byRarity[rarity].length) {
      groups.push({ label: rarity, children: byRarity[rarity] });
    }
  }

  // Epic — sub-grouped by class, active class first
  if (byRarity.Epic.length) {
    const epicItems = byRarity.Epic;

    // Build class sub-groups in order
    const classSubGroups: any[] = [];
    const usedItems = new Set<any>();

    // Active class first
    if (activeClassName) {
      const activeItems = epicItems.filter(
        item => moduleClassMap[item.aegisName]?.includes(activeClassName)
      );
      if (activeItems.length) {
        classSubGroups.push({ label: activeClassName, children: activeItems });
        activeItems.forEach(i => usedItems.add(i));
      }
    }

    // Remaining classes in order
    for (const className of moduleClassOrder) {
      if (className === activeClassName) continue;
      const classItems = epicItems.filter(
        item => !usedItems.has(item) && moduleClassMap[item.aegisName]?.includes(className)
      );
      if (classItems.length) {
        classSubGroups.push({ label: className, children: classItems });
        classItems.forEach(i => usedItems.add(i));
      }
    }

    // Any epic items not mapped to a class (fallback)
    const unmapped = epicItems.filter(item => !usedItems.has(item));
    if (unmapped.length) {
      classSubGroups.push({ label: 'Other', children: unmapped });
    }

    groups.push({ label: 'Epic', children: classSubGroups });
  }

  // Legendary
  if (byRarity.Legendary.length) {
    groups.push({ label: 'Legendary', children: byRarity.Legendary });
  }

  return groups;
}
```

**Step 4: Update grouped lists after every flat list change**

Add a private method that refreshes the grouped lists. Call it at the end of `setEnchantList()` and at the end of `filterAutoEnchantLists()`:

```typescript
private refreshGroupedLists() {
  if (!this.isAutoEquipment) return;
  this.enchant2GroupedList = this.toGroupedModuleList(this.enchant2List, this.activeClassName);
  this.enchant3GroupedList = this.toGroupedModuleList(this.enchant3List, this.activeClassName);
  this.enchant4GroupedList = this.toGroupedModuleList(this.enchant4List, this.activeClassName);
}
```

In `setEnchantList()`, after the `if (this.isAutoEquipment) { this.filterAutoEnchantLists(); }` block, add:
```typescript
this.refreshGroupedLists();
```

In `filterAutoEnchantLists()`, at the very end, add:
```typescript
this.refreshGroupedLists();
```

Also add it to `onSelectItem()` after the enchant3/4 list rebuild block (around line 349):
```typescript
this.refreshGroupedLists();
```

**Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/app/layout/pages/ro-calculator/equipment/equipment.component.ts
git commit -m "feat: add grouped module lists and toGroupedModuleList helper to EquipmentComponent"
```

---

## Task 6: Update HTML to use grouped dropdowns and pass activeClassName

**Files:**
- Modify: `src/app/layout/pages/ro-calculator/equipment/equipment.component.html`
- Modify: `src/app/layout/pages/ro-calculator/ro-calculator.component.html`

**Context:** Switch the enchant2/3/4 dropdowns to use grouped lists when `isAutoEquipment`. Pass `activeClassName` from the parent to each Auto equipment component.

**Step 1: Update enchant2/3/4 dropdowns in equipment.component.html**

Find the three p-dropdown elements for enchant2Id, enchant3Id, enchant4Id (around lines 240, 269, 298). For each, change `[options]="enchantNList"` to use the grouped list conditionally, and add `[group]` and group option properties:

For enchant2 dropdown, change:
```html
[options]="enchant2List"
```
to:
```html
[options]="isAutoEquipment ? enchant2GroupedList : enchant2List"
[group]="isAutoEquipment"
[optionGroupLabel]="isAutoEquipment ? 'label' : null"
[optionGroupChildren]="isAutoEquipment ? ['children', 'children', 'children'] : null"
```

Apply the same pattern to enchant3 and enchant4 dropdowns.

**Step 2: Add activeClassName input to auto equipment component instances in ro-calculator.component.html**

Find the `app-equipment` instances that can have Automatic equipment. These are the armor, garment, and boot slots. Add `[activeClassName]="selectedCharacter.className"` to each:

```html
<!-- Armor slot -->
<app-equipment
  [itemType]="'armor'"
  [activeClassName]="selectedCharacter.className"
  ...
></app-equipment>

<!-- Garment slot -->
<app-equipment
  [itemType]="'garment'"
  [activeClassName]="selectedCharacter.className"
  ...
></app-equipment>

<!-- Boot slot -->
<app-equipment
  [itemType]="'boot'"
  [activeClassName]="selectedCharacter.className"
  ...
></app-equipment>
```

Also add to the comparison slot instances (`model2.*`) and the accessory slots (Auto_B_R, Auto_B_L, Auto_BC_R, Auto_BC_L use accRight/accLeft slots).

**Step 3: Run dev server and verify grouping**

```bash
npm start
```

1. Select Automatic Armor Type A in Armor slot, set class to Rune Knight
2. Open module slot 1 dropdown — verify groups: Normal, Rare, Unique, Epic (with Rune Knight sub-group first), no Legendary
3. Switch class to Warlock — verify Warlock sub-group appears first in Epic
4. Select Automatic Leg Type A in Boot slot — verify groups: Normal, Rare, Unique, Legendary (no Epic sub-groups)
5. Confirm active class sub-group appears first in all cases

**Step 4: Commit**

```bash
git add src/app/layout/pages/ro-calculator/equipment/equipment.component.html
git add src/app/layout/pages/ro-calculator/ro-calculator.component.html
git commit -m "feat: group module dropdowns by rarity with Epic sub-grouped by active class"
```

---

## Task 7: Final verification

**Step 1: Run full app test**

```bash
npm start
```

Verify all four fixes:

1. **Combo fix** — Equip Automatic Armor A + Automatic Engine Wing B → damage summary should show +10% ACD applied
2. **Engine Wing modules** — Equip Automatic Engine Wing A → only 5 modules visible (DEF, MDEF, Caster, Critical, Powerful)
3. **Leg modules** — Equip Automatic Leg A → Vital, Mental, Heal, Fixed Cast, Robust, and Legendary modules all visible
4. **Module grouping** — Armor A modules grouped by Normal/Rare/Unique/Epic (with class sub-groups)/no Legendary

**Step 2: Run lint**

```bash
npm run lint
```

Fix any issues.

**Step 3: Final commit if any lint fixes were made**

```bash
git add -A
git commit -m "fix: lint issues"
```
