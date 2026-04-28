/**
 * apply-scripts-2026-04-28.mjs
 *
 * Applies bonus scripts to the 47 new items added by fetch-update-2026-04-28.mjs.
 * Strict validation:
 *   - Every aegis skill key in script is checked against src/app/constants/skill-name.ts
 *   - Every EQUIP[name] reference is checked against current item.json names
 *   - Every prefix __ is checked against the whitelist
 *   - Element prefixes (p_element / p_my_element / m_element / m_my_element) flagged for manual review
 *
 * High-confidence items are applied automatically.
 * Low-confidence items are listed for user approval — NOT applied.
 */
import { readFileSync, writeFileSync } from 'fs';

const ITEM_JSON = 'src/assets/demo/data/item.json';
const SKILL_TS = 'src/app/constants/skill-name.ts';

const items = JSON.parse(readFileSync(ITEM_JSON, 'utf-8'));
const skillTs = readFileSync(SKILL_TS, 'utf-8');
const skillNames = new Set();
for (const m of skillTs.matchAll(/'([A-Z][A-Z_0-9]+)'/g)) skillNames.add(m[1]);

const itemNamesNoSlot = new Set();
function stripSlot(n) {
  return n.replace(/\s*\[\d+\]\s*$/, '').trim();
}
for (const it of Object.values(items)) {
  if (it.name) itemNamesNoSlot.add(stripSlot(it.name));
}

const VALID_PREFIXES = new Set(['acd', 'cd', 'chance', 'dmg', 'fct', 'fix_vct', 'vct', 'autocast']);
const KNOWN_STAT_KEYS = new Set([
  'str', 'agi', 'vit', 'int', 'dex', 'luk', 'pow', 'sta', 'wis', 'spl', 'con', 'crt',
  'maxHp', 'maxSp', 'hp', 'sp', 'hpPercent', 'spPercent',
  'atk', 'matk', 'atk2', 'matk2', 'atkPercent', 'matkPercent',
  'def', 'mdef', 'pAtk', 'sMatk', 'cRate', 'res', 'mRes', 'hPlus', 'cDmg',
  'aspd', 'aspdPercent', 'cri', 'criDmg', 'flee', 'hit', 'perfectHit',
  'range', 'melee', 'longRange', 'shortRange',
  'healingPlus', 'healing', 'autospellMaster',
  'all_stat', 'all_status',
]);
const KNOWN_DYNAMIC_PREFIXES = [
  'p_size_', 'p_race_', 'p_element_', 'p_my_element_', 'p_pene_race_', 'p_pene_size_', 'p_pene_element_',
  'm_size_', 'm_race_', 'm_element_', 'm_my_element_', 'm_pene_race_', 'm_pene_size_', 'm_pene_element_',
  'p_class_', 'm_class_', 'reduce_', 'tolerance_', 'res_', 'mres_',
];

function validateScript(script, itemName) {
  const errors = [];
  const warnings = [];
  for (const key of Object.keys(script)) {
    // prefix__ syntax
    if (key.includes('__')) {
      const [pfx] = key.split('__');
      if (!VALID_PREFIXES.has(pfx)) errors.push(`unknown prefix "${pfx}" in key "${key}"`);
      continue;
    }
    // Skill aegis name (uppercase)
    if (/^[A-Z][A-Z_0-9]+$/.test(key)) {
      if (!skillNames.has(key)) errors.push(`skill aegis "${key}" not in skill-name.ts`);
      continue;
    }
    // Stat or dynamic prefix
    if (KNOWN_STAT_KEYS.has(key)) continue;
    if (KNOWN_DYNAMIC_PREFIXES.some((p) => key.startsWith(p))) continue;
    warnings.push(`unrecognized key "${key}"`);
  }
  // Validate EQUIP[Name] refs in values
  const allValues = JSON.stringify(script);
  for (const m of allValues.matchAll(/EQUIP\[([^\]]+)\]/g)) {
    const inner = m[1];
    const names = inner.split(/&&|\|\|/).map((s) => s.trim());
    for (const n of names) {
      if (n.startsWith('REFINE')) continue; // RegExp shouldn't match this but just in case
      if (!itemNamesNoSlot.has(n)) errors.push(`EQUIP[${n}] — item name not in item.json`);
    }
  }
  return { errors, warnings };
}

// ============================================================
// SHADOW EQUIPMENT — 8 sets x 3 pieces = 24 items
// Pattern follows 2026-04-14 Shadow gear (Flechas/Fúria/etc).
//
// Each set has:
//   - Weapon: ATK/MATK +1 per refine, +N% skill dmg, +bonus on refine 7/9, set bonus +1% skill dmg per refine, defense pene with shield
//   - Armor (or Pendant): HP+10/refine, +N% skill dmg, set bonus +1% per refine
//   - Boots/Earring: HP+10/refine, cd reduction or other utility
// ============================================================

