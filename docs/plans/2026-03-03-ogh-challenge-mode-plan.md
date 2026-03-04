# OGH Challenge Mode Items — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add ~67 items from the kRO Old Glast Heim Challenge Mode update to the calculator.

**Architecture:** Single script (`scripts/add-ogh-cm-items.mjs`) adds all items to `item.json`. Enchant table already has entries for the Temporal Circlets — no changes needed there.

**Tech Stack:** Node.js script (ES modules), item.json, existing script system patterns.

**Reference:** Design doc at `docs/plans/2026-03-03-ogh-challenge-mode-design.md`

---

### Task 1: Create script with Temporal Circlets (19 headgears)

**Files:**
- Create: `scripts/add-ogh-cm-items.mjs`

**Step 1: Write the script with all 19 Temporal Circlets**

Create `scripts/add-ogh-cm-items.mjs` following the pattern from `scripts/add-490414-490435.mjs`.

Key field reference for all circlets:
- `itemTypeId: 1` — NO, headgears use `itemTypeId: 2`
- `itemSubTypeId: 512` (upper headgear)
- `slots: 1`, `defense: 10`, `requiredLevel: 170`, `weight: 0`
- `location: null`, `compositionPos: null`
- aegisNames from Divine Pride (already in `_enchant_table.ts`)

