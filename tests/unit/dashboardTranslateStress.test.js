import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packBatches } from '../../tools/dashboard-translate/batcher.js';
import { SCOPE } from '../../tools/dashboard-translate/config.js';
import { destinationId, sha256Hex } from '../../tools/dashboard-translate/identity.js';
import { buildTranslationStatus } from '../../tools/dashboard-translate/status.js';
import { applyUpdates } from '../../tools/dashboard-translate/updater.js';

function buildEntries(count) {
  const files = ['section-dash/en.json', 'section-dashboard-global/en.json'];
  const entries = [];

  for (let index = 0; index < count; index += 1) {
    const relativeSourceFile = files[index % files.length];
    const sourceText = index % 5 === 0 ? 'Save Changes' : `Label ${index} {name}`;
    const jsonPointer = `/k${index}`;
    const sourceHash = sha256Hex(sourceText);
    entries.push({
      scope: SCOPE,
      relativeSourceFile,
      jsonPointer,
      sourceText,
      sourceHash,
      destinationId: destinationId({
        scope: SCOPE,
        relativeSourceFile,
        jsonPointer,
        sourceHash,
      }),
      ancestorKinds: ['object'],
      status: 'missing',
      targetRelativeFile: relativeSourceFile.replace('/en.json', '/fr.json'),
      targetFileHash: null,
      targetFileMissing: true,
    });
  }

  return entries;
}

function syncIo() {
  return {
    readFileSync,
    writeFileSync,
    mkdirSync,
    existsSync,
    rmSync,
    unlinkSync: rmSync,
    copyFileSync: (from, to) => writeFileSync(to, readFileSync(from)),
    renameSync: (from, to) => {
      writeFileSync(to, readFileSync(from, 'utf8'), 'utf8');
      rmSync(from);
    },
  };
}

describe('dashboard translation stress', () => {
  it('packs and round-trips large fixture sets without a network call', () => {
    const sizes = [100, 1000, 10000, 50000];

    for (const size of sizes) {
      const entries = buildEntries(size);
      expect(new Set(entries.map((entry) => entry.destinationId)).size).toBe(size);

      const duplicated = entries.filter((entry) => entry.sourceText === 'Save Changes');
      expect(new Set(duplicated.map((entry) => entry.destinationId)).size).toBe(duplicated.length);

      const batches = packBatches(entries, 'fr', 800);
      expect(batches.flat()).toHaveLength(size);

      const root = mkdtempSync(join(tmpdir(), 'dash-stress-'));
      const i18nRoot = join(root, 'i18n');
      const scoped = entries.filter((entry) => entry.relativeSourceFile === 'section-dash/en.json');
      const tree = {};
      for (const entry of scoped) {
        tree[entry.jsonPointer.slice(1)] = entry.sourceText;
      }
      mkdirSync(join(i18nRoot, 'section-dash'), { recursive: true });
      writeFileSync(join(i18nRoot, 'section-dash', 'en.json'), `${JSON.stringify(tree, null, 2)}\n`);

      const checkpoint = {
        locale: 'fr',
        entries: Object.fromEntries(scoped.map((entry) => [entry.destinationId, {
          ...entry,
          translation: `«${entry.sourceText}»`,
          status: 'completed',
          locale: 'fr',
          model: 'mock',
        }])),
      };

      const result = applyUpdates({
        checkpoint,
        locale: 'fr',
        i18nRoot,
        io: syncIo(),
        backupDir: join(root, 'backups'),
        dryRun: false,
      });

      expect(result.written).toEqual(['section-dash/fr.json']);
      const french = JSON.parse(readFileSync(join(i18nRoot, 'section-dash', 'fr.json'), 'utf8'));
      for (const entry of scoped) {
        expect(french[entry.jsonPointer.slice(1)]).toBe(`«${entry.sourceText}»`);
      }

      const rescanned = buildTranslationStatus({
        scope: SCOPE,
        sourceLocale: 'en',
        strings: scoped,
      }, i18nRoot, 'fr', new Map(scoped.map((entry) => [`${entry.relativeSourceFile}\n${entry.jsonPointer}`, entry.sourceHash])));
      expect(rescanned.entries.every((entry) => entry.status === 'existing')).toBe(true);
    }
  }, 120000);
});
