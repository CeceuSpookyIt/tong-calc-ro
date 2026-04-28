/**
 * fetch-update-2026-04-28.mjs
 *
 * Fetches new equipment items from Divine Pride API and adds them to item.json.
 * STRICTER than 2026-04-14:
 *   - REQUIRES LATAM identifiedDisplayName (no fallback to DP name).
 *   - Refuses generic placeholder names ("Equip. Sombrio", "Escudo", "").
 *   - Slot suffix [N] is stripped here; parse-latam-items.mjs re-adds it.
 *   - Description left empty; populated by re-running parse-latam-items.mjs.
 *   - Skips IDs already present in item.json (additive-only).
 */
import { readFileSync, writeFileSync } from 'fs';

const API_KEY = '78ce39ae8c2f15f269d1a8f542b76ffb';
const ITEM_JSON = 'src/assets/demo/data/item.json';
const POST_UPDATE = 'C:/Users/Marcel/rag/snapshots/post-update/iteminfo_new_decompiled.lua';

// 47 equipment items confirmed relevant for damage calculator.
const IDS = [
  // ===== Shadow Equipment (8 sets x 3 pieces = 24) =====
  // Explosão (Genetic — Cart Cannon? validate)
  24476, 24477, 24478,
  // Lumen
  24488, 24489, 24490,
  // Corrente (Royal Guard — Banishing Point? Overbrand? validate)
  24521, 24522, 24523,
  // Cópia (Shadow Chaser — Reproduce? Triangle Shot? validate)
  24533, 24534, 24535,
  // Castigo (Inquisitor? Sura? validate)
  24545, 24546, 24547,
  // Aesir (mixed? validate)
  24557, 24558, 24559,
  // Erva (Geneticist — Acid Demonstration? Cart Tornado? validate)
  24569, 24570, 24571,
  // Compressora (Mechanic — Knuckle Boost? Vulcan? validate)
  24575, 24576, 24577,

  // ===== Other Equipment (23) =====
  410183, // Diadema Radiante (head)
  410184, // Diadema Profano (head)
  450151, // Camisa de Algodão Aprimorada (armor)
  460012, // Guarda Aprimorada (shield)
  480136, // Espada do Espadachim Mágico Thanatos (sword)
  480812, // Manto Branco Físico (garment)
  480813, // Manto Branco Mágico (garment)
  490087, // Colar Ampulheta (accessory)
  500018, // Lâmina de Recaída
  510021, // Faca Aprimorada (dagger)
  510026, // Adaga de Recaída (dagger)
  530009, // Lança Fortificada (spear)
  540013, // Manual de Fortificação (book)
  560011, // Punho de Sucata (knuckle)
  570012, // Alaúde de Sucata (instrument)
  580012, // Chicote de Sucata (whip)
  590015, // Cruz Relapse
  590036, // Cruz Maldita
  600013, // Claymore Fortificado (twohand sword)
  610015, // Katar Relapse (katar)
  620005, // Machado Relapse (axe)
  640013, // Cajado Fortificado (rod/staff)
  700021, // Arco de Sucata (bow)
];

const GENERIC_NAMES = new Set([
  '', '???',
  'Equip. Sombrio', 'Equipamento Sombrio',
  'Acessório Sombrio', 'Manopla Sombria', 'Colar Sombrio', 'Brinco Sombrio',
  'Malha Sombria', 'Escudo Sombrio', 'Greva Sombria',
  'Escudo', 'Adaga', 'Espada', 'Cajado', 'Lança',
  'Cubo Sombrio',
]);

const luaContent = readFileSync(POST_UPDATE, 'utf-8');

function decodeLuaString(s) {
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '\\' && i + 1 < s.length) {
      const next = s[i + 1];
      if (next >= '0' && next <= '9') {
        let numStr = next;
        if (i + 2 < s.length && s[i + 2] >= '0' && s[i + 2] <= '9') {
          numStr += s[i + 2];
          if (i + 3 < s.length && s[i + 3] >= '0' && s[i + 3] <= '9') numStr += s[i + 3];
        }
        bytes.push(parseInt(numStr));
        i += numStr.length;
      } else if (next === 'n') { bytes.push(10); i++; }
      else if (next === 't') { bytes.push(9); i++; }
      else if (next === '\\') { bytes.push(92); i++; }
      else if (next === '"') { bytes.push(34); i++; }
      else bytes.push(s.charCodeAt(i));
    } else {
      bytes.push(s.charCodeAt(i));
    }
  }
  return Buffer.from(bytes).toString('utf-8');
}

