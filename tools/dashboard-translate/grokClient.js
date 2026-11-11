import { CHAT_COMPLETIONS_URL, DEFAULT_BACKOFF_MS, DEFAULT_MAX_ATTEMPTS, MODEL } from './config.js';
import { batchIdFor } from './batcher.js';
import { validateTranslationResponse } from './validator.js';

const LIVE_FLAG = 'DASHBOARD_TRANSLATE_ALLOW_LIVE';

/**
 * @param {string} message
 * @param {string[]} secrets
 * @returns {string}
 */
export function redactSecrets(message, secrets) {
  let output = String(message);
  for (const secret of secrets) {
    if (secret && secret.length > 0) {
      output = output.split(secret).join('[REDACTED]');
    }
  }
  return output;
}

/**
 * @param {object[]} entries
 * @param {string} locale
 * @returns {{ system: string, user: string }}
 */
export function buildMessages(entries, locale) {
  const items = entries.map((entry) => ({
    id: entry.destinationId,
    text: entry.sourceText,
    context: entry.relativeSourceFile.split('/')[0],
  }));

  return {
    system: [
      'You translate dashboard UI strings.',
      'Return strict JSON with this shape: {"locale":"<locale>","batchId":"<batchId>","translations":{"<id>":"<text>"}}.',
      'Use only the ids you were given. Do not invent ids or file paths.',
      'Preserve placeholders (%s, %d, {name}, {0}, {{variable}}, {\'@\'}), HTML tags, entities, URLs, brand names, and line breaks exactly.',
    ].join(' '),
    user: JSON.stringify({
      locale,
      batchId: batchIdFor(locale, entries.map((entry) => entry.destinationId)),
      items,
    }),
  };
}

/**
 * @param {number} attempt
 * @param {number} baseMs
 * @returns {number}
 */
export function backoffMs(attempt, baseMs = DEFAULT_BACKOFF_MS) {
  return baseMs * (2 ** Math.max(0, attempt - 1));
}

/**
 * @param {number} status
 * @returns {boolean}
 */
export function isRetryableStatus(status) {
  return status === 429 || status >= 500;
}

/**
 * Live transport. Refuses to run unless the operator opts in.
 * The API key is read from the environment and is never returned or logged.
 *
 * @param {object} request
 * @param {{ fetchImpl?: typeof fetch, timeoutMs?: number }} [options]
 */
export async function liveChatTransport(request, options = {}) {
  if (process.env[LIVE_FLAG] !== '1') {
    throw new Error(`Live Grok calls are disabled. Set ${LIVE_FLAG}=1 only for an approved sample.`);
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error('XAI_API_KEY is not set.');
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 60_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model || MODEL,
        temperature: 0,
        messages: [
          { role: 'system', content: request.system },
          { role: 'user', content: request.user },
        ],
      }),
      signal: controller.signal,
    });

    const bodyText = await response.text();
    if (!response.ok) {
      const error = new Error(`Grok HTTP ${response.status}`);
      error.status = response.status;
      error.retryable = isRetryableStatus(response.status);
      error.body = redactSecrets(bodyText, [apiKey]).slice(0, 500);
      throw error;
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      const error = new Error('Grok response was not JSON');
      error.status = response.status;
      error.retryable = true;
      throw error;
    }

    return {
      status: response.status,
      content: payload?.choices?.[0]?.message?.content ?? '',
      usage: {
        promptTokens: payload?.usage?.prompt_tokens ?? 0,
        completionTokens: payload?.usage?.completion_tokens ?? 0,
      },
    };
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeout = new Error('Grok request timed out');
      timeout.retryable = true;
      timeout.status = 0;
      throw timeout;
    }

    if (error instanceof Error && (error.status != null || error.retryable != null)) {
      error.message = redactSecrets(error.message, [apiKey]);
      throw error;
    }

    const network = new Error('Grok network error');
    network.retryable = true;
    network.status = 0;
    throw network;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * @param {object} options
 * @returns {Promise<object>}
 */
