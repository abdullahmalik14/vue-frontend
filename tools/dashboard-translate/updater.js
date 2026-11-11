import { dirname, join } from 'node:path';
import { getAtPointer, setAtPointer, stableStringify } from './pointers.js';
import { sha256Hex } from './identity.js';
import { isDashboardSectionDir } from './config.js';

/**
 * @param {string} relativeFile
 */
export function assertDashboardTarget(relativeFile) {
  const [sectionDir, fileName] = relativeFile.split('/');
  if (!sectionDir || !fileName || relativeFile.split('/').length !== 2) {
    throw new Error(`Refusing unexpected target path: ${relativeFile}`);
  }

  if (!isDashboardSectionDir(sectionDir)) {
    throw new Error(`Refusing path outside dashboard scope: ${relativeFile}`);
  }

  if (!/^[a-z]{2}(?:-[a-z]{2})?\.json$/.test(fileName) || fileName === 'en.json') {
    throw new Error(`Refusing to write a non-target locale file: ${relativeFile}`);
  }
}

/**
 * @param {object} options
 * @returns {object}
 */
export function planUpdates(options) {
  const { checkpoint, i18nRoot, io, locale } = options;
  const changes = [];
  const blocked = [];
  const byFile = new Map();

  for (const record of Object.values(checkpoint.entries)) {
    if (record.status !== 'completed' || record.locale !== locale) {
      continue;
    }

    assertDashboardTarget(record.targetRelativeFile);

    if (!byFile.has(record.targetRelativeFile)) {
      const absolute = absoluteTarget(i18nRoot, record.targetRelativeFile);
      const exists = io.existsSync(absolute);
      const raw = exists ? io.readFileSync(absolute, 'utf8') : null;
      byFile.set(record.targetRelativeFile, {
        relativeFile: record.targetRelativeFile,
        absolute,
        existed: exists,
        beforeHash: raw == null ? null : sha256Hex(raw),
        beforeRaw: raw,
        tree: raw == null ? {} : JSON.parse(raw),
        writes: [],
      });
    }

    const filePlan = byFile.get(record.targetRelativeFile);
    if (record.targetFileMissing && filePlan.existed) {
      blocked.push({ destinationId: record.destinationId, reason: 'target_appeared' });
      continue;
    }

    if (!record.targetFileMissing && record.targetFileHash && filePlan.beforeHash !== record.targetFileHash) {
      blocked.push({ destinationId: record.destinationId, reason: 'target_changed' });
      continue;
    }

    const current = getAtPointer(filePlan.tree, record.jsonPointer);
    if (current.found && current.value === record.translation) {
      continue;
    }

    if (current.found && typeof current.value === 'string' && current.value.trim() !== '' && current.value !== record.translation) {
      const allowed = recordAllowsOverwrite(record);
      if (!allowed) {
        blocked.push({ destinationId: record.destinationId, reason: 'existing_value' });
        continue;
      }
    }

    setAtPointer(filePlan.tree, record.jsonPointer, record.translation, record.ancestorKinds);
    filePlan.writes.push({
      destinationId: record.destinationId,
      jsonPointer: record.jsonPointer,
      before: current.found ? current.value : null,
      after: record.translation,
    });
    changes.push({
      destinationId: record.destinationId,
      targetRelativeFile: record.targetRelativeFile,
      jsonPointer: record.jsonPointer,
      before: current.found ? current.value : null,
      after: record.translation,
    });
  }

  const files = [...byFile.values()].filter((file) => file.writes.length > 0);
  return { changes, blocked, files };
}

/**
 * Completed rows store the scan-time target hash. Overwrite is allowed only when
 * the scanned value was missing, empty, or a trusted source-hash change.
 *
 * @param {object} record
 * @returns {boolean}
 */
function recordAllowsOverwrite(record) {
  return record.allowOverwrite === true;
}

/**
 * The English hash check uses the source text stored on the record, re-read from disk.
 *
 * @param {object} io
 * @param {string} i18nRoot
 * @param {string} relativeSourceFile
 */
function readEnglishText(io, i18nRoot, relativeSourceFile, jsonPointer, englishTrees) {
  const absolute = absoluteTarget(i18nRoot, relativeSourceFile);
  if (!englishTrees.has(absolute)) {
    englishTrees.set(absolute, JSON.parse(io.readFileSync(absolute, 'utf8')));
  }
  const tree = englishTrees.get(absolute);
  const lookedUp = getAtPointer(tree, jsonPointer);
  if (!lookedUp.found || typeof lookedUp.value !== 'string') {
    return null;
  }
  return lookedUp.value;
}

