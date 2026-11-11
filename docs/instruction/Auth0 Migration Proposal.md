# Cognito → Auth0 Migration Plan (Vue Frontend)

**Document version:** 2.0  
**Date:** 6 March 2026  
**Scope:** Vue frontend — sign up, log in, lost password, reset password, onboarding, dashboard access, local dev mock shim.

---

## 1. Goal

Shift authentication from **AWS Cognito** to **Auth0**. Keep all existing Vue flows, UI, route guards, and dashboard access behaviour the same. Only the auth handler layer changes.

---

## 2. Current Setup (Cognito)

### How it works today

```
Auth Pages (Login, SignUp, Onboarding, etc.)
        ↓
authHandler.js  →  dev shim (local)  OR  awsCognitoHandler (production)
        ↓
useAuthStore  →  JWT decode  →  currentUser { role, onboardingPassed, kycPassed }
        ↓
routeGuards.js + routeConfig.json  →  allow / redirect
        ↓
/dashboard
```

### Key files (Cognito — will be replaced)


| File                                        | Role                            |
| ------------------------------------------- | ------------------------------- |
| `src/dev/utils/auth/authHandler.js`         | Picks dev or Cognito handler    |
| `src/dev/utils/auth/awsCognitoHandler.js`   | Production Cognito logic        |
| `src/dev/utils/auth/awsCognitoUtilities.js` | Cognito SDK wrappers            |
| `src/dev/utils/auth/authHandlerDev.js`      | Local dev mock                  |
| `src/stores/useAuthStore.js`                | Session + JWT decode            |
| `src/systems/routing/routeGuards.js`        | Auth / role / onboarding checks |
| `src/router/routeConfig.json`               | Route access rules              |


### Cognito JWT claims used today


| Claim                     | Used for                           |
| ------------------------- | ---------------------------------- |
| `custom:role`             | creator / fan / vendor / agent     |
| `custom:username`         | Public handle                      |
| `custom:kyc`              | Creator KYC (`"true"` / `"false"`) |
| `custom:preferred_locale` | Language                           |
| `custom:lastlogin`        | Last login timestamp               |
| `sub`                     | User ID                            |
| `email`                   | User email                         |


### Onboarding → dashboard logic (stays the same)

- `onboardingPassed` = `true` when token has both `role` + `username`
- **Creator** needs `onboardingPassed` + `kycPassed` before `/dashboard`
- **Fan / vendor / agent** need `onboardingPassed` only
- After onboarding, Vue sets local dirty state immediately, then refreshes token when Auth0 metadata updates

---

## 3. Target Setup (Auth0)

### Architecture after migration

```
Auth Pages (same UI, no redesign)
        ↓
authHandler.js  →  dev shim (local)  OR  authHandlerAuth0 (production)
        ↓
auth0ClaimMapper.js  →  normalizes Auth0 JWT → same store shape as today
        ↓
useAuthStore  →  same getters, same guards
        ↓
/dashboard (unchanged)
```

### Auth0 SDK

- Package: `@auth0/auth0-spa-js`
- Login, logout, session restore, silent token refresh via Auth0 SPA SDK

### Environment variables


| Variable                     | Purpose                                               |
| ---------------------------- | ----------------------------------------------------- |
| `VITE_AUTH_PROVIDER`         | `auth0` (prod)                                        |
| `VITE_AUTH0_DOMAIN`          | Auth0 tenant domain                                   |
| `VITE_AUTH0_CLIENT_ID`       | SPA client ID                                         |
| `VITE_AUTH0_AUDIENCE`        | API audience                                          |
| `VITE_AUTH0_REDIRECT_URI`    | Callback URL, e.g. `https://app.example.com/callback` |
| `VITE_AUTH0_CLAIM_NAMESPACE` | `https://fansocial.app/`                              |


Remove after migration: `VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, `VITE_COGNITO_REGION`, `VITE_AUTH_DEV_SHIM`.

---

## 4. JWT Claim Mapping (Cognito → Auth0)

Auth0 Actions will inject these into the ID token. Vue reads them via a single claim mapper.


| Cognito (old)             | Auth0 (new)                               | Store field                    |
| ------------------------- | ----------------------------------------- | ------------------------------ |
| `custom:role`             | `https://fansocial.app/role`              | `currentUser.role`             |
| `custom:username`         | `https://fansocial.app/username`          | onboarding check               |
| `custom:kyc`              | `https://fansocial.app/kyc_passed`        | `currentUser.kycPassed`        |
| `custom:onboardingPassed` | `https://fansocial.app/onboarding_passed` | `currentUser.onboardingPassed` |
| `custom:preferred_locale` | `https://fansocial.app/preferred_locale`  | `currentUser.preferredLocale`  |
| `custom:lastlogin`        | `https://fansocial.app/last_login`        | raw                            |
| `sub`                     | `sub`                                     | user ID                        |
| `email`                   | `email`                                   | user email                     |


