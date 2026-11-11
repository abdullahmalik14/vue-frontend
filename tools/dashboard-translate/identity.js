import { createHash } from 'node:crypto';

/**
 * @param {string} value
 * @returns {string}
 */
export function sha256Hex(value) {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/**
 * Length-prefix a field so concatenated identities cannot collide.
 *
 * @param {string} value
 * @returns {string}
 */
export function encodeField(value) {
  const text = String(value);
  return `${Buffer.byteLength(text, 'utf8')}:${text}`;
}

/**
 * Destination id covers scope, file, JSON pointer, and source text.
 * A hash of the English text alone is not unique.
 *
 * @param {{ scope: string, relativeSourceFile: string, jsonPointer: string, sourceHash: string }} parts
 * @returns {string}
 */
export function destinationId(parts) {
  const canonical = [
    encodeField(parts.scope),
    encodeField(parts.relativeSourceFile),
    encodeField(parts.jsonPointer),
    encodeField(parts.sourceHash),
  ].join('\n');

  return sha256Hex(canonical);
}

/**
 * @param {string} relativePath
 * @returns {string}
 */
export function toPosixPath(relativePath) {
  return relativePath.replace(/\\/g, '/');
}
