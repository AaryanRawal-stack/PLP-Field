// logger.js
const DEBUG = true;

export function debug(...args) {
  if (DEBUG) console.log("[DEBUG]", ...args);
}

export function info(...args) {
  console.info("[INFO]", ...args);
}

export function warn(...args) {
  console.warn("[WARN]", ...args);
}

export function error(...args) {
  console.error("[ERROR]", ...args);
}
