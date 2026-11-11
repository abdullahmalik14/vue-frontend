import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { buildMessages, liveChatTransport, redactSecrets, translateEntries } from '../../tools/dashboard-translate/grokClient.js';
import { destinationId, sha256Hex } from '../../tools/dashboard-translate/identity.js';
import { buildSourceInventory, collectSourceStrings, targetFileFor } from '../../tools/dashboard-translate/inventory.js';
import { scanDashboard, translateMissing } from '../../tools/dashboard-translate/pipeline.js';
import { applyUpdates } from '../../tools/dashboard-translate/updater.js';
import { validateTranslationResponse } from '../../tools/dashboard-translate/validator.js';
import { buildTranslationStatus, selectTranslatable } from '../../tools/dashboard-translate/status.js';
import { estimateBatchCost } from '../../tools/dashboard-translate/cost.js';
import { DASHBOARD_SECTION_DIRS } from '../../tools/dashboard-translate/config.js';

const projectRoot = join(import.meta.dirname, '../..');

function writeJson(path, value) {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function tempRoot() {
  return mkdtempSync(join(tmpdir(), 'dash-i18n-'));
}

function dashboardFixture(root, files) {
  const i18nRoot = join(root, 'i18n');
  for (const dir of DASHBOARD_SECTION_DIRS) {
    writeJson(join(i18nRoot, dir, 'en.json'), files[dir] ?? { unused: 'Unused' });
  }
  return i18nRoot;
}

function sourceEntry(relativeSourceFile, tree, pointer, status = 'missing') {
  const { records } = collectSourceStrings(tree);
  const record = records.find((item) => item.jsonPointer === pointer);
  const sourceHash = sha256Hex(record.sourceText);
  return {
    scope: 'dashboard',
    relativeSourceFile,
    jsonPointer: pointer,
    sourceText: record.sourceText,
    sourceHash,
    destinationId: destinationId({
      scope: 'dashboard',
      relativeSourceFile,
      jsonPointer: pointer,
      sourceHash,
    }),
    ancestorKinds: record.ancestorKinds,
    status,
    targetRelativeFile: targetFileFor(relativeSourceFile, 'fr'),
    targetFileHash: null,
    targetFileMissing: true,
  };
}

function successBody(locale, batchId, items, mutate) {
  const translations = {};
  for (const item of items) {
    translations[item.id] = `«${item.text}»`;
  }
  if (mutate) {
    mutate(translations, items);
  }
  return {
    status: 200,
    content: JSON.stringify({ locale, batchId, translations }),
    usage: { promptTokens: 10, completionTokens: 8 },
  };
}

function nodeIo(overrides = {}) {
  return {
    readFileSync,
    writeFileSync,
    mkdirSync,
    copyFileSync: (from, to) => writeFileSync(to, readFileSync(from)),
    renameSync: (from, to) => {
      writeFileSync(to, readFileSync(from));
      rmSync(from);
    },
    unlinkSync: (path) => rmSync(path),
    rmSync,
    existsSync,
    ...overrides,
  };
}

describe('dashboard translation identity and matching', () => {
  it('keeps duplicate strings and separate files on distinct ids', () => {
    const tree = {
      settings: { save: 'Save Changes' },
      profile: { save: 'Save Changes', note: 'Hello, {0}!' },
    };
    const first = sourceEntry('section-dash/en.json', tree, '/settings/save');
    const second = sourceEntry('section-dash/en.json', tree, '/profile/save');
    const otherFile = sourceEntry('section-dashboard-global/en.json', { save: 'Save Changes' }, '/save');

    expect(first.destinationId).not.toBe(second.destinationId);
    expect(first.destinationId).not.toBe(otherFile.destinationId);
    expect(first.destinationId).toBe(sourceEntry('section-dash/en.json', tree, '/settings/save').destinationId);

    const changed = sourceEntry('section-dash/en.json', { settings: { save: 'Save now' } }, '/settings/save');
    expect(changed.destinationId).not.toBe(first.destinationId);
  });

  it('walks nested objects, arrays, unicode, html, and placeholders', () => {
    const tree = {
      items: ['Café', 'Say "hi"'],
      block: { html: 'CLAIM<br>OFFER', lines: 'one\ntwo', link: 'See https://example.com/a?b=1' },
      empty: '',
    };
    const { records } = collectSourceStrings(tree);
    const byPointer = new Map(records.map((record) => [record.jsonPointer, record.sourceText]));

    expect(byPointer.get('/items/0')).toBe('Café');
    expect(byPointer.get('/items/1')).toBe('Say "hi"');
    expect(byPointer.get('/block/html')).toContain('<br>');
    expect(byPointer.get('/block/lines')).toContain('\n');
    expect(byPointer.get('/empty')).toBe('');
    expect(sourceEntry('section-dash/en.json', tree, '/block/link').protectedTokens).toBeUndefined();
    const link = records.find((record) => record.jsonPointer === '/block/link');
    expect(link.sourceText).toContain('https://example.com/a?b=1');
  });

  it('matches only the same file and pointer, and treats fallback as unfinished', () => {
    const root = tempRoot();
    const i18nRoot = dashboardFixture(root, {
      'section-dash': { save: 'Save Changes', greet: 'Hello, {0}!' },
      'section-dashboard-global': { save: 'Save Changes' },
    });
    writeJson(join(i18nRoot, 'section-dashboard-global', 'fr.json'), { save: 'Enregistrer' });
    writeJson(join(i18nRoot, 'section-dash', 'fr.json'), { save: '   ', greet: { bad: true } });

    const inventory = buildSourceInventory(i18nRoot);
    const status = buildTranslationStatus(inventory, i18nRoot, 'fr', new Map());
    const dashSave = status.entries.find((entry) => entry.relativeSourceFile === 'section-dash/en.json' && entry.jsonPointer === '/save');
    const globalSave = status.entries.find((entry) => entry.relativeSourceFile === 'section-dashboard-global/en.json' && entry.jsonPointer === '/save');
    const greet = status.entries.find((entry) => entry.jsonPointer === '/greet');

    expect(dashSave.status).toBe('empty_invalid');
    expect(globalSave.status).toBe('needs_review');
    expect(greet.status).toBe('structure_mismatch');
    expect(selectTranslatable(status).some((entry) => entry.destinationId === globalSave.destinationId)).toBe(false);
    expect(selectTranslatable(status).some((entry) => entry.destinationId === dashSave.destinationId)).toBe(true);
  });

  it('scans the real dashboard without treating Vietnamese as French', () => {
    const root = tempRoot();
    const scanned = scanDashboard({
      i18nRoot: join(projectRoot, 'public', 'i18n'),
      outputDir: join(root, 'out'),
      locale: 'fr',
      ledgerPath: join(root, 'ledger.json'),
      generatedAt: '2026-01-01T00:00:00.000Z',
    });

    expect(scanned.inventory.files.map((file) => file.relativeSourceFile)).toEqual([
      'section-dash/en.json',
      'section-dashboard-creator/en.json',
      'section-dashboard-fan/en.json',
      'section-dashboard-global/en.json',
    ]);
    expect(scanned.summary.counts.missing).toBe(scanned.summary.counts.englishStrings);
    expect(scanned.summary.counts.englishStrings).toBeGreaterThan(100);
    expect(scanned.inventory.strings.some((entry) => entry.relativeSourceFile.includes('section-auth'))).toBe(false);
    expect(scanned.inventory.strings.some((entry) => entry.relativeSourceFile.includes('section-misc'))).toBe(false);

    const creator = scanned.inventory.files.find((file) => file.relativeSourceFile === 'section-dashboard-creator/en.json');
    const fan = scanned.inventory.files.find((file) => file.relativeSourceFile === 'section-dashboard-fan/en.json');
    expect(creator.stringCount).toBe(7);
    expect(fan.stringCount).toBe(6);

    const welcome = scanned.inventory.strings.find((entry) => entry.jsonPointer === '/auth/login/welcome');
    expect(welcome.protectedTokens).toContain('{0}');

    const vietnamese = buildTranslationStatus(
      scanned.inventory,
      join(projectRoot, 'public', 'i18n'),
      'vi',
      new Map(),
    );
    expect(vietnamese.entries.some((entry) => entry.status === 'needs_review')).toBe(true);
    expect(vietnamese.entries.some((entry) => entry.status === 'existing')).toBe(false);
  });
});

describe('dashboard translation mock API', () => {
  it('validates success, partial, duplicate, locale, placeholders, and unsafe html', () => {
    const sources = new Map([
      ['a'.repeat(64), 'Hello, {0}!'],
      ['b'.repeat(64), 'Save'],
    ]);
    const expected = {
      locale: 'fr',
      batchId: 'b_test',
      expectedIds: [...sources.keys()],
      sourcesById: sources,
    };

    const ok = validateTranslationResponse(JSON.stringify({
      locale: 'fr',
      batchId: 'b_test',
      translations: {
        ['a'.repeat(64)]: 'Bonjour, {0}!',
        ['b'.repeat(64)]: 'Enregistrer',
      },
    }), expected);
    expect(ok.accepted).toHaveLength(2);

    const partial = validateTranslationResponse(JSON.stringify({
      locale: 'fr',
      batchId: 'b_test',
      translations: { ['b'.repeat(64)]: 'Enregistrer' },
    }), expected);
    expect(partial.rejected.map((item) => item.reason)).toContain('incomplete_batch');

    const duplicate = validateTranslationResponse(
      `{"locale":"fr","batchId":"b_test","translations":{"${'a'.repeat(64)}":"Bonjour, {0}!","${'a'.repeat(64)}":"Bonjour, {0}!","${'b'.repeat(64)}":"Enregistrer"}}`,
      expected,
    );
    expect(duplicate.duplicateIds).toContain('a'.repeat(64));
    expect(duplicate.accepted.map((item) => item.destinationId)).not.toContain('a'.repeat(64));

    const wrongLocale = validateTranslationResponse(JSON.stringify({
      locale: 'vi',
      batchId: 'b_test',
      translations: {},
    }), expected);
    expect(wrongLocale.rejected[0].reason).toBe('wrong_locale');

    const broken = validateTranslationResponse(JSON.stringify({
      locale: 'fr',
      batchId: 'b_test',
      translations: {
        ['a'.repeat(64)]: 'Bonjour, {1}!',
        ['b'.repeat(64)]: 'Enregistrer',
      },
    }), expected);
    expect(broken.rejected.find((item) => item.destinationId === 'a'.repeat(64)).reason).toBe('protected_token_mismatch');

    const unsafe = validateTranslationResponse(JSON.stringify({
      locale: 'fr',
      batchId: 'b_test',
      translations: {
        ['a'.repeat(64)]: 'Hello, {0}! <script>alert(1)</script>',
        ['b'.repeat(64)]: 'Save',
      },
    }), expected);
    expect(unsafe.rejected.find((item) => item.destinationId === 'a'.repeat(64)).reason).toBe('script_tag');

    const malformed = validateTranslationResponse('not-json', expected);
    expect(malformed.rejected[0].reason).toBe('malformed_json');
  });

  it('does not send file paths and retries only failed transport calls', async () => {
    const tree = { save: 'Save Changes', greet: 'Hello, {0}!' };
    const entries = [
      sourceEntry('section-dash/en.json', tree, '/save'),
      sourceEntry('section-dash/en.json', tree, '/greet'),
    ];
    const messages = buildMessages(entries, 'fr');
    expect(messages.user).not.toContain('.json');
    expect(messages.user).not.toContain('public/i18n');
    expect(messages.system).not.toContain('section-dash/fr.json');

    const sleeps = [];
    let calls = 0;
    const checkpoint = await translateEntries({
      entries,
      batches: [entries],
      locale: 'fr',
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      now: () => '2026-01-01T00:00:00.000Z',
      transport: async (request) => {
        calls += 1;
        if (calls === 1) {
          const error = new Error('Grok HTTP 429');
          error.status = 429;
          error.retryable = true;
          throw error;
        }
        const payload = JSON.parse(request.user);
        return successBody('fr', payload.batchId, payload.items);
      },
    });

    expect(calls).toBe(2);
    expect(sleeps).toEqual([400]);
    expect(Object.values(checkpoint.entries).every((entry) => entry.status === 'completed')).toBe(true);
  });

  it('resumes without resending completed ids', async () => {
    const entries = [0, 1, 2].map((index) => sourceEntry(
      'section-dash/en.json',
      { [`item${index}`]: `Label ${index}` },
      `/item${index}`,
    ));
    const seen = [];
    const root = tempRoot();
    const checkpointPath = join(root, 'checkpoint.json');

    await translateMissing({
      statusReport: { locale: 'fr', entries },
      locale: 'fr',
      checkpointPath,
      maxInputTokens: 1,
      maxBatches: 1,
      model: 'mock',
      sleep: async () => {},
      now: () => '2026-01-01T00:00:00.000Z',
      transport: async (request) => {
        const payload = JSON.parse(request.user);
        seen.push(payload.items.map((item) => item.id));
        return successBody('fr', payload.batchId, payload.items);
      },
    });

    await translateMissing({
      statusReport: { locale: 'fr', entries },
      locale: 'fr',
      checkpointPath,
      maxInputTokens: 1,
      model: 'mock',
      sleep: async () => {},
      now: () => '2026-01-01T00:00:00.000Z',
      transport: async (request) => {
        const payload = JSON.parse(request.user);
        seen.push(payload.items.map((item) => item.id));
        return successBody('fr', payload.batchId, payload.items);
      },
    });

    const flat = seen.flat();
    expect(new Set(flat).size).toBe(flat.length);
    expect(flat).toHaveLength(3);
    expect(estimateBatchCost(entries, 'fr').verifiedAgainstAccount).toBe(false);
  });

  it('keeps the API key out of errors and does not call fetch unless live is enabled', async () => {
    const fetchImpl = vi.fn();
    const previousFlag = process.env.DASHBOARD_TRANSLATE_ALLOW_LIVE;
    const previousKey = process.env.XAI_API_KEY;
    delete process.env.DASHBOARD_TRANSLATE_ALLOW_LIVE;
    process.env.XAI_API_KEY = 'unit-test-secret';

    try {
      await expect(liveChatTransport({ system: 's', user: 'u' }, { fetchImpl })).rejects.toThrow(/disabled/);
      expect(fetchImpl).not.toHaveBeenCalled();

      process.env.DASHBOARD_TRANSLATE_ALLOW_LIVE = '1';
      fetchImpl.mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'bad unit-test-secret',
      });
      await expect(liveChatTransport({ system: 's', user: 'u' }, { fetchImpl })).rejects.toThrow(/401/);
      await expect(liveChatTransport({ system: 's', user: 'u' }, { fetchImpl })).rejects.not.toThrow(/unit-test-secret/);
      expect(redactSecrets('unit-test-secret leaked', ['unit-test-secret'])).toBe('[REDACTED] leaked');
    } finally {
      if (previousFlag == null) {
        delete process.env.DASHBOARD_TRANSLATE_ALLOW_LIVE;
      } else {
        process.env.DASHBOARD_TRANSLATE_ALLOW_LIVE = previousFlag;
      }
      if (previousKey == null) {
        delete process.env.XAI_API_KEY;
      } else {
        process.env.XAI_API_KEY = previousKey;
      }
    }
  });
});

