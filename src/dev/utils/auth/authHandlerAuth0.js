import { jwtDecode } from 'jwt-decode';
import { log } from '@/infrastructure/logging/logHandler.js';
import {
  getAuth0Client,
  isAuth0Configured,
  loginWithPassword,
  loginAfterSignup,
  loginWithSocialConnection,
  refreshAuth0Tokens,
  sendPasswordResetEmail,
  signupWithPassword,
} from './auth0Utilities.js';
import { getAuth0ClaimNamespace } from './auth0ClaimMapper.js';
import { normalizeProfileAttributes } from './authProfileAttributes.js';
import { getAuth0ConnectionForProvider } from './authSocialConfig.js';

let pendingTokens = null;

function persistTokens({ idToken, accessToken, refreshToken }) {
  if (idToken) localStorage.setItem('idToken', idToken);
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

function clearPersistedTokens() {
  localStorage.removeItem('idToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

function mapAttributesToMetadata(attributes = {}) {
  const normalized = normalizeProfileAttributes(attributes);
  const ns = getAuth0ClaimNamespace();
  const metadata = {};

  if (normalized.role !== undefined) metadata[`${ns}role`] = normalized.role;
  if (normalized.username !== undefined) metadata[`${ns}username`] = normalized.username;
  if (normalized.onboardingPassed !== undefined) {
    metadata[`${ns}onboarding_passed`] = !!normalized.onboardingPassed;
  }
  if (normalized.kycPassed !== undefined) {
    metadata[`${ns}kyc_passed`] = !!normalized.kycPassed;
  }
  if (normalized.preferredLocale !== undefined) {
    metadata[`${ns}preferred_locale`] = normalized.preferredLocale;
  }

  // Legacy custom:* metadata keys for compatibility during migration
  if (normalized.role !== undefined) metadata['custom:role'] = normalized.role;
  if (normalized.username !== undefined) metadata['custom:username'] = normalized.username;
  if (normalized.kycPassed !== undefined) {
    metadata['custom:kyc'] = normalized.kycPassed ? 'true' : 'false';
  }
  if (normalized.onboardingPassed !== undefined) {
    metadata['custom:onboardingPassed'] = normalized.onboardingPassed ? 'true' : 'false';
  }
  if (normalized.preferredLocale !== undefined) {
    metadata['custom:preferred_locale'] = normalized.preferredLocale;
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith('custom:') && metadata[key] === undefined) {
      metadata[key] = value;
    }
  }

  return metadata;
}

async function authenticateUser(email, password) {
  if (!isAuth0Configured()) {
    throw new Error('Auth0 is not configured');
  }

  log('authHandlerAuth0.js', 'login', 'start', 'Auth0 password login', { email });

  const tokens = await loginWithPassword(email, password);
  persistTokens(tokens);
  pendingTokens = tokens;

  log('authHandlerAuth0.js', 'login', 'success', 'Auth0 login complete', { email });
  return tokens;
}

async function registerNewUser(email, password, attributes = {}) {
  if (!isAuth0Configured()) {
    throw new Error('Auth0 is not configured');
  }

  log('authHandlerAuth0.js', 'register', 'start', 'Auth0 signup', { email });
  const result = await signupWithPassword(email, password);

  if (Object.keys(attributes).length > 0) {
    try {
      await updateUserProfile(mapAttributesToMetadata(attributes));
    } catch (error) {
      log('authHandlerAuth0.js', 'register', 'metadata-warn', 'Signup succeeded but metadata update failed', {
        error: error?.message,
      });
    }
  }

  log('authHandlerAuth0.js', 'register', 'success', 'Auth0 signup complete', { email });
  return { ...result, email, requiresEmailVerification: true };
}

async function confirmUserSignup(email, code) {
  if (!isAuth0Configured()) {
    throw new Error('Auth0 is not configured');
  }

  // Auth0 default database flow verifies via email link. If tenant allows login before verify,
  // attempt login so the app can continue into onboarding.
  if (!code) {
    throw new Error('Please verify your email using the link sent to your inbox.');
  }

  log('authHandlerAuth0.js', 'confirmSignUp', 'start', 'Auth0 post-signup confirmation', { email });

  try {
    const tokens = await loginAfterSignup(email, code);
    persistTokens(tokens);
    pendingTokens = tokens;
    return { success: true, ...tokens };
  } catch (error) {
    throw new Error(
      error?.message ||
        'Email verification is link-based for Auth0. Open the link in your email, then log in.',
    );
  }
}

async function resendConfirmationCode(email) {
  if (!isAuth0Configured()) {
    throw new Error('Auth0 is not configured');
  }

  await sendPasswordResetEmail(email);
  return { success: true, email };
}

async function initiatePasswordReset(email) {
  log('authHandlerAuth0.js', 'forgotPassword', 'start', 'Auth0 password reset email', { email });
  await sendPasswordResetEmail(email);
  return { success: true };
}

async function confirmPasswordReset(email, code, newPassword) {
  if (!isAuth0Configured()) {
    throw new Error('Auth0 is not configured');
  }

  // Auth0 database connections reset via emailed link/ticket, not OTP on this page.
  if (code) {
    throw new Error(
      'Password reset for Auth0 is completed from the link in your email. Open that link, then log in with your new password.',
    );
  }

  log('authHandlerAuth0.js', 'confirmPassword', 'info', 'Auth0 uses email-link password reset', { email });
  return { success: true, email, usesEmailLink: true };
}

async function changeUserPassword(oldPassword, newPassword) {
  if (!isAuth0Configured()) {
    throw new Error('Auth0 is not configured');
  }

  if (!newPassword) {
    throw new Error('New password is required');
  }

  const accessToken = localStorage.getItem('accessToken');
  const idToken = localStorage.getItem('idToken');

  if (!accessToken) {
    throw new Error('No access token available for password change');
  }

  let email = '';
  if (idToken) {
    try {
      const decoded = jwtDecode(idToken);
      email = decoded.email || decoded.sub || '';
    } catch (error) {
      log('authHandlerAuth0.js', 'changePassword', 'decode-warn', 'Could not decode id token for email', {
        error: error?.message,
      });
    }
  }

  const isInitialPasswordSet = !oldPassword;

  if (!isInitialPasswordSet) {
    if (!email) {
      throw new Error('Unable to verify current password without a signed-in email');
    }

    try {
      await loginWithPassword(email, oldPassword);
    } catch (error) {
      throw new Error('Incorrect current password');
    }
  }

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;

  const response = await fetch(`https://${domain}/api/v2/users/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: newPassword }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.message || payload.error || 'Failed to change Auth0 password';
    throw new Error(message);
  }

  if (isInitialPasswordSet) {
    try {
      await updateUserProfile({ 'custom:password_source': 'user' });
    } catch (error) {
      log('authHandlerAuth0.js', 'changePassword', 'metadata-warn', 'Password changed but metadata update failed', {
        error: error?.message,
      });
    }
  }

  log('authHandlerAuth0.js', 'changePassword', 'success', 'Auth0 password changed');
  return true;
}

async function updateUserProfile(attributes = {}) {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token available for profile update');
  }

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const metadata = mapAttributesToMetadata(attributes);

  const response = await fetch(`https://${domain}/api/v2/users/me`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_metadata: metadata,
      app_metadata: metadata,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload.message || payload.error || 'Failed to update Auth0 user profile';
    throw new Error(message);
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      const tokens = await refreshAuth0Tokens(refreshToken);
      persistTokens(tokens);
      pendingTokens = tokens;
    } catch (error) {
      log('authHandlerAuth0.js', 'updateProfileAttributes', 'refresh-warn', 'Metadata updated but token refresh failed', {
        error: error?.message,
      });
    }
  }

  return true;
}

async function restoreUserSession() {
  const existingIdToken = localStorage.getItem('idToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (refreshToken && isAuth0Configured()) {
    try {
      const tokens = await refreshAuth0Tokens(refreshToken);
      persistTokens(tokens);
      pendingTokens = tokens;
      return tokens;
    } catch (error) {
      log('authHandlerAuth0.js', 'restoreSession', 'refresh-failed', 'Auth0 refresh failed', {
        error: error?.message,
      });
    }
  }

  if (existingIdToken) {
    return {
      idToken: existingIdToken,
      accessToken: localStorage.getItem('accessToken'),
      refreshToken,
    };
  }

  if (isAuth0Configured()) {
    try {
      const client = await getAuth0Client();
      const authenticated = await client.isAuthenticated();
      if (authenticated) {
        const idToken = await client.getIdTokenClaims();
        const accessToken = await client.getTokenSilently();
        const tokens = {
          idToken: idToken?.__raw,
          accessToken,
          refreshToken: localStorage.getItem('refreshToken'),
        };
        persistTokens(tokens);
        pendingTokens = tokens;
        return tokens;
      }
    } catch (error) {
      log('authHandlerAuth0.js', 'restoreSession', 'silent-failed', 'Auth0 silent auth failed', {
        error: error?.message,
      });
    }
  }

  throw new Error('No active Auth0 session');
}

async function logoutUser() {
  clearPersistedTokens();
  pendingTokens = null;

  if (isAuth0Configured()) {
    try {
      const client = await getAuth0Client();
      await client.logout({
        logoutParams: {
          returnTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      return true;
    } catch (error) {
      log('authHandlerAuth0.js', 'logout', 'warn', 'Auth0 logout redirect failed', {
        error: error?.message,
      });
    }
  }

  return true;
}

async function handleAuthCallback() {
  if (!isAuth0Configured()) return null;

  const client = await getAuth0Client();
  const result = await client.handleRedirectCallback();
  const idTokenClaims = await client.getIdTokenClaims();
  const accessToken = await client.getTokenSilently();

  const tokens = {
    idToken: idTokenClaims?.__raw,
    accessToken,
    refreshToken: localStorage.getItem('refreshToken'),
    appState: result?.appState || null,
  };

  persistTokens(tokens);
  pendingTokens = tokens;
  return tokens;
}

async function loginWithSocial(provider, options = {}) {
  if (!isAuth0Configured()) {
    throw new Error('Auth0 is not configured');
  }

  const connection = getAuth0ConnectionForProvider(provider);
  log('authHandlerAuth0.js', 'loginWithSocial', 'redirect', 'Starting Auth0 social redirect', {
    provider,
    connection,
    intent: options.intent || 'login',
  });

  await loginWithSocialConnection(connection, {
    intent: options.intent || 'login',
    provider,
    returnTo: options.returnTo || '/dashboard',
  });
}

function getPendingTokens() {
  const tokens = pendingTokens;
  pendingTokens = null;
  return tokens;
}

export const authHandlerAuth0 = {
  login: authenticateUser,
  register: registerNewUser,
  signup: registerNewUser,
  confirmSignUp: confirmUserSignup,
  resendConfirmationCode,
  changePassword: changeUserPassword,
  forgotPassword: initiatePasswordReset,
  confirmPassword: confirmPasswordReset,
  updateProfileAttributes: updateUserProfile,
  restoreSession: restoreUserSession,
  logout: logoutUser,
  handleCallback: handleAuthCallback,
  loginWithSocial,
  getPendingTokens,
};

export {
  authenticateUser,
  registerNewUser,
  restoreUserSession,
  logoutUser,
  updateUserProfile,
};
