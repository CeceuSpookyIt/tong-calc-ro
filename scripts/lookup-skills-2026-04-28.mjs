/**
 * Looks up PT-BR skill names in GRF skillinfolist_decompiled.lua to find aegisName.
 * One-off helper for the 2026-04-28 update.
 */
import { readFileSync } from 'fs';

const GRF_FILE = 'C:/Users/Marcel/rag/snapshots/grf-extracted-2026-04-28/skillinfolist_decompiled.lua';

function decodeLuaString(s) {
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const n = s[i + 1];
      if (n >= '0' && n <= '9') {
        let ns = n;
        if (i + 2 < s.length && s[i + 2] >= '0' && s[i + 2] <= '9') {
          ns += s[i + 2];
          if (i + 3 < s.length && s[i + 3] >= '0' && s[i + 3] <= '9') ns += s[i + 3];
        }
        bytes.push(parseInt(ns));
        i += ns.length;
      } else {
        bytes.push(s.charCodeAt(i));
      }
    } else {
      bytes.push(s.charCodeAt(i));
    }
  }
  return Buffer.from(bytes).toString('utf-8');
}

const content = readFileSync(GRF_FILE, 'utf-8');
const re = /"([A-Z][A-Z_0-9]+)"\s*,\s*\n\s*SkillName\s*=\s*"([^"]+)"/g;

const ptbrToAegis = new Map(); // exact PT-BR name → [aegis]
const aegisToPtbr = new Map();

let m;
while ((m = re.exec(content)) !== null) {
  const aegis = m[1];
  const dec = decodeLuaString(m[2]);
  aegisToPtbr.set(aegis, dec);
  if (!ptbrToAegis.has(dec)) ptbrToAegis.set(dec, []);
  ptbrToAegis.get(dec).push(aegis);
}

const queries = [
  'Explosão Espiritual', 'Gemini Lumen', 'Corrente Elétrica', 'Cópia Explosiva',
  'Castigo de Loki', 'Lanças dos Aesir', 'Erva Daninha', 'Choque Rápido', 'Escudo Compressor',
  'Tempestade de Flechas', 'Disparo Certeiro', 'Sopro do Dragão', 'Bafo do Dragão',
  'Disparo Perfurante', 'Combo Rápido', 'Tornado de Carrinho', 'Investigar',
  'Garra Sombria', 'Chute Aéreo', 'Kunai Explosiva', 'Cometas Lunáticos',
  'Tiro Neutralizante', 'Impacto Flamejante', 'Chute Estelar',
  'Esquife de Gelo', 'Zero Absoluto', 'Pó de Diamante', 'Adoramus',
  'Ruído Estridente', 'Onda Psíquica', 'Lança Congelante', 'Lâmina de Vento',
  'Inspiração', 'Divisão de Alma', 'Escudo Mágico', 'Impacto Espiritual',
  'Telecinesia', 'Meteoros de Nepeta', 'Castigo',
  'Zona Acidificada (Fogo)', 'Zona Acidificada (Vento)',
  'Abyss Square', 'Shield Shooting', 'Conflagração',
  'Second Faith: Judgment', 'Second Faith: Conviction',
  'Rose Blossom', 'Flamen', 'Arbitrium',
  'Storm Slash', 'Impact Crater', 'Axe Stomp', 'Frozen Slash', 'Gale Storm',
  'Chakra da Cura', 'Disparo Perfurante', 'Ilimitar', 'Investigar',
  'Tornado de Carrinho', 'Castigo de Loki', 'Chute Aéreo', 'Kunai Explosiva',
  'Chilique de Picky', 'Cometas Lunáticos', 'Tiro Neutralizante',
  'Impacto Flamejante', 'Chute Estelar', 'Esquife de Gelo', 'Zero Absoluto',
  'Pó de Diamante', 'Adoramus', 'Ruído Estridente', 'Onda Psíquica',
  'Lança Congelante', 'Lâmina de Vento', 'Inspiração', 'Divisão de Alma',
  'Escudo Mágico', 'Impacto Espiritual', 'Telecinesia', 'Meteoros de Nepeta',
];

const seen = new Set();
for (const q of queries) {
  if (seen.has(q)) continue;
  seen.add(q);
  const exact = ptbrToAegis.get(q);
  // also try fuzzy match (substring)
  const fuzzy = [];
  if (!exact) {
    for (const [k, v] of ptbrToAegis) {
      if (k.includes(q) || q.includes(k)) fuzzy.push(`${v.join(',')}=${k}`);
    }
  }
  if (exact) {
    console.log(`${q.padEnd(34)} → ${exact.join(', ')}`);
  } else if (fuzzy.length > 0) {
    console.log(`${q.padEnd(34)} → (fuzzy) ${fuzzy.slice(0, 3).join(' | ')}`);
  } else {
    console.log(`${q.padEnd(34)} → NOT FOUND`);
  }
}
