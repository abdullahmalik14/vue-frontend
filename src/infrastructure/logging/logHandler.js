/**
 * LogHandler - Single unified logging function
 *
 * Provides environment-aware logging with consistent format.
 * Format: [fileName.js] [method] [flag] Description {json}
 * Controlled by VITE_ENABLE_LOGGER environment variable.
 */


// Check if logging is enabled via environment variable
const viteEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
const isLoggingEnabled = viteEnv?.VITE_ENABLE_LOGGER === 'true' ||
                         viteEnv?.VITE_ENABLE_LOGGER === true ||
                         viteEnv?.DEV; // Default to enabled in development

/**
 * Single unified logging function
 * Format: [fileName.js] [method] [flag] Description {json data}
 *
 * Supports both:
 * - log(file, method, flag, description, data)
 * - log({ file, method, flag, purpose/description, ...data })
 *
 * @param {string|object} fileName - Source file name, or options object
 * @param {string} [methodName] - Method or function name
 * @param {string} [flag] - Operation flag (e.g., 'start', 'success', 'error')
 * @param {string} [description] - Human-readable description
 * @param {object} [data] - Optional data object to log
 * @returns {void}
 */
export function log(fileName, methodName, flag, description, data = {}) {
  // Only log if enabled
  if (!isLoggingEnabled) {
    return;
  }

  // Object-style calls used by some services (flowRefreshManager, etc.)
  if (fileName && typeof fileName === "object") {
    const payload = fileName;
    const resolvedFile = payload.file || payload.fileName || "unknown";
    const resolvedMethod = payload.method || payload.methodName || "unknown";
    const resolvedFlag = payload.flag || "info";
    const resolvedDescription =
      payload.description || payload.purpose || payload.message || "";
    const {
      file: _f,
      fileName: _fn,
      method: _m,
      methodName: _mn,
      flag: _flag,
      description: _d,
      purpose: _p,
      message: _msg,
      ...rest
    } = payload;
    return log(resolvedFile, resolvedMethod, resolvedFlag, resolvedDescription, rest);
  }

  // Format: [fileName.js] [method] [flag] Description
  const formattedMessage = `[${fileName}] [${methodName}] [${flag}] ${description}`;

  // Determine log level based on flag
  const lowerFlag = String(flag ?? "").toLowerCase();

  if (lowerFlag.includes('error') || lowerFlag.includes('exception') || lowerFlag.includes('fail')) {
    console.error(formattedMessage, data);
  } else if (lowerFlag.includes('warn') || lowerFlag.includes('warning')) {
    console.warn(formattedMessage, data);
  } else if (lowerFlag.includes('debug')) {
    console.debug(formattedMessage, data);
  } else {
    console.log(formattedMessage, data);
  }
}

/**
 * Check if logging is currently enabled
 * Useful for conditional logic based on logging state
 *
 * @returns {boolean} - True if logging is enabled
 */
export function isLoggerEnabled() {
  return isLoggingEnabled;
}

// Legacy exports for backward compatibility
export function logDebugMessage(scope, message, data = null) {
  log(scope, 'legacy', 'debug', message, data);
}

export function logInfoMessage(scope, message, data = null) {
  log(scope, 'legacy', 'info', message, data);
}

export function logWarningMessage(scope, message, data = null) {
  log(scope, 'legacy', 'warn', message, data);
}

export function logErrorMessage(scope, message, data = null) {
  log(scope, 'legacy', 'error', message, data);
}

// Export shorthand object for convenience
export const logger = {
  debug: logDebugMessage,
  info: logInfoMessage,
  warn: logWarningMessage,
  error: logErrorMessage,
  isEnabled: isLoggerEnabled
};
