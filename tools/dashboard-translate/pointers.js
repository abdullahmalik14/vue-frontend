/**
 * JSON Pointer helpers (RFC 6901) for translation trees.
 */

/**
 * @param {string} segment
 * @returns {string}
 */
export function escapePointerSegment(segment) {
  return String(segment).replace(/~/g, '~0').replace(/\//g, '~1');
}

/**
 * @param {string} segment
 * @returns {string}
 */
export function unescapePointerSegment(segment) {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

/**
 * @param {string} pointer
 * @returns {string[]}
 */
export function parsePointer(pointer) {
  if (pointer === '' || pointer === '/') {
    return [];
  }

  if (!pointer.startsWith('/')) {
    throw new Error(`Invalid JSON pointer: ${pointer}`);
  }

  return pointer.slice(1).split('/').map(unescapePointerSegment);
}

/**
 * @param {unknown} root
 * @param {string} pointer
 * @returns {{ found: boolean, value: unknown }}
 */
export function getAtPointer(root, pointer) {
  const segments = parsePointer(pointer);
  let node = root;

  for (const segment of segments) {
    if (Array.isArray(node)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= node.length) {
        return { found: false, value: undefined };
      }
      node = node[index];
      continue;
    }

    if (!node || typeof node !== 'object' || !Object.prototype.hasOwnProperty.call(node, segment)) {
      return { found: false, value: undefined };
    }

    node = node[segment];
  }

  return { found: true, value: node };
}

/**
 * @param {unknown} root
 * @param {string} pointer
 * @param {unknown} value
 * @param {Array<'object'|'array'>} ancestorKinds
 */
export function setAtPointer(root, pointer, value, ancestorKinds) {
  const segments = parsePointer(pointer);

  if (segments.length === 0) {
    throw new Error('Cannot replace the translation root');
  }

  let node = root;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    const kind = ancestorKinds[index + 1] === 'array' ? 'array' : 'object';
    const existing = Array.isArray(node) ? node[Number(segment)] : node[segment];

    if (existing == null || typeof existing !== 'object') {
      const created = kind === 'array' ? [] : {};
      if (Array.isArray(node)) {
        node[Number(segment)] = created;
      } else {
        node[segment] = created;
      }
      node = created;
      continue;
    }

    node = existing;
  }

  const leaf = segments[segments.length - 1];
  if (Array.isArray(node)) {
    node[Number(leaf)] = value;
    return;
  }

  node[leaf] = value;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}
