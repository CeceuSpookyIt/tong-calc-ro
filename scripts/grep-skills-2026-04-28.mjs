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
      } else bytes.push(s.charCodeAt(i));
    } else bytes.push(s.charCodeAt(i));
  }
  return Buffer.from(bytes).toString('utf-8');
}

const content = readFileSync(GRF_FILE, 'utf-8');
const re = /"([A-Z][A-Z_0-9]+)"\s*,\s*\n\s*SkillName\s*=\s*"([^"]+)"/g;

const all = [];
let m;
while ((m = re.exec(content)) !== null) all.push({ aegis: m[1], name: decodeLuaString(m[2]) });

const fragments = process.argv.slice(2);
if (!fragments.length) {
  console.error('Usage: node grep-skills-2026-04-28.mjs <fragment> [fragment...]');
  process.exit(1);
}

for (const frag of fragments) {
  console.log(`\n--- "${frag}" ---`);
  const matches = all.filter((s) => s.name.toLowerCase().includes(frag.toLowerCase()));
  for (const m of matches) console.log(`  ${m.aegis.padEnd(30)} = ${m.name}`);
  if (!matches.length) console.log('  (none)');
}
