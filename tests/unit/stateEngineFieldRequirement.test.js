import { describe, expect, it } from 'vitest';

import { createStepStateEngine } from '@/utils/stateEngine.js';

describe('stateEngine.addFieldRequirement (L-15)', () => {
  it('passes validation context so matchValue can read sibling state fields', async () => {
    const engine = createStepStateEngine({
      flowId: 'l15-match-test',
      defaults: { password: 'secret', confirmPassword: 'secret' },
      urlSync: 'none',
    });

    engine.addFieldRequirement(
      1,
      'confirmPassword',
      {
        rules: [{ type: 'matchValue', param: 'password', message: 'Passwords must match' }],
      },
      { scope: 'booking', fieldId: 'confirmPassword' },
    );

    const passResult = await engine.validate(1);
    expect(passResult.valid).toBe(true);

    engine.setState('confirmPassword', 'wrong', { silent: true });
    const failResult = await engine.validate(1);
    expect(failResult.valid).toBe(false);
    expect(failResult.errors.length).toBeGreaterThan(0);
  });

  it('uses element from contextOptions for required attribute checks', async () => {
    const engine = createStepStateEngine({
      flowId: 'l15-element-test',
      defaults: { title: '' },
      urlSync: 'none',
    });

    const input = document.createElement('input');
    input.setAttribute('required', '');
    input.value = '';

    engine.addFieldRequirement(
      1,
      'title',
      { required: true, requiredMessage: 'Title required' },
      { element: input, fieldId: 'title', scope: 'booking' },
    );

    const result = await engine.validate(1);
    expect(result.valid).toBe(false);
  });
});

describe('stateEngine persist', () => {
  it('hydrates step and state from localStorage', async () => {
    const flowId = `persist-test-${Date.now()}`;
    localStorage.removeItem(`stateEngine:${flowId}`);

    const engine = createStepStateEngine({
      flowId,
      urlSync: 'none',
      persist: true,
      initialStep: 0,
      defaults: { activeTab: 'video', uploadPhase: 'idle' },
    });
    engine.initialize({ fromUrl: false });
    engine.setState('activeTab', 'singleImage', { silent: true });
    engine.setState('uploadPhase', 'ready', { silent: true });
    await engine.goToStep(1, { force: true });
    engine.flushPersist();

    const restored = createStepStateEngine({
      flowId,
      urlSync: 'none',
      persist: true,
      initialStep: 0,
      defaults: { activeTab: 'video', uploadPhase: 'idle' },
    });
    restored.initialize({ fromUrl: false });

    expect(restored.state.activeTab).toBe('singleImage');
    expect(restored.state.uploadPhase).toBe('ready');
    expect(restored.step).toBe(1);

    restored.clearPersist();
  });

  it('does not persist blob URLs', () => {
    const flowId = `persist-blob-${Date.now()}`;
    const engine = createStepStateEngine({
      flowId,
      urlSync: 'none',
      persist: true,
      defaults: { mediaUrl: '' },
    });
    engine.initialize({ fromUrl: false });
    engine.setState('mediaUrl', 'blob:http://localhost/abc', { silent: true });
    engine.flushPersist();

    const restored = createStepStateEngine({
      flowId,
      urlSync: 'none',
      persist: true,
      defaults: { mediaUrl: '' },
    });
    restored.initialize({ fromUrl: false });
    expect(restored.state.mediaUrl).toBe('');
    restored.clearPersist();
  });
});
