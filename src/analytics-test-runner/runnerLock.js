/**
 * Shared in-flight lock so single-case, batch, mixed-batch, and volume
 * runners cannot overlap. Batch may nest the single-case runner.
 */

let lockKind = null;
let lockDepth = 0;

const NESTING = {
  batch: ['case'],
};

/**
 * @param {'case'|'batch'|'mixed'|'volume'|'historical-seed'} kind
 * @returns {() => void} release
 */
export function acquireRunnerLock(kind) {
  if (lockKind && lockKind !== kind) {
    const allowed = NESTING[lockKind] || [];
    if (!allowed.includes(kind)) {
      throw new Error(
        `Test runner already in progress (${lockKind}) — wait for the current run to finish`,
      );
    }
    lockDepth += 1;
    return releaseRunnerLock;
  }

  if (lockKind === kind) {
    throw new Error('Test runner already in progress — wait for the current run to finish');
  }

  lockKind = kind;
  lockDepth = 1;
  return releaseRunnerLock;
}

export function releaseRunnerLock() {
  if (lockDepth > 0) lockDepth -= 1;
  if (lockDepth <= 0) {
    lockKind = null;
    lockDepth = 0;
  }
}

export function getRunnerLockKind() {
  return lockKind;
}

export function isAnyRunnerInFlight() {
  return lockKind != null;
}
