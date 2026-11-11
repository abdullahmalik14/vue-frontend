#!/usr/bin/env node
/**
 * Extract user-facing text strings from Vue page templates and recursively
 * imported / dynamic child components (for translation spreadsheet prep).
 *
 * Default entry: Dashboard Analytics page (also used by /iframe/analytics).
 *
 * Usage:
 *   npm run extract:analytics-strings
 *   node ./build/extractTemplateTextStrings.js
 *   node ./build/extractTemplateTextStrings.js --all-imports
 *   node ./build/extractTemplateTextStrings.js --entry src/path/Page.vue --out my-strings
 *
 * Default scope keeps analytics UI (+ i18n keys under dashboard.analytics.*).
 * Pass --all-imports to include every imported chrome component (header/sidebar/etc).
 *
 * Outputs:
 *   build/output/analytics-text-strings.csv
 *   build/output/analytics-text-strings.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, relative, resolve, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const DEFAULT_ENTRIES = [
  'src/templates/dashboard/global/DashboardAnalyticsPage.vue',
];

const OUTPUT_DIR = join(projectRoot, 'build', 'output');
const OUTPUT_BASENAME = 'analytics-text-strings';
const LOCALE_EN = join(
  projectRoot,
  'public/i18n/section-dashboard-global/en.json',
);

/** @type {Set<string>} */
const visitedFiles = new Set();
/** @type {Map<string, object>} */
const findings = new Map();

function parseArgs(argv) {
  const entries = [];
  let outBase = OUTPUT_BASENAME;
  let allImports = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--entry' && argv[i + 1]) entries.push(argv[++i]);
    else if (arg === '--out' && argv[i + 1]) outBase = argv[++i];
    else if (arg === '--all-imports') allImports = true;
  }
  return {
    entries: entries.length ? entries : DEFAULT_ENTRIES,
    outBase,
    allImports,
  };
}

function toPosix(p) {
  return p.replace(/\\/g, '/');
}

function resolveImportPath(fromFile, importPath) {
  let cleaned = importPath.trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned) return null;

  if (cleaned.startsWith('@/')) {
    cleaned = join(projectRoot, 'src', cleaned.slice(2));
  } else if (cleaned.startsWith('.') || cleaned.startsWith('/')) {
    cleaned = resolve(dirname(fromFile), cleaned);
  } else {
    return null;
  }

  if (!extname(cleaned)) {
    if (existsSync(`${cleaned}.vue`)) return `${cleaned}.vue`;
    if (existsSync(join(cleaned, 'index.vue'))) return join(cleaned, 'index.vue');
    return null;
  }

  if (extname(cleaned) !== '.vue') return null;
  return existsSync(cleaned) ? cleaned : null;
}

