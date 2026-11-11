/**
 * Auth for WordPress template iframes embedded inside this app.
 *
 * Those PHP templates used to rely on the WordPress session cookie only, which
 * is dropped in third-party iframe contexts. They now accept the dashboard JWT
 * (same value as `userData.jwtToken`) on the query string as `fs_jwt`, with an
 * optional `uid` + `iframe_nonce` fallback.
 *
 * The token is read from the host page. When this app runs same-origin with the
 * dashboard, `window.parent.userData` is readable directly. In the cross-origin
 * embed (vue build host inside fansocial.app) that read throws, so the host is
 * expected to forward the token on this app's own URL (`?fs_jwt=...`) or to set
 * `window.__fsHostJwt`. Every source is optional: with none of them present the
 * URL is returned untouched, exactly as before.
 */

function toTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getDefaultWindow() {
  return typeof window !== 'undefined' ? window : null;
}

/**
 * Same-origin host windows only. A cross-origin parent throws on property
 * access, which is expected and simply means "no token from this source".
 */
function collectHostWindows(windowRef) {
  const hosts = [windowRef];

  ['parent', 'top', 'opener'].forEach((key) => {
    try {
      const candidate = windowRef?.[key];
      if (candidate && candidate !== windowRef && !hosts.includes(candidate)) {
        hosts.push(candidate);
      }
    } catch {
      // Cross-origin host window — not readable, skip it.
    }
  });

  return hosts;
}

function readHostUserDataValues(windowRef, keys) {
  const values = [];

  collectHostWindows(windowRef).forEach((hostWindow) => {
    let userData = null;
    try {
      userData = hostWindow?.userData || null;
    } catch {
      return;
    }
    if (!userData) return;

    keys.forEach((key) => {
      values.push(userData[key], userData.user?.[key]);
    });
  });

  return values;
}

function readQueryValues(windowRef, keys) {
  let search = '';
  try {
    search = windowRef?.location?.search || '';
  } catch {
    return [];
  }
  if (!search) return [];

  const params = new URLSearchParams(search);
  return keys.map((key) => params.get(key));
}

function firstNonEmpty(values) {
  for (const value of values) {
    const text = toTrimmedString(value);
    if (text) return text;
  }
  return '';
}

/**
 * Dashboard JWT (`userData.jwtToken`) as seen from the host page.
 */
export function resolveHostJwtToken({ windowRef = getDefaultWindow() } = {}) {
  if (!windowRef) return '';

  let injected = '';
  try {
    injected = toTrimmedString(windowRef.__fsHostJwt);
  } catch {
    injected = '';
  }

  return firstNonEmpty([
    injected,
    ...readHostUserDataValues(windowRef, ['jwtToken', 'jwt_token', 'jwt']),
    ...readQueryValues(windowRef, ['fs_jwt', 'jwtToken', 'jwt']),
  ]);
}

/**
 * Optional `uid` + `iframe_nonce` fallback the PHP template accepts when no
 * JWT is available.
 */
export function resolveHostUidFallback({ windowRef = getDefaultWindow() } = {}) {
  if (!windowRef) return { uid: '', iframeNonce: '' };

  const uid = firstNonEmpty([
    ...readHostUserDataValues(windowRef, ['UID', 'uid', 'encryptedUid', 'encrypted_uid']),
    ...readQueryValues(windowRef, ['uid', 'fs_uid']),
  ]);

  const iframeNonce = firstNonEmpty([
    ...readHostUserDataValues(windowRef, ['iframeNonce', 'iframe_nonce']),
    ...readQueryValues(windowRef, ['iframe_nonce', 'iframeNonce']),
  ]);

  return { uid, iframeNonce };
}

/**
 * Adds host auth params to a WordPress iframe URL, preserving any query string
 * it already carries. Returns the input unchanged when nothing is resolvable.
 */
export function buildHostAuthenticatedIframeUrl(baseUrl, { windowRef = getDefaultWindow() } = {}) {
  const url = toTrimmedString(baseUrl);
  if (!url) return '';

  const token = resolveHostJwtToken({ windowRef });
  const fallback = token ? { uid: '', iframeNonce: '' } : resolveHostUidFallback({ windowRef });

  const params = [];
  if (token) params.push(['fs_jwt', token]);
  if (fallback.uid) params.push(['uid', fallback.uid]);
  if (fallback.iframeNonce) params.push(['iframe_nonce', fallback.iframeNonce]);
  if (!params.length) return url;

  try {
    const parsed = new URL(url, windowRef?.location?.href);
    params.forEach(([key, value]) => parsed.searchParams.set(key, value));
    return parsed.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    const query = params
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return `${url}${separator}${query}`;
  }
}
