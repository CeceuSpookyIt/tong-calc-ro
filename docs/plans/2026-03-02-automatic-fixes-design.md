# Design: Automatic Equipment Fixes & Module UX

**Date:** 2026-03-02

## Overview

Three improvements to the EP17.2 Automatic equipment system:

1. **Bug fix** — Set combo bonuses not activating (EQUIP[] name mismatch)
2. **Data fix** — Missing Rare/Unique/Legendary modules for Leg equipment
3. **UX feature** — Module dropdowns grouped by rarity, with Epic sub-grouped by class

---

## Bug 1: EQUIP[] Name Mismatch

### Root Cause

`isEquipItem()` in `calculator.ts` matches equipped items by exact name from `item.json`. The six Auto equipment items have `EQUIP[...]` conditions using Portuguese names from before the EN rename, so combos never activate.

### Fix

Update 10 `EQUIP[...]` strings in `src/assets/demo/data/item.json`:

| Item | Attribute | Old (PT) | New (EN) |
|---|---|---|---|
| Auto_Armor_A (450127) | atk2 | `Asa-Motor Automática Tipo A` | `Automatic Engine Wing Type A` |
| Auto_Armor_A (450127) | acd | `Asa-Motor Automática Tipo B` | `Automatic Engine Wing Type B` |
| Auto_Armor_B (450128) | aspdPercent | `Asa-Motor Automática Tipo A` | `Automatic Engine Wing Type A` |
| Auto_Armor_B (450128) | matk2 | `Asa-Motor Automática Tipo B` | `Automatic Engine Wing Type B` |
| Auto_Leg_A (470022) | atkPercent | `Armadura Automática Tipo A` | `Automatic Armor Type A` |
| Auto_Leg_A (470022) | aspdPercent | `Armadura Automática Tipo B` | `Automatic Armor Type B` |
| Auto_Leg_B (470023) | spPercent | `Armadura Automática Tipo A` | `Automatic Armor Type A` |
| Auto_Leg_B (470023) | matkPercent | `Armadura Automática Tipo B` | `Automatic Armor Type B` |
| Auto_Engine_A (480020) | criDmg | `Perna Automática Tipo A` | `Automatic Leg Type A` |
| Auto_Engine_A (480020) | vct | `Perna Automática Tipo B` | `Automatic Leg Type B` |
| Auto_Engine_B (480021) | range | `Perna Automática Tipo A` | `Automatic Leg Type A` |
| Auto_Engine_B (480021) | m_element_all | `Perna Automática Tipo B` | `Automatic Leg Type B` |

**Files:** `src/assets/demo/data/item.json`

---

## Bug 2: Missing Leg Modules

### Missing Items

| AegisName | Name | Rarity | Max |
|---|---|---|---|
| Auto_Module_B8 | Vital | Rare | 2 |
| Auto_Module_B9 | Mental | Rare | 2 |
| Auto_Module_B16 | Heal | Rare | 2 |
| Auto_Module_C14 | Robust | Unique | 1 |
| Auto_Module_L1 | Unlimited Vital | Legendary | 1 |
| Auto_Module_L2 | Spell Buster | Legendary | 1 |
| Auto_Module_L3 | Firing Shot | Legendary | 1 |
| Auto_Module_L4 | Overpower | Legendary | 1 |
| Auto_Module_L5 | Fatal Flash | Legendary | 1 |
| Auto_Module_L6 | Lucky Strike | Legendary | 1 |

### Fix

1. Fetch scripts from Divine Pride API for each missing module item ID
2. Add entries to `item.json`
3. In `automatic.ts`:
   - Uncomment modules in `autoLegModules`
   - Add max enchant entries: B8/B9/B16 = 2, C14/L1–L6 = 1

**Files:** `src/assets/demo/data/item.json`, `src/app/constants/enchant_item/automatic.ts`

---

## Feature: Module Grouping by Rarity + Class

### UI Structure

Module dropdowns for Automatic equipment show groups by rarity. Within Epic, sub-groups by job class with the active class appearing first.

```
▶ Normal        — DEF, MDEF
▶ Rare          — ATK, MATK, Shooter (or Vital/Mental/Heal for Leg)
▶ Unique        — Force modules, ACD, etc.
▶ Epic
  ▶ Rune Knight   ← active class first
    Dragon Breath, Wave Break, Hundred Spiral
  ▶ Royal Guard
    Earth Drive, Vanishing Cannon
  ▶ Warlock
    ...
▶ Legendary     — (Leg only)
```

Empty groups are omitted. Only shown for `isAutoEquipment === true`.

### Data Structure

```typescript
// Two-level group item for Normal/Rare/Unique/Legendary:
{ label: 'Normal', children: [ DropdownModel, ... ] }

// Three-level group for Epic:
{
  label: 'Epic',
  children: [
    { label: 'Rune Knight', children: [ DropdownModel, ... ] },
    { label: 'Royal Guard', children: [ DropdownModel, ... ] },
    ...
  ]
}
```

PrimeNG handles this natively with `[group]="true"` and `[optionGroupChildren]="['children', 'children', 'children']"` (already used elsewhere in the project).

### New Exports in `automatic.ts`

**`moduleRarityMap`** — maps each aegisName to its rarity tier:
```typescript
export type ModuleRarity = 'Normal' | 'Rare' | 'Unique' | 'Epic' | 'Legendary';
export const moduleRarityMap: Record<string, ModuleRarity> = { ... };
```

**`moduleClassMap`** — maps each epic aegisName to the ClassName values it belongs to:
```typescript
export const moduleClassMap: Record<string, ClassName[]> = {
  'Auto_Module_Db': [ClassName.RuneKnight, ClassName.DragonKnight],
  'Auto_Module_Dp': [ClassName.RoyalGuard, ClassName.ImperialGuard],
  'Auto_Module_Gg': [ClassName.ArchBishop, ClassName.Cardinal],
  // ... all 59 epic modules
};
```

**`moduleClassOrder`** — ordered list of class names for consistent sub-group ordering within Epic:
```typescript
export const moduleClassOrder: ClassName[] = [
  ClassName.RuneKnight, ClassName.DragonKnight,
  ClassName.RoyalGuard, ClassName.ImperialGuard,
  // ...
];
```

### Changes to EquipmentComponent

1. **New `@Input() activeClassName?: ClassName`** — passed from parent for active class filtering

2. **`toGroupedModuleList(flat, activeClassName)`** — new private method:
   - Groups flat list by rarity via `moduleRarityMap`
   - For Epic group: creates sub-groups per class via `moduleClassMap`, active class first
   - Returns nested structure compatible with PrimeNG multi-level groups
   - Called whenever `enchant2List`/`enchant3List`/`enchant4List` is updated and `isAutoEquipment`

3. **New properties:** `enchant2GroupedList`, `enchant3GroupedList`, `enchant4GroupedList`

4. **HTML update:** enchant2/3/4 dropdowns switch to `[group]="true"` + grouped list when `isAutoEquipment`

### Changes to ro-calculator.component.html

Pass `[activeClassName]="selectedCharacter.className"` to each Auto equipment component binding.

**Files:** `automatic.ts`, `equipment.component.ts`, `equipment.component.html`, `ro-calculator.component.html`