```js
import { readFileSync, writeFileSync } from 'fs';

const itemFile = 'src/assets/demo/data/item.json';
const items = JSON.parse(readFileSync(itemFile, 'utf-8'));

const newItems = {
  // === TEMPORAL CIRCLETS (headgears) ===
  "19474": {
    id: 19474,
    aegisName: "S_Circlet_Of_Time_RK",
    name: "Temporal Circlet (Rune Knight) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Rune Knight"],
    script: {
      hp: ["2---250"],
      spPercent: ["3---2"],
      "Dragon Breath": ["3---15"],
      range: ["4---5"],
      acd: ["REFINE[11]===5"]
    }
  },
  "19475": {
    id: 19475,
    aegisName: "S_Circlet_Of_Time_LG",
    name: "Temporal Circlet (Royal Guard) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Royal Guard"],
    script: {
      atk2: ["2---15"],
      aspd: ["3---2"],
      "Vanishing Point": ["3---15"],
      "Cannon Spear": ["3---15"],
      range: ["4---5"],
      atkPercent: ["REFINE[11]===5"]
    }
  },
  "19476": {
    id: 19476,
    aegisName: "S_Circlet_Of_Time_NC",
    name: "Temporal Circlet (Mechanic) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Mechanic"],
    script: {
      atk2: ["2---15"],
      aspd: ["3---2"],
      "Arm Cannon": ["3---10"],
      "Knuckle Boost": ["3---10"],
      range: ["4---5"],
      acd: ["REFINE[11]===5"]
    }
  },
  "19477": {
    id: 19477,
    aegisName: "S_Circlet_Of_Time_GN",
    name: "Temporal Circlet (Genetic) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Genetic"],
    script: {
      atk2: ["2---15"],
      aspd: ["3---2"],
      "Spore Explosion": ["3---20"],
      "Cart Tornado": ["3---20"],
      p_size_all: ["4---2"],
      acd: ["REFINE[11]===5"]
    }
  },
  "19478": {
    id: 19478,
    aegisName: "S_Circlet_Of_Time_GC",
    name: "Temporal Circlet (Guillotine Cross) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Guillotine Cross"],
    script: {
      atk2: ["2---15"],
      aspd: ["3---2"],
      "Rolling Cutter": ["3---20"],
      "Counter Slash": ["3---20"],
      atkPercent: ["4---2"],
      acd: ["REFINE[11]===5"]
    }
  },
  "19479": {
    id: 19479,
    aegisName: "S_Circlet_Of_Time_SC",
    name: "Temporal Circlet (Shadow Chaser) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Shadow Chaser"],
    script: {
      atk2: ["2---15"],
      aspd: ["3---2"],
      "Fatal Menace": ["3---30"],
      "Feint Bomb": ["3---30"],
      atkPercent: ["4---2"],
      acd: ["REFINE[11]===5"]
    }
  },
  "19480": {
    id: 19480,
    aegisName: "S_Circlet_Of_Time_AB",
    name: "Temporal Circlet (Archbishop) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Archbishop"],
    script: {
      matk: ["2---15"],
      vct: ["3---3"],
      Adoramus: ["3---20"],
      m_element_holy: ["4---7"],
      matkPercent: ["REFINE[11]===5"]
    }
  },
  "19481": {
    id: 19481,
    aegisName: "S_Circlet_Of_Time_SR",
    name: "Temporal Circlet (Sura) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Sura"],
    script: {
      atk2: ["2---15"],
      hpPercent: ["3---2"],
      "Knuckle Arrow": ["3---20"],
      "Tiger Cannon": ["3---10"],
      range: ["4---5"],
      atkPercent: ["REFINE[11]===5"]
    }
  },
  "19482": {
    id: 19482,
    aegisName: "S_Circlet_Of_Time_WL",
    name: "Temporal Circlet (Warlock) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Warlock"],
    script: {
      matk: ["2---15"],
      vct: ["3---3"],
      "Chain Lightning": ["3---20"],
      "Jack Frost": ["3---20"],
      m_element_wind: ["4---5"],
      m_element_water: ["4---5"],
      matkPercent: ["REFINE[11]===5"]
    }
  },
  "19483": {
    id: 19483,
    aegisName: "S_Circlet_Of_Time_SO",
    name: "Temporal Circlet (Sorcerer) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Sorcerer"],
    script: {
      matk: ["2---15"],
      vct: ["3---3"],
      "Psychic Wave": ["3---20"],
      "Diamond Dust": ["3---20"],
      m_element_neutral: ["4---5"],
      m_element_water: ["4---5"],
      matkPercent: ["REFINE[11]===5"]
    }
  },
  "19484": {
    id: 19484,
    aegisName: "S_Circlet_Of_Time_RA",
    name: "Temporal Circlet (Ranger) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Ranger"],
    script: {
      atk2: ["2---15"],
      criDmg: ["3---5"],
      "Arrow Storm": ["3---20"],
      "Aimed Bolt": ["3---20"],
      range: ["4---5"],
      "cd__Arrow Storm": ["REFINE[11]===1"]
    }
  },
  "19485": {
    id: 19485,
    aegisName: "S_Circlet_Of_Time_WM",
    name: "Temporal Circlet (Wanderer/Minstrel) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Minstrel", "Wanderer"],
    script: {
      matk: ["2---15"],
      vct: ["3---5"],
      Reverberation: ["3---20"],
      "Metallic Sound": ["3---20"],
      m_element_neutral: ["4---7"],
      matkPercent: ["REFINE[11]===5"]
    }
  },
  "19486": {
    id: 19486,
    aegisName: "S_Circlet_Of_Time_SE",
    name: "Temporal Circlet (Star Emperor) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Star Emperor"],
    script: {
      atk2: ["2---15"],
      aspd: ["3---2"],
      "Falling Star": ["3---30"],
      p_size_all: ["4---2"],
      atkPercent: ["REFINE[11]===5"]
    }
  },
  "19487": {
    id: 19487,
    aegisName: "S_Circlet_Of_Time_SL",
    name: "Temporal Circlet (Soul Reaper) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Soul Reaper"],
    script: {
      matk: ["2---15"],
      vct: ["3---5"],
      "Curse Explosion": ["3---20"],
      Eswhoo: ["3---20"],
      m_element_shadow: ["4---7"],
      matkPercent: ["REFINE[11]===5"]
    }
  },
  "19488": {
    id: 19488,
    aegisName: "S_Circlet_Of_Time_RL",
    name: "Temporal Circlet (Rebellion) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Rebellion"],
    script: {
      atk2: ["2---15"],
      aspd: ["3---2"],
      "Round Trip": ["3---20"],
      "Vanishing Buster": ["3---20"],
      range: ["4---5"],
      acd: ["REFINE[11]===5"]
    }
  },
  "19489": {
    id: 19489,
    aegisName: "S_Circlet_Of_Time_OB",
    name: "Temporal Circlet (Oboro) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Oboro"],
    script: {
      matk: ["2---15"],
      aspd: ["3---2"],
      "Wind Blade": ["3---30"],
      "Freezing Spear": ["3---30"],
      m_element_wind: ["4---5"],
      m_element_water: ["4---5"],
      matkPercent: ["REFINE[11]===5"]
    }
  },
  "19490": {
    id: 19490,
    aegisName: "S_Circlet_Of_Time_KG",
    name: "Temporal Circlet (Kagerou) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Kagerou"],
    script: {
      atk2: ["2---15"],
      aspd: ["3---2"],
      "Cross Slash": ["3---20"],
      "Kunai Explosion": ["3---20"],
      p_size_all: ["4---2"],
      atkPercent: ["REFINE[11]===5"]
    }
  },
  "19491": {
    id: 19491,
    aegisName: "S_Circlet_Of_Time_SN",
    name: "Temporal Circlet (Super Novice) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Super Novice"],
    script: {
      atk2: ["2---10"],
      matk: ["2---10"],
      aspd: ["3---4"],
      vct: ["3---4"],
      criDmg: ["4---5"],
      m_element_all: ["4---5"]
    }
  },
  "19492": {
    id: 19492,
    aegisName: "S_Circlet_Of_Time_SU",
    name: "Temporal Circlet (Summoner) [1]",
    unidName: "Temporal Circlet",
    resName: "",
    description: "",
    slots: 1,
    itemTypeId: 2,
    itemSubTypeId: 512,
    itemLevel: null,
    attack: null,
    defense: 10,
    weight: 0,
    requiredLevel: 170,
    location: "Upper",
    compositionPos: null,
    usableClass: ["Summoner"],
    script: {
      atk2: ["2---15"],
      aspd: ["3---2"],
      "Catnip Meteor": ["3---20"],
      "Picky Peck": ["3---20"],
      range: ["4---5"],
      m_element_neutral: ["4---7"],
      acd: ["REFINE[11]===5"]
    }
  },

  // ... weapons, cards, enchants added in subsequent tasks
};

// Add new items
for (const [id, item] of Object.entries(newItems)) {
  if (items[id]) {
    console.log(`Item ${id} already exists, skipping: ${items[id].name}`);
  } else {
    items[id] = item;
    console.log(`Added item ${id}: ${item.name}`);
  }
}

// Write back
writeFileSync(itemFile, JSON.stringify(items, null, 2), 'utf-8');
console.log('\nDone! Items added to item.json');
```

