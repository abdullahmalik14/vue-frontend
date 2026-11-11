const TOKEN_PATTERNS = [
  /\{\{[^{}]+\}\}/g,
  /\{[^{}]+\}/g,
  /%%/g,
  /%(?:\d+\$)?[sdif]/g,
  /<\/?[a-zA-Z][^>\n]*>/g,
  /https?:\/\/[^\s"'<>]+/g,
  /&(?:#\d+|#x[0-9a-fA-F]+|[a-zA-Z]+);/g,
];

/**
 * Tokens that must survive translation: placeholders, tags, URLs, entities, printf.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function extractProtectedTokens(text) {
  if (typeof text !== 'string' || text.length === 0) {
    return [];
  }

  const tokens = [];

  for (const pattern of TOKEN_PATTERNS) {
    const found = text.match(pattern);
    if (found) {
      tokens.push(...found);
    }
  }

  return tokens.sort();
}

/**
 * @param {string} source
 * @param {string} translation
 * @returns {string|null}
 */
export function protectedTokenMismatch(source, translation) {
  const sourceTokens = extractProtectedTokens(source);
  const translatedTokens = extractProtectedTokens(translation);

  if (sourceTokens.length !== translatedTokens.length) {
    return 'protected_token_count';
  }

  for (let index = 0; index < sourceTokens.length; index += 1) {
    if (sourceTokens[index] !== translatedTokens[index]) {
      return 'protected_token_mismatch';
    }
  }

  const sourceBreaks = source.match(/\n/g)?.length ?? 0;
  const translatedBreaks = translation.match(/\n/g)?.length ?? 0;
  if (sourceBreaks !== translatedBreaks) {
    return 'line_break_mismatch';
  }

  return null;
}

/**
 * @param {string} translation
 * @returns {string|null}
 */
export function unsafeMarkupReason(translation) {
  if (/<\s*script\b/i.test(translation)) {
    return 'script_tag';
  }

  if (/\son[a-z]+\s*=/i.test(translation)) {
    return 'inline_event_handler';
  }

  if (/javascript\s*:/i.test(translation)) {
    return 'javascript_url';
  }

  return null;
}
