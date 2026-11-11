# Authentication Overview

The authentication system provides a unified interface for logging in, signing up, managing sessions, and retrieving the current user. It abstracts two backends:

1. **Auth0** — production authentication (email/password + social connections)
2. **Dev shim** — local mock users with JWT tokens, no external network calls

At runtime, the app selects the handler via `VITE_AUTH_PROVIDER` (`dev` | `auth0`) or `window.APP.useAuthHandler()`. All views call the same `authHandler` API regardless of backend.

The system manages roles, onboarding steps, KYC flags, and persistent sessions through JWT claims mapped by `auth0ClaimMapper.js`.

## Terminology

* **Auth Handler** — Active module for login, signup, session restore, logout, token refresh, and profile metadata.
* **Dev Shim** — `authHandlerDev.js`; mock users from `mockAuthUsers.json`.
* **Auth0 Handler** — `authHandlerAuth0.js`; SPA SDK + Resource Owner Password Grant for embedded forms.
* **Session Tokens** — `idToken`, `accessToken`, `refreshToken` in localStorage.
* **Dirty State** — Local store updates before Auth0 metadata propagates into refreshed JWT claims.
* **Callback Flow** — `/auth/callback` completes Auth0 redirect login.

## High-Level Behavior

On startup: resolve provider → `restoreSession()` → route guards read `useAuthStore`. Login/signup flows call `authHandler`; onboarding/KYC call `updateProfileAttributes` then `syncWithAuthToken`.

## System Parts

| Module | Purpose |
|--------|---------|
| `authHandler.js` | Factory: `dev` \| `auth0` |
| `authHandlerAuth0.js` | Auth0 login, signup, reset, social redirect, metadata |
| `authHandlerDev.js` | Mock users, social mock, password change |
| `auth0ClaimMapper.js` | JWT claims → store user shape |
| `socialAuthBridge.js` | Unified social login entry (redirect or dev mock) |
| `authLocaleProfile.js` | Preferred locale in Auth0 metadata |

## Priority Rules

1. `VITE_AUTH_PROVIDER=dev` → dev shim
2. `VITE_AUTH_PROVIDER=auth0` → Auth0 (production default when not in dev)
3. `window.APP.useAuthHandler('dev'|'auth0')` → runtime override

## Removed (Auth0 migration Phase 5)

* AWS Cognito handler (`awsCognitoHandler.js`) — deleted
* Cognito SDK script preload — removed from routes and asset map
* `VITE_COGNITO_*` env vars — no longer required

See `docs/instruction/Auth0 Migration Proposal.md` for full migration details.