**Step 2: Run the script**

Run: `node scripts/add-ogh-cm-items.mjs`
Expected: 19 items added messages, no "already exists" warnings.

**Step 3: Verify in item.json**

Run: `grep -c "S_Circlet_Of_Time" src/assets/demo/data/item.json`
Expected: 19

**Step 4: Commit**

```bash
git add scripts/add-ogh-cm-items.mjs src/assets/demo/data/item.json
git commit -m "feat: add 19 Temporal Circlet headgears from OGH Challenge Mode"
```

---

### Task 2: Add weapons to script (Guardian Knight series — 6 weapons)

**Files:**
- Modify: `scripts/add-ogh-cm-items.mjs`

**Step 1: Add Guardian Knight weapons to `newItems` object**

Add these entries after the circlets, before the closing `};`:

Weapon field reference:
- `itemTypeId: 1` for all weapons
- `itemLevel: 4` for all (weapon level 4)
- Subtypes: 258 (2H sword), 263 (2H axe), 262 (1H axe), 259 (spear), 257 (sword), 266 (bow)
- Set bonus references: `"Vestes de Schmidt"` and `"Manto de Schmidt"` (existing items)

```js
  // === GUARDIAN KNIGHT WEAPONS ===
  "21055": {
    id: 21055,
    aegisName: "Guardian_Knight_Claymore",
    name: "Guardian Knight Claymore [2]",
    unidName: "Two-handed Sword",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 258,
    itemLevel: 4,
    attack: 280,
    defense: null,
    weight: 200,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Rune Knight"],
    script: {
      atkPercent: ["5"],
      atk2: ["1---4"],
      cri: ["REFINE[9]===5"],
      criDmg: ["REFINE[9]===25"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      atk2: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      criDmg: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]20"]
    }
  },
  "28141": {
    id: 28141,
    aegisName: "Guardian_Knight_Battle_Axe",
    name: "Guardian Knight Battle Axe [2]",
    unidName: "Two-handed Axe",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 263,
    itemLevel: 4,
    attack: 270,
    defense: null,
    weight: 500,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Mechanic"],
    script: {
      atkPercent: ["5"],
      range: ["1---1"],
      "Axe Tornado": ["REFINE[9]===20"],
      "Lava Flow": ["REFINE[9]===20"],
      "cd__Axe Tornado": ["REFINE[9]===1"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      atk2: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      range: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"]
    }
  },
  "1336": {
    id: 1336,
    aegisName: "Guardian_Knight_Axe",
    name: "Guardian Knight Axe [2]",
    unidName: "Axe",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 262,
    itemLevel: 4,
    attack: 210,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Mechanic"],
    script: {
      atkPercent: ["5"],
      range: ["1---1"],
      "Power Swing": ["REFINE[9]===20"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      atk2: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      range: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      p_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      p_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]
    }
  },
  "32027": {
    id: 32027,
    aegisName: "Guardian_Knight_Spear",
    name: "Guardian Knight Spear [2]",
    unidName: "Spear",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 259,
    itemLevel: 4,
    attack: 205,
    defense: null,
    weight: 400,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Royal Guard"],
    script: {
      range: ["1---1"],
      "Vanishing Point": ["REFINE[9]===20"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      atk2: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      range: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"]
    }
  },
  "32353": {
    id: 32353,
    aegisName: "Guardian_Knight_Jewel_Sword",
    name: "Guardian Knight Jewel Sword [2]",
    unidName: "Sword",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 257,
    itemLevel: 4,
    attack: 130,
    defense: null,
    weight: 400,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Royal Guard"],
    script: {
      matk: ["180"],
      hpPercent: ["1---1"],
      "Grand Cross": ["1---2"],
      "Shield Press": ["REFINE[9]===20"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      m_race_undead: ["REFINE[11]===20"],
      m_race_angel: ["REFINE[11]===20"],
      atkPercent: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]7"],
      matkPercent: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]7"],
      p_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      p_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      m_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      m_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]
    }
  },
  "18191": {
    id: 18191,
    aegisName: "Guardian_Knight_Bow",
    name: "Guardian Knight Crossbow [2]",
    unidName: "Bow",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 266,
    itemLevel: 4,
    attack: 180,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Shadow Chaser"],
    script: {
      range: ["15"],
      atk2: ["1---4"],
      "Triangle Shot": ["REFINE[9]===20"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      atk2: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      range: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"]
    }
  },
```

