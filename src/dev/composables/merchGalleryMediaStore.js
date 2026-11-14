/**
 * IndexedDB store for merch gallery dataUrls.
 * localStorage keeps card metadata (and may strip heavy media on quota);
 * this store keeps full gallery so Edit → Gallery still shows images.
 */

const DB_NAME = 'merchLibraryMedia';
const DB_VERSION = 1;
const STORE_NAME = 'galleries';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error || new Error('indexedDB open failed'));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function normalizeGallery(galleryUploaded = []) {
  if (!Array.isArray(galleryUploaded)) return [];
  return galleryUploaded
    .map((entry) => {
      const dataUrl = entry?.dataUrl || (!String(entry?.objectUrl || '').startsWith('blob:')
        ? (entry?.objectUrl || '')
        : '');
      if (!dataUrl) return null;
      return {
        id: entry?.id || '',
        name: entry?.name || '',
        dataUrl,
        objectUrl: dataUrl,
      };
    })
    .filter(Boolean);
}

export async function saveMerchGallery(itemId, galleryUploaded) {
  if (!itemId) return;
  const gallery = normalizeGallery(galleryUploaded);
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('gallery save failed'));
      tx.objectStore(STORE_NAME).put({ id: itemId, gallery, updatedAt: Date.now() });
    });
    db.close();
  } catch (err) {
    console.warn('[merchGalleryMediaStore] save failed', err);
  }
}

export async function loadMerchGallery(itemId) {
  if (!itemId) return [];
  try {
    const db = await openDb();
    const row = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      tx.onerror = () => reject(tx.error || new Error('gallery load failed'));
      const req = tx.objectStore(STORE_NAME).get(itemId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error || new Error('gallery get failed'));
    });
    db.close();
    return Array.isArray(row?.gallery) ? row.gallery : [];
  } catch (err) {
    console.warn('[merchGalleryMediaStore] load failed', err);
    return [];
  }
}

export async function deleteMerchGallery(itemId) {
  if (!itemId) return;
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('gallery delete failed'));
      tx.objectStore(STORE_NAME).delete(itemId);
    });
    db.close();
  } catch (err) {
    console.warn('[merchGalleryMediaStore] delete failed', err);
  }
}

export function galleryHasMedia(galleryUploaded) {
  return (Array.isArray(galleryUploaded) ? galleryUploaded : []).some(
    (entry) => Boolean(entry?.dataUrl || (entry?.objectUrl && !String(entry.objectUrl).startsWith('blob:'))),
  );
}