Example token payload:

```json
{
  "sub": "auth0|abc123",
  "email": "user@example.com",
  "https://fansocial.app/role": "creator",
  "https://fansocial.app/username": "@myhandle",
  "https://fansocial.app/onboarding_passed": true,
  "https://fansocial.app/kyc_passed": true
}
```

---

## 5. Auth Flows — What We Will Do

### 5.1 Flows (handler swap, UI stays)


| Flow           | View                          | Action                                    |
| -------------- | ----------------------------- | ----------------------------------------- |
| Log in         | `AuthLogin.vue`               | `authHandler.login()` → Auth0             |
| Sign up        | `AuthSignUp.vue`              | Auth0 Database signup                     |
| Confirm email  | `AuthConfirmEmail.vue`        | Auth0 email verification                  |
| Lost password  | `AuthLostPassword.vue`        | Auth0 password reset email                |
| Reset password | `AuthResetPassword.vue`       | Auth0 reset completion                    |
| Onboarding     | `AuthSignUpOnboarding.vue`    | Update Auth0 metadata + local dirty state |
| KYC            | `AuthSignUpOnboardingKyc.vue` | Set `kyc_passed` in metadata              |
| Logout         | `useAuthStore.logout()`       | Auth0 logout + clear tokens               |


### 5.2 Social auth (Phase 2)


| Provider | Current                          | Migration                   |
| -------- | -------------------------------- | --------------------------- |
| Google   | `GoogleAuthPage.vue` + Cognito   | Auth0 Google connection     |
| Facebook | `FacebookAuthPage.vue` + Cognito | Auth0 Facebook connection   |
| Twitter  | `twitterCognitoHandler.js`       | Auth0 Twitter connection    |
| Telegram | `telegramCognitoHandler.js`      | Custom OAuth + Auth0 Action |


Email/password flows ship first. Social auth follows in Phase 2.

### 5.3 Unchanged

- All dashboard pages (referrals, analytics, settings, etc.)
- `routeGuards.js` logic
- `routeConfig.json` dependency rules
- Role-based sidebar menu
- Flow system (`withAuth.js`, `flowAuthContext.js`)

---

## 6. Local Dev Mock Shim

Local development bypasses Auth0 completely. Predefined users from config.

### Config file (new)

`src/config/mockAuthUsers.json`

```json
{
  "users": [
    {
      "email": "creator@test.com",
      "password": "Test123!",
      "role": "creator",
      "username": "@creator",
      "onboardingPassed": true,
      "kycPassed": true
    },
    {
      "email": "creator-kyc@test.com",
      "password": "Test123!",
      "role": "creator",
      "username": "@newcreator",
      "onboardingPassed": true,
      "kycPassed": false
    },
    {
      "email": "fan@test.com",
      "password": "Test123!",
      "role": "fan",
      "username": "@fanuser",
      "onboardingPassed": true,
      "kycPassed": false
    },
    {
      "email": "vendor@test.com",
      "password": "Test123!",
      "role": "vendor",
      "username": "@vendor",
      "onboardingPassed": true,
      "kycPassed": false
    },
    {
      "email": "new@test.com",
      "password": "Test123!",
      "role": null,
      "username": null,
      "onboardingPassed": false,
      "kycPassed": false
    }
  ]
}
```

### Dev mode behaviour

- Activate with `VITE_AUTH_PROVIDER=dev`
- Login matches email/password against config
- Mints local JWT with same claim shape as Auth0
- No Auth0 or AWS network calls
- `window.APP.setMockUserState({ role, onboardingPassed, kycPassed })` kept for quick testing

---

## 7. Files — New, Modify, Remove

### 7.1 New files


| File                                                  | Purpose                                               |
| ----------------------------------------------------- | ----------------------------------------------------- |
| `src/dev/utils/auth/authHandlerAuth0.js`              | Auth0 handler (login, signup, reset, session, logout) |
| `src/dev/utils/auth/auth0Utilities.js`                | Auth0 SPA SDK wrappers                                |
| `src/dev/utils/auth/auth0ClaimMapper.js`              | Auth0 JWT → store user shape                          |
| `src/config/mockAuthUsers.json`                       | Local test users                                      |
| `src/templates/auth/page/shared/AuthCallbackPage.vue` | OAuth callback route                                  |
| `tests/unit/auth0ClaimMapper.test.js`                 | Claim mapper tests                                    |
| `tests/unit/authHandlerAuth0.test.js`                 | Handler tests                                         |


