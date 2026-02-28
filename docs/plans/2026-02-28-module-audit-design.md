# EP17.2 Module Audit Design

## Problem

The current module system in `automatic.ts` has incorrect target assignments and no max enchant validation:
1. Modules are available on wrong equipment pieces (e.g., Epic modules on garment/shoes when they should only be on Armor)
2. No limit on how many of the same module can be placed on one equipment
3. Several modules from the reference table are missing from the codebase
4. Duplicate entries in `_enchant_table.ts` (old + new automatic equipment registrations)

## Reference Table (Source: Divine Pride EP17.2 enchant image)

### Normal Tier

| Module | Aegis | Target | Max |
|--------|-------|--------|-----|
| Defense | Auto_Module_A | Armor A/B, Engine A/B, Leg A/B | 3 |
| Magic Defense | Auto_Module_A2 | Armor A/B, Engine A/B, Leg A/B | 3 |
| Vit | Auto_Module_A3 | Booster R/L, Battle Chip R/L | 2 |
| Luk | Auto_Module_A4 | Booster R/L, Battle Chip R/L | 2 |
| Str | Auto_Module_A5 | Booster R, Battle Chip R | 2 |
| Agi | Auto_Module_A6 | Booster R, Battle Chip R | 2 |
| Int | Auto_Module_A7 | Booster L, Battle Chip L | 2 |
| Dex | Auto_Module_A8 | Booster L, Battle Chip L | 2 |
| HP Recovery | TBD | Booster R, Battle Chip R | 2 |
| SP Recovery | TBD | Booster L, Battle Chip L | 2 |

### Rare Tier

| Module | Aegis | Target | Max |
|--------|-------|--------|-----|
| Spell | Auto_Module_B3 | Booster R/L, Battle Chip R/L | 1 |
| Attack Speed | Auto_Module_B4 | Booster R/L, Battle Chip R/L | 1 |
| Fatal | Auto_Module_B5 | Booster R/L, Battle Chip R/L | 1 |
| Expert Archer | Auto_Module_B6 | Booster R/L, Battle Chip R/L | 1 |
| Vital | TBD | Leg A/B | 2 |
| Mental | TBD | Leg A/B | 2 |
| Heal | TBD | Leg A/B | 2 |
| Attack Power | Auto_Module_B10 | Armor A/B | 2 |
| Magic Power | Auto_Module_B11 | Armor A/B | 2 |
| Shooter | Auto_Module_B12 | Armor A/B | 2 |
| Fast | TBD | Engine Wing A/B | 2 |
| Caster | Auto_Module_B14 | Engine Wing A/B | 2 |
| Critical | Auto_Module_B15 | Engine Wing A/B | 2 |

### Unique Tier (all max 1)

| Module | Aegis | Target |
|--------|-------|--------|
| Magical Force | Auto_Module_C2 | Armor A/B |
| Attacker Force | Auto_Module_C3 | Armor A/B |
| Range Force | Auto_Module_C | Armor A/B |
| Critical Force | Auto_Module_C4 | Armor A/B |
| Recovery Force | TBD | Armor A/B |
| Mirror Counter | TBD | Armor A/B |
| Delay after skill | Auto_Module_C6 | Armor A/B |
| Fixed Casting | Auto_Module_C7 | Leg A/B |
| Above All | TBD | Engine Wing A/B |
| Drain Life | TBD | Booster R, Battle Chip R |
| Drain Soul | TBD | Booster L, Battle Chip L |
| Magic Healing | TBD | Booster R, Battle Chip R |
| Magic Soul | TBD | Booster L, Battle Chip L |
| Power Force | Auto_Module_C8 | Armor A/B |
| Robust | TBD | Leg A/B |
| Powerful | Auto_Module_C9 | Engine Wing A/B |
| All Force | Auto_Module_C10 | Booster R/L, Battle Chip R/L |
| Reflection Reject | TBD | Engine Wing A/B |

### Legendary Tier (Leg A/B only)

| Module | Aegis |
|--------|-------|
| Unlimited Vital | TBD |
| Spell Buster | TBD |
| Firing Shot | TBD |
| Overpower | TBD |
| Fatal Flash | TBD |
| Lucky Strike | TBD |

### Epic Tier (Armor A/B only, max 2)

51 skill-specific modules — all already in codebase.

## Solution

### 1. Refactor `automatic.ts`

Replace current generic arrays with per-equipment arrays containing only the correct modules:

- `autoArmorModules`: Defense, MDEF, Attack Power, Magic Power, Shooter + all Unique armor modules + all Epic modules
- `autoEngineModules`: Defense, MDEF, Fast, Caster, Critical + Unique engine modules (Above All, Powerful, Reflection Reject)
- `autoLegModules`: Defense, MDEF, Vital, Mental, Heal + Unique leg modules (Fixed Casting, Robust) + Legendary
- `autoAccRModules`: Vit, Luk, Str, Agi, HP Recovery + Rare acc modules (Spell, ASPD, Fatal, Expert Archer) + Unique R modules (Drain Life, Magic Healing, All Force)
- `autoAccLModules`: Vit, Luk, Int, Dex, SP Recovery + Rare acc modules (Spell, ASPD, Fatal, Expert Archer) + Unique L modules (Drain Soul, Magic Soul, All Force)

Add a `moduleMaxEnchant` map: `Record<string, number>` mapping each aegisName to its max count (default 1).

### 2. Update `_enchant_table.ts`

- Remove old duplicate entries (lines ~774-782)
- Update new entries to use the refactored arrays (same array for all 3 slots — filtering happens in component)

### 3. Progressive slot unlocking + max filtering in `equipment.component.ts`

- Slot 2 `[disabled]` when `!enchant1Id`
- Slot 3 `[disabled]` when `!enchant2Id`
- On enchant selection change, recompute available options for subsequent slots:
  - Count occurrences of each module in earlier slots
  - Exclude modules that reached their `maxEnchant`

### 4. Add missing modules to `item.json`

Look up missing modules on Divine Pride and add entries with correct scripts.

### 5. Cleanup

Remove orphaned `automaticArmor`, `automaticGarment`, `automaticBoot`, `automaticAccR`, `automaticAccL` arrays if no longer referenced.
