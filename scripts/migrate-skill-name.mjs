#!/usr/bin/env node
/**
 * migrate-skill-name.mjs
 *
 * Replaces EN skill names in skill-name.ts with aegisNames from the registry.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SKILL_NAME_TS = path.join(ROOT, 'src/app/constants/skill-name.ts');
const REGISTRY_JSON = path.join(ROOT, 'src/app/constants/skill-registry-data.json');

const registry = JSON.parse(fs.readFileSync(REGISTRY_JSON, 'utf-8'));
const content = fs.readFileSync(SKILL_NAME_TS, 'utf-8');

const enToAegis = new Map();
for (const [aegis, entry] of Object.entries(registry)) {
  enToAegis.set(entry.en, aegis);
}

// Extra mappings for alternate EN names in skill-name.ts
// These are cases where skill-name.ts uses a different EN name than what the registry stored
const EXTRA = {
  'Acid Demonstration': 'CR_ACIDDEMONSTRATION',
  'Nature Friendly': 'WH_NATUREFRIENDLY',
  'Bio Cannibalize': 'AM_CANNIBALIZE',
  'Cart Remodeling': 'GN_REMODELING_CART',
  'Cross Wound': 'SHC_CROSS_SLASH',
  'Dance With Wug': 'WM_DANCE_WITH_WUG',
  'Dragon Training': 'RK_DRAGONTRAINING',
  'Concentration': 'LK_CONCENTRATION',
  'Intimidate': 'RG_INTIMIDATE',
  'Kiling Cloud': 'SO_CLOUD_KILL',
  'Knowledge of Sun Moon and Star': 'SG_KNOWLEDGE',
  'Madogear License': 'NC_MADOLICENCE',
  'Ninja Aura': 'NJ_NINPOU',
  'Vigor condensation': 'DK_VIGOR',
  'Wounding Shot': 'RL_QD_SHOT',
  'Burst Attack': 'SR_DRAGONCOMBO',
  'Cannon Spear': 'LG_CANNONSPEAR',
  'Dragon Combo': 'SR_DRAGONCOMBO',
  'Freezing Spear': 'NJ_HYOUSYOURAKU',
  'Knuckle Boost': 'NC_BOOSTKNUCKLE',
  'Power Swing': 'NC_POWERSWING',
  'Raid': 'RG_RAID',
  'Spirit of Savage': 'SU_SVG_SPIRIT',
  'Sprit Of Savage': 'SU_SVG_SPIRIT',
  'Suicidal Destruction': 'SR_TIGERCANNON',
  'Swift Trap': 'WH_SWIFTTRAP',
  'Flamen': 'CD_FRAMEN',
  'Rapid Smiting': 'IG_GRAND_JUDGEMENT',
  'Rock Down Arrow': 'AG_ROCK_DOWN',
};
for (const [en, aegis] of Object.entries(EXTRA)) {
  if (!enToAegis.has(en)) enToAegis.set(en, aegis);
}

// Parse arrays properly — handle both 'single' and "double" quoted strings
function extractStringsFromArray(text) {
  const results = [];
  const regex = /"([^"]+)"|'([^']+)'/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    const val = m[1] || m[2];
    if (val && !val.startsWith('//')) results.push(val);
  }
  return results;
}

// Split the file into the two arrays
const activePassiveMatch = content.match(/const ACTIVE_PASSIVE_SKILL_NAMES = \[([\s\S]*?)\] as const/);
const offensiveMatch = content.match(/export const OFFENSIVE_SKILL_NAMES = \[([\s\S]*?)\] as const/);

if (!activePassiveMatch || !offensiveMatch) {
  console.error('Could not find arrays in skill-name.ts');
  process.exit(1);
}

const activePassiveNames = extractStringsFromArray(activePassiveMatch[1]);
const offensiveNames = extractStringsFromArray(offensiveMatch[1]);

console.log(`Active/Passive: ${activePassiveNames.length} names`);
console.log(`Offensive: ${offensiveNames.length} names`);

// Migrate
function migrate(names) {
  const result = [];
  let unmapped = 0;
  for (const name of names) {
    const aegis = enToAegis.get(name);
    if (aegis) {
      result.push(aegis);
    } else {
      console.error(`UNMAPPED: "${name}"`);
      result.push(name);
      unmapped++;
    }
  }
  return { result, unmapped };
}

const ap = migrate(activePassiveNames);
const off = migrate(offensiveNames);

console.log(`\nActive/Passive: ${ap.result.length} (${ap.unmapped} unmapped)`);
console.log(`Offensive: ${off.result.length} (${off.unmapped} unmapped)`);

// Generate new file
const output = `const ACTIVE_PASSIVE_SKILL_NAMES = [
${ap.result.map(s => `  '${s}',`).join('\n')}
] as const;

export const OFFENSIVE_SKILL_NAMES = [
${off.result.map(s => `  '${s}',`).join('\n')}
] as const;

export type SKILL_NAME = (typeof ACTIVE_PASSIVE_SKILL_NAMES)[number] | (typeof OFFENSIVE_SKILL_NAMES)[number];
export { ACTIVE_PASSIVE_SKILL_NAMES };
`;

if (ap.unmapped + off.unmapped > 0) {
  console.log(`\n⚠ ${ap.unmapped + off.unmapped} unmapped — NOT writing.`);
  process.exit(1);
}

fs.writeFileSync(SKILL_NAME_TS, output);
console.log(`\n✅ Written to ${SKILL_NAME_TS}`);