### 7.2 Modify


| File                                                   | Change                                           |
| ------------------------------------------------------ | ------------------------------------------------ |
| `src/dev/utils/auth/authHandler.js`                    | `dev`                                            |
| `src/dev/utils/auth/authHandlerDev.js`                 | Load users from `mockAuthUsers.json`             |
| `src/stores/useAuthStore.js`                           | Use `auth0ClaimMapper`; provider-agnostic claims |
| `src/dev/utils/auth/authUtilities.js`                  | Provider-agnostic helpers                        |
| `src/dev/utils/auth/index.js`                          | Export new modules                               |
| `src/templates/auth/views/AuthLogin.vue`               | Wire to Auth0 handler                            |
| `src/templates/auth/views/AuthSignUp.vue`              | Auth0 signup                                     |
| `src/templates/auth/views/AuthConfirmEmail.vue`        | Auth0 verification                               |
| `src/templates/auth/views/AuthLostPassword.vue`        | Auth0 reset email                                |
| `src/templates/auth/views/AuthResetPassword.vue`       | Auth0 reset                                      |
| `src/templates/auth/views/AuthSignUpOnboarding.vue`    | Auth0 metadata update                            |
| `src/templates/auth/views/AuthSignUpOnboardingKyc.vue` | KYC flag in metadata                             |
| `src/systems/i18n/cognitoLocaleProfile.js`             | Rename → `authLocaleProfile.js`                  |
| `src/systems/i18n/userLocaleProfile.js`                | Auth0 metadata source                            |
| `src/router/routeConfig.json`                          | Add `/callback` route                            |
| `src/router/index.js`                                  | Auth0 callback on boot                           |
| `src/app/main.js`                                      | Auth0 client init                                |
| `build/validateEnv.js`                                 | Auth0 env validation                             |
| `src/systems/build/envValidator.js`                    | Same                                             |
| `.env`, `.env.development`, `.env.production`          | Auth0 vars                                       |
| `config/env.production.template`                       | Auth0 template                                   |
| `package.json`                                         | Add `@auth0/auth0-spa-js`, remove Cognito deps   |


### 7.3 Remove (after migration)


| File                                                  | Reason              |
| ----------------------------------------------------- | ------------------- |
| `src/dev/utils/auth/awsCognitoHandler.js`             | Replaced            |
| `src/dev/utils/auth/awsCognitoUtilities.js`           | Replaced            |
| `src/dev/utils/auth/twitterCognitoHandler.js`         | Replaced in Phase 2 |
| `src/dev/utils/auth/telegramCognitoHandler.js`        | Replaced in Phase 2 |
| `public/vendor/amazon-cognito-identity-6.3.15.min.js` | Cognito SDK         |


### 7.4 No change


| Area                           | Files                                |
| ------------------------------ | ------------------------------------ |
| Route guards                   | `routeGuards.js`, `routeResolver.js` |
| Dashboard                      | All `src/dev/templates/dashboard/**` |
| Referrals, analytics, settings | No auth changes                      |
| Sidebar menu                   | `dashboard-sidebar-menu-items.js`    |


---

## 8. Auth Handler API (same contract for all handlers)

Every handler implements this interface so views do not change:

```js
authHandler.login(email, password)
authHandler.register(email, password, attributes?)
authHandler.confirmSignUp(email, code)
authHandler.resendConfirmationCode(email)
authHandler.forgotPassword(email)
authHandler.confirmPassword(email, code, newPassword)
authHandler.changePassword(oldPassword, newPassword)
authHandler.updateProfileAttributes(attributes)
authHandler.restoreSession()
authHandler.logout()
authHandler.getPendingTokens()
authHandler.handleCallback()
```

---

## 9. Implementation Phases

### Phase 1 — Foundation

1. Install `@auth0/auth0-spa-js`
2. Create `auth0ClaimMapper.js`
3. Refactor `useAuthStore` to use claim mapper
4. Create `mockAuthUsers.json` + upgrade `authHandlerDev.js`
5. Update `authHandler.js` factory: `dev` | `auth0`
6. Unit tests for claim mapping

**Result:** Dev shim works with config users. Store reads claims from any provider.

### Phase 2 — Core auth (email/password)

