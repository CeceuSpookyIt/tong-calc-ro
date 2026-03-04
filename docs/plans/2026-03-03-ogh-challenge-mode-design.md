# Old Glast Heim Challenge Mode — Design

## Overview

Add all equipment from the kRO Old Glast Heim Challenge Mode update to the calculator. Items are not yet in the LATAM client, so names follow English (Divine Pride).

Reference: https://ro.gnjoy.com/news/update/View.asp?seq=237&curpage=1

## Scope

| Category | Count | IDs |
|----------|-------|-----|
| Temporal Circlets (headgears) | 19 | 19474-19492 |
| Weapons (Guardian Knight + Royal) | ~22 | various |
| Cards | 8 | 27381-27388 |
| Temporal Jewel enchants | 18 | 29672-29689 |

Total: ~67 items

## 1. Temporal Circlets (19 headgears)

One per class (3rd classes + Star Emperor, Soul Reaper, Rebellion, Kagerou, Oboro, Super Novice, Summoner).

- `itemTypeId: 2`, `itemSubTypeId: 512` (upper headgear)
- `slots: 1`, `defense: 10`, `requiredLevel: 170`, `weight: 0`
- `aegisName`: `S_Circlet_Of_Time_RK`, `S_Circlet_Of_Time_LG`, etc.
- Names: English from Divine Pride (e.g. "Temporal Circlet (Rune Knight) [1]")
- `usableClass`: restricted to specific class

### Script patterns

**Physical classes:**
- `"hp": ["2---250"]` or `"atk2": ["2---15"]` — per 2 refine
- `"aspd": ["3---2"]` or `"spPercent": ["3---2"]` — per 3 refine
- Skill damage: `"Dragon Breath": ["3---15"]` — per 3 refine
- `"range": ["4---5"]` — ranged physical +5% per 4 refine
- `"acd": ["REFINE[11]===5"]` — delay reduction at +11

**Magic classes:**
- `"matk": ["2---15"]` — per 2 refine
- `"vct": ["3---3"]` or `"vct": ["3---5"]` — VCT reduction per 3 refine
- Skill damage: `"Adoramus": ["3---20"]`
- `"m_element_holy": ["4---7"]` — element magic per 4 refine
- `"matkPercent": ["REFINE[11]===5"]` — at +11

### Enchants

Already registered in `_enchant_table.ts` as `tempHead2`/`tempHead3`/`tempHead4`. No changes needed to enchant table.

## 2. Weapons (~22)

All weapon level 4, req. level 170, slots 2 (except Royal Gladius L: slots 3).

### Guardian Knight series (6)

| ID | aegisName | Type | Class |
|----|-----------|------|-------|
| 21055 | Guardian_Knight_Claymore | 2H Sword | Rune Knight |
| 28141 | Guardian_Knight_Battle_Axe | 2H Axe | Mechanic |
| 1336 | Guardian_Knight_Axe | Axe | Mechanic |
| 32027 | Guardian_Knight_Spear | Spear | Royal Guard |
| 32353 | Guardian_Knight_Jewel_Sword | Sword | Royal Guard |
| 18191 | Guardian_Knight_Bow | Bow | Shadow Chaser |

### Royal series (~16)

| ID | aegisName | Type | Class |
|----|-----------|------|-------|
| 28774 | Royal_Gladius_R | Dagger | GX |
| 28775 | Royal_Gladius_L | Dagger | GX |
| 28776 | Royal_Magician_Dagger | Dagger | Shadow Chaser |
| 28046 | Royal_Katar | Katar | GX |
| 1870 | Royal_Knuckle | Knuckle | Sura |
| 2060 | Royal_Magician_Staff | Staff | Warlock |
| 26165 | Royal_Cleric_Staff | Staff | Archbishop |
| 26166 | Royal_Magician_Wand | Staff | Warlock |
| 28636 | Royal_Sage_Book | Book | Sorcerer |
| 26216 | Royal_Whip | Whip | Wanderer |
| 32111 | Royal_Cello | Musical Instrument | Minstrel |
| 18198 | Guardian_Knight_Archer_Bow | Bow | Ranger |
| 13347 | Royal_Huuma_Shuriken | Huuma | Kagerou |
| 32304 | Royal_Revolver | Pistol | Rebellion |
| 32401 | Royal_Pillar | Mace | Mechanic |
| 32402 | Royal_Syringe | Mace | Genetic |
| 32403 | Royal_Alchemy_Staff | Mace | Genetic |
| 26172 | Royal_Foxtail | Foxtail | Summoner |

