import { createAuth0Client } from '@auth0/auth0-spa-js';
import { log } from '@/infrastructure/logging/logHandler.js';

let auth0ClientPromise = null;

function getRedirectUri() {
  if (import.meta.env.VITE_AUTH0_REDIRECT_URI) {
    return import.meta.env.VITE_AUTH0_REDIRECT_URI;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  return undefined;
}

export function isAuth0Configured() {
  return Boolean(import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID);
}

export function getAuth0Config() {
  return {
    domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
    authorizationParams: {
      redirect_uri: getRedirectUri(),
      audience: import.meta.env.VITE_AUTH0_AUDIENCE || undefined,
    },
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
  };
}

export async function getAuth0Client() {
  if (!isAuth0Configured()) {
    throw new Error('Auth0 is not configured. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID.');
  }

  if (!auth0ClientPromise) {
    auth0ClientPromise = createAuth0Client(getAuth0Config()).catch((error) => {
      auth0ClientPromise = null;
      log('auth0Utilities.js', 'getAuth0Client', 'error', 'Failed to create Auth0 client', {
        error: error?.message,
      });
      throw error;
    });
  }

  return auth0ClientPromise;
}

export async function resetAuth0Client() {
  auth0ClientPromise = null;
}

/**
 * Resource Owner Password Grant for embedded login forms.
 * Requires Password grant enabled on the Auth0 application.
 */
export async function loginWithPassword(email, password) {
  const { domain, clientId, authorizationParams } = getAuth0Config();
  const audience = authorizationParams?.audience;

  const body = new URLSearchParams({
    grant_type: 'password',
    username: email,
    password,
    client_id: clientId,
    scope: 'openid profile email offline_access',
  });

  if (audience) {
    body.set('audience', audience);
  }

  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error_description || payload.error || 'Auth0 login failed';
    throw new Error(message);
  }

  return {
    idToken: payload.id_token,
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in,
  };
}

export async function refreshAuth0Tokens(refreshToken) {
  const { domain, clientId } = getAuth0Config();

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error_description || payload.error || 'Auth0 token refresh failed';
    throw new Error(message);
  }

  return {
    idToken: payload.id_token,
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || refreshToken,
    expiresIn: payload.expires_in,
  };
}

export async function signupWithPassword(email, password) {
  const { domain, clientId } = getAuth0Config();
  const connection = import.meta.env.VITE_AUTH0_DB_CONNECTION || 'Username-Password-Authentication';

  const response = await fetch(`https://${domain}/dbconnections/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      email,
      password,
      connection,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.description || payload.message || payload.error || 'Auth0 signup failed';
    throw new Error(message);
  }

  return payload;
}

export async function sendPasswordResetEmail(email) {
  const { domain, clientId } = getAuth0Config();
  const connection = import.meta.env.VITE_AUTH0_DB_CONNECTION || 'Username-Password-Authentication';

  const response = await fetch(`https://${domain}/dbconnections/change_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      email,
      connection,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.description || payload.message || payload.error || 'Auth0 password reset failed';
    throw new Error(message);
  }

  return true;
}

/**
 * Auth0 database signup auto-login after registration when email verification is optional/disabled.
 */
export async function loginAfterSignup(email, password) {
  return loginWithPassword(email, password);
}

/**
 * Redirect to Auth0 Universal Login for a social connection.
 *
 * @param {string} connection - Auth0 connection name (e.g. twitter, google-oauth2)
 * @param {{ intent?: string, provider?: string, returnTo?: string }} [options]
 */
export async function loginWithSocialConnection(connection, options = {}) {
  const client = await getAuth0Client();
  const intent = options.intent || 'login';
  const provider = options.provider || connection;
  const returnTo = options.returnTo || '/dashboard';

  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('auth0_social_intent', intent);
    sessionStorage.setItem('auth0_social_provider', provider);
  }

  await client.loginWithRedirect({
    authorizationParams: {
      connection,
    },
    appState: {
      returnTo,
      intent,
      provider,
    },
  });
}
