// vueApp-main-new/src/utils/auth/authHandler.js

import { authHandlerAuth0 } from './authHandlerAuth0';
import { authHandlerDev } from './authHandlerDev';
import { log } from '@/infrastructure/logging/logHandler';

/**
 * @file authHandler.js
 * @description Authentication handler factory with runtime toggle
 * @purpose Supports dev shim and Auth0 (production)
 *
 * Environment: VITE_AUTH_PROVIDER ('dev' | 'auth0')
 * Legacy: VITE_AUTH_DEV_SHIM ('dev' | true/false)
 * Runtime: window.APP.useAuthHandler('dev' | 'auth0')
 */

const authProvider = import.meta.env.VITE_AUTH_PROVIDER;
const legacyAuthMode = import.meta.env.VITE_AUTH_DEV_SHIM;
const isDevelopment =
  import.meta.env.DEV ||
  import.meta.env.MODE === 'development' ||
  import.meta.env.NODE_ENV === 'development';

function resolveInitialProvider() {
  if (authProvider === 'dev' || legacyAuthMode === 'dev' || legacyAuthMode === 'true') {
    return 'dev';
  }

  if (authProvider === 'auth0') {
    return 'auth0';
  }

  if (isDevelopment) {
    return 'dev';
  }

  return 'auth0';
}

const HANDLERS = {
  dev: authHandlerDev,
  auth0: authHandlerAuth0,
};

let currentProvider = resolveInitialProvider();
let currentHandler = HANDLERS[currentProvider] || authHandlerAuth0;

log('authHandler.js', 'initialization', 'init', 'Initializing auth handler', {
  authProvider,
  legacyAuthMode,
  isDevelopment,
  selectedProvider: currentProvider,
});

if (window.performanceTracker) {
  window.performanceTracker.step({
    step: 'authHandler_init',
    file: 'authHandler.js',
    method: 'initialization',
    flag: 'init',
    purpose: 'Initialize auth handler based on environment',
  });
}

function providerLabel(provider = currentProvider) {
  return provider;
}

/**
 * @function getAuthHandler
 * @returns {object} Current auth handler
 */
export function getAuthHandler() {
  log('authHandler.js', 'getAuthHandler', 'get', 'Getting current auth handler', {
    handlerType: providerLabel(),
  });

  return currentHandler;
}

/**
 * @function useAuthHandler
 * @param {string} type - Handler type ('dev' | 'auth0')
 * @returns {object} New auth handler
 */
export function useAuthHandler(type) {
  const previousProvider = currentProvider;

  if (type === 'dev') {
    currentProvider = 'dev';
    currentHandler = authHandlerDev;
  } else if (type === 'auth0') {
    currentProvider = 'auth0';
    currentHandler = authHandlerAuth0;
  } else {
    log('authHandler.js', 'useAuthHandler', 'invalid', 'Invalid handler type requested', {
      requestedType: type,
      validTypes: ['dev', 'auth0'],
    });
    return currentHandler;
  }

  if (previousProvider !== currentProvider) {
    log('authHandler.js', 'useAuthHandler', 'changed', 'Handler changed successfully', {
      from: previousProvider,
      to: currentProvider,
    });
  }

  return currentHandler;
}

/**
 * @function getCurrentAuthMode
 * @returns {string} Current auth mode
 */
export function getCurrentAuthMode() {
  return currentProvider;
}

function proxyMethod(methodName, fallback) {
  return (...args) => {
    const handler = currentHandler;
    const fn = handler?.[methodName];

    if (typeof fn === 'function') {
      return fn(...args);
    }

    if (typeof fallback === 'function') {
      return fallback(...args);
    }

    return Promise.reject(new Error(`${methodName} is not supported by the active auth handler`));
  };
}

export const authHandler = {
  login: proxyMethod('login'),
  signup: proxyMethod('signup'),
  register: proxyMethod('register', (...args) => currentHandler.signup?.(...args)),
  logout: proxyMethod('logout'),
  restoreSession: proxyMethod('restoreSession'),
  handleCallback: proxyMethod('handleCallback', async () => null),
  updateProfileAttributes: proxyMethod('updateProfileAttributes'),
  changePassword: proxyMethod('changePassword'),
  forgotPassword: proxyMethod('forgotPassword'),
  confirmPassword: proxyMethod('confirmPassword'),
  getPendingTokens: proxyMethod('getPendingTokens', () => null),
  confirmSignUp: proxyMethod('confirmSignUp'),
  resendConfirmationCode: proxyMethod('resendConfirmationCode'),
  loginWithSocial: proxyMethod('loginWithSocial'),
};

if (typeof window !== 'undefined') {
  window.APP = window.APP || {};
  window.APP.useAuthHandler = useAuthHandler;
  window.APP.getAuthHandler = getAuthHandler;
  window.APP.getCurrentAuthMode = getCurrentAuthMode;

  log('authHandler.js', 'window-api', 'expose', 'Console commands exposed', {
    commands: [
      'window.APP.useAuthHandler("dev")',
      'window.APP.useAuthHandler("auth0")',
      'window.APP.getCurrentAuthMode()',
    ],
  });
}

export { authHandlerDev, authHandlerAuth0 };

