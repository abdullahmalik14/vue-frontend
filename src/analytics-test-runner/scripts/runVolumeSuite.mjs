/**
 * Headless driver: system Chrome + CDP (no Playwright).
 * Opens the analytics iframe and runs volume ×N for every master event.
 *
 *   node src/analytics-test-runner/scripts/runVolumeSuite.mjs
 *
 * Optional env:
 *   ANALYTICS_VOLUME_COUNT=15
 *   ANALYTICS_SUITE_KEYS=newSubscription,profileVisit
 *   ANALYTICS_RUNNER_URL=http://localhost:5173/iframe/analytics?creator=99999&debug-test-runner=true
 *   ANALYTICS_SUITE_OUT=.tmp/analytics-volume-suite-results.json
 *   CDP_PORT=9334
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const CHROME = process.env.CHROME_PATH
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = Number(process.env.CDP_PORT || 9334);
const PAGE_URL = process.env.ANALYTICS_RUNNER_URL
  || 'http://localhost:5173/iframe/analytics?creator=99999&debug-test-runner=true';
const COUNT = Number(process.env.ANALYTICS_VOLUME_COUNT || 15);
const OUT = resolve(ROOT, process.env.ANALYTICS_SUITE_OUT || '.tmp/analytics-volume-suite-results.json');
const USER_DATA = resolve(ROOT, '.tmp/chrome-analytics-suite');

const ALL_KEYS = [
  'newSubscription',
  'recurringSubscription',
  'switchSubscription',
  'cancelSubscription',
  'merchOrder',
  'p2vOrder',
  'tokenOrder',
  'follow',
  'unfollow',
  'profileVisit',
  'mediaLike',
  'mediaUnlike',
  'profileLike',
  'profileUnlike',
  'merchLike',
  'merchUnlike',
  'feedLike',
  'feedUnlike',
  'tagEngagement',
  'mediaView',
  'mediaWatchDuration',
];

const KEYS = process.env.ANALYTICS_SUITE_KEYS
  ? process.env.ANALYTICS_SUITE_KEYS.split(',').map((s) => s.trim()).filter(Boolean)
  : ALL_KEYS;

function writeResults(payload) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2));
}

function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 0;
  const pending = new Map();

  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id == null || !pending.has(msg.id)) return;
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) {
      reject(new Error(msg.error.message || JSON.stringify(msg.error)));
      return;
    }
    resolve(msg.result);
  });

  function send(method, params = {}, sessionId) {
    const id = ++nextId;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify(payload));
    });
  }

  return new Promise((resolve, reject) => {
    ws.addEventListener('open', () => resolve({ send, ws }));
    ws.addEventListener('error', reject);
  });
}

async function waitForJson(url, attempts = 80) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
    } catch {
      // Chrome not listening yet
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function evaluateAsync(send, sessionId, expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }, sessionId);
  if (result.exceptionDetails) {
    const detail = result.exceptionDetails;
    const text = detail.exception?.description || detail.text || 'Runtime.evaluate failed';
    throw new Error(text);
  }
  return result.result?.value;
}

function slimFromPage(key, count) {
  return `
(async () => {
  const suite = await window.runAnalyticsTestVolumeSuite({
    keys: [${JSON.stringify(key)}],
    count: ${Number(count)},
    uniqueFans: true,
    historical: false,
  });
  return suite && suite[0] ? suite[0] : { key: ${JSON.stringify(key)}, ok: false, error: 'empty suite result' };
})()
`.trim();
}

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${USER_DATA}`,
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  '--no-sandbox',
  'about:blank',
], {
  stdio: ['ignore', 'pipe', 'pipe'],
});

let chromeErr = '';
chrome.stderr.on('data', (chunk) => {
  chromeErr += chunk.toString();
  if (chromeErr.length > 8000) chromeErr = chromeErr.slice(-4000);
});

const cleanup = () => {
  try {
    chrome.kill('SIGTERM');
  } catch {
    // already exited
  }
};
process.on('exit', cleanup);
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});

try {
  const version = await waitForJson(`http://127.0.0.1:${PORT}/json/version`);
  const { send, ws } = await connectCdp(version.webSocketDebuggerUrl);

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('Page.navigate', { url: PAGE_URL }, sessionId);

  console.log(`Opened ${PAGE_URL}`);

  const readyDeadline = Date.now() + 120000;
  while (Date.now() < readyDeadline) {
    const ready = await evaluateAsync(
      send,
      sessionId,
      'typeof window.runAnalyticsTestVolume === "function"',
    );
    if (ready === true) break;
    await delay(400);
  }
  const ready = await evaluateAsync(
    send,
    sessionId,
    'typeof window.runAnalyticsTestVolume === "function"',
  );
  if (ready !== true) {
    throw new Error(`Runner not ready. Chrome stderr:\n${chromeErr}`);
  }

  console.log(`Runner ready — ${KEYS.length} events ×${COUNT}`);

  const results = [];
  for (let i = 0; i < KEYS.length; i += 1) {
    const key = KEYS[i];
    const progress = `[${i + 1}/${KEYS.length}]`;
    console.log(`${progress} starting ${key} ×${COUNT}`);
    const started = Date.now();
    try {
      const slim = await evaluateAsync(send, sessionId, slimFromPage(key, COUNT));
      const elapsedMs = Date.now() - started;
      const row = {
        key,
        ok: slim?.ok !== false,
        elapsedMs,
        error: slim?.error || null,
        counts: slim?.counts || null,
        copyPasteFailures: slim?.copyPasteFailures || '',
        failures: slim?.failures || [],
      };
      results.push(row);
      const c = slim?.counts || {};
      console.log(
        `${progress} ${key}: pass ${c.pass ?? 0} · FAIL ${c.fail ?? 0} · GAP ${c.gap ?? 0} · BLOCKED ${c.blocked ?? 0} (${Math.round(elapsedMs / 1000)}s)`,
      );
    } catch (error) {
      const elapsedMs = Date.now() - started;
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        key,
        ok: false,
        elapsedMs,
        error: message,
        counts: null,
        copyPasteFailures: message,
        failures: [],
      });
      console.log(`${progress} ${key}: ERROR ${message} (${Math.round(elapsedMs / 1000)}s)`);
    }
    writeResults({
      startedAt: new Date().toISOString(),
      count: COUNT,
      historical: false,
      completed: results.length,
      total: KEYS.length,
      results,
    });
  }

  const finished = {
    finishedAt: new Date().toISOString(),
    count: COUNT,
    historical: false,
    completed: results.length,
    total: KEYS.length,
    results,
  };
  writeResults(finished);
  console.log(`Wrote ${OUT}`);
  console.log(JSON.stringify(results.map((r) => ({
    key: r.key,
    ok: r.ok,
    counts: r.counts,
    error: r.error || null,
  })), null, 2));

  ws.close();
  cleanup();
  await delay(500);
  process.exit(results.some((r) => !r.ok) ? 1 : 0);
} catch (error) {
  console.error(error instanceof Error ? error.stack : error);
  if (chromeErr) console.error('Chrome stderr:\n', chromeErr);
  cleanup();
  process.exit(1);
}