1. Create `authHandlerAuth0.js` + `auth0Utilities.js`
2. Wire login, signup, confirm email
3. Wire lost password + reset password
4. Add `/callback` route + `AuthCallbackPage.vue`
5. Session restore + token refresh on app boot

**Result:** Full email/password auth via Auth0.

### Phase 3 — Onboarding & dashboard access

1. Wire `AuthSignUpOnboarding.vue` → Auth0 metadata + dirty state
2. Wire KYC views → `kyc_passed` metadata
3. Verify all route guard scenarios (Section 10)
4. Token refresh after metadata update

**Result:** Sign up → onboarding → KYC → dashboard works end-to-end.

### Phase 4 — Social auth

1. Auth0 social connections (Google, Facebook, Twitter)
2. Replace `twitterCognitoHandler.js`, `telegramCognitoHandler.js`
3. Update social auth pages

**Result:** Social login via Auth0.

### Phase 5 — Cleanup ✅

1. Delete Cognito handler files + SDK
2. Remove Cognito env vars
3. Remove Cognito script preload from route config
4. Update `Authentication Overview.md` and related docs

**Result:** Zero Cognito code in production bundle. Auth provider is `dev` | `auth0` only; `cognitoLocaleProfile` replaced by `authLocaleProfile`; Cognito npm packages removed.

---

## 10. Test Scenarios


| Scenario                         | Expected                          |
| -------------------------------- | --------------------------------- |
| Not logged in → `/dashboard`     | Redirect `/log-in`                |
| Logged in, no role               | Redirect `/sign-up/onboarding`    |
| Fan, onboarding done             | `/dashboard` ✅                    |
| Creator, no onboarding           | `/sign-up/onboarding`             |
| Creator, onboarding done, no KYC | `/sign-up/onboarding/kyc`         |
| Creator, onboarding + KYC done   | `/dashboard` ✅                    |
| Vendor, onboarding done          | `/dashboard` ✅                    |
| Page refresh while logged in     | Session restored from token       |
| Logout                           | Tokens cleared, redirect to login |
| Dev shim: `creator@test.com`     | Dashboard with creator role       |
| Dev shim: `new@test.com`         | Redirect to onboarding            |


---

## 11. Auth0 Tenant Setup (required before Phase 2)

These steps run in Auth0 dashboard before production handler goes live:

1. Create SPA application with callback URL `/callback` and logout URL
2. Enable Database connection (email/password)
3. Create Auth0 Action (Post Login) to inject custom claims from `app_metadata`:
  - `role`, `username`, `onboarding_passed`, `kyc_passed`, `preferred_locale`
4. Configure password reset email
5. Configure email verification
6. Set claim namespace to `https://fansocial.app/`
7. Add env vars to `.env.production`

---

## 12. Dirty State Pattern (onboarding)

This pattern stays exactly as today — only the metadata target changes from Cognito to Auth0.

```
User completes onboarding step
  → 1. Update local store immediately (dirty state)
  → 2. Call authHandler.updateProfileAttributes() → Auth0 metadata
  → 3. Refresh token (silent auth)
  → 4. Store re-decodes token with new claims
  → 5. Route guards allow /dashboard
```

Code reference: `useAuthStore.setTokenAndDecode()` already merges local state with token claims for propagation delay. Same logic applies to Auth0.

---

## 13. Backend Note (separate workstream)

Database and API validation are not part of this Vue migration, but must align:

- Backend validates Auth0 JWTs (not Cognito)
- User records keyed by Auth0 `sub`
- Management API for metadata updates goes through backend proxy (not exposed client-side)

Vue frontend migration can proceed independently; API calls use the same `sub` from token.

---

## 14. Success Criteria

- [ ] Login, signup, lost password, reset password work via Auth0
- [ ] JWT contains role, onboarding_passed, kyc_passed, username
- [ ] Dashboard gating identical to current Cognito behaviour
- [ ] Dev shim login from `mockAuthUsers.json` without Auth0
- [ ] Cognito SDK removed from production
- [ ] Auth UI unchanged (no visual regression)
- [ ] All test scenarios in Section 10 pass

---

## 15. References


| Doc                         | Path                                                                  |
| --------------------------- | --------------------------------------------------------------------- |
| Current auth overview       | `docs/instruction/Authentication Overview.md`                         |
| Route guards & dependencies | `docs/instruction/Authentication Rules and Dependency Enforcement.md` |
| Mock login (current)        | `docs/instruction/F.md`                                               |
| Auth handler factory        | `src/dev/utils/auth/authHandler.js`                                   |
| Auth store                  | `src/stores/useAuthStore.js`                                          |
| Route config                | `src/router/routeConfig.json`                                         |


