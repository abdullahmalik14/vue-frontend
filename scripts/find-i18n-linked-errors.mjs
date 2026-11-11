import fs from 'fs';
import { baseCompile, CompileErrorCodes } from '@intlify/message-compiler';

function flatten(obj, prefix = '') {
  const out = [];
  for (const [k, v] of Object.entries(obj || {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flatten(v, p));
    else if (typeof v === 'string') out.push([p, v]);
  }
  return out;
}

function findBad(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const bad = [];
  for (const [key, msg] of flatten(data)) {
    const errors = [];
    baseCompile(msg, { onError: (e) => errors.push(e) });
    for (const e of errors) {
      if (e.code === CompileErrorCodes.INVALID_LINKED_FORMAT) {
        bad.push({ key, msg });
        break;
      }
    }
  }
  return bad;
}

const files = [
  'public/i18n/section-dashboard-global/en.json',
  'public/i18n/section-dashboard-global/vi.json',
  'public/i18n/section-misc/en.json',
  'public/i18n/section-misc/vi.json',
];

for (const file of files) {
  const bad = findBad(file);
  console.log(`\n${file}: ${bad.length}`);
  for (const b of bad) console.log(`  ${b.key} => ${JSON.stringify(b.msg)}`);
}