### Script patterns

- Base: `"atkPercent": ["5"]` or `"matkPercent": ["5"]`
- Per refine: `"atk2": ["1---4"]` or `"range": ["1---1"]` or `"matk": ["1---4"]`
- At +9: `"SkillName": ["REFINE[9]===20"]`
- At +11: `"p_race_undead": ["REFINE[11]===20"]`, `"p_race_angel": ["REFINE[11]===20"]`
- Indestructible: informational only (no calc impact)

### Set bonuses with Schmidt equipment

Weapons have set bonuses with existing items "Vestes de Schmidt" and "Manto de Schmidt":
- `"atk2": ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"]`
- `"p_element_holy": ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]`
- `"p_element_undead": ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]`

### Royal Gladius dual wield

Uses combined refine via `REFINE[weapon,leftWeapon==X]` pattern (already supported by calc):
- `"Cross Impact": ["REFINE[weapon,leftWeapon==18]===20"]`
- `"p_race_undead": ["REFINE[weapon,leftWeapon==22]===30"]`

## 3. Cards (8)

| ID | aegisName | Slot | Script |
|----|-----------|------|--------|
| 27381 | Phantom_Himmelmez_Card | Garment | `m_element_holy: ["100"]`, `m_element_neutral: ["100"]`, `allRes: ["-30"]` |
| 27382 | Prime_Corruption_Root_Card | Garment | `atk2: ["30"]`, `matk: ["30"]` |
| 27383 | Phantom_Amdarais_Card | Shoes | `hpPercent: ["10"]`, `spPercent: ["5"]` |
| 27384 | Mutated_White_Knight_Card | Weapon | `matk: ["15"]`, `m_size_medium: ["20"]`, `m_size_large: ["20"]` |
| 27385 | Mutated_Khalitzburg_Card | Shield | `mdef: ["10"]` (defensive only) |
| 27386 | Cursed_Raydric_Card | Acc | `p_race_undead: ["5"]` |
| 27387 | Cursed_Raydric_Archer_Card | Acc | `p_race_demon: ["5"]` |
| 27388 | Cursed_Butler_Card | Acc | HP recovery (no DPS impact) |

### Card combo bonuses

- 27386 + 27387: `"p_race_undead": ["EQUIP[Cursed Raydric Archer Card]5"]` on 27386, vice versa
- 27382 + Realized Corruption Root: `"m_element_fire": ["EQUIP[Carta Corruption Root Realizado]30"]`
- 27383 + Amdarais: `"p_size_all": ["EQUIP[Carta Amdarais]5"]`, `"matkPercent": ["EQUIP[Carta Amdarais]5"]`
- 27384 + 27385: `"m_size_medium": ["EQUIP[Mutated Khalitzburg Card]5"]` on 27384

## 4. Temporal Jewel Enchants (18)

IDs 29672-29689. 6 stats x 3 levels. `itemTypeId: 11`, `compositionPos: 65535`.

Already referenced in `_enchant_table.ts` as `Time_Jewely_Str_1` through `Time_Jewely_Luk_3`.

### Script patterns (per stat, per level)

**STR (29672-29674):** `atk2` per 2 refine (2/4/7), `hit` per 2 refine (3/5/7), `atkPercent` per 5 refine (1/2/3)
**AGI (29675-29677):** `aspd` per 2 refine (1/3/5), `flee` per 2 refine (4/5/7), ASPD +1 per 5 refine
**VIT (29678-29680):** `def` per 2 refine (5/7/10), `hp` per 2 refine (200/300/500), `hpPercent` per 5 refine (1/2/3)
**INT (29681-29683):** `heal` per 2 refine (1/3/5), `matk` per 2 refine (2/4/7), `matkPercent` per 5 refine (1/2/3)
**DEX (29684-29686):** `bowDmg` per 2 refine (1/2/3), `hit` per 2 refine (2/5/7), `atkPercent` per 5 refine (1/2/3)
**LUK (29687-29689):** `criDmg` per 2 refine (3/6/9), `cri` per 2 refine (1/2/3), `atkPercent` per 5 refine (1/2/3)

## Implementation approach

1. **Script `scripts/add-ogh-cm-items.mjs`** — adds all ~67 items to `item.json`
2. **No enchant table changes needed** — already registered
3. Names in English (Divine Pride) since not yet in LATAM client