function collectVueImports(source, fromFile) {
  const imports = new Set();
  const patterns = [
    /import\s+(?:[\w*{}\s,$]+\s+from\s+)?['"]([^'"]+\.vue)['"]/g,
    /import\s*\(\s*['"]([^'"]+\.vue)['"]\s*\)/g,
    /defineAsyncComponent\s*\(\s*(?:\(\s*\)\s*=>\s*)?import\s*\(\s*['"]([^'"]+\.vue)['"]\s*\)/g,
  ];

  for (const re of patterns) {
    let match;
    while ((match = re.exec(source)) !== null) {
      const resolved = resolveImportPath(fromFile, match[1]);
      if (resolved) imports.add(resolved);
    }
  }
  return [...imports];
}

function isAnalyticsRelatedFile(filePath) {
  const rel = toPosix(relative(projectRoot, filePath)).toLowerCase();
  const name = basename(filePath).toLowerCase();
  return (
    rel.includes('analytics') ||
    name.includes('analytics') ||
    name === 'dashboardanalyticstrendpopup.vue'
  );
}

function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

function extractSfcBlocks(source) {
  const templateMatch = source.match(/<template[\s\S]*?>([\s\S]*?)<\/template>/i);
  const scriptMatches = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  return {
    template: templateMatch ? templateMatch[1] : '',
    scripts: scriptMatches.map((m) => m[1]).join('\n'),
  };
}

function getByPath(obj, pathKey) {
  return pathKey.split('.').reduce((acc, part) => {
    if (acc == null || typeof acc !== 'object') return undefined;
    return acc[part];
  }, obj);
}

function loadLocaleEnglish() {
  if (!existsSync(LOCALE_EN)) return {};
  try {
    return JSON.parse(readFileSync(LOCALE_EN, 'utf8'));
  } catch {
    return {};
  }
}

function looksLikeUiEnglish(text) {
  if (!text || text.length < 2) return false;
  if (!/[A-Za-z]/.test(text)) return false;
  // HTML / Vue fragment noise
  if (/[{}<>]|class=|ref=|v-|@\w+|:\w+=/.test(text)) return false;
  if (/&&|\|\||=>|\?:|emit\(|update:model/.test(text)) return false;
  if (/=/.test(text)) return false;
  if (/^[0-9$%.,\s/|-]+$/.test(text)) return false;
  // Technical identifiers without spaces
  if (/^[a-z][a-zA-Z0-9]*$/.test(text) && text.length < 24) return false;
  if (/^[a-z0-9_-]+$/.test(text) && !/\s/.test(text) && text.length < 20) return false;
  // Template expression leftovers
  if (/^row\./i.test(text)) return false;
  if (/^(js|ts|vue|css)$/i.test(text)) return false;
  return true;
}

function looksLikeI18nKey(key) {
  if (!key || key.length < 3) return false;
  if (!key.includes('.')) return false;
  if (/[{}<>\s]/.test(key)) return false;
  return true;
}

function addFinding({
  english,
  i18nKey = '',
  kind,
  sourceFile,
  location,
  note = '',
  localeEnglish = '',
}) {
  let text = String(english || '').replace(/\s+/g, ' ').trim();
  if (localeEnglish) text = String(localeEnglish).replace(/\s+/g, ' ').trim();

  if (!looksLikeUiEnglish(text) && !i18nKey) return;
  if (i18nKey && !text) text = i18nKey.split('.').pop() || i18nKey;

  const key = [
    text.toLowerCase(),
    i18nKey,
    kind,
    toPosix(relative(projectRoot, sourceFile)),
  ].join('|');

  if (findings.has(key)) return;

  findings.set(key, {
    english: text,
    i18nKey: i18nKey || '',
    kind,
    sourceFile: toPosix(relative(projectRoot, sourceFile)),
    location,
    note,
  });
}

function extractI18nCalls(code, sourceFile, location, localeRoot) {
  const re =
    /(?:\$t|t)\(\s*(['"])([^'"]+)\1(?:\s*,\s*(['"])([^'"]*)\3)?/g;
  let match;
  while ((match = re.exec(code)) !== null) {
    const i18nKey = match[2];
    if (!looksLikeI18nKey(i18nKey)) continue;
    const fallback = match[4] || '';
    const fromLocale = getByPath(localeRoot, i18nKey);
    const localeEnglish = typeof fromLocale === 'string' ? fromLocale : '';

    addFinding({
      english: fallback || localeEnglish || i18nKey.split('.').pop() || i18nKey,
      i18nKey,
      kind: fallback ? 'i18n_with_fallback' : localeEnglish ? 'i18n_key' : 'i18n_key_unresolved',
      sourceFile,
      location,
      note: fallback
        ? 'Inline English fallback'
        : localeEnglish
          ? 'Resolved from section-dashboard-global/en.json'
          : 'Key only — English not found in locale JSON',
      localeEnglish: fallback || localeEnglish,
    });
  }
}

function extractAttrStrings(template, sourceFile) {
  const attrs = ['alt', 'title', 'aria-label', 'placeholder'];
  for (const attr of attrs) {
    const re = new RegExp(
      '\\b' + attr + '\\s*=\\s*([\'"])([^\'"{]+)\\1',
      'gi',
    );
    let match;
    while ((match = re.exec(template)) !== null) {
      const value = match[2].trim();
      if (!looksLikeUiEnglish(value)) continue;
      addFinding({
        english: value,
        kind: `attr_${attr}`,
        sourceFile,
        location: 'template',
        note: `Hardcoded ${attr}`,
      });
    }

    // text="..." on buttons (static only)
    if (attr === 'placeholder') {
      /* handled above */
    }
  }

  const textAttrRe = /\btext\s*=\s*(['"])([^'"{]+)\1/gi;
  let m;
  while ((m = textAttrRe.exec(template)) !== null) {
    const value = m[2].trim();
    if (!looksLikeUiEnglish(value)) continue;
    addFinding({
      english: value,
      kind: 'attr_text',
      sourceFile,
      location: 'template',
      note: 'Hardcoded text prop',
    });
  }
}

function extractTemplateTextNodes(template, sourceFile) {
  // Remove tags (including multiline) so only text nodes remain
  const textOnly = stripHtmlComments(template)
    .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  for (const chunk of textOnly.split(/\s{2,}|\n/)) {
    const text = chunk.replace(/\s+/g, ' ').trim();
    if (!looksLikeUiEnglish(text)) continue;
    addFinding({
      english: text,
      kind: 'hardcoded_text',
      sourceFile,
      location: 'template',
      note: 'Hardcoded template text',
    });
  }
}

function extractScriptUiLiterals(script, sourceFile) {
  const patterns = [
    /\b(?:label|title|text|message|linkText|emptyText|placeholder)\s*:\s*(['"])([^'"\n]+)\1/g,
  ];

  for (const re of patterns) {
    let match;
    while ((match = re.exec(script)) !== null) {
      const value = match[2].trim();
      if (!looksLikeUiEnglish(value)) continue;
      addFinding({
        english: value,
        kind: 'script_literal',
        sourceFile,
        location: 'script',
        note: 'UI string in script (label/title/text)',
      });
    }
  }

  // English chart/category keys: "New Subscriber":
  const quotedUiRe = /(['"])([A-Z][^'"]{1,80})\1\s*:/g;
  let m;
  while ((m = quotedUiRe.exec(script)) !== null) {
    const value = m[2].trim();
    if (!looksLikeUiEnglish(value)) continue;
    addFinding({
      english: value,
      kind: 'script_object_key',
      sourceFile,
      location: 'script',
      note: 'English object key used as chart/category label',
    });
  }

  // name: 'New Subscriber' style literals with spaces or capitals
  const nameRe = /\bname\s*:\s*(['"])([^'"\n]+)\1/g;
  while ((m = nameRe.exec(script)) !== null) {
    const value = m[2].trim();
    if (!looksLikeUiEnglish(value)) continue;
    if (!/\s/.test(value) && !/^[A-Z]/.test(value)) continue;
    addFinding({
      english: value,
      kind: 'script_name',
      sourceFile,
      location: 'script',
      note: 'name literal (chart series / donut slice)',
    });
  }
}

function scanVueFile(filePath, { allImports, localeRoot, followChrome }) {
  const abs = resolve(filePath);
  if (visitedFiles.has(abs)) return;
  if (!existsSync(abs)) {
    console.warn(`[skip] missing file: ${filePath}`);
    return;
  }
  
  visitedFiles.add(abs);

  const source = readFileSync(abs, 'utf8');
  const { template, scripts } = extractSfcBlocks(source);
  const shouldExtract =
    allImports || followChrome || isAnalyticsRelatedFile(abs);

  if (shouldExtract) {
    if (template) {
      const tpl = stripHtmlComments(template);
      extractI18nCalls(tpl, abs, 'template', localeRoot);
      extractAttrStrings(tpl, abs);
      extractTemplateTextNodes(tpl, abs);
    }
    if (scripts) {
      extractI18nCalls(scripts, abs, 'script', localeRoot);
      extractScriptUiLiterals(scripts, abs);
    }
  }

  for (const child of collectVueImports(source, abs)) {
    // Always walk the graph from the entry; extraction filtered above
    scanVueFile(child, {
      allImports,
      localeRoot,
      followChrome: false,
    });
  }
}

function csvEscape(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function shouldKeepRow(row, allImports) {
  if (allImports) return true;
  if (row.i18nKey && row.i18nKey.startsWith('dashboard.analytics')) return true;
  if (row.sourceFile.toLowerCase().includes('analytics')) return true;
  return false;
}

function writeOutputs(outBase, allImports) {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  let rows = [...findings.values()].filter((r) => shouldKeepRow(r, allImports));

  // Dedupe spreadsheet-friendly: prefer unique english+key
  const dedupe = new Map();
  for (const row of rows) {
    const k = `${row.english.toLowerCase()}|${row.i18nKey}`;
    if (!dedupe.has(k)) dedupe.set(k, row);
  }
  rows = [...dedupe.values()].sort((a, b) => {
    const byEn = a.english.localeCompare(b.english);
    if (byEn !== 0) return byEn;
    return (a.i18nKey || '').localeCompare(b.i18nKey || '');
  });

  const csvHeader = [
    'english_text',
    'i18n_key',
    'kind',
    'source_file',
    'location',
    'note',
  ];

  const csvLines = [
    csvHeader.join(','),
    ...rows.map((r) =>
      [r.english, r.i18nKey, r.kind, r.sourceFile, r.location, r.note]
        .map(csvEscape)
        .join(','),
    ),
  ];

  const csvPath = join(OUTPUT_DIR, `${outBase}.csv`);
  const jsonPath = join(OUTPUT_DIR, `${outBase}.json`);

  writeFileSync(csvPath, `${csvLines.join('\n')}\n`, 'utf8');
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        scope: allImports ? 'all-imports' : 'analytics-focused',
        scannedVueFiles: [...visitedFiles].map((f) =>
          toPosix(relative(projectRoot, f)),
        ),
        totalStrings: rows.length,
        strings: rows,
      },
      null,
      2,
    ),
    'utf8',
  );

  return { csvPath, jsonPath, rows };
}

function main() {
  const { entries, outBase, allImports } = parseArgs(process.argv.slice(2));
  const localeRoot = loadLocaleEnglish();

  console.log('\n=================================');
  console.log('Extract template text strings');
  console.log('=================================\n');
  console.log(`Scope: ${allImports ? 'all imports' : 'analytics-focused'}`);

  for (const entry of entries) {
    const abs = resolve(projectRoot, entry);
    console.log(`Entry: ${toPosix(relative(projectRoot, abs))}`);
    scanVueFile(abs, {
      allImports,
      localeRoot,
      followChrome: true, // extract from entry itself
    });
  }

  const { csvPath, jsonPath, rows } = writeOutputs(outBase, allImports);
  const keyed = rows.filter((r) => r.i18nKey).length;
  const hardcoded = rows.filter((r) => !r.i18nKey).length;

  console.log(`\nScanned Vue files: ${visitedFiles.size}`);
  console.log(`Spreadsheet rows: ${rows.length}`);
  console.log(`  with i18n key: ${keyed}`);
  console.log(`  hardcoded / literal: ${hardcoded}`);
  console.log(`\nCSV:  ${toPosix(relative(projectRoot, csvPath))}`);
  console.log(`JSON: ${toPosix(relative(projectRoot, jsonPath))}\n`);
}

main();