**NOTE on duplicate keys:** JavaScript objects don't allow duplicate keys. When a weapon has both a base bonus and a set bonus using the same key (e.g., `atk2`), combine them into an array:
```js
atk2: ["1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"]
```

This is the existing pattern in the codebase (multiple values in a single array).

**Step 2: Run script and verify**

Run: `node scripts/add-ogh-cm-items.mjs`
Expected: 25 items added (19 circlets + 6 weapons)

**Step 3: Commit**

```bash
git add scripts/add-ogh-cm-items.mjs src/assets/demo/data/item.json
git commit -m "feat: add 6 Guardian Knight weapons from OGH Challenge Mode"
```

---

### Task 3: Add Royal series weapons (~16 weapons)

**Files:**
- Modify: `scripts/add-ogh-cm-items.mjs`

**Step 1: Add Royal weapons to `newItems` object**

Weapon subtypes:
- Dagger: 256, Katar: 267, Knuckle: 268, Staff 1H: 264, Staff 2H: 265
- Bow: 266, Whip: 270, Musical Instrument: 269, Book: 271
- Mace: 261, Pistol: 273, Huuma Shuriken: 278, Foxtail: 265

```js
  // === ROYAL WEAPONS ===
  "28774": {
    id: 28774,
    aegisName: "Royal_Gladius_R",
    name: "Royal Gladius (R) [2]",
    unidName: "Dagger",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 256,
    itemLevel: 4,
    attack: 200,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Guillotine Cross"],
    script: {
      atkPercent: ["5"],
      atk2: ["2---7", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      "Cross Impact": ["REFINE[weapon,leftWeapon==18]===20"],
      "Counter Slash": ["REFINE[weapon,leftWeapon==18]===20"],
      p_race_undead: ["REFINE[weapon,leftWeapon==22]===30"],
      p_race_angel: ["REFINE[weapon,leftWeapon==22]===30"],
      atkPercent: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      p_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,leftWeapon,armor,garment==40]===20"],
      p_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,leftWeapon,armor,garment==40]===20"]
    }
  },
  "28775": {
    id: 28775,
    aegisName: "Royal_Gladius_L",
    name: "Royal Gladius (L) [3]",
    unidName: "Dagger",
    resName: "",
    description: "",
    slots: 3,
    itemTypeId: 1,
    itemSubTypeId: 256,
    itemLevel: 4,
    attack: 100,
    defense: null,
    weight: 100,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Guillotine Cross"],
    script: {}
  },
  "28776": {
    id: 28776,
    aegisName: "Royal_Magician_Dagger",
    name: "Royal Magician Dagger [2]",
    unidName: "Dagger",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 256,
    itemLevel: 4,
    attack: 200,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Shadow Chaser"],
    script: {
      matk: ["170"],
      matkPercent: ["5"],
      matk: ["1---4"],
      m_element_fire: ["REFINE[9]===15"],
      m_element_neutral: ["REFINE[9]===15"],
      m_race_undead: ["REFINE[11]===20"],
      m_race_angel: ["REFINE[11]===20"],
      matk: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      m_element_fire: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      m_element_neutral: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"]
    }
  },
  "28046": {
    id: 28046,
    aegisName: "Royal_Katar",
    name: "Royal Katar [2]",
    unidName: "Katar",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 267,
    itemLevel: 4,
    attack: 200,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Guillotine Cross"],
    script: {
      atkPercent: ["5"],
      atk2: ["1---5", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      "Rolling Cutter": ["REFINE[9]===20"],
      "Cross Ripper Slasher": ["REFINE[9]===20"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      range: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]20"]
    }
  },
  "1870": {
    id: 1870,
    aegisName: "Royal_Knuckle",
    name: "Royal Knuckle [2]",
    unidName: "Knuckle",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 268,
    itemLevel: 4,
    attack: 190,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Sura"],
    script: {
      range: ["15"],
      atk2: ["1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      "Rampage Blast": ["REFINE[9]===20"],
      "cd__Rampage Blast": ["REFINE[9]===1"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      range: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"]
    }
  },
  "2060": {
    id: 2060,
    aegisName: "Royal_Magician_Staff",
    name: "Royal Magician Staff [2]",
    unidName: "Staff",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 264,
    itemLevel: 4,
    attack: 100,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Warlock"],
    script: {
      matk: ["270", "1---5", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      matkPercent: ["5"],
      "Chain Lightning": ["REFINE[9]===20"],
      "Earth Strain": ["REFINE[9]===20"],
      m_race_undead: ["REFINE[11]===20"],
      m_race_angel: ["REFINE[11]===20"],
      m_element_wind: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      m_element_earth: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      m_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      m_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]
    }
  },
  "26165": {
    id: 26165,
    aegisName: "Royal_Cleric_Staff",
    name: "Royal Cleric Staff [2]",
    unidName: "Staff",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 264,
    itemLevel: 4,
    attack: 100,
    defense: null,
    weight: 100,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Archbishop"],
    script: {
      matk: ["170", "1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      matkPercent: ["5"],
      Adoramus: ["REFINE[9]===20"],
      m_race_undead: ["REFINE[11]===20"],
      m_race_angel: ["REFINE[11]===20"],
      m_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      m_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]
    }
  },
  "26166": {
    id: 26166,
    aegisName: "Royal_Magician_Wand",
    name: "Royal Magician Wand [2]",
    unidName: "Staff",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 264,
    itemLevel: 4,
    attack: 100,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Warlock"],
    script: {
      matk: ["180", "1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      m_element_fire: ["5", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      "Hell Inferno": ["REFINE[9]===20"],
      "Crimson Rock": ["REFINE[9]===20"],
      m_race_undead: ["REFINE[11]===20"],
      m_race_angel: ["REFINE[11]===20"],
      m_element_shadow: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      m_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      m_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]
    }
  },
  "28636": {
    id: 28636,
    aegisName: "Royal_Sage_Book",
    name: "Royal Sage Book [2]",
    unidName: "Book",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 271,
    itemLevel: 4,
    attack: 90,
    defense: null,
    weight: 100,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Sorcerer"],
    script: {
      matk: ["170", "1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      m_element_wind: ["5", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      m_element_water: ["5", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      "Varetyr Spear": ["REFINE[9]===20"],
      "Diamond Dust": ["REFINE[9]===20"],
      m_race_undead: ["REFINE[11]===20"],
      m_race_angel: ["REFINE[11]===20"],
      m_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      m_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]
    }
  },
  "26216": {
    id: 26216,
    aegisName: "Royal_Whip",
    name: "Royal Whip [2]",
    unidName: "Whip",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 270,
    itemLevel: 4,
    attack: 100,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Wanderer"],
    script: {
      matk: ["180", "1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      m_element_neutral: ["5", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      Reverberation: ["REFINE[9]===20"],
      "Metallic Sound": ["REFINE[9]===20"],
      "cd__Metallic Sound": ["REFINE[9]===1"],
      m_race_undead: ["REFINE[11]===20"],
      m_race_angel: ["REFINE[11]===20"],
      m_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      m_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]
    }
  },
  "32111": {
    id: 32111,
    aegisName: "Royal_Cello",
    name: "Royal Cello [2]",
    unidName: "Musical Instrument",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 269,
    itemLevel: 4,
    attack: 90,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Minstrel"],
    script: {
      matk: ["180", "1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      m_element_neutral: ["5", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      Reverberation: ["REFINE[9]===20"],
      "Metallic Sound": ["REFINE[9]===20"],
      "cd__Metallic Sound": ["REFINE[9]===1"],
      m_race_undead: ["REFINE[11]===20"],
      m_race_angel: ["REFINE[11]===20"],
      m_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      m_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]
    }
  },
  "18198": {
    id: 18198,
    aegisName: "Guardian_Knight_Archer_Bow",
    name: "Guardian Knight Archer Bow [2]",
    unidName: "Bow",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 266,
    itemLevel: 4,
    attack: 190,
    defense: null,
    weight: 170,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Ranger"],
    script: {
      range: ["15"],
      atk2: ["1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      "Aimed Bolt": ["REFINE[9]===25"],
      acd: ["REFINE[9]===12"],
      "cd__Aimed Bolt": ["REFINE[11]===1"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      range: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"]
    }
  },
  "13347": {
    id: 13347,
    aegisName: "Royal_Huuma_Shuriken",
    name: "Royal Huuma Shuriken [2]",
    unidName: "Huuma Shuriken",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 278,
    itemLevel: 4,
    attack: 240,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Kagerou"],
    script: {
      range: ["15"],
      atk2: ["1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      "Cross Slash": ["REFINE[9]===20"],
      "cd__Cross Slash": ["REFINE[9]===2"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      range: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"]
    }
  },
  "32304": {
    id: 32304,
    aegisName: "Royal_Revolver",
    name: "Royal Revolver [2]",
    unidName: "Revolver",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 273,
    itemLevel: 4,
    attack: 150,
    defense: null,
    weight: 70,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Rebellion"],
    script: {
      range: ["15"],
      atk2: ["1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      "Fire Dance": ["REFINE[9]===20"],
      "cd__Heat Barrel": ["REFINE[11]===5"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      range: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"]
    }
  },
  "32401": {
    id: 32401,
    aegisName: "Royal_Pillar",
    name: "Royal Pillar [2]",
    unidName: "Mace",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 261,
    itemLevel: 4,
    attack: 220,
    defense: null,
    weight: 500,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Mechanic"],
    script: {
      atkPercent: ["5"],
      range: ["1---1"],
      "Arm Cannon": ["REFINE[9]===20"],
      "Knuckle Boost": ["REFINE[9]===20"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"]
    }
  },
  "32402": {
    id: 32402,
    aegisName: "Royal_Syringe",
    name: "Royal Syringe [2]",
    unidName: "Mace",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 261,
    itemLevel: 4,
    attack: 210,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Genetic"],
    script: {
      atkPercent: ["5"],
      range: ["1---1"],
      "Cart Cannon": ["REFINE[9]===20"],
      "Spore Explosion": ["REFINE[9]===20"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"]
    }
  },
  "32403": {
    id: 32403,
    aegisName: "Royal_Alchemy_Staff",
    name: "Royal Alchemy Staff [2]",
    unidName: "Mace",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 261,
    itemLevel: 4,
    attack: 200,
    defense: null,
    weight: 150,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Genetic"],
    script: {
      atkPercent: ["5"],
      atk2: ["1---4"],
      "Crazy Vines": ["REFINE[9]===30"],
      "cd__Crazy Vines": ["REFINE[9]===1"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"]
    }
  },
  "26172": {
    id: 26172,
    aegisName: "Royal_Foxtail",
    name: "Royal Foxtail [2]",
    unidName: "Staff",
    resName: "",
    description: "",
    slots: 2,
    itemTypeId: 1,
    itemSubTypeId: 265,
    itemLevel: 4,
    attack: 275,
    defense: null,
    weight: 120,
    requiredLevel: 170,
    location: null,
    compositionPos: null,
    usableClass: ["Summoner"],
    script: {
      matk: ["350", "1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      matkPercent: ["5"],
      atk2: ["1---4", "EQUIP[Vestes de Schmidt&&Manto de Schmidt]30"],
      "Catnip Meteor": ["REFINE[9]===20"],
      "Picky Peck": ["REFINE[9]===20"],
      p_race_undead: ["REFINE[11]===20"],
      p_race_angel: ["REFINE[11]===20"],
      m_race_undead: ["REFINE[11]===20"],
      m_race_angel: ["REFINE[11]===20"],
      range: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      matkPercent: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]10"],
      p_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      p_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      m_element_holy: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"],
      m_element_undead: ["EQUIP[Vestes de Schmidt&&Manto de Schmidt]REFINE[weapon,armor,garment==30]===20"]
    }
  },
```