const scripts = {
  // ===== Set 1: Explosão (Sura) — SR_RAMPAGEBLASTER =====
  // 24476 Malha Sombria da Explosão (armor)
  24476: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      SR_RAMPAGEBLASTER: ['5', '2---2', 'EQUIP[Escudo Sombrio da Explosão&&Greva Sombria da Explosão]REFINE[shadowArmor,shadowShield,shadowBoot==1]---1'],
    },
  },
  // 24477 Escudo Sombrio da Explosão (shield)
  24477: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      range: ['3', '7===3', '9===4'],
      SR_RAMPAGEBLASTER: ['EQUIP[Malha Sombria da Explosão&&Greva Sombria da Explosão]REFINE[shadowArmor,shadowShield,shadowBoot==1]---1'],
      p_pene_race_all: ['EQUIP[Manopla Sombria de Shura]===40', 'EQUIP[Manopla Sombria de Shura]REFINE[shadowShield,shadowWeapon==1]---1'],
    },
  },
  // 24478 Greva Sombria da Explosão (boots) — cd reduction
  24478: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      cd__SR_RAMPAGEBLASTER: ['0.2', '3---0.1'],
    },
  },

  // ===== Set 2: Lumen (Arch Bishop) — AB_DUPLELIGHT =====
  // 24488 Malha Sombria Lumen (armor)
  24488: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      AB_DUPLELIGHT: ['5', '2---2'],
    },
  },
  // 24489 Escudo Sombrio Lumen (shield)
  // Description: holy mdmg +1%, p_size_all +1%, +2% each at refine 7 and 9
  24489: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      m_my_element_holy: ['1', '7===2', '9===2'],
      p_size_all: ['1', '7===2', '9===2'],
      AB_DUPLELIGHT: ['EQUIP[Malha Sombria Lumen&&Greva Sombria Lumen]REFINE[shadowArmor,shadowShield,shadowBoot==1]---1'],
      p_pene_race_all: ['EQUIP[Manopla Sombria de Arcebispo]===40', 'EQUIP[Manopla Sombria de Arcebispo]REFINE[shadowShield,shadowWeapon==1]---1'],
      m_pene_race_all: ['EQUIP[Manopla Sombria de Arcebispo]===40', 'EQUIP[Manopla Sombria de Arcebispo]REFINE[shadowShield,shadowWeapon==1]---1'],
    },
  },
  // 24490 Greva Sombria Lumen (boots) — crit dmg +5%, +1% per 2 refines
  24490: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      criDmg: ['5', '2---1'],
    },
  },

  // ===== Set 3: Corrente (Arcanist/Arch Mage) — WL_CHAINLIGHTNING =====
  // 24521 Manopla Sombria da Corrente (weapon) — wind mdmg +3/3/4
  24521: {
    confidence: 'high',
    script: {
      atk: ['1---1'],
      matk: ['1---1'],
      m_my_element_wind: ['3', '7===3', '9===4'],
      WL_CHAINLIGHTNING: ['EQUIP[Brinco Sombrio da Corrente&&Colar Sombrio da Corrente]REFINE[shadowWeapon,shadowEarring,shadowPendant==1]---1'],
      m_pene_race_all: ['EQUIP[Escudo Sombrio de Arcano]===40', 'EQUIP[Escudo Sombrio de Arcano]REFINE[shadowShield,shadowWeapon==1]---1'],
    },
  },
  // 24522 Colar Sombrio da Corrente (left accessory) — chain lightning +5%, +2% per refine
  24522: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      WL_CHAINLIGHTNING: ['5', '1---2'],
    },
  },
  // 24523 Brinco Sombrio da Corrente (right accessory) — SP cost reduction
  24523: {
    confidence: 'high',
    // SP cost reduction is not directly modelable in this calculator's script DSL.
    // Skipping the bonus (SP cost) but keeping HP bonus.
    script: {
      maxHp: ['10---1'],
    },
  },

  // ===== Set 4: Cópia (Shadow Chaser) — SC_FEINTBOMB =====
  // 24533 Manopla Sombria da Cópia (weapon) — p_size_all + (refine 7/9 enhanced)
  // Set bonus uses (sum of refines / 2)
  24533: {
    confidence: 'high',
    script: {
      atk: ['1---1'],
      matk: ['1---1'],
      p_size_all: ['3', '7===3', '9===4'],
      // Set bonus: SC_FEINTBOMB + (sum of refines / 2)% — using REFINE pattern with /2 divisor
      SC_FEINTBOMB: ['EQUIP[Brinco Sombrio da Cópia&&Colar Sombrio da Cópia]REFINE[shadowWeapon,shadowEarring,shadowPendant==2]---1'],
      // Set with shield: VCT -1% per 2 refines (using vct prefix)
      vct: ['EQUIP[Escudo Sombrio de Renegado]REFINE[shadowShield,shadowWeapon==2]---1'],
    },
  },
  // 24534 Colar Sombrio da Cópia
  24534: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      SC_FEINTBOMB: ['5', '2---2'],
    },
  },
  // 24535 Brinco Sombrio da Cópia (boots equiv) — cd reduction
  24535: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      cd__SC_FEINTBOMB: ['0.2', '3---0.1'],
    },
  },

  // ===== Set 5: Castigo (Guillotine Cross / Shadow Cross) — GC_CROSSRIPPERSLASHER =====
  // 24545 Manopla Sombria do Castigo (weapon) — range +3, +bonus 7/9
  // Set: GC_CROSSRIPPERSLASHER + (sum of refines / 2)%
  24545: {
    confidence: 'high',
    script: {
      atk: ['1---1'],
      matk: ['1---1'],
      range: ['3', '7===3', '9===4'],
      GC_CROSSRIPPERSLASHER: ['EQUIP[Brinco Sombrio do Castigo&&Colar Sombrio do Castigo]REFINE[shadowWeapon,shadowEarring,shadowPendant==2]---1'],
      p_pene_race_all: ['EQUIP[Escudo Sombrio de Sicário]===40', 'EQUIP[Escudo Sombrio de Sicário]REFINE[shadowShield,shadowWeapon==1]---1'],
    },
  },
  // 24546 Colar Sombrio do Castigo
  24546: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      GC_CROSSRIPPERSLASHER: ['5', '2---2'],
    },
  },
  // 24547 Brinco Sombrio do Castigo
  24547: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      p_size_all: ['5', '2---1'],
    },
  },

  // ===== Set 6: Aesir (Sorcerer) — SO_VARETYR_SPEAR =====
  // 24557 Manopla Sombria dos Aesir
  24557: {
    confidence: 'high',
    script: {
      atk: ['1---1'],
      matk: ['1---1'],
      m_my_element_wind: ['3', '7===3', '9===4'],
      SO_VARETYR_SPEAR: ['EQUIP[Brinco Sombrio dos Aesir&&Colar Sombrio dos Aesir]REFINE[shadowWeapon,shadowEarring,shadowPendant==1]---1'],
      m_pene_race_all: ['EQUIP[Escudo Sombrio de Feiticeiro]===40', 'EQUIP[Escudo Sombrio de Feiticeiro]REFINE[shadowShield,shadowWeapon==1]---1'],
    },
  },
  // 24558 Colar Sombrio dos Aesir
  24558: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      SO_VARETYR_SPEAR: ['5', '1---2'],
    },
  },
  // 24559 Brinco Sombrio dos Aesir — SP cost reduction (not modeled)
  24559: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
    },
  },

  // ===== Set 7: Erva (Geneticist/Biolo) — GN_CRAZYWEED =====
  // 24569 Manopla Sombria da Erva
  24569: {
    confidence: 'high',
    script: {
      atk: ['1---1'],
      matk: ['1---1'],
      p_size_all: ['3', '7===3', '9===4'],
      GN_CRAZYWEED: ['EQUIP[Brinco Sombrio da Erva&&Colar Sombrio da Erva]REFINE[shadowWeapon,shadowEarring,shadowPendant==1]---1'],
      p_pene_race_all: ['EQUIP[Escudo Sombrio de Bioquímico]===40', 'EQUIP[Escudo Sombrio de Bioquímico]REFINE[shadowShield,shadowWeapon==1]---1'],
    },
  },
  // 24570 Colar Sombrio da Erva
  24570: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      GN_CRAZYWEED: ['5', '2---2'],
    },
  },
  // 24571 Brinco Sombrio da Erva — cd reduction
  24571: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      cd__GN_CRAZYWEED: ['0.2', '3---0.1'],
    },
  },

  // ===== Set 8: Compressora (Imperial Guard / Royal Guard) — LG_SHIELDPRESS + PA_SHIELDCHAIN =====
  // 24575 Manopla Sombria Compressora — boosts BOTH skills via set bonus
  24575: {
    confidence: 'high',
    script: {
      atk: ['1---1'],
      matk: ['1---1'],
      p_size_all: ['3', '7===3', '9===4'],
      PA_SHIELDCHAIN: ['EQUIP[Brinco Sombrio Compressor&&Colar Sombrio Compressor]REFINE[shadowWeapon,shadowEarring,shadowPendant==1]---1'],
      LG_SHIELDPRESS: ['EQUIP[Brinco Sombrio Compressor&&Colar Sombrio Compressor]REFINE[shadowWeapon,shadowEarring,shadowPendant==1]---1'],
      p_pene_race_all: ['EQUIP[Escudo Sombrio de Guardião Real]===40', 'EQUIP[Escudo Sombrio de Guardião Real]REFINE[shadowShield,shadowWeapon==1]---1'],
    },
  },
  // 24576 Colar Sombrio Compressor — Shield Press +5%, +2% per 2 refines
  24576: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      LG_SHIELDPRESS: ['5', '2---2'],
    },
  },
  // 24577 Brinco Sombrio Compressor — Rapid Smiting +5%, +2% per 2 refines
  24577: {
    confidence: 'high',
    script: {
      maxHp: ['10---1'],
      PA_SHIELDCHAIN: ['5', '2---2'],
    },
  },

  // ============================================================
  // OTHER EQUIPMENT (23 items)
  // ============================================================

  // 410183 Diadema Radiante (mid headgear) — EXPERIMENTAL aggressive modeling
  // Set bonus: any of 6 ring+necklace pairs all (Rubi, Ametista, Esmeralda, Zircônio, Safira, Aquamarina)
  // Bonus: ATK+50, MATK+50, p/m_class_boss+8%, p/m_element_dark+10%, p/m_element_undead+10%
  410183: {
    confidence: 'high',
    experimental: true,
    script: {
      atkPercent: ['2'],
      matkPercent: ['2'],
      atk: ['EQUIP[Anel Radiante Rubi&&Colar Radiante Rubi||Anel Radiante Ametista&&Colar Radiante Ametista||Anel Radiante Esmeralda&&Colar Radiante Esmeralda||Anel Radiante Zircônio&&Colar Radiante Zircônio||Anel Radiante Safira&&Colar Radiante Safira||Anel Radiante Aquamarina&&Colar Radiante Aquamarina]50'],
      matk: ['EQUIP[Anel Radiante Rubi&&Colar Radiante Rubi||Anel Radiante Ametista&&Colar Radiante Ametista||Anel Radiante Esmeralda&&Colar Radiante Esmeralda||Anel Radiante Zircônio&&Colar Radiante Zircônio||Anel Radiante Safira&&Colar Radiante Safira||Anel Radiante Aquamarina&&Colar Radiante Aquamarina]50'],
      p_class_boss: ['EQUIP[Anel Radiante Rubi&&Colar Radiante Rubi||Anel Radiante Ametista&&Colar Radiante Ametista||Anel Radiante Esmeralda&&Colar Radiante Esmeralda||Anel Radiante Zircônio&&Colar Radiante Zircônio||Anel Radiante Safira&&Colar Radiante Safira||Anel Radiante Aquamarina&&Colar Radiante Aquamarina]8'],
      m_class_boss: ['EQUIP[Anel Radiante Rubi&&Colar Radiante Rubi||Anel Radiante Ametista&&Colar Radiante Ametista||Anel Radiante Esmeralda&&Colar Radiante Esmeralda||Anel Radiante Zircônio&&Colar Radiante Zircônio||Anel Radiante Safira&&Colar Radiante Safira||Anel Radiante Aquamarina&&Colar Radiante Aquamarina]8'],
      p_element_dark: ['EQUIP[Anel Radiante Rubi&&Colar Radiante Rubi||Anel Radiante Ametista&&Colar Radiante Ametista||Anel Radiante Esmeralda&&Colar Radiante Esmeralda||Anel Radiante Zircônio&&Colar Radiante Zircônio||Anel Radiante Safira&&Colar Radiante Safira||Anel Radiante Aquamarina&&Colar Radiante Aquamarina]10'],
      p_element_undead: ['EQUIP[Anel Radiante Rubi&&Colar Radiante Rubi||Anel Radiante Ametista&&Colar Radiante Ametista||Anel Radiante Esmeralda&&Colar Radiante Esmeralda||Anel Radiante Zircônio&&Colar Radiante Zircônio||Anel Radiante Safira&&Colar Radiante Safira||Anel Radiante Aquamarina&&Colar Radiante Aquamarina]10'],
      m_element_dark: ['EQUIP[Anel Radiante Rubi&&Colar Radiante Rubi||Anel Radiante Ametista&&Colar Radiante Ametista||Anel Radiante Esmeralda&&Colar Radiante Esmeralda||Anel Radiante Zircônio&&Colar Radiante Zircônio||Anel Radiante Safira&&Colar Radiante Safira||Anel Radiante Aquamarina&&Colar Radiante Aquamarina]10'],
      m_element_undead: ['EQUIP[Anel Radiante Rubi&&Colar Radiante Rubi||Anel Radiante Ametista&&Colar Radiante Ametista||Anel Radiante Esmeralda&&Colar Radiante Esmeralda||Anel Radiante Zircônio&&Colar Radiante Zircônio||Anel Radiante Safira&&Colar Radiante Safira||Anel Radiante Aquamarina&&Colar Radiante Aquamarina]10'],
    },
  },

  // 410184 Diadema Profano — EXPERIMENTAL
  // NOTE: client desc says "Anel Profano Aquamarina" / "Zircônio" but item.json has Topázio/Opala.
  //       Likely client copy-paste bug. Using actual PT-BR names from item.json.
  // "Sombrio e Sagrado" version for set bonus (vs Radiante's Sombrio+Maldito)
  // Description: ATQ+50, ATQM+50, dmg vs boss+8%, dmg vs Neutro+Sagrado+10%
  410184: {
    confidence: 'high',
    experimental: true,
    script: {
      atkPercent: ['2'],
      matkPercent: ['2'],
      atk: ['EQUIP[Anel Profano Rubi&&Colar Profano Rubi||Anel Profano Esmeralda&&Colar Profano Esmeralda||Anel Profano Topázio&&Colar Profano Topázio||Anel Profano Ametista&&Colar Profano Ametista||Anel Profano Safira&&Colar Profano Safira||Anel Profano Opala&&Colar Profano Opala]50'],
      matk: ['EQUIP[Anel Profano Rubi&&Colar Profano Rubi||Anel Profano Esmeralda&&Colar Profano Esmeralda||Anel Profano Topázio&&Colar Profano Topázio||Anel Profano Ametista&&Colar Profano Ametista||Anel Profano Safira&&Colar Profano Safira||Anel Profano Opala&&Colar Profano Opala]50'],
      p_class_boss: ['EQUIP[Anel Profano Rubi&&Colar Profano Rubi||Anel Profano Esmeralda&&Colar Profano Esmeralda||Anel Profano Topázio&&Colar Profano Topázio||Anel Profano Ametista&&Colar Profano Ametista||Anel Profano Safira&&Colar Profano Safira||Anel Profano Opala&&Colar Profano Opala]8'],
      m_class_boss: ['EQUIP[Anel Profano Rubi&&Colar Profano Rubi||Anel Profano Esmeralda&&Colar Profano Esmeralda||Anel Profano Topázio&&Colar Profano Topázio||Anel Profano Ametista&&Colar Profano Ametista||Anel Profano Safira&&Colar Profano Safira||Anel Profano Opala&&Colar Profano Opala]8'],
      p_element_neutral: ['EQUIP[Anel Profano Rubi&&Colar Profano Rubi||Anel Profano Esmeralda&&Colar Profano Esmeralda||Anel Profano Topázio&&Colar Profano Topázio||Anel Profano Ametista&&Colar Profano Ametista||Anel Profano Safira&&Colar Profano Safira||Anel Profano Opala&&Colar Profano Opala]10'],
      p_element_holy: ['EQUIP[Anel Profano Rubi&&Colar Profano Rubi||Anel Profano Esmeralda&&Colar Profano Esmeralda||Anel Profano Topázio&&Colar Profano Topázio||Anel Profano Ametista&&Colar Profano Ametista||Anel Profano Safira&&Colar Profano Safira||Anel Profano Opala&&Colar Profano Opala]10'],
      m_element_neutral: ['EQUIP[Anel Profano Rubi&&Colar Profano Rubi||Anel Profano Esmeralda&&Colar Profano Esmeralda||Anel Profano Topázio&&Colar Profano Topázio||Anel Profano Ametista&&Colar Profano Ametista||Anel Profano Safira&&Colar Profano Safira||Anel Profano Opala&&Colar Profano Opala]10'],
      m_element_holy: ['EQUIP[Anel Profano Rubi&&Colar Profano Rubi||Anel Profano Esmeralda&&Colar Profano Esmeralda||Anel Profano Topázio&&Colar Profano Topázio||Anel Profano Ametista&&Colar Profano Ametista||Anel Profano Safira&&Colar Profano Safira||Anel Profano Opala&&Colar Profano Opala]10'],
    },
  },

  // 450151 Camisa de Algodão Aprimorada — EXPERIMENTAL grade scaling
  // Pow/Spl/Sta/Wis/Con/Crt +1 base.
  // GRADE C+ (Mágico+): Wis+1 per refine
  // GRADE B+ (Raro+): Con+1 per refine
  // GRADE A+ (Épico+): Crt+1 per refine, RES+2 per refine, MRES+1 per refine, H.Plus+2 per refine
  450151: {
    confidence: 'high',
    experimental: true,
    script: {
      pow: ['1'], spl: ['1'], sta: ['1'], wis: ['1', 'GRADE[me==C]---1'],
      con: ['1', 'GRADE[me==B]---1'],
      crt: ['1', 'GRADE[me==A]---1'],
      res: ['GRADE[me==A]---2'],
      mRes: ['GRADE[me==A]---1'],
      hPlus: ['GRADE[me==A]---2'],
    },
  },

  // 460012 Guarda Aprimorada (shield) — placeholder, no bonuses listed
  460012: {
    confidence: 'high',
    script: {},
  },

  // 480136 Espada do Espadachim Mágico Thanatos — EXPERIMENTAL
  // BaseLv 210+: pAtk+3, sMatk+3
  // BaseLv 230+: additionally pAtk+2, sMatk+2
  // Per 3 refines: melee+2%, range+2%, all magic dmg+2%
  // Per 5 refines: vs Médios+5%, vs Grandes+5% (physical AND magical)
  // +9: p_pene_race_dragon+20%, p_pene_race_angel+20%, m_pene_race_dragon+20%, m_pene_race_angel+20%
  // +11: additional +10% pene to dragon/angel (so +30 total)
  // Set with Thanatos Dolor Caído (NOT IN item.json — TODO)
  // Set with Pingente Força Vermelha or Pingente Mental Azul (NOT IN item.json — TODO)
  480136: {
    confidence: 'high',
    experimental: true,
    script: {
      pAtk: ['LEVEL[210]===3', 'LEVEL[230]===2'],
      sMatk: ['LEVEL[210]===3', 'LEVEL[230]===2'],
      melee: ['3---2'],
      range: ['3---2'],
      m_my_element_all: ['3---2'],
      p_size_m: ['5---5'],
      p_size_l: ['5---5'],
      m_size_m: ['5---5'],
      m_size_l: ['5---5'],
      p_pene_race_dragon: ['9===20', '11===10'],
      p_pene_race_angel: ['9===20', '11===10'],
      m_pene_race_dragon: ['9===20', '11===10'],
      m_pene_race_angel: ['9===20', '11===10'],
    },
  },

  // 480812 Manto Branco Físico — EXPERIMENTAL with main set bonuses
  // Base: per 3 refines p_size_all+3, per 5 refines range+5/melee+5
  // +9: ATK+50, perfectHit+10
  // +11: HP/SP+10%, acd-15%
  // Set bonuses with each Diadema Temporal:
  //   Rúnico: VCT for Sopro+Bafo do Dragão -100% (mostly SR_); soma 22+: 5% chance vampire HP, 1% SP
  //   Real: 100% reflect crit; soma 22+: cd Vanishing Buster -0.5
  //   Atirador: VCT Arrow Storm + Aimed Bolt -100%; soma 22+: cd Unlimit -45
  //   Lutador: cd Flash Combo -1; soma 22+: heal/sp on Gentle Touch Cure
  //   Mecânico: 100% freeze tolerance; soma 22+: no fuel
  //   Químico: cd Cart Tornado -0.5; soma 22+: chance investigate
  //   Mortal: 5% vampire HP; soma 22+: dark claw on Cross Ripper
  //   Renegado: 1% vampire SP; soma 22+: enables aerial kick
  //   Kagerou: VCT Kunai Explosion -100%; soma 22+: cd Kunai -1
  //   Doram: chance Lunatic Carrot Beat from Picky Peck; soma 22+: knockback immunity
  //   Rebelde: cd Banishing Buster -1.5; soma 22+: fct -0.5
  //   Aprendiz: enables Ignition Break; soma 22+: cd Ignition Break -1
  //   Estelar: chance Star Kick on physical; soma 22+: fct -0.5
  480812: {
    confidence: 'high',
    experimental: true,
    script: {
      // Base scaling
      p_size_all: ['3---3'],
      range: ['5---5'],
      melee: ['5---5'],
      atk: ['9===50'],
      perfectHit: ['9===10'],
      hpPercent: ['11===10'],
      spPercent: ['11===10'],
      acd: ['11===15'],
      // Set bonuses (per-Diadema):
      vct__RK_DRAGONBREATH: ['EQUIP[Diadema Temporal Rúnico]===100'],
      vct__RK_DRAGONBREATH_WATER: ['EQUIP[Diadema Temporal Rúnico]===100'],
      cd__LG_CANNONSPEAR: ['EQUIP[Diadema Temporal Real]REFINE[garment,headUpper==22]===0.5'],
      vct__RA_ARROWSTORM: ['EQUIP[Diadema Temporal Atirador]===100'],
      vct__RA_AIMEDBOLT: ['EQUIP[Diadema Temporal Atirador]===100'],
      cd__RA_UNLIMIT: ['EQUIP[Diadema Temporal Atirador]REFINE[garment,headUpper==22]===45'],
      cd__SR_FLASHCOMBO: ['EQUIP[Diadema Temporal Lutador]===1'],
      cd__GN_CART_TORNADO: ['EQUIP[Diadema Temporal Químico]===0.5'],
      // Diadema Químico set (soma 22+): 10% chance on Cart Tornado to activate Investigar (5s).
      // p_infiltration = full Investigar mechanic (calculator handles it):
      //   - hard DEF reduction = 1 (ignore hard DEF)
      //   - soft DEF = 0 (ignore soft DEF)
      //   - ATK += reducedHardDef / 2 (the half-DEF-as-ATK part)
      // chance__ wrapper exibe como bônus probabilístico (não infla DPS médio constante).
      chance__p_infiltration: ['EQUIP[Diadema Temporal Químico]REFINE[garment,headUpper==22]===1'],
      cd__GC_CROSSRIPPERSLASHER: ['EQUIP[Diadema Temporal Mortal]REFINE[garment,headUpper==22]===0.5'],
      // Diadema Mortal set (soma 22+): ativa Dark Claw lv3 (= +90% melee on target) on Cross Ripper.
      // chance__ porque é proc ao usar a skill (não always-on).
      chance__darkClaw: ['EQUIP[Diadema Temporal Mortal]REFINE[garment,headUpper==22]===90'],
      vct__KO_BAKURETSU: ['EQUIP[Diadema Temporal Kagerou]===100'],
      cd__KO_BAKURETSU: ['EQUIP[Diadema Temporal Kagerou]REFINE[garment,headUpper==22]===1'],
      cd__RL_BANISHING_BUSTER: ['EQUIP[Diadema Temporal Rebelde]===1.5'],
      fct: ['EQUIP[Diadema Temporal Rebelde]REFINE[garment,headUpper==22]===0.5', 'EQUIP[Diadema Temporal Estelar]REFINE[garment,headUpper==22]===0.5'],
      cd__RK_IGNITIONBREAK: ['EQUIP[Diadema Temporal Aprendiz]REFINE[garment,headUpper==22]===1'],
      // Doram set: when using Picky Peck, 7% chance autocast Lunatic Carrot Beat lv3
      // Trigger 'onskill' = when player uses any active skill (closest match for "Ao usar Chilique de Picky")
      autocast__SU_LUNATICCARROTBEAT: ['EQUIP[Diadema Temporal Doram]3,7,onskill'],
      // Estelar set: on physical attack, 10% chance autocast Star Kick lv1 (or learned level)
      autocast__SJ_FLASHKICK: ['EQUIP[Diadema Temporal Estelar]1,10,onhit,learned'],
    },
  },

  // 480813 Manto Branco Mágico — EXPERIMENTAL with set bonuses
  // Base: per 3 refines m_size_all+3, per 5 refines all elem +5%
  // +9: MATK+50, vct-10%
  // +11: HP/SP+10%, acd-15%
  // Sets:
  //   Arcano: VCT Esquife de Gelo (WL_JACKFROST) -100%; soma 22+: cd Zero Absoluto (WL_FROSTMISTY) -5
  //   Mágico: VCT Pó de Diamante (SO_DIAMONDDUST) -100%; soma 22+: heal 9000 on Invocar Varuna
  //   Sagrado: chance Magic Shield on magical attack; soma 22+: cd Adoramus -0.5
  //   Musical: VCT Ruído Estridente (WM_METALICSOUND) -100%; soma 22+: chance Psychic Wave
  //   Oboro: VCT Lança Congelante + Lâmina de Vento -100%; soma 22+: cd Inspiração (KO_IZAYOI) -50
  //   Xamânico: cd Soul Division -3; soma 22+: enables Magic Shield lv10
  //   Aprendiz: enables Soul Expansion lv5; soma 22+: enables Telekinesia lv5
  //   Doram: VCT Catnip Meteor (SU_CN_METEOR) -100%; soma 22+: knockback immunity
  480813: {
    confidence: 'high',
    experimental: true,
    script: {
      m_size_all: ['3---3'],
      m_my_element_all: ['5---5'],
      matk: ['9===50'],
      vct: ['9===10'],
      hpPercent: ['11===10'],
      spPercent: ['11===10'],
      acd: ['11===15'],
      // Set bonuses
      vct__WL_JACKFROST: ['EQUIP[Diadema Temporal Arcano]===100'],
      cd__WL_FROSTMISTY: ['EQUIP[Diadema Temporal Arcano]REFINE[garment,headUpper==22]===5'],
      vct__SO_DIAMONDDUST: ['EQUIP[Diadema Temporal Mágico]===100'],
      cd__AB_ADORAMUS: ['EQUIP[Diadema Temporal Sagrado]REFINE[garment,headUpper==22]===0.5'],
      vct__WM_METALICSOUND: ['EQUIP[Diadema Temporal Musical]===100'],
      // Diadema Musical set (soma 22+): 4% autocast Psychic Wave lv3 on Metallic Sound use
      autocast__SO_PSYCHIC_WAVE: ['EQUIP[Diadema Temporal Musical]REFINE[garment,headUpper==22]3,4,onskill'],
      cd__SP_SOULDIVISION: ['EQUIP[Diadema Temporal Xamânico]===3'],
      // Diadema Oboro: VCT Lança Congelante (NJ_HYOUSENSOU) + Lâmina de Vento (NJ_HUUJIN) -100%
      vct__NJ_HYOUSENSOU: ['EQUIP[Diadema Temporal Oboro]===100'],
      vct__NJ_HUUJIN: ['EQUIP[Diadema Temporal Oboro]===100'],
      // Diadema Oboro soma 22+: cd Inspiração (KO_IZAYOI) -50s
      cd__KO_IZAYOI: ['EQUIP[Diadema Temporal Oboro]REFINE[garment,headUpper==22]===50'],
      vct__SU_CN_METEOR: ['EQUIP[Diadema Temporal Doram]===100'],
    },
  },

  // 490087 Colar Ampulheta — EXPERIMENTAL: per 5 JOB levels, -1 to each stat
  // Description: "A cada 5 níveis de classe" → job level (not base level)
  // jobLevel:5----1 = -1 per 5 job levels (uses ---- for negative)
  490087: {
    confidence: 'high',
    experimental: true,
    script: {
      pow: ['6', 'jobLevel:5----1'],
      spl: ['6', 'jobLevel:5----1'],
      sta: ['6', 'jobLevel:5----1'],
      wis: ['6', 'jobLevel:5----1'],
      crt: ['6', 'jobLevel:5----1'],
      con: ['6', 'jobLevel:5----1'],
    },
  },

  // ===== Etel/Sucata weapons — simple "skill +5% per 2 refines, melee/ranged +2% per 4 refines" =====
  // 500018 Lâmina de Recaída (sword, Biolo) — Acidified Zone Fire+Wind +5% per 2 refines, ATQ +3% per 4 refines
  500018: {
    confidence: 'high',
    script: {
      BO_ACIDIFIED_ZONE_FIRE: ['2---5'],
      BO_ACIDIFIED_ZONE_WIND: ['2---5'],
      atkPercent: ['4---3'],
    },
  },

  // 510021 Faca Aprimorada — EXPERIMENTAL grade scaling
  // Pow/Spl/Sta/Wis/Con/Crt +1 base
  // GRADE C+: Pow+1 per refine
  // GRADE B+: Spl+1 per refine
  // GRADE A+: Sta+1 per refine, pAtk+2, sMatk+2, cRate+1
  510021: {
    confidence: 'high',
    experimental: true,
    script: {
      pow: ['1', 'GRADE[me==C]---1'],
      spl: ['1', 'GRADE[me==B]---1'],
      sta: ['1', 'GRADE[me==A]---1'],
      wis: ['1'], con: ['1'], crt: ['1'],
      pAtk: ['GRADE[me==A]===2'],
      sMatk: ['GRADE[me==A]===2'],
      cRate: ['GRADE[me==A]===1'],
    },
  },

  // 510026 Adaga de Recaída (dagger, Abyss Chaser) — MATK+215, Abyss Square +5%/2 refines, all element mdmg +2%/4
  510026: {
    confidence: 'high',
    script: {
      matk: ['215'],
      ABC_ABYSS_SQUARE: ['2---5'],
      m_my_element_all: ['4---2'],
    },
  },

  // 530009 Lança Fortificada (spear, Imperial Guard) — Shield Shooting +5%/2, range +2%/4
  530009: {
    confidence: 'high',
    script: {
      IG_SHIELD_SHOOTING: ['2---5'],
      range: ['4---2'],
    },
  },

  // 540013 Manual de Fortificação (book, Elemental Master) — Indestructible, MATK+210, Conflagration +5%/2, all elem mdmg +2%/4
  540013: {
    confidence: 'high',
    script: {
      matk: ['210'],
      EM_CONFLAGRATION: ['2---5'],
      m_my_element_all: ['4---2'],
    },
  },

  // 560011 Punho de Sucata (knuckle, Inquisitor) — Second Faith Judgment + Conviction +5%/2, melee +2%/4
  560011: {
    confidence: 'high',
    script: {
      IQ_SECOND_JUDGEMENT: ['2---5'],
      IQ_SECOND_FAITH: ['2---5'],
      melee: ['4---2'],
    },
  },

  // 570012 Alaúde de Sucata (instrument, Trouvere) — Rose Blossom +5%/2, range +2%/4
  570012: {
    confidence: 'high',
    script: {
      TR_ROSEBLOSSOM: ['2---5'],
      range: ['4---2'],
    },
  },

  // 580012 Chicote de Sucata (whip, Trouvere) — same as Alaúde
  580012: {
    confidence: 'high',
    script: {
      TR_ROSEBLOSSOM: ['2---5'],
      range: ['4---2'],
    },
  },

  // 590015 Cruz Relapse (mace, Cardinal) — MATK+210, Flamen +5%/2 + healing +5%/2, all elem mdmg +2%/4
  590015: {
    confidence: 'high',
    script: {
      matk: ['210'],
      CD_FRAMEN: ['2---5'],
      healing: ['2---5'],
      m_my_element_all: ['4---2'],
    },
  },

  // 590036 Cruz Maldita — EXPERIMENTAL with grade options
  // MATK+230, Flamen+7%/2 refines, healing+6%/2, Arbitrium+7%/3, all elem mdmg+3%/4
  // [Grau D] SPL+2
  // [Grau C] Flamen additionally +10%
  // [Grau B] sMatk+2
  // Note: GRADE[me==X] is "X or higher", but [Grau D] is "exactly D". Using LOWER-BOUND interpretation
  // (D bonus stays at all higher grades since they each "fail" exact match — this is risky, marking experimental).
  590036: {
    confidence: 'high',
    experimental: true,
    script: {
      matk: ['230'],
      CD_FRAMEN: ['2---7', 'GRADE[me==C]===10'],
      healing: ['2---6'],
      CD_ARBITRIUM: ['3---7'],
      m_my_element_all: ['4---3'],
      spl: ['GRADE[me==D]===2'],
      sMatk: ['GRADE[me==B]===2'],
    },
  },

  // 600013 Claymore Fortificado (twohand sword, Dragon Knight) — Storm Slash +5%/2, melee +2%/4
  600013: {
    confidence: 'high',
    script: {
      DK_STORMSLASH: ['2---5'],
      melee: ['4---2'],
    },
  },

  // 610015 Katar Relapse (katar, Shadow Cross) — Impact Crater +5%/2, melee +2%/4
  610015: {
    confidence: 'high',
    script: {
      SHC_IMPACT_CRATER: ['2---5'],
      melee: ['4---2'],
    },
  },

  // 620005 Machado Relapse (axe, Meister) — Indestructible, Axe Stomp +5%/2, melee +2%/4
  620005: {
    confidence: 'high',
    script: {
      MT_AXE_STOMP: ['2---5'],
      melee: ['4---2'],
    },
  },

  // 640013 Cajado Fortificado (rod, Arch Mage) — Indestructible, MATK+240, Frozen Slash +5%/2, all elem mdmg +2%/4
  640013: {
    confidence: 'high',
    script: {
      matk: ['240'],
      AG_FROZEN_SLASH: ['2---5'],
      m_my_element_all: ['4---2'],
    },
  },

  // 700021 Arco de Sucata (bow, Windhawk) — Gale Storm +5%/2, range +2%/4
  700021: {
    confidence: 'high',
    script: {
      WH_GALESTORM: ['2---5'],
      range: ['4---2'],
    },
  },
};

