/**
 * Repeatable interactionsEngine wiring for media-uploader.
 *
 * Linden pattern (where it fits — not every line of the wizard):
 * - checkbox / toggle / radio → show|hide a panel via showElement / hideElement
 * - field changes → processFieldChange (one pipeline, not bespoke watchers per control)
 * - type checks → validation library rules on the field config (minNum, maxNum, custom, …)
 *
 * Visibility keys are `${scopeId}_${name}` so clearScope cleans them up.
 */
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

export function useMediaInteractions(scopeId) {
  if (!scopeId) {
    throw new Error('[useMediaInteractions] scopeId is required');
  }

  function visibilityKey(name) {
    return `${scopeId}_${name}`;
  }

  function setVisible(name, visible) {
    interactionsEngine.runInteractions(
      [{ type: visible ? 'showElement' : 'hideElement', elementKey: visibilityKey(name) }],
      null,
    );
  }

  function isVisible(name) {
    return !!interactionsEngine.elementVisibility[visibilityKey(name)];
  }

  /** Boolean / checkbox field config (no validation unless callers add it). */
  function fieldConfig(id, extras = {}) {
    return {
      scope: scopeId,
      id,
      validation: { required: false, rules: [] },
      validateOnInput: false,
      validateOnMount: false,
      ...extras,
    };
  }

  function registerField(config, initialValue, visibilityName = null, visibilityPredicate = (v) => !!v) {
    interactionsEngine.register(config, initialValue, null);
    if (visibilityName != null) {
      setVisible(visibilityName, visibilityPredicate(initialValue));
    }
  }

  function changeField(config, value, visibilityName = null, visibilityPredicate = (v) => !!v) {
    interactionsEngine.processFieldChange(config, value);
    if (visibilityName != null) {
      setVisible(visibilityName, visibilityPredicate(value));
    }
  }

  function clear() {
    interactionsEngine.clearScope(scopeId);
  }

  return {
    interactionsEngine,
    visibilityKey,
    setVisible,
    isVisible,
    fieldConfig,
    registerField,
    changeField,
    clear,
  };
}
