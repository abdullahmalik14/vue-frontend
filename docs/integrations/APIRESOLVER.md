# Centralized API Configuration

## Overview

All external API base URLs are managed in a single config file. A strict resolver function enforces environment selection, domain whitelisting, and HTTPS — throwing on any misconfiguration rather than silently falling back.

---

## Files

| File | Purpose |
|------|---------|
| `src/config/apiConfig.js` | Service URL map + allowed domain whitelist |
| `src/infrastructure/http/getApiBaseUrl.js` | Resolver function |
| `src/services/events/flows/triggerEventFlow.js` | Reference integration (events trigger) |

---

## Usage

```js
import { getApiBaseUrl } from '@/infrastructure/http/getApiBaseUrl.js';

// Reads VITE_API_ENVIRONMENT from .env
const base = getApiBaseUrl('events');

// Explicit override (second arg must be 'production' or 'staging')
const base = getApiBaseUrl('events', 'production');
```

---

## Environment variable

Set in your `.env` file:

```
VITE_API_ENVIRONMENT=production
# or
VITE_API_ENVIRONMENT=staging
```

Valid values are **`production`** and **`staging`** only. Any other value throws at runtime.

---

## Adding a new service

**1.** Add an entry to `src/config/apiConfig.js`:

```js
export const ALLOWED_DOMAINS = [
  'node-build-prod.uy4sdjn4f7.com',
  'your-new-domain.com',            // ← add here
];

export const API_CONFIG = {
  events: {
    production: 'https://node-build-prod.uy4sdjn4f7.com',
    staging:    '',
  },
  'your.service': {                  // ← add here
    production: 'https://your-new-domain.com',
    staging:    'https://staging.your-new-domain.com',
  },
};
```

**2.** Call the resolver wherever the base URL is needed:

```js
import { getApiBaseUrl } from '@/infrastructure/http/getApiBaseUrl.js';

const base = getApiBaseUrl('your.service');
fetch(`${base}/api/your-endpoint`, { ... });
```

---

## Security rules (enforced at runtime)

| Rule | Behaviour |
|------|-----------|
| Environment must be `production` or `staging` | Throws if missing or invalid |
| Service must exist in `API_CONFIG` | Throws if unknown |
| URL must be set for the resolved environment | Throws if empty string |
| URL must use HTTPS | Throws — localhost/127.0.0.1 are exempt |
| Hostname must be in `ALLOWED_DOMAINS` | Throws — localhost/127.0.0.1 are exempt |

---

## Reference integration — events trigger

`src/services/events/flows/triggerEventFlow.js` shows the full pattern:

```js
import { fail, ok } from '@/services/flow-system/flowTypes.js';
import { getApiBaseUrl } from '@/infrastructure/http/getApiBaseUrl.js';

export async function triggerEventFlow({ masterEventType, fields } = {}) {
  const baseUrl = getApiBaseUrl('events');

  const response = await fetch(`${baseUrl}/api/events/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ masterEventType, fields }),
  });
  // ...
}
```