**IMPORTANT: Fix duplicate key issue.** Before running, review every item for duplicate JS object keys and merge them into arrays. For example:
- `range: ["15"]` and `range: ["1---1"]` → `range: ["15", "1---1"]`
- `matk: ["270"]` and `matk: ["1---5"]` → `matk: ["270", "1---5"]`
- `atk2: ["2---7"]` and `atk2: ["EQUIP[...]30"]` → `atk2: ["2---7", "EQUIP[...]30"]`

**Step 2: Run script and verify**

Run: `node scripts/add-ogh-cm-items.mjs`
Expected: 41 items added (19 circlets + 6 GK weapons + 16 Royal weapons)

**Step 3: Commit**

```bash
git add scripts/add-ogh-cm-items.mjs src/assets/demo/data/item.json
git commit -m "feat: add 16 Royal series weapons from OGH Challenge Mode"
```

---

### Task 4: Add cards (8 cards)

**Files:**
- Modify: `scripts/add-ogh-cm-items.mjs`

**Step 1: Add cards to `newItems` object**

Card field reference:
- `itemTypeId: 6`, `itemSubTypeId: 0`
- `compositionPos`: 4 (weapon), 16 (armor), 64 (garment), 256 (shoes), 136 (accessory)
- `cardPrefix`: suffix/prefix for the card
- `weight: 1`, `slots: 0`

