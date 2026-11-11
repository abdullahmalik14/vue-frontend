import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  DASHBOARD_SECTION_DIRS,
  SCOPE,
  SOURCE_LOCALE,
  isDashboardSectionDir,
} from './config.js';
import { destinationId, sha256Hex, toPosixPath } from './identity.js';
import { escapePointerSegment } from './pointers.js';
import { extractProtectedTokens } from './placeholders.js';

/**
 * @param {unknown} value
 * @returns {'array'|'object'|'string'|'null'|'number'|'boolean'|'other'}
 */
export function valueKind(value) {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  const kind = typeof value;
  if (kind === 'string' || kind === 'number' || kind === 'boolean' || kind === 'object') {
    return kind;
  }

  return 'other';
}

/**
 * @param {unknown} value
 * @param {string} pointer
 * @param {Array<'object'|'array'>} ancestorKinds
 * @param {Array<object>} records
 * @param {Array<object>} structureIssues
 */
function walkSource(value, pointer, ancestorKinds, records, structureIssues) {
  if (typeof value === 'string') {
    records.push({
      jsonPointer: pointer,
      sourceText: value,
      ancestorKinds: [...ancestorKinds],
    });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkSource(item, `${pointer}/${index}`, [...ancestorKinds, 'array'], records, structureIssues);
    });
    return;
  }

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      walkSource(
        value[key],
        `${pointer}/${escapePointerSegment(key)}`,
        [...ancestorKinds, 'object'],
        records,
        structureIssues,
      );
    }
    return;
  }

  if (pointer !== '') {
    structureIssues.push({
      jsonPointer: pointer,
      reason: 'non_string_leaf',
      kind: valueKind(value),
    });
  }
}

/**
 * @param {unknown} tree
 * @returns {{ records: Array<object>, structureIssues: Array<object> }}
 */
export function collectSourceStrings(tree) {
  const records = [];
  const structureIssues = [];
  walkSource(tree, '', [], records, structureIssues);
  return { records, structureIssues };
}

/**
 * @param {string} i18nRoot
 * @returns {string[]}
 */
export function listDashboardSourceFiles(i18nRoot) {
  if (!existsSync(i18nRoot)) {
    throw new Error(`i18n root does not exist: ${i18nRoot}`);
  }

  const found = [];

  for (const entry of readdirSync(i18nRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !isDashboardSectionDir(entry.name)) {
      continue;
    }

    const relativeSourceFile = toPosixPath(join(entry.name, `${SOURCE_LOCALE}.json`));
    const absolute = join(i18nRoot, entry.name, `${SOURCE_LOCALE}.json`);
    if (!existsSync(absolute)) {
      throw new Error(`Missing dashboard English file: ${relativeSourceFile}`);
    }

    found.push(relativeSourceFile);
  }

  const expected = DASHBOARD_SECTION_DIRS.map((dir) => `${dir}/${SOURCE_LOCALE}.json`);
  const missingDirs = expected.filter((file) => !found.includes(file));
  if (missingDirs.length > 0) {
    throw new Error(`Dashboard English files not found: ${missingDirs.join(', ')}`);
  }

  return expected;
}

/**
 * @param {string} relativeSourceFile
 * @param {string} locale
 * @returns {string}
 */
export function targetFileFor(relativeSourceFile, locale) {
  const sectionDir = relativeSourceFile.split('/')[0];
  if (!isDashboardSectionDir(sectionDir)) {
    throw new Error(`Refusing path outside dashboard scope: ${relativeSourceFile}`);
  }

  return `${sectionDir}/${locale}.json`;
}

/**
 * @param {string} i18nRoot
 * @param {string} relativeFile
 * @returns {{ tree: unknown, raw: string, hash: string } | { error: string, raw: null, hash: null, tree: null }}
 */
export function readJsonFile(i18nRoot, relativeFile) {
  const absolute = join(i18nRoot, ...relativeFile.split('/'));

  if (!existsSync(absolute)) {
    return { missing: true, tree: null, raw: null, hash: null, error: null };
  }

  const raw = readFileSync(absolute, 'utf8');
  const hash = sha256Hex(raw);

  try {
    return { missing: false, tree: JSON.parse(raw), raw, hash, error: null };
  } catch (error) {
    return {
      missing: false,
      tree: null,
      raw,
      hash,
      error: error instanceof Error ? error.message : 'malformed_json',
    };
  }
}

/**
 * @param {string} i18nRoot
 * @returns {object}
 */
export function buildSourceInventory(i18nRoot) {
  const files = [];
  const strings = [];
  const fileErrors = [];

  for (const relativeSourceFile of listDashboardSourceFiles(i18nRoot)) {
    const loaded = readJsonFile(i18nRoot, relativeSourceFile);
    const fileStat = statSync(join(i18nRoot, ...relativeSourceFile.split('/')));

    if (loaded.error || !loaded.tree || typeof loaded.tree !== 'object' || Array.isArray(loaded.tree)) {
      fileErrors.push({
        relativeSourceFile,
        reason: loaded.error || 'root_not_object',
      });
      files.push({
        relativeSourceFile,
        sha256: loaded.hash,
        bytes: fileStat.size,
        stringCount: 0,
      });
      continue;
    }

    const { records, structureIssues } = collectSourceStrings(loaded.tree);

    for (const record of records) {
      const sourceHash = sha256Hex(record.sourceText);
      strings.push({
        scope: SCOPE,
        relativeSourceFile,
        jsonPointer: record.jsonPointer,
        sourceText: record.sourceText,
        sourceHash,
        destinationId: destinationId({
          scope: SCOPE,
          relativeSourceFile,
          jsonPointer: record.jsonPointer,
          sourceHash,
        }),
        ancestorKinds: record.ancestorKinds,
        protectedTokens: extractProtectedTokens(record.sourceText),
      });
    }

    files.push({
      relativeSourceFile,
      sha256: loaded.hash,
      bytes: fileStat.size,
      stringCount: records.length,
      structureIssues,
    });
  }

  const ids = new Set();
  for (const entry of strings) {
    if (ids.has(entry.destinationId)) {
      throw new Error(`Destination id collision: ${entry.destinationId}`);
    }
    ids.add(entry.destinationId);
  }

  return {
    scope: SCOPE,
    sourceLocale: SOURCE_LOCALE,
    files,
    fileErrors,
    strings,
  };
}
