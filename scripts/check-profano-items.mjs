import { readFileSync } from 'fs';

const c = readFileSync('C:/Users/Marcel/rag/snapshots/post-update/iteminfo_new_decompiled.lua', 'utf-8');

function decode(s) {
  const b = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const n = s[i + 1];
      if (n >= '0' && n <= '9') {
        let ns = n;
        if (i + 2 < s.length && s[i + 2] >= '0' && s[i + 2] <= '9') {
          ns += s[i + 2];
          if (i + 3 < s.length && s[i + 3] >= '0' && s[i + 3] <= '9') ns += s[i + 3];
        }
        b.push(parseInt(ns));
        i += ns.length;
      } else {
        b.push(s.charCodeAt(i));
      }
    } else {
      b.push(s.charCodeAt(i));
    }
  }
  return Buffer.from(b).toString('utf-8');
}

const re = /\[(\d+)\]\s*=\s*\{[\s\S]*?(?<![un])identifiedDisplayName\s*=\s*"([^"]*)"/gm;
let m;
const found = [];
while ((m = re.exec(c)) !== null) {
  const name = decode(m[2]);
  if (name.includes('Profano') || name.includes('Radiante')) {
    found.push({ id: m[1], name });
  }
}
found.sort((a, b) => Number(a.id) - Number(b.id));
console.log('Profano/Radiante items in iteminfo_new (post-update):');
for (const f of found) console.log(`  ${f.id}: ${f.name}`);