```js
  // === CARDS ===
  "27381": {
    id: 27381,
    aegisName: "Phantom_Himmelmez_Card",
    name: "Phantom of Himmelmez Card",
    unidName: "Card",
    resName: "이름없는카드",
    description: "",
    slots: 0,
    itemTypeId: 6,
    itemSubTypeId: 0,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 1,
    requiredLevel: null,
    location: null,
    compositionPos: 64,
    cardPrefix: "Of Fallen Angel",
    script: {
      m_element_holy: ["100"],
      m_element_neutral: ["100"]
    }
  },
  "27382": {
    id: 27382,
    aegisName: "Prime_Corruption_Root_Card",
    name: "Prime Corruption Root Card",
    unidName: "Card",
    resName: "이름없는카드",
    description: "",
    slots: 0,
    itemTypeId: 6,
    itemSubTypeId: 0,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 1,
    requiredLevel: null,
    location: null,
    compositionPos: 64,
    cardPrefix: "Of Creep",
    script: {
      atk2: ["30"],
      matk: ["30"]
    }
  },
  "27383": {
    id: 27383,
    aegisName: "Phantom_Amdarais_Card",
    name: "Phantom of Amdarais Card",
    unidName: "Card",
    resName: "이름없는카드",
    description: "",
    slots: 0,
    itemTypeId: 6,
    itemSubTypeId: 0,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 1,
    requiredLevel: null,
    location: null,
    compositionPos: 256,
    cardPrefix: "Of Relax",
    script: {
      hpPercent: ["10"],
      spPercent: ["5"]
    }
  },
  "27384": {
    id: 27384,
    aegisName: "Mutated_White_Knight_Card",
    name: "Mutated White Knight Card",
    unidName: "Card",
    resName: "이름없는카드",
    description: "",
    slots: 0,
    itemTypeId: 6,
    itemSubTypeId: 0,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 1,
    requiredLevel: null,
    location: null,
    compositionPos: 4,
    cardPrefix: "Mutant White",
    script: {
      matk: ["15"],
      m_size_medium: ["20", "EQUIP[Mutated Khalitzburg Card]5"],
      m_size_large: ["20", "EQUIP[Mutated Khalitzburg Card]5"]
    }
  },
  "27385": {
    id: 27385,
    aegisName: "Mutated_Khalitzburg_Card",
    name: "Mutated Khalitzburg Card",
    unidName: "Card",
    resName: "이름없는카드",
    description: "",
    slots: 0,
    itemTypeId: 6,
    itemSubTypeId: 0,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 1,
    requiredLevel: null,
    location: null,
    compositionPos: 32,
    cardPrefix: "Mutant Khalitzburg",
    script: {
      mdef: ["10"]
    }
  },
  "27386": {
    id: 27386,
    aegisName: "Cursed_Raydric_Card",
    name: "Cursed Raydric Card",
    unidName: "Card",
    resName: "이름없는카드",
    description: "",
    slots: 0,
    itemTypeId: 6,
    itemSubTypeId: 0,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 1,
    requiredLevel: null,
    location: null,
    compositionPos: 136,
    cardPrefix: "Exorcist's",
    script: {
      p_race_undead: ["5", "EQUIP[Cursed Raydric Archer Card]5"]
    }
  },
  "27387": {
    id: 27387,
    aegisName: "Cursed_Raydric_Archer_Card",
    name: "Cursed Raydric Archer Card",
    unidName: "Card",
    resName: "이름없는카드",
    description: "",
    slots: 0,
    itemTypeId: 6,
    itemSubTypeId: 0,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 1,
    requiredLevel: null,
    location: null,
    compositionPos: 136,
    cardPrefix: "Undead Slayer's",
    script: {
      p_race_demon: ["5", "EQUIP[Cursed Raydric Card]5"]
    }
  },
  "27388": {
    id: 27388,
    aegisName: "Cursed_Butler_Card",
    name: "Cursed Butler Card",
    unidName: "Card",
    resName: "이름없는카드",
    description: "",
    slots: 0,
    itemTypeId: 6,
    itemSubTypeId: 0,
    itemLevel: null,
    attack: null,
    defense: null,
    weight: 1,
    requiredLevel: null,
    location: null,
    compositionPos: 136,
    cardPrefix: "Strong Recovery",
    script: {}
  },
```