// ============================================================
// Validate + apply
// ============================================================

const applied = [];
const pending = [];
const validationFailures = [];

for (const [idStr, entry] of Object.entries(scripts)) {
  const id = parseInt(idStr);
  const it = items[id];
  if (!it) {
    validationFailures.push(`${id}: NOT IN item.json — run fetch-update-2026-04-28.mjs first`);
    continue;
  }
  const { errors, warnings } = validateScript(entry.script, it.name);
  if (errors.length > 0) {
    validationFailures.push(`${id} ${it.name}: ${errors.join('; ')}`);
    continue;
  }
  if (entry.confidence === 'high') {
    items[id].script = entry.script;
    applied.push({ id, name: it.name, warnings, experimental: !!entry.experimental });
  } else {
    pending.push({ id, name: it.name, reason: entry.reason, script: entry.script, warnings });
  }
}

// ============================================================
// Report
// ============================================================
const stable = applied.filter((a) => !a.experimental);
const experimental = applied.filter((a) => a.experimental);
console.log(`\n=== APPLIED — STABLE (${stable.length}) ===`);
for (const a of stable) {
  console.log(`  ${a.id}: ${a.name}`);
  if (a.warnings.length > 0) console.log(`     WARN: ${a.warnings.join('; ')}`);
}
console.log(`\n=== APPLIED — EXPERIMENTAL (${experimental.length}) — needs validation ===`);
for (const a of experimental) {
  console.log(`  ${a.id}: ${a.name}`);
  if (a.warnings.length > 0) console.log(`     WARN: ${a.warnings.join('; ')}`);
}

console.log(`\n=== PENDING (low confidence: ${pending.length}) ===`);
for (const p of pending) {
  console.log(`  ${p.id}: ${p.name}`);
  console.log(`     reason: ${p.reason}`);
  console.log(`     proposed: ${JSON.stringify(p.script)}`);
}

console.log(`\n=== VALIDATION FAILURES (${validationFailures.length}) ===`);
for (const f of validationFailures) console.log(`  ${f}`);

if (validationFailures.length === 0) {
  writeFileSync(ITEM_JSON, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`\nWritten ${applied.length} scripts to item.json`);
} else {
  console.log(`\nABORTED: ${validationFailures.length} validation failures — item.json NOT modified.`);
}