describe('dashboard translation updates', () => {
  it('writes only the approved id and leaves the other file untouched', () => {
    const root = tempRoot();
    const i18nRoot = join(root, 'i18n');
    const dashTree = { save: 'Save Changes' };
    const globalTree = { save: 'Save Changes' };
    writeJson(join(i18nRoot, 'section-dash', 'en.json'), dashTree);
    writeJson(join(i18nRoot, 'section-dashboard-global', 'en.json'), globalTree);
    writeJson(join(i18nRoot, 'section-dashboard-creator', 'en.json'), { keep: 'Keep me' });
    const untouched = readFileSync(join(i18nRoot, 'section-dashboard-creator', 'en.json'), 'utf8');

    const dash = sourceEntry('section-dash/en.json', dashTree, '/save');
    const global = sourceEntry('section-dashboard-global/en.json', globalTree, '/save');
    const checkpoint = {
      locale: 'fr',
      entries: {
        [global.destinationId]: {
          ...global,
          translation: 'Enregistrer',
          status: 'completed',
          locale: 'fr',
          model: 'grok-3-mini',
        },
      },
    };

    const dry = applyUpdates({
      checkpoint,
      locale: 'fr',
      i18nRoot,
      io: nodeIo(),
      backupDir: join(root, 'backups'),
      dryRun: true,
    });
    expect(dry.changes).toHaveLength(1);
    expect(existsSync(join(i18nRoot, 'section-dashboard-global', 'fr.json'))).toBe(false);

    const applied = applyUpdates({
      checkpoint,
      locale: 'fr',
      i18nRoot,
      io: nodeIo(),
      backupDir: join(root, 'backups'),
      dryRun: false,
    });
    expect(applied.written).toEqual(['section-dashboard-global/fr.json']);
    expect(JSON.parse(readFileSync(join(i18nRoot, 'section-dashboard-global', 'fr.json'), 'utf8')).save).toBe('Enregistrer');
    expect(existsSync(join(i18nRoot, 'section-dash', 'fr.json'))).toBe(false);
    expect(readFileSync(join(i18nRoot, 'section-dashboard-creator', 'en.json'), 'utf8')).toBe(untouched);

    const second = applyUpdates({
      checkpoint,
      locale: 'fr',
      i18nRoot,
      io: nodeIo(),
      backupDir: join(root, 'backups-2'),
      dryRun: false,
    });
    expect(second.written).toEqual([]);
    expect(dash.destinationId).not.toBe(global.destinationId);
  });

  it('rolls back when the source hash changed or a later file write fails', () => {
    const root = tempRoot();
    const i18nRoot = join(root, 'i18n');
    writeJson(join(i18nRoot, 'section-dash', 'en.json'), { save: 'Save Changes' });
    const entry = sourceEntry('section-dash/en.json', { save: 'Save Changes' }, '/save');
    writeJson(join(i18nRoot, 'section-dash', 'en.json'), { save: 'Save Changes now' });

    const blocked = applyUpdates({
      checkpoint: {
        locale: 'fr',
        entries: {
          [entry.destinationId]: { ...entry, translation: 'Enregistrer', status: 'completed', locale: 'fr' },
        },
      },
      locale: 'fr',
      i18nRoot,
      io: nodeIo(),
      backupDir: join(root, 'backups'),
      dryRun: false,
    });
    expect(blocked.blocked.some((item) => item.reason === 'source_hash_mismatch')).toBe(true);
    expect(existsSync(join(i18nRoot, 'section-dash', 'fr.json'))).toBe(false);

    writeJson(join(i18nRoot, 'section-dash', 'en.json'), { save: 'Save Changes' });
    writeJson(join(i18nRoot, 'section-dashboard-fan', 'en.json'), { title: 'Fan' });
    const fan = sourceEntry('section-dashboard-fan/en.json', { title: 'Fan' }, '/title');
    const failingIo = nodeIo({
      writeFileSync: (path, data, encoding) => {
        if (String(path).includes('section-dashboard-fan') && String(path).endsWith('.tmp')) {
          const error = new Error('disk full');
          error.code = 'ENOSPC';
          throw error;
        }
        writeFileSync(path, data, encoding);
      },
    });

    expect(() => applyUpdates({
      checkpoint: {
        locale: 'fr',
        entries: {
          [entry.destinationId]: { ...entry, translation: 'Enregistrer', status: 'completed', locale: 'fr' },
          [fan.destinationId]: { ...fan, translation: 'Fan fr', status: 'completed', locale: 'fr' },
        },
      },
      locale: 'fr',
      i18nRoot,
      io: failingIo,
      backupDir: join(root, 'backups'),
      dryRun: false,
    })).toThrow(/disk full/);
    expect(existsSync(join(i18nRoot, 'section-dash', 'fr.json'))).toBe(false);
    expect(existsSync(join(i18nRoot, 'section-dashboard-fan', 'fr.json'))).toBe(false);
  });

  it('refuses a target file that changed after the scan', () => {
    const root = tempRoot();
    const i18nRoot = join(root, 'i18n');
    writeJson(join(i18nRoot, 'section-dash', 'en.json'), { save: 'Save Changes' });
    const originalFrench = `${JSON.stringify({ other: 'Laisser' }, null, 2)}\n`;
    writeFileSync(join(i18nRoot, 'section-dash', 'fr.json'), originalFrench);
    const entry = sourceEntry('section-dash/en.json', { save: 'Save Changes' }, '/save', 'missing');
    entry.targetFileMissing = false;
    entry.targetFileHash = sha256Hex(originalFrench);
    writeFileSync(join(i18nRoot, 'section-dash', 'fr.json'), `${JSON.stringify({ other: 'Changé' }, null, 2)}\n`);

    const result = applyUpdates({
      checkpoint: {
        locale: 'fr',
        entries: {
          [entry.destinationId]: { ...entry, translation: 'Enregistrer', status: 'completed', locale: 'fr' },
        },
      },
      locale: 'fr',
      i18nRoot,
      io: nodeIo(),
      backupDir: join(root, 'backups'),
      dryRun: false,
    });

    expect(result.blocked.some((item) => item.reason === 'target_changed')).toBe(true);
    expect(JSON.parse(readFileSync(join(i18nRoot, 'section-dash', 'fr.json'), 'utf8')).other).toBe('Changé');
  });
});