**Step 2: Run script and verify**

Run: `node scripts/add-ogh-cm-items.mjs`
Expected: 49 items added (19 + 6 + 16 + 8)

**Step 3: Commit**

```bash
git add scripts/add-ogh-cm-items.mjs src/assets/demo/data/item.json
git commit -m "feat: add 8 OGH Challenge Mode cards"
```

---

### Task 5: Add Temporal Jewel enchants (18 enchant items)

**Files:**
- Modify: `scripts/add-ogh-cm-items.mjs`

**Step 1: Add enchant items to `newItems` object**

Enchant field reference:
- `itemTypeId: 11`, `itemSubTypeId: 0`
- `compositionPos: 65535`
- `slots: 0`, `weight: 10`
- aegisNames must match what's in `_enchant_table.ts`: `Time_Jewely_Str_1` etc.

```js
  // === TEMPORAL JEWEL ENCHANTS ===
  // STR series
  "29672": {
    id: 29672, aegisName: "Time_Jewely_Str_1", name: "Temporal Jewel STR Lv.1",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { atk2: ["2---2"], hit: ["2---3"], atkPercent: ["5---1"] }
  },
  "29673": {
    id: 29673, aegisName: "Time_Jewely_Str_2", name: "Temporal Jewel STR Lv.2",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { atk2: ["2---4"], hit: ["2---5"], atkPercent: ["5---2"] }
  },
  "29674": {
    id: 29674, aegisName: "Time_Jewely_Str_3", name: "Temporal Jewel STR Lv.3",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { atk2: ["2---7"], hit: ["2---7"], atkPercent: ["5---3"] }
  },
  // AGI series
  "29675": {
    id: 29675, aegisName: "Time_Jewely_Agi_1", name: "Temporal Jewel AGI Lv.1",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { aspd: ["2---1"], flee: ["2---4"], aspd: ["5---1"] }
  },
  "29676": {
    id: 29676, aegisName: "Time_Jewely_Agi_2", name: "Temporal Jewel AGI Lv.2",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { aspd: ["2---3"], flee: ["2---5"], aspd: ["5---1"] }
  },
  "29677": {
    id: 29677, aegisName: "Time_Jewely_Agi_3", name: "Temporal Jewel AGI Lv.3",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { aspd: ["2---5"], flee: ["2---7"], aspd: ["5---1"] }
  },
  // VIT series
  "29678": {
    id: 29678, aegisName: "Time_Jewely_Vit_1", name: "Temporal Jewel VIT Lv.1",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { def: ["2---5"], hp: ["2---200"], hpPercent: ["5---1"] }
  },
  "29679": {
    id: 29679, aegisName: "Time_Jewely_Vit_2", name: "Temporal Jewel VIT Lv.2",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { def: ["2---7"], hp: ["2---300"], hpPercent: ["5---2"] }
  },
  "29680": {
    id: 29680, aegisName: "Time_Jewely_Vit_3", name: "Temporal Jewel VIT Lv.3",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { def: ["2---10"], hp: ["2---500"], hpPercent: ["5---3"] }
  },
  // INT series
  "29681": {
    id: 29681, aegisName: "Time_Jewely_Int_1", name: "Temporal Jewel INT Lv.1",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { heal: ["2---1"], matk: ["2---2"], matkPercent: ["5---1"] }
  },
  "29682": {
    id: 29682, aegisName: "Time_Jewely_Int_2", name: "Temporal Jewel INT Lv.2",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { heal: ["2---3"], matk: ["2---4"], matkPercent: ["5---2"] }
  },
  "29683": {
    id: 29683, aegisName: "Time_Jewely_Int_3", name: "Temporal Jewel INT Lv.3",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { heal: ["2---5"], matk: ["2---7"], matkPercent: ["5---3"] }
  },
  // DEX series
  "29684": {
    id: 29684, aegisName: "Time_Jewely_Dex_1", name: "Temporal Jewel DEX Lv.1",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { bowDmg: ["2---1"], hit: ["2---2"], atkPercent: ["5---1"] }
  },
  "29685": {
    id: 29685, aegisName: "Time_Jewely_Dex_2", name: "Temporal Jewel DEX Lv.2",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { bowDmg: ["2---2"], hit: ["2---5"], atkPercent: ["5---2"] }
  },
  "29686": {
    id: 29686, aegisName: "Time_Jewely_Dex_3", name: "Temporal Jewel DEX Lv.3",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { bowDmg: ["2---3"], hit: ["2---7"], atkPercent: ["5---3"] }
  },
  // LUK series
  "29687": {
    id: 29687, aegisName: "Time_Jewely_Luk_1", name: "Temporal Jewel LUK Lv.1",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { criDmg: ["2---3"], cri: ["2---1"], atkPercent: ["5---1"] }
  },
  "29688": {
    id: 29688, aegisName: "Time_Jewely_Luk_2", name: "Temporal Jewel LUK Lv.2",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { criDmg: ["2---6"], cri: ["2---2"], atkPercent: ["5---2"] }
  },
  "29689": {
    id: 29689, aegisName: "Time_Jewely_Luk_3", name: "Temporal Jewel LUK Lv.3",
    unidName: "Enchant Stone", resName: "", description: "", slots: 0,
    itemTypeId: 11, itemSubTypeId: 0, itemLevel: null, attack: null,
    defense: null, weight: 10, requiredLevel: null, location: null,
    compositionPos: 65535,
    script: { criDmg: ["2---9"], cri: ["2---3"], atkPercent: ["5---3"] }
  },
```

