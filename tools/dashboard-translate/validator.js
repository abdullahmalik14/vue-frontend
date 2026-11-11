import { protectedTokenMismatch, unsafeMarkupReason } from './placeholders.js';

/**
 * @param {string} text
 * @returns {string}
 */
export function stripJsonFence(text) {
  return String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

/**
 * Pull the raw translations object so duplicate keys are still visible.
 *
 * @param {string} jsonText
 * @returns {string}
 */
export function extractRawTranslationsObject(jsonText) {
  const marker = '"translations"';
  const start = jsonText.indexOf(marker);
  if (start < 0) {
    throw new Error('translations field missing');
  }

  let index = start + marker.length;
  while (index < jsonText.length && /\s/.test(jsonText[index])) {
    index += 1;
  }
  if (jsonText[index] !== ':') {
    throw new Error('translations colon missing');
  }
  index += 1;
  while (index < jsonText.length && /\s/.test(jsonText[index])) {
    index += 1;
  }

  const begin = index;
  if (jsonText[index] !== '{') {
    throw new Error('translations object missing');
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (; index < jsonText.length; index += 1) {
    const char = jsonText[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return jsonText.slice(begin, index + 1);
      }
    }
  }

  throw new Error('unterminated translations object');
}

/**
 * @param {string} jsonText
 * @returns {string[]}
 */
export function topLevelKeys(jsonText) {
  const source = jsonText.trim();
  if (!source.startsWith('{') || !source.endsWith('}')) {
    throw new Error('translations payload is not a JSON object');
  }

  let index = 1;
  const keys = [];

  const skipWhitespace = () => {
    while (index < source.length && /\s/.test(source[index])) {
      index += 1;
    }
  };

  const readString = () => {
    if (source[index] !== '"') {
      throw new Error('expected string');
    }

    index += 1;
    let value = '';

    while (index < source.length) {
      const char = source[index];
      if (char === '\\') {
        const next = source[index + 1];
        if (next === 'u') {
          const hex = source.slice(index + 2, index + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
            throw new Error('bad unicode escape');
          }
          value += String.fromCharCode(Number.parseInt(hex, 16));
          index += 6;
          continue;
        }

        const escaped = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' }[next];
        if (escaped == null) {
          throw new Error('unsupported escape');
        }
        value += escaped;
        index += 2;
        continue;
      }

      if (char === '"') {
        index += 1;
        return value;
      }

      value += char;
      index += 1;
    }

    throw new Error('unterminated string');
  };

  const skipValue = () => {
    skipWhitespace();
    const char = source[index];

    if (char === '"') {
      readString();
      return;
    }

    if (char === '{') {
      let depth = 0;
      do {
        if (source[index] === '"') {
          readString();
          continue;
        }
        if (source[index] === '{') depth += 1;
        if (source[index] === '}') depth -= 1;
        index += 1;
      } while (depth > 0 && index < source.length);
      return;
    }

    if (char === '[') {
      let depth = 0;
      do {
        if (source[index] === '"') {
          readString();
          continue;
        }
        if (source[index] === '[') depth += 1;
        if (source[index] === ']') depth -= 1;
        index += 1;
      } while (depth > 0 && index < source.length);
      return;
    }

    while (index < source.length && !/[,\}\]]/.test(source[index])) {
      index += 1;
    }
  };

  while (index < source.length) {
    skipWhitespace();
    if (source[index] === '}') {
      break;
    }
    if (source[index] === ',') {
      index += 1;
      continue;
    }

    const key = readString();
    skipWhitespace();
    if (source[index] !== ':') {
      throw new Error('expected colon');
    }
    index += 1;
    keys.push(key);
    skipValue();
  }

  return keys;
}

/**
 * @param {string} rawContent
 * @param {{ locale: string, batchId: string, expectedIds: string[], sourcesById: Map<string, string> }} expected
 * @returns {{ accepted: object[], rejected: object[], unknownIds: string[], duplicateIds: string[] }}
 */
export function validateTranslationResponse(rawContent, expected) {
  const rejected = [];
  const accepted = [];
  let parsed;

  try {
    parsed = JSON.parse(stripJsonFence(rawContent));
  } catch (error) {
    return {
      accepted,
      rejected: expected.expectedIds.map((id) => ({
        destinationId: id,
        reason: 'malformed_json',
        detail: error instanceof Error ? error.message : 'malformed_json',
      })),
      unknownIds: [],
      duplicateIds: [],
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return failAll(expected.expectedIds, 'response_not_object');
  }

  if (parsed.locale !== expected.locale) {
    return failAll(expected.expectedIds, 'wrong_locale');
  }

  if (parsed.batchId != null && parsed.batchId !== expected.batchId) {
    return failAll(expected.expectedIds, 'wrong_batch');
  }

  const translations = parsed.translations;
  if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return failAll(expected.expectedIds, 'missing_translations_object');
  }

  let rawKeys = [];
  try {
    const translationsJson = extractRawTranslationsObject(stripJsonFence(rawContent));
    rawKeys = topLevelKeys(translationsJson);
  } catch {
    rawKeys = Object.keys(translations);
  }

  const seen = new Set();
  const duplicateIds = [];
  for (const key of rawKeys) {
    if (seen.has(key)) {
      duplicateIds.push(key);
    }
    seen.add(key);
  }

  const unknownIds = [...seen].filter((id) => !expected.sourcesById.has(id));
  const expectedSet = new Set(expected.expectedIds);

  for (const id of expected.expectedIds) {
    if (duplicateIds.includes(id)) {
      rejected.push({ destinationId: id, reason: 'duplicate_id' });
      continue;
    }

    if (!Object.prototype.hasOwnProperty.call(translations, id)) {
      rejected.push({ destinationId: id, reason: 'incomplete_batch' });
      continue;
    }

    const value = translations[id];
    if (typeof value !== 'string' || value.trim() === '') {
      rejected.push({ destinationId: id, reason: 'invalid_string' });
      continue;
    }

    const unsafe = unsafeMarkupReason(value);
    if (unsafe) {
      rejected.push({ destinationId: id, reason: unsafe });
      continue;
    }

    const tokenError = protectedTokenMismatch(expected.sourcesById.get(id), value);
    if (tokenError) {
      rejected.push({ destinationId: id, reason: tokenError });
      continue;
    }

    if (!expectedSet.has(id)) {
      rejected.push({ destinationId: id, reason: 'unexpected_id' });
      continue;
    }

    accepted.push({ destinationId: id, translation: value });
  }

  return { accepted, rejected, unknownIds, duplicateIds };
}

/**
 * @param {string[]} ids
 * @param {string} reason
 */
function failAll(ids, reason) {
  return {
    accepted: [],
    rejected: ids.map((destinationId) => ({ destinationId, reason })),
    unknownIds: [],
    duplicateIds: [],
  };
}
