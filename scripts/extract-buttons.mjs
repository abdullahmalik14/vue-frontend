import fs from 'fs';
import path from 'path';

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === 'node_modules') continue;
      walk(p, acc);
    } else if (ent.name.endsWith('.vue')) acc.push(p);
  }
  return acc;
}

import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = walk(path.join(root, 'src')).filter((f) => {
  const c = fs.readFileSync(f, 'utf8');
  return /DashboardPrimaryButton|TwoPieceButton/.test(c);
});

const exclude =
  /demo-audit|DemoPage\.vue|CartComponentsDemo|NotificationCardDemo|AuthComponentDemo|ValidationRulesShowcase|LoadingSpinnerDemo/;

const samples = new Map();

function norm(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function fingerprint(block) {
  return norm(
    block
      .replace(/@[a-zA-Z-]+="[^"]*"/g, '')
      .replace(/v-[a-zA-Z-]+="[^"]*"/g, '')
      .replace(/:key="[^"]*"/g, '')
      .replace(/\s+/g, ' ')
  );
}

for (const f of files) {
  if (exclude.test(f)) continue;
  const c = fs.readFileSync(f, 'utf8');
  const re = /<DashboardPrimaryButton[\s\S]*?(?:\/>|<\/DashboardPrimaryButton>)/g;
  let m;
  while ((m = re.exec(c))) {
    const block = m[0];
    const key = fingerprint(block);
    if (!samples.has(key)) samples.set(key, { file: f, type: 'dpb', block });
  }
  const re2 = /<TwoPieceButton[\s\S]*?(?:\/>|<\/TwoPieceButton>)/g;
  while ((m = re2.exec(c))) {
    const block = m[0];
    const key = fingerprint(block);
    if (!samples.has(key)) samples.set(key, { file: f, type: 'two', block });
  }
}

console.log('count', samples.size);
const out = [...samples.values()].map((v) => ({
  file: v.file,
  type: v.type,
  preview: v.block.slice(0, 400),
}));
fs.writeFileSync('scripts/button-samples.json', JSON.stringify(out, null, 2));
console.log('wrote scripts/button-samples.json');
