/**
 * IndexedDB helpers for media-uploader library blobs.
 * localStorage cannot hold multiple data: URLs — media bytes live here.
 */

const DB_NAME = 'media-uploader-library';
const DB_VERSION = 1;
const STORE_NAME = 'media';

export const MEDIA_REF_PREFIX = 'idb-media://';

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

function openDb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('indexedDB unavailable'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error || new Error('idb open failed'));
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }
  return dbPromise;
}

export function mediaRefKey(itemId, field) {
  return `${MEDIA_REF_PREFIX}${itemId}/${field}`;
}

export function isMediaRef(url) {
  return typeof url === 'string' && url.startsWith(MEDIA_REF_PREFIX);
}

export function parseMediaRef(url) {
  if (!isMediaRef(url)) return null;
  const rest = url.slice(MEDIA_REF_PREFIX.length);
  const slash = rest.indexOf('/');
  if (slash <= 0) return null;
  return {
    itemId: rest.slice(0, slash),
    field: rest.slice(slash + 1),
  };
}

export function isHeavyMediaUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:')) return true;
  if (url.startsWith('blob:')) return true;
  return url.length > 2048;
}

function idbRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('idb request failed'));
  });
}

export async function idbSetMedia(itemId, field, value) {
  if (!itemId || !field || value == null) return;
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await idbRequest(store.put(value, `${itemId}:${field}`));
}

export async function idbGetMedia(itemId, field) {
  if (!itemId || !field) return null;
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const result = await idbRequest(store.get(`${itemId}:${field}`));
  return result ?? null;
}

export async function idbDeleteMediaForItem(itemId) {
  if (!itemId) return;
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await Promise.all([
    idbRequest(store.delete(`${itemId}:video`)),
    idbRequest(store.delete(`${itemId}:poster`)),
  ]);
}

/**
 * Persist heavy media URLs for one library item into IndexedDB.
 * Returns lightweight URL fields suitable for localStorage.
 */
export async function persistLibraryItemMedia(item) {
  if (!item?.id) return item;

  const next = { ...item };
  const tasks = [];

  if (isHeavyMediaUrl(item.videoUrl)) {
    const value = item.videoUrl;
    tasks.push(
      idbSetMedia(item.id, 'video', value).then(() => {
        next.videoUrl = mediaRefKey(item.id, 'video');
      }),
    );
  }

  if (isHeavyMediaUrl(item.poster)) {
    if (item.poster === item.videoUrl) {
      // Same bytes as video — reuse video key (ensure video task also ran, or write once).
      if (!isHeavyMediaUrl(item.videoUrl)) {
        tasks.push(idbSetMedia(item.id, 'video', item.poster));
      }
      next.poster = mediaRefKey(item.id, 'video');
    } else {
      const value = item.poster;
      tasks.push(
        idbSetMedia(item.id, 'poster', value).then(() => {
          next.poster = mediaRefKey(item.id, 'poster');
        }),
      );
    }
  }

  await Promise.all(tasks);
  return next;
}

/**
 * Resolve idb-media:// refs (and leave normal URLs as-is) for display after hydrate.
 */
export async function hydrateLibraryItemMedia(item) {
  if (!item?.id) return item;
  const next = { ...item };

  async function resolveField(field) {
    const current = next[field];
    if (!isMediaRef(current)) return;
    const parsed = parseMediaRef(current);
    if (!parsed) return;
    try {
      const stored = await idbGetMedia(parsed.itemId, parsed.field);
      if (typeof stored === 'string' && stored) {
        next[field] = stored;
      }
    } catch (error) {
      console.warn('[media-idb] hydrate failed', parsed, error);
    }
  }

  await Promise.all([resolveField('videoUrl'), resolveField('poster')]);
  return next;
}

export async function hydrateLibraryItemsMedia(items) {
  if (!Array.isArray(items) || !items.length) return items || [];
  return Promise.all(items.map((item) => hydrateLibraryItemMedia(item)));
}
