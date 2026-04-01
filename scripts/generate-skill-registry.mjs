#!/usr/bin/env node
/**
 * generate-skill-registry.mjs
 *
 * Generates src/app/constants/skill-registry-data.json by cross-referencing:
 * 1. skillinfolist_decompiled.lua (GRF) → aegisName → PT-BR
 * 2. skill_db_rathena.yml → aegisName → EN (Description)
 * 3. skill-name.ts → list of EN names used in calc
 * 4. skill-name-map.json → PT-BR → EN bridge
 *
 * Multi-pass matching with confidence levels for review.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Source paths ───────────────────────────────────────────────────
const GRF_LUA = 'C:/Users/Marcel/rag/snapshots/grf-extracted/skillinfolist_decompiled.lua';
const RATHENA_YAML = 'C:/Users/Marcel/rag/snapshots/grf-extracted/skill_db_rathena.yml';
const SKILL_NAME_TS = path.join(ROOT, 'src/app/constants/skill-name.ts');
const SKILL_NAME_MAP = path.join(ROOT, 'scripts/skill-name-map.json');
const OUTPUT = path.join(ROOT, 'src/app/constants/skill-registry-data.json');
const REVIEW_OUTPUT = path.join(ROOT, 'scripts/skill-registry-review.json');

// ─── Manual overrides: EN calc name → aegisName ─────────────────────
const MANUAL_OVERRIDES = {
  // ── Internal calc skills (prefixed with _) ──
  '_3Faith': '_CALC_3FAITH',
  '_Argutus Vita_Telum': '_CALC_ARGUTUS_VITA_TELUM',
  '_Biolo_Monster_List': '_CALC_BIOLO_MONSTER_LIST',
  '_ElementalMaster_spirit': '_CALC_ELEMENTALMASTER_SPIRIT',
  '_Sorcerer_Elemental_Spirit': '_CALC_SORCERER_ELEMENTAL_SPIRIT',
  '_Meister_ABR_List': '_CALC_MEISTER_ABR_LIST',
  '_Meister_Quake': '_CALC_MEISTER_QUAKE',
  '_Meister_Rush': '_CALC_MEISTER_RUSH',
  '_NightWatch_Aiming Count': '_CALC_NIGHTWATCH_AIMING_COUNT',
  '_Religio_Benedictum': '_CALC_RELIGIO_BENEDICTUM',
  '_Trouvere_Troubadour_ignore_res_mres': '_CALC_TROUVERE_TROUBADOUR_IGNORE_RES_MRES',
  '_Trouvere_Troubadour_pAtk_sMatk': '_CALC_TROUVERE_TROUBADOUR_PATK_SMATK',
  '_SoulAscetic_Blessing': '_CALC_SOULASCETIC_BLESSING',
  '_SkyEmperor_Rising_Sun': '_CALC_SKYEMPEROR_RISING_SUN',
  '_SkyEmperor_Rising_Moon': '_CALC_SKYEMPEROR_RISING_MOON',
  '_Debuf_Sonic_Brand': '_CALC_DEBUF_SONIC_BRAND',
  // Calc-internal stat/UI pseudo-skills
  'dmg__Lucifer Morocc': '_CALC_DMG_LUCIFER_MOROCC',
  'cri_race_demon': '_CALC_CRI_RACE_DEMON',
  'cri_race_dragon': '_CALC_CRI_RACE_DRAGON',
  'cri_race_fish': '_CALC_CRI_RACE_FISH',
  'cri_race_insect': '_CALC_CRI_RACE_INSECT',
  'cri_race_undead': '_CALC_CRI_RACE_UNDEAD',
  'Current HP': '_CALC_CURRENT_HP',
  'Current SP': '_CALC_CURRENT_SP',
  'Debuff_Spore Explosion': '_CALC_DEBUFF_SPORE_EXPLOSION',
  'Comet Amp': '_CALC_COMET_AMP',
  'Spin Count': '_CALC_SPIN_COUNT',                    // GX spin counter (calc UI)
  'Total Soul': '_CALC_TOTAL_SOUL',                    // Soul Reaper soul counter
  'Total Spirit': '_CALC_TOTAL_SPIRIT',                // Sura spirit sphere counter
  'Wrath of': '_CALC_WRATH_OF',                        // StarGladiator hatred target

  // ── Novice / 1st class ──
  'Auto Guard': 'CR_AUTOGUARD',
  'Auto Spell': 'SA_AUTOSPELL',
  'Hilt Binding': 'BS_HILTBINDING',
  'Iron Hand': 'MO_IRONHAND',
  'Power Maximize': 'BS_MAXIMIZE',
  'Power': 'TK_POWER',
  'Ride Peco': 'KN_RIDING',
  'Snake Eyes': 'GS_SNAKEEYE',
  'Snatcher': 'RG_SNATCHER',
  'Plagiarism': 'RG_PLAGIARISM',
  'Raid': 'RG_RAID',
  'Chain Combo': 'MO_CHAINCOMBO',
  'Combo Finish': 'MO_COMBOFINISH',
  'Finger Offensive': 'MO_FINGEROFFENSIVE',
  'Power Absorb': 'MO_ABSORBSPIRITS',
  'Musical Lesson': 'BA_MUSICALLESSON',
  'Musical Strike': 'BA_MUSICALSTRIKE',
  'Dancing Lesson': 'DC_DANCINGLESSON',
  'Charm': 'DC_WINKCHARM',
  'Learning Potion': 'AM_LEARNINGPOTION',
  'Potion Pitcher': 'AM_POTIONPITCHER',
  'Bio Cannibalize': 'AM_CANNIBALIZE',

  // ── 2nd class / Transcendent ──
  'Acid Bomb': 'CR_ACIDDEMONSTRATION',
  'Arrow Vulcan': 'CG_ARROWVULCAN',
  "Bragi's Poem": 'BA_POEMBRAGI',
  'Advanced Book': 'SA_ADVANCEDBOOK',
  'Frost Weapon': 'SA_FROSTWEAPON',
  'Seismic Weapon': 'SA_SEISMICWEAPON',
  'Lightning Loader': 'SA_LIGHTNINGLOADER',
  'Land Protector': 'SA_LANDPROTECTOR',
  'Fist Spell': 'SO_SPELLFIST',
  'Lucky Cast': 'SA_FREECAST',
  'Spear Dynamo': 'LK_CONCENTRATION',
  'Indulge': 'PF_HPCONVERSION',

  // ── 3rd class ──
  'Clementia': 'AB_CLEMENTIA',
  'Laudaagnus': 'AB_LAUDAAGNUS',
  'Genesis Ray': 'LG_RAYOFGENESIS',
  'Bomb Cluster': 'RA_CLUSTERBOMB',
  'Trap Research': 'RA_RESEARCHTRAP',
  'Wug Rider': 'RA_WUGRIDER',
  'New Poison Research': 'GC_RESEARCHNEWPOISON',
  'Poisonous Weapon': 'GC_POISONINGWEAPON',
  'Venom Impression': 'GC_VENOMIMPRESS',
  'Poison Burst': 'GC_POISONSMOKE',
  'Kiling Cloud': 'SO_CLOUD_KILL',
  'Killing Cloud': 'SO_CLOUD_KILL',
  'Cart Weight': 'GN_REMODELING_CART',
  'Madogear License': 'NC_MADOLICENCE',
  'On Magogear': 'NC_MADOLICENCE',           // same skill, different calc label
  'Fire Earth Research': 'NC_RESEARCHFE',
  'Nuckle Boost': 'NC_BOOSTKNUCKLE',
  'Wind Walk': 'SN_WINDWALK',
  'Rising Dragon': 'SR_RAISINGDRAGON',
  'Sky Blow': 'SR_SKYNETBLOW',
  'Rush To Windmill': 'MI_RUSH_WINDMILL',
  'Rampage Blast': 'SR_RAMPAGEBLASTER',
  'Lightning Ride': 'SR_RIDEINLIGHTNING',
  'Gentle Touch - Alive': 'SR_GENTLETOUCH_ENERGYGAIN',
  'Gentle Touch - Opposite': 'SR_GENTLETOUCH_CHANGE',
  'Shadow Formation': 'SC_SHADOWFORM',
  'Shadow Spell': 'SC_AUTOSHADOWSPELL',
  'Shadow Wound': 'SHC_CROSS_SLASH',          // ShadowCross passive, maps to Cross Slash aegis
  'Cross Wound': 'SHC_CROSS_SLASH',           // Kagerou/Oboro debuff, same aegis
  'Masquerade-Groomy': 'SC_GROOMY',
  'Urgent Escape': 'SC_ESCAPE',
  'Lesson': 'WM_LESSON',
  'Metalic Sound': 'WM_METALICSOUND',
  "Frigg's Song": 'WM_FRIGG_SONG',
  'WL_FROSTMISTY': 'WL_FROSTMISTY',
  'Frost Misty': 'WL_FROSTMISTY',
  'Freezing Spell': 'WL_FREEZE_SP',
  'Released': 'WL_RELEASE',
  'Rhapsody of Mineworker': 'TR_AIN_RHAPSODY',
  'Meditation': 'HP_MEDITATIO',
  'Lightening Bolt': 'MG_LIGHTNINGBOLT',
  'Infiltration': 'SS_SHIMIRU',

  // ── Rebellion / NightWatch ──
  'Platinum Altar': 'RL_P_ALTER',
  "God's Hammer": 'RL_HAMMER_OF_GOD',
  "Rich's Coin": 'RL_RICHS_COIN',
  'Hot Barrel': 'RL_HEAT_BARREL',
  'Wounding Shot': 'RL_QD_SHOT',              // Quick Draw Shot in rAthena — verify!
  'Grenade Dropping': 'NW_GRENADES_DROPPING',
  'Grenade Mastery': 'NW_GRENADE_MASTERY',
  'Grenade Fragment': 'NW_GRENADE_FRAGMENT',
  'Intensive Aim': 'NW_INTENSIVE_AIM',
  'No Limits': 'RA_UNLIMIT',
  'Full Blast': 'NW_AUTO_FIRING_LAUNCHER',    // Auto Firing Launcher in rAthena — verify!
  'Gunslinger Mine': 'RL_FLICKER',            // Flicker (mine detonator) — verify!
  'Switf Trap': 'WH_SWIFTTRAP',              // typo in calc

  // ── Doram ──
  'Frash Shrimp': 'SU_FRESHSHRIMP',
  'Sprit Of Life': 'SU_SPIRITOFLIFE',
  'Sprit Of Savage': 'SU_SVG_SPIRIT',

  // ── TaeKwon / StarGladiator / StarEmperor / SoulReaper ──
  'Happy Break': 'TK_SPTIME',
  'Seven Wind': 'TK_SEVENWIND',
  'Improve Dodge': 'TK_DODGE',
  'Blessing of Sun': 'SG_SUN_BLESS',
  'Blessing of Moon': 'SG_MOON_BLESS',
  'Blessing of Star': 'SG_STAR_BLESS',
  'Fusion of Sun, Moon and Star': 'SG_FUSION',
  'Knowledge of Sun Moon and Star': 'SG_KNOWLEDGE',
  'Knowledge of Sun, Moon and Star': 'SG_KNOWLEDGE',
  'Blaze Kick': 'SJ_PROMINENCEKICK',         // Prominence Kick in rAthena
  'Falling Stars': 'SJ_FALLINGSTAR',
  'Solar Explosion': 'SJ_NOVAEXPLOSING',
  'Solar Luminance': 'SJ_LIGHTOFSUN',
  'Solar Stance': 'SJ_SUNSTANCE',
  'Lunar Luminance': 'SJ_LIGHTOFMOON',
  'Stellar Luminance': 'SJ_LIGHTOFSTAR',
  'Stellar Stance': 'SJ_STARSTANCE',
  'Evil Soul Curse': 'SP_SOULCURSE',
  'Fairy Soul': 'SP_SOULFAIRY',
  'Soul Harvest': 'SP_SOULCOLLECT',

  // ── Ninja / Kagerou / Oboro ──
  'Dagger Throwing Practice': 'NJ_TOBIDOUGU',
  'Ninja Mastery': 'NJ_NINPOU',
  'Ninja Aura': 'NJ_NINPOU',                 // same skill, different calc label — verify!
  'Flaming Petals': 'NJ_KOUENKA',
  'Freezing Spear': 'NJ_HYOUSYOURAKU',       // Hyousyouraku = Freezing Spear
  'First Wind': 'NJ_KAMAITACHI',             // Kamaitachi = First Wind (Oboro wind skill)
  'Illusion - Bewitch': 'KO_GENWAKU',
  'Illusion - Death': 'KO_JYUSATSU',
  'Illusion - Shadow': 'KO_ZANZOU',
  'Illusion - Shock': 'KO_KYOUGAKU',
  'Moonlight Fantasy': 'OB_OBOROGENSOU',

  // ── RuneKnight runestones ──
  'Asir Runestone': '_CALC_ASIR_RUNESTONE',
  'Turisus Runestone': '_CALC_TURISUS_RUNESTONE',
  'Lux Anima Runestone': 'RK_LUXANIMA',

  // ── Odin / misc ──
  "Odin's Power": 'ALL_ODINS_POWER',
  "Owl's Eye": 'AC_OWL',
  "Vulture's Eye": 'AC_VULTURE',
  "Lerad's Dew": 'WM_LERADS_DEW',
  "Hell's Drive": 'HN_HELLS_DRIVE',
  'Improve Concentration': 'AC_CONCENTRATION',

  // ── 4th class ──
  'Dagger & Bow Mastery': 'ABC_DAGGER_AND_BOW_M',
  'Magic Sword Mastery': 'ABC_MAGIC_SWORD_M',
  'Mace & Book Mastery': 'CD_MACE_BOOK_M',
  'Magic Book Mastery': 'EM_MAGIC_BOOK_M',
  'Spear & Sword Mastery': 'IG_SPEAR_SWORD_M',
  'Divulio': '_CALC_DIVULIO',                // EM spirit name, not a standalone skill
  'Ardor': 'EM_SUMMON_ELEMENTAL_ARDOR',
  'Procella': 'EM_SUMMON_ELEMENTAL_PROCELLA',
  'Serpens': 'EM_SUMMON_ELEMENTAL_SERPENS',
  'Terramotus': 'EM_SUMMON_ELEMENTAL_TERREMOTUS',
  'Two Hand Defending': 'DK_TWOHANDDEF',
  'Vigor condensation': 'DK_VIGOR',
  'Vigor Explosion': 'DK_VIGOR',             // same skill, different context
  'Fatal Shadow Claw': 'SHC_FATAL_SHADOW_CROW',
  'Circling Nature': 'WH_NATUREFRIENDLY',    // Nature Friendly in rAthena
  'Dart Arrow': '_CALC_DART_ARROW',            // Wanderer passive, not in rAthena
  'Rapid Smiting': 'IG_GRAND_JUDGEMENT',     // IG offensive skill — verify!
  'Suicidal Destruction': 'SR_TIGERCANNON',  // alternate Tiger Cannon mode — verify!
  'Burst Attack': 'SR_DRAGONCOMBO',          // Dragon Combo in rAthena — verify!
  'Exploding Dragon': 'SR_DRAGONCOMBO',      // same skill — verify!

  'Geffenia Nocturne': 'TR_GEF_NOCTURN',
  'Serenade of Jawaii': 'TR_JAWAII_SERENADE',
  'Mystic Symphony': 'TR_MYSTIC_SYMPHONY',
  'March of Prontera': 'TR_PRON_MARCH',
  'Moonlight Serenade': 'WA_MOONLIT_SERENADE',
  'Colors of Hynrok': 'SH_COLORS_OF_HYUN_ROK',
  'Stratum Tremor': 'AG_STRANTUM_TREMOR',
  'Rock Down Arrow': 'AG_ROCK_DOWN',
  'Talisman Mastery': 'SOA_TALISMAN_MASTERY',
  'Soul Mastery': 'SOA_SOUL_MASTERY',

  // ── Mandragora / misc 3rd ──
  'Mandragora Howling': 'GN_MANDRAGORA',
  'Main Ranger': 'RA_RANGERMAIN',
  'Lion Howling': 'SR_HOWLINGOFLION',

  // ── Intensification = RG_CLOSECONFINE? or NPC? — calc-internal for now ──
  'Intensification': '_CALC_INTENSIFICATION',

  // ── Ride Dragon = uses RK_DRAGONTRAINING internally ──
  'Ride Dragon': 'RK_DRAGONTRAINING',

  // ── Last 4 fuzzy-resolved ──
  'Flamen': 'CD_FRAMEN',                     // Calc typo: "Flamen" → rAthena "Framen"
  'Lava Flow': 'MH_MAGMA_FLOW',
  'Acidified Zone Earth': 'BO_ACIDIFIED_ZONE_GROUND',
  'Activation Attack Machine': 'MT_A_MACHINE',
};

// ─── Parse GRF Lua: aegisName → PT-BR ──────────────────────────────
function parseGrfLua(filePath) {
  const content = fs.readFileSync(filePath, 'latin1');
  const map = new Map();

  const entries = content.split(/\[SKID\./);
  for (const entry of entries) {
    const aegisMatch = entry.match(/^\w+\]\s*=\s*\{\s*"(\w+)"/);
    if (!aegisMatch) continue;
    const aegis = aegisMatch[1];
    const ptbrMatch = entry.match(/SkillName\s*=\s*"([^"]+)"/);
    if (!ptbrMatch) continue;
    map.set(aegis, ptbrMatch[1]);
  }
  return map;
}

// ─── Parse rAthena YAML: aegisName → EN description ─────────────────
function parseRathenaYaml(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const map = new Map();
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const nameMatch = lines[i].match(/^\s{4}Name:\s+(\S+)/);
    if (nameMatch) {
      const aegis = nameMatch[1];
      if (i + 1 < lines.length) {
        const descMatch = lines[i + 1].match(/^\s{4}Description:\s+(.+)/);
        if (descMatch) {
          map.set(aegis, descMatch[1].trim());
        }
      }
    }
  }
  return map;
}

// ─── Parse skill-name.ts → list of EN names (handles apostrophes) ───
function parseSkillNameTs(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const names = new Set();

  // Only the array section (before dup check)
  const arraySection = content.split('const dup')[0];

  // Match double-quoted strings (may contain apostrophes)
  for (const m of arraySection.matchAll(/"([^"]+)"/g)) {
    const val = m[1].trim();
    if (val && !val.startsWith('//') && !val.includes('as const')) names.add(val);
  }

  // Match single-quoted strings (no apostrophe inside)
  for (const m of arraySection.matchAll(/'([^']+)'/g)) {
    const val = m[1].trim();
    if (val && !val.startsWith('//') && !val.includes('as const')) names.add(val);
  }

  // Remove artifacts from comment lines
  for (const name of names) {
    if (name.startsWith('//') || name.length < 2 || name.includes('\n')) {
      names.delete(name);
    }
  }

  return names;
}

// ─── Normalize for fuzzy matching ───────────────────────────────────
function norm(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// ─── Levenshtein distance ───────────────────────────────────────────
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ─── Extract meaningful words (min 3 chars) ─────────────────────────
function getWords(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length >= 3);
}

// ─── Word overlap score (Jaccard on significant words) ──────────────
function wordOverlap(a, b) {
  const wordsA = new Set(getWords(a));
  const wordsB = new Set(getWords(b));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) if (wordsB.has(w)) overlap++;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? overlap / union : 0;
}

// ─── Aegis-name to words ────────────────────────────────────────────
// "CR_AUTOGUARD" → ["auto", "guard"], "SR_RAISINGDRAGON" → ["raising", "dragon"]
function aegisToWords(aegis) {
  // Remove 1-3 char job prefix (e.g. CR_, SR_, NPC_, ALL_)
  const body = aegis.replace(/^[A-Z]{1,4}_/, '');
  return body.toLowerCase().split('_').filter(w => w.length >= 3);
}

// ─── Score a candidate match ────────────────────────────────────────
function scoreMatch(calcEN, aegis, rathenaEN) {
  const normCalc = norm(calcEN);
  const normRA = norm(rathenaEN);

  // Exact normalized match
  if (normCalc === normRA) return { score: 100, reason: 'exact-normalized' };

  // Levenshtein on normalized
  const levDist = levenshtein(normCalc, normRA);
  const maxLen = Math.max(normCalc.length, normRA.length);
  const levSimilarity = maxLen > 0 ? (1 - levDist / maxLen) : 0;

  // Word overlap (Jaccard) between calc EN and rAthena EN
  const wJaccard = wordOverlap(calcEN, rathenaEN);

  // Exact word matches between calc words and aegis body words
  const aegisWords = new Set(aegisToWords(aegis));
  const calcWords = getWords(calcEN);
  let aegisExactMatch = 0;
  for (const cw of calcWords) {
    if (aegisWords.has(cw)) aegisExactMatch++;
  }
  const aegisWordRatio = calcWords.length > 0 ? aegisExactMatch / calcWords.length : 0;

  // Containment: only counts if the contained string is substantial (>= 5 chars)
  const containScore =
    (normCalc.length >= 5 && normRA.includes(normCalc)) ||
    (normRA.length >= 5 && normCalc.includes(normRA))
      ? 15 : 0;

  // Composite score: weighted sum (not max — avoids false positives from one lucky metric)
  const score = (
    levSimilarity * 40 +       // max 40 pts from lev similarity
    wJaccard * 35 +            // max 35 pts from word overlap
    aegisWordRatio * 15 +      // max 15 pts from aegis body word match
    containScore               // max 15 pts from containment
  );

  const reason = `lev=${(levSimilarity * 100).toFixed(0)}% words=${(wJaccard * 100).toFixed(0)}% aegis=${(aegisWordRatio * 100).toFixed(0)}%`;

  return { score: Math.min(score, 99), reason };
}

// ─── Main ───────────────────────────────────────────────────────────
function main() {
  console.log('Loading sources...');

  const grfMap = parseGrfLua(GRF_LUA);
  console.log(`  GRF: ${grfMap.size} aegis→PT-BR entries`);

  const rathenaMap = parseRathenaYaml(RATHENA_YAML);
  console.log(`  rAthena: ${rathenaMap.size} aegis→EN entries`);

  const calcNames = parseSkillNameTs(SKILL_NAME_TS);
  console.log(`  Calc: ${calcNames.size} EN names`);

  const skillNameMapRaw = JSON.parse(fs.readFileSync(SKILL_NAME_MAP, 'utf-8'));
  const ptbrToEnBridge = new Map(Object.entries(skillNameMapRaw));
  const enToPtbrBridge = new Map();
  for (const [ptbr, en] of ptbrToEnBridge) enToPtbrBridge.set(en, ptbr);
  console.log(`  Bridge: ${ptbrToEnBridge.size} PT-BR→EN entries`);

  // ─── Build reverse maps ───────────────────────────────────────────
  // Prefer player skills over NPC_ duplicates
  const enToAegis = new Map();
  for (const [aegis, en] of rathenaMap) {
    const existing = enToAegis.get(en);
    if (!existing) {
      enToAegis.set(en, aegis);
    } else if (existing.startsWith('NPC_') && !aegis.startsWith('NPC_')) {
      enToAegis.set(en, aegis); // replace NPC with player version
    }
  }

  const normToAegis = new Map();
  for (const [aegis, en] of rathenaMap) {
    const n = norm(en);
    if (!normToAegis.has(n)) normToAegis.set(n, aegis);
  }

  const ptbrToAegisGrf = new Map();
  for (const [aegis, ptbr] of grfMap) {
    if (!ptbrToAegisGrf.has(ptbr)) ptbrToAegisGrf.set(ptbr, aegis);
  }

  // ─── Multi-pass matching ──────────────────────────────────────────
  const matched = new Map(); // calcEN → { aegis, confidence, pass }
  const review = []; // for human review

  let pass1 = 0, pass2 = 0, pass3 = 0, pass4 = 0, pass5 = 0, pass6 = 0;

  for (const calcEN of calcNames) {
    // Pass 0: Manual overrides (highest priority)
    if (MANUAL_OVERRIDES[calcEN]) {
      matched.set(calcEN, { aegis: MANUAL_OVERRIDES[calcEN], confidence: 'MANUAL', pass: 0 });
      pass4++;
      continue;
    }

    // Pass 1: Exact match rAthena EN description
    if (enToAegis.has(calcEN)) {
      matched.set(calcEN, { aegis: enToAegis.get(calcEN), confidence: 'HIGH', pass: 1 });
      pass1++;
      continue;
    }

    // Pass 2: GRF PT-BR bridge
    const ptbrName = enToPtbrBridge.get(calcEN);
    if (ptbrName && ptbrToAegisGrf.has(ptbrName)) {
      matched.set(calcEN, { aegis: ptbrToAegisGrf.get(ptbrName), confidence: 'HIGH', pass: 2 });
      pass2++;
      continue;
    }

    // Pass 3: Exact normalized match
    const normCalcEN = norm(calcEN);
    if (normToAegis.has(normCalcEN)) {
      matched.set(calcEN, { aegis: normToAegis.get(normCalcEN), confidence: 'HIGH', pass: 3 });
      pass3++;
      continue;
    }

    // Pass 4: Fuzzy matching — find best candidate
    let bestScore = 0;
    let bestAegis = null;
    let bestEN = null;
    let bestReason = '';

    for (const [aegis, en] of rathenaMap) {
      const { score, reason } = scoreMatch(calcEN, aegis, en);
      if (score > bestScore) {
        bestScore = score;
        bestAegis = aegis;
        bestEN = en;
        bestReason = reason;
      }
    }

    // Also try matching against GRF PT-BR names via bridge
    for (const [ptbr, aegis] of ptbrToAegisGrf) {
      const en = rathenaMap.get(aegis) || ptbr;
      const { score, reason } = scoreMatch(calcEN, aegis, en);
      if (score > bestScore) {
        bestScore = score;
        bestAegis = aegis;
        bestEN = en;
        bestReason = reason;
      }
    }

    if (bestScore >= 75) {
      matched.set(calcEN, { aegis: bestAegis, confidence: 'HIGH', pass: 4 });
      pass5++;
      review.push({ calcEN, aegis: bestAegis, rathenaEN: bestEN, score: Math.round(bestScore), confidence: 'HIGH', reason: bestReason });
    } else if (bestScore >= 50) {
      matched.set(calcEN, { aegis: bestAegis, confidence: 'MEDIUM', pass: 5 });
      pass5++;
      review.push({ calcEN, aegis: bestAegis, rathenaEN: bestEN, score: Math.round(bestScore), confidence: 'MEDIUM', reason: bestReason });
    } else if (bestScore >= 30) {
      matched.set(calcEN, { aegis: bestAegis, confidence: 'LOW', pass: 6 });
      pass6++;
      review.push({ calcEN, aegis: bestAegis, rathenaEN: bestEN, score: Math.round(bestScore), confidence: 'LOW', reason: bestReason });
    } else {
      // No match at all — make it calc-internal
      const fallbackAegis = '_CALC_' + calcEN.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      matched.set(calcEN, { aegis: fallbackAegis, confidence: 'NONE', pass: 7 });
      pass6++;
      review.push({ calcEN, aegis: fallbackAegis, rathenaEN: bestEN, score: Math.round(bestScore), confidence: 'NONE', reason: `best: ${bestAegis} (${bestReason})` });
    }
  }

  console.log(`\nMatching results:`);
  console.log(`  Pass 1 (exact rAthena):    ${pass1}`);
  console.log(`  Pass 2 (GRF bridge):       ${pass2}`);
  console.log(`  Pass 3 (normalized):       ${pass3}`);
  console.log(`  Pass 4 (manual):           ${pass4}`);
  console.log(`  Pass 5 (fuzzy HIGH/MED):   ${pass5}`);
  console.log(`  Pass 6 (fuzzy LOW/NONE):   ${pass6}`);
  console.log(`  TOTAL:                     ${matched.size}`);

  // ─── Build registry ───────────────────────────────────────────────
  const registry = {};
  for (const [calcEN, { aegis }] of matched) {
    const ptbr = grfMap.get(aegis) || calcEN;
    registry[aegis] = { en: calcEN, ptbr };
  }

  // Sort by aegis name
  const sorted = {};
  for (const key of Object.keys(registry).sort()) {
    sorted[key] = registry[key];
  }

  const entries = Object.keys(sorted).length;
  const missingPtbr = Object.values(sorted).filter(v => !v.ptbr).length;
  console.log(`\nRegistry: ${entries} entries (missing PT-BR: ${missingPtbr})`);

  // ─── Write outputs ────────────────────────────────────────────────
  fs.writeFileSync(OUTPUT, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');
  console.log(`✅ Written registry to ${OUTPUT}`);

  // Review file — sorted by confidence (worst first)
  const confidenceOrder = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 };
  review.sort((a, b) => confidenceOrder[a.confidence] - confidenceOrder[b.confidence] || a.calcEN.localeCompare(b.calcEN));

  const reviewSummary = {
    total: review.length,
    NONE: review.filter(r => r.confidence === 'NONE').length,
    LOW: review.filter(r => r.confidence === 'LOW').length,
    MEDIUM: review.filter(r => r.confidence === 'MEDIUM').length,
    HIGH: review.filter(r => r.confidence === 'HIGH').length,
    items: review,
  };

  fs.writeFileSync(REVIEW_OUTPUT, JSON.stringify(reviewSummary, null, 2) + '\n', 'utf-8');
  console.log(`📋 Written review file to ${REVIEW_OUTPUT}`);

  // Print review summary
  console.log(`\n─── REVIEW NEEDED ───`);
  console.log(`  NONE (no match):  ${reviewSummary.NONE}`);
  console.log(`  LOW  (<50):       ${reviewSummary.LOW}`);
  console.log(`  MEDIUM (50-74):   ${reviewSummary.MEDIUM}`);
  console.log(`  HIGH (75+):       ${reviewSummary.HIGH}`);

  if (review.length > 0) {
    console.log(`\n─── ITEMS FOR REVIEW ───`);
    for (const r of review) {
      const tag = { NONE: '❌', LOW: '🟡', MEDIUM: '🟠', HIGH: '🟢' }[r.confidence];
      console.log(`  ${tag} [${r.confidence}] "${r.calcEN}" → ${r.aegis} (rAthena: "${r.rathenaEN}") score=${r.score} ${r.reason}`);
    }
  }
}

main();
