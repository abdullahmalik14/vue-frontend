# Dashboard translation integration

Run these commands from the Vue project root. Stage A locale is `fr`. Scope is only:

- `public/i18n/section-dash`
- `public/i18n/section-dashboard-creator`
- `public/i18n/section-dashboard-fan`
- `public/i18n/section-dashboard-global`

Do not read or write `section-auth`, `section-misc`, `section-shop`, or `base`. Do not add locales that are not already in `SUPPORTED_LOCALES`. Leave `vi` and every other locale until this French proof of concept is accepted.

The model is `grok-3-mini`. The CLI calls `https://api.x.ai/v1/chat/completions`. Several strings in one chat request are not the xAI Batch API.

## Discovery

English source files and the French targets:

| English file | Strings | French |
|---|---:|---|
| `section-dash/en.json` | 75 | no `fr.json` |
| `section-dashboard-creator/en.json` | 7 | no `fr.json` |
| `section-dashboard-fan/en.json` | 6 | no `fr.json` |
| `section-dashboard-global/en.json` | 2857 | no `fr.json` |
| Total | 2945 | 2945 missing |

Each string id is the SHA-256 of length-prefixed scope `dashboard`, source file, JSON pointer, and English text hash. The same English sentence in two files has two ids. Ids are not written into `en.json`. A translation in one file does not satisfy another file. English shown by the app as a fallback is not a completed translation.

Vietnamese files already exist. With no trusted source-hash ledger they are `needs_review`. Do not send them to Grok and do not overwrite them.

## Scan

No network.

```bash
node tools/dashboard-translate/cli.js scan --locale fr
```

Writes:

- `tools/dashboard-translate/output/source-inventory.json`
- `tools/dashboard-translate/output/translation-status.json`
- `tools/dashboard-translate/output/missing-translations.json`
- `tools/dashboard-translate/output/translation-summary.json`

`estimate --locale fr` prints the same scan plus a local cost estimate. `verifiedAgainstAccount` is false until the xAI console rates in `config.js` are replaced. The current placeholder rates are $0.30 per million input tokens and $0.50 per million output tokens, about $0.06 for these 2945 strings. That is not an invoice.

Offline tests, with no API key:

```bash
npx vitest run --config tools/dashboard-translate/vitest.config.js
```

Stress fixtures are 100, 1,000, 10,000, and 50,000 strings. Do not point those tests at the live API.

## Dry-run

No network. Shows which keys would change. Does not write `fr.json`.

```bash
node tools/dashboard-translate/cli.js dry-run --locale fr
```

Preview: `tools/dashboard-translate/output/dry-run-fr.json`.

## Live sample

Confirm in the xAI account, before any live call: model `grok-3-mini`, price, token limit, trial credit, and whether the Batch API discount exists. No live call has been made. No `fr.json` has been created.

Set the key only in the shell. Then send 10 missing French strings:

```bash
node tools/dashboard-translate/cli.js translate --locale fr --limit 10
```

Read `tools/dashboard-translate/state/checkpoint-fr.json`. Keep a row only when the id matches the inventory, the locale is `fr`, and placeholders still match. Then dry-run, then apply, then rescan.

## Translation

Grok receives the id, the English text, and the section folder name. It does not receive a destination path. The updater uses the inventory id to choose the file and key.

Accepted strings must keep `{{name}}`, `{name}`, `{0}`, `{'@'}`, `%s`, `%d`, HTML tags, URLs, entities, and the same number of line breaks. Rows with `<script`, inline event handlers, `javascript:`, a bad id, or a broken placeholder stay `failed` and are not written.

```bash
node tools/dashboard-translate/cli.js translate --locale fr
```

`--mock` is for local checks. It stores `"model": "mock"`. `apply` will not write mock rows into `public/i18n`.

## Apply

```bash
node tools/dashboard-translate/cli.js apply --locale fr
```

Before writing, the CLI re-reads the English string and checks the target file bytes against the scan. It writes a temp file, parses the JSON, then replaces the target. A second apply that finds the same values writes nothing.

## Rescan

```bash
node tools/dashboard-translate/cli.js rescan --locale fr
```

Read the four reports again. A string is done only when the French value is at the same file and JSON pointer. A successful API call by itself is not enough.

## Resume

Completed checkpoint rows are not sent again. If the run stops, run the same `translate --locale fr` command. Do not delete `tools/dashboard-translate/state/checkpoint-fr.json`.

Retries cover HTTP 429, 5xx, timeouts, and network errors. Other failures stay in the checkpoint as `failed`.

## Rollback

Backups are written to `tools/dashboard-translate/state/backups/` before a file is replaced. If a later file in the same run fails, files already written in that run are restored. To undo a finished apply, copy the backup over the matching `fr.json`, then rescan.

After a successful apply, `tools/dashboard-translate/state/hash-ledger.json` stores the English hash. A later English edit can be marked `source_changed`. A translation with no ledger hash is `needs_review` and is not overwritten.

## Credentials

`XAI_API_KEY` is read from the environment. Live calls also require `DASHBOARD_TRANSLATE_ALLOW_LIVE=1`. The key is never printed. Do not put it in git, JSON reports, checkpoints, tests, prompts, or screenshots.
    