function getLatamIdentifiedName(id) {
  const regex = new RegExp(
    `\\[${id}\\]\\s*=\\s*\\{[\\s\\S]*?(?<![un])identifiedDisplayName\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`,
    'm',
  );
  const m = luaContent.match(regex);
  return m ? decodeLuaString(m[1]) : null;
}

function stripSlotSuffix(name) {
  return name.replace(/\s*\[\d+\]\s*$/, '').trim();
}

async function fetchItem(id) {
  const url = `https://www.divine-pride.net/api/database/Item/${id}?apiKey=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  ${id}: DP HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.log(`  ${id}: ${e.message}`);
    return null;
  }
}

async function main() {
  const items = JSON.parse(readFileSync(ITEM_JSON, 'utf-8'));
  const added = [];
  const skipped = [];
  const failed = [];

  for (const id of IDS) {
    if (items[id]) {
      skipped.push({ id, reason: 'exists', name: items[id].name });
      continue;
    }

    const latamName = getLatamIdentifiedName(id);
    if (!latamName) {
      failed.push({ id, reason: 'no LATAM identifiedDisplayName' });
      console.log(`  ${id}: FAIL — no LATAM name`);
      continue;
    }
    const cleanName = stripSlotSuffix(latamName);
    if (GENERIC_NAMES.has(cleanName)) {
      failed.push({ id, reason: `generic name: "${cleanName}"` });
      console.log(`  ${id}: FAIL — generic name "${cleanName}"`);
      continue;
    }

    const dp = await fetchItem(id);
    if (!dp) {
      failed.push({ id, reason: 'DP fetch failed' });
      continue;
    }

    const entry = {
      id, // CRITICAL: calculator dropdown lists use item.id to populate value field
      aegisName: dp.aegisName || `LATAM_${id}`,
      name: dp.slots > 0 ? `${cleanName} [${dp.slots}]` : cleanName,
      unidName: dp.unidName || dp.name || cleanName,
      resName: dp.resName || '',
      description: '', // filled by parse-latam-items.mjs
      slots: dp.slots || 0,
      itemTypeId: dp.itemTypeId,
      itemSubTypeId: dp.itemSubTypeId,
      itemLevel: dp.itemLevel || null,
      attack: dp.attack || null,
      matk: dp.matk || null,
      defense: dp.defense || null,
      weight: dp.weight || null,
      requiredLevel: dp.requiredLevel || null,
      location: dp.location || null,
      compositionPos: dp.compositionPos || null,
      usableClass: ['all'],
      script: {},
    };

    if (dp.itemTypeId === 6) {
      entry.cardPrefix = dp.cardPrefix || '';
    }

    items[id] = entry;
    added.push({ id, name: entry.name, aegis: dp.aegisName, latamName });
    console.log(`  ${id}: ${entry.name} [${dp.aegisName}]`);

    await new Promise((r) => setTimeout(r, 250));
  }

  writeFileSync(ITEM_JSON, JSON.stringify(items, null, 2), 'utf-8');

  console.log(`\n=== RESULTADO ===`);
  console.log(`Added: ${added.length}`);
  console.log(`Skipped (existing): ${skipped.length}`);
  console.log(`Failed: ${failed.length}`);
  if (skipped.length) {
    console.log(`\nSkipped:`);
    for (const s of skipped) console.log(`  ${s.id}: ${s.name} (${s.reason})`);
  }
  if (failed.length) {
    console.log(`\nFailed:`);
    for (const f of failed) console.log(`  ${f.id}: ${f.reason}`);
  }
  console.log(`\nNext: re-run parse-latam-items.mjs to populate descriptions.`);
}

main();
