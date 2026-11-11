

export function applyOverride(base = {}, theme = '', override = {}) {
  // Prefer themes (Linden); fall back to legacy versions key during migration
  const themeData = base.themes?.[theme] || base.versions?.[theme] || {}

  const merged = {
    id: override.addId ?? base.addId ?? undefined,
    class: [base.addClass, themeData.addClass, override.addClass]
      .filter(Boolean)
      .join(' ') || undefined,
    ...Object.assign(
      {},
      base.addAttributes || {},
      themeData.addAttributes || {},
      override.addAttributes || {}
    )
  }

  if (override.removeId) merged.id = undefined
  if (override.removeClass) merged.class = undefined
  if (Array.isArray(override.removeAttributes)) {
    for (const key of override.removeAttributes) {
      delete merged[key]
    }
  }

  return merged
}


export function resolveWrappers(wrappers = [], theme = '', wrapperOverrides = []) {
  const wrapperAttrs = {}

  for (const wrapper of wrappers) {
    const key = wrapper.targetAttribute
    const override = wrapperOverrides.find(o => o.target === key) || {}
    wrapperAttrs[key] = applyOverride(wrapper, theme, override)
  }

  return wrapperAttrs
}

export function resolveAllConfigs(config = {}, theme = '', props = {}) {
  const wrapperOverrides = props.wrapperOverrides || []
  // Accept theme or legacy version prop from callers still mid-migration
  const resolvedTheme = theme || props.theme || props.version || ''

  return {
    wrapperAttrs: resolveWrappers(config.wrappers, resolvedTheme, wrapperOverrides),
    inputAttrs: applyOverride(config.elm, resolvedTheme, {
      addId: props.addId,
      addClass: props.addClass,
      addAttributes: {
        name: props.name,
        placeholder: props.placeholder,
        required: props.required,
        autocomplete: props.autocomplete,
        ...(props.addAttributes || {})
      },
      removeId: props.removeId,
      removeClass: props.removeClass,
      removeAttributes: props.removeAttributes
    }),
    labelAttrs: applyOverride(config?.additionalConfig?.label || {}, resolvedTheme, {}),
    descriptionAttrs: applyOverride(config?.additionalConfig?.description || {}, resolvedTheme, {})
  }
}