export async function translateEntries(options) {
  const {
    entries,
    locale,
    transport,
    model = MODEL,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    backoffBaseMs = DEFAULT_BACKOFF_MS,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    now = () => new Date().toISOString(),
    checkpoint = emptyCheckpoint(locale),
  } = options;

  const pending = entries.filter((entry) => {
    const current = checkpoint.entries[entry.destinationId];
    return !current || current.status !== 'completed' || current.sourceHash !== entry.sourceHash;
  });

  const sourcesById = new Map(entries.map((entry) => [entry.destinationId, entry.sourceText]));
  const entryById = new Map(entries.map((entry) => [entry.destinationId, entry]));

  for (const batch of options.batches) {
    const batchEntries = batch.filter((entry) => pending.some((item) => item.destinationId === entry.destinationId));
    if (batchEntries.length === 0) {
      continue;
    }

    const batchId = batchIdFor(locale, batchEntries.map((entry) => entry.destinationId));
    const messages = buildMessages(batchEntries, locale);
    let attempt = 0;
    let done = false;

    while (!done && attempt < maxAttempts) {
      attempt += 1;
      try {
        const response = await transport({
          ...messages,
          model,
          batchId,
          destinationIds: batchEntries.map((entry) => entry.destinationId),
        });

        checkpoint.usage.promptTokens += response.usage?.promptTokens ?? 0;
        checkpoint.usage.completionTokens += response.usage?.completionTokens ?? 0;
        checkpoint.usage.requests += 1;

        const validated = validateTranslationResponse(response.content, {
          locale,
          batchId,
          expectedIds: batchEntries.map((entry) => entry.destinationId),
          sourcesById,
        });

        const retryableRejection = validated.accepted.length === 0
          && validated.rejected.every((item) => item.reason === 'malformed_json' || item.reason === 'incomplete_batch');

        for (const item of validated.accepted) {
          const source = entryById.get(item.destinationId);
          checkpoint.entries[item.destinationId] = completedRecord(source, item.translation, {
            locale,
            model,
            batchId,
            now: now(),
          });
        }

        if (validated.accepted.length === batchEntries.length) {
          done = true;
          break;
        }

        if (retryableRejection && attempt < maxAttempts) {
          await sleep(backoffMs(attempt, backoffBaseMs));
          continue;
        }

        for (const item of validated.rejected) {
          if (checkpoint.entries[item.destinationId]?.status === 'completed') {
            continue;
          }
          const source = entryById.get(item.destinationId);
          checkpoint.entries[item.destinationId] = failedRecord(source, item.reason, {
            locale,
            model,
            batchId,
            attempt,
            now: now(),
          });
        }

        checkpoint.rejections.push({
          batchId,
          unknownIds: validated.unknownIds,
          duplicateIds: validated.duplicateIds,
          at: now(),
        });
        done = true;
      } catch (error) {
        const retryable = error?.retryable === true || isRetryableStatus(error?.status);
        checkpoint.usage.requests += 1;
        if (retryable && attempt < maxAttempts) {
          await sleep(backoffMs(attempt, backoffBaseMs));
          continue;
        }

        for (const source of batchEntries) {
          if (checkpoint.entries[source.destinationId]?.status === 'completed') {
            continue;
          }
          checkpoint.entries[source.destinationId] = failedRecord(
            source,
            redactSecrets(error instanceof Error ? error.message : 'transport_error', []),
            { locale, model, batchId, attempt, now: now() },
          );
        }
        done = true;
      }
    }

    if (typeof options.onCheckpoint === 'function') {
      options.onCheckpoint(checkpoint);
    }

    if (options.maxBatches && checkpoint.usage.requests >= options.maxBatches) {
      break;
    }
  }

  return checkpoint;
}

/**
 * @param {string} locale
 */
export function emptyCheckpoint(locale) {
  return {
    version: 1,
    locale,
    model: MODEL,
    entries: {},
    rejections: [],
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      requests: 0,
    },
  };
}

/**
 * @param {object} source
 * @param {string} translation
 * @param {object} meta
 */
function completedRecord(source, translation, meta) {
  return {
    destinationId: source.destinationId,
    sourceHash: source.sourceHash,
    sourceText: source.sourceText,
    relativeSourceFile: source.relativeSourceFile,
    jsonPointer: source.jsonPointer,
    ancestorKinds: source.ancestorKinds,
    targetRelativeFile: source.targetRelativeFile,
    targetFileHash: source.targetFileHash ?? null,
    targetFileMissing: source.targetFileMissing === true,
    allowOverwrite: source.status === 'source_changed',
    locale: meta.locale,
    translation,
    model: meta.model,
    batchId: meta.batchId,
    status: 'completed',
    updatedAt: meta.now,
  };
}

/**
 * @param {object} source
 * @param {string} reason
 * @param {object} meta
 */
function failedRecord(source, reason, meta) {
  return {
    destinationId: source.destinationId,
    sourceHash: source.sourceHash,
    sourceText: source.sourceText,
    relativeSourceFile: source.relativeSourceFile,
    jsonPointer: source.jsonPointer,
    ancestorKinds: source.ancestorKinds,
    targetRelativeFile: source.targetRelativeFile,
    targetFileHash: source.targetFileHash ?? null,
    targetFileMissing: source.targetFileMissing === true,
    locale: meta.locale,
    translation: null,
    model: meta.model,
    batchId: meta.batchId,
    status: 'failed',
    reason,
    attempts: meta.attempt,
    updatedAt: meta.now,
  };
}
