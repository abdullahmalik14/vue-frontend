/**
 * Centralized API configuration.
 *
 * Each key is a service identifier (dot-separated namespacing is allowed).
 * Each value is an object with "production" and "staging" base URLs.
 *
 * Usage:
 *   import { getApiBaseUrl } from '@/infrastructure/http/getApiBaseUrl.js';
 *
 *   const base = getApiBaseUrl('events');                  // uses VITE_API_ENVIRONMENT
 *   const base = getApiBaseUrl('events', 'production');    // explicit override
 *
 * To add a new service:
 *   1. Add an entry here with both production and staging URLs.
 *   2. Call getApiBaseUrl('your.service') wherever the base URL is needed.
 */
export const ALLOWED_DOMAINS = [
  'analytics-api.fansocial.app',
  'localhost',
];

export const API_CONFIG = {

  'dashboard.analytics': {
    production: 'https://analytics-api.fansocial.app',
    staging:    'http://localhost:3002',
    dev:        'http://localhost:3002',
  },

  events: {
    production: 'https://analytics-api.fansocial.app',
    staging:    'http://localhost:3002',
    dev:        'http://localhost:3002',
  },

};