function absoluteTarget(i18nRoot, relativeFile) {
  return join(i18nRoot, ...relativeFile.split('/'));
}

/**
 * @param {object} options
 */
export function applyUpdates(options) {
  const { i18nRoot, io, backupDir, dryRun } = options;
  const englishChecked = planWithEnglish(options);
  if (dryRun) {
    return {
      dryRun: true,
      changes: englishChecked.changes,
      blocked: englishChecked.blocked,
      written: [],
    };
  }

  const written = [];

  try {
    for (const file of englishChecked.files) {
      const nextText = stableStringify(file.tree);
      JSON.parse(nextText);
      io.mkdirSync(dirname(file.absolute), { recursive: true });

      if (file.existed) {
        io.mkdirSync(backupDir, { recursive: true });
        io.copyFileSync(file.absolute, join(backupDir, file.relativeFile.replace(/\//g, '__')));
      }

      const tempPath = `${file.absolute}.tmp`;
      const rollback = {
        relativeFile: file.relativeFile,
        beforeRaw: file.beforeRaw,
        absolute: file.absolute,
        tempPath,
      };

      try {
        io.writeFileSync(tempPath, nextText, 'utf8');
        JSON.parse(io.readFileSync(tempPath, 'utf8'));
        if (io.existsSync(file.absolute)) {
          io.rmSync(file.absolute);
        }
        io.renameSync(tempPath, file.absolute);
        written.push(rollback);
      } catch (fileError) {
        restoreFile(io, rollback);
        throw fileError;
      }
    }
  } catch (error) {
    for (const file of written) {
      restoreFile(io, file);
    }
    throw error;
  }

  return {
    dryRun: false,
    changes: englishChecked.changes,
    blocked: englishChecked.blocked,
    written: written.map((file) => file.relativeFile),
  };
}

/**
 * Re-read English text so a stale in-memory tree cannot approve a changed source.
 *
 * @param {object} options
 */
function planWithEnglish(options) {
  const { checkpoint, i18nRoot, io } = options;
  const englishTrees = new Map();
  const patched = {
    ...checkpoint,
    entries: {},
  };

  for (const [id, record] of Object.entries(checkpoint.entries)) {
    if (record.status !== 'completed') {
      patched.entries[id] = record;
      continue;
    }

    const text = readEnglishText(io, i18nRoot, record.relativeSourceFile, record.jsonPointer, englishTrees);
    if (text == null || sha256Hex(text) !== record.sourceHash) {
      patched.entries[id] = { ...record, status: 'blocked', reason: 'source_hash_mismatch' };
      continue;
    }

    patched.entries[id] = record;
  }

  const plan = planUpdates({ ...options, checkpoint: patched });
  for (const record of Object.values(patched.entries)) {
    if (record.status === 'blocked') {
      plan.blocked.push({ destinationId: record.destinationId, reason: record.reason });
    }
  }
  return plan;
}

/**
 * @param {object} io
 * @param {{ absolute: string, beforeRaw: string|null, tempPath: string }} file
 */
function restoreFile(io, file) {
  if (file.beforeRaw == null) {
    if (io.existsSync(file.absolute)) {
      io.rmSync(file.absolute);
    }
  } else {
    io.writeFileSync(file.absolute, file.beforeRaw, 'utf8');
  }

  if (io.existsSync(file.tempPath)) {
    io.unlinkSync(file.tempPath);
  }
}

/**
 * @param {object} checkpoint
 * @param {object[]} inventoryStrings
 * @returns {object[]}
 */
export function ledgerRowsFromCheckpoint(checkpoint, inventoryStrings) {
  const byId = new Map(inventoryStrings.map((entry) => [entry.destinationId, entry]));
  const rows = [];

  for (const record of Object.values(checkpoint.entries)) {
    if (record.status !== 'completed') {
      continue;
    }
    const source = byId.get(record.destinationId);
    if (!source) {
      continue;
    }
    rows.push({
      relativeSourceFile: source.relativeSourceFile,
      jsonPointer: source.jsonPointer,
      sourceHash: source.sourceHash,
      destinationId: source.destinationId,
    });
  }

  return rows;
}