**IMPORTANT: Fix AGI series duplicate key.** The AGI enchants have `aspd` as both "ASPD% per 2 refine" and "flat ASPD per 5 refine". Combine:
```js
aspd: ["2---1", "5---1"]  // for Lv.1
aspd: ["2---3", "5---1"]  // for Lv.2
aspd: ["2---5", "5---1"]  // for Lv.3
```

**Step 2: Run script and verify**

Run: `node scripts/add-ogh-cm-items.mjs`
Expected: 67 items added (19 + 22 + 8 + 18)

**Step 3: Commit**

```bash
git add scripts/add-ogh-cm-items.mjs src/assets/demo/data/item.json
git commit -m "feat: add 18 Temporal Jewel enchants from OGH Challenge Mode"
```

---

### Task 6: Build verification and smoke test

**Step 1: Run build**

Run: `npm run build`
Expected: Successful build with no errors.

**Step 2: Start dev server and smoke test**

Run: `npm start`
Then use playwright-cli to:
1. Open http://localhost:4200
2. Select Rune Knight class
3. Search for "Temporal Circlet" in headgear slot — verify it appears
4. Equip it, set refine to +11 — verify Dragon Breath bonus shows
5. Search for "Guardian Knight Claymore" in weapon slot — verify it appears
6. Search for "Mutated White Knight" in weapon card slot — verify it appears

**Step 3: Verify enchant dropdown works**

1. With Temporal Circlet equipped, check enchant slot dropdown
2. Verify Temporal Jewel STR/AGI/VIT/INT/DEX/LUK options appear

**Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address OGH Challenge Mode item issues found during testing"
```

---

### Task 7: Push to fork

**Step 1: Push**

Run: `git push myfork main`
Expected: Successful push, GitHub Actions deploy triggered.
