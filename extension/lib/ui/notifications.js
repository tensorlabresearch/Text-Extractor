// User notification helpers.

/**
 * Show a transient notification.
 * @param {string} message
 * @param {"info"|"success"|"error"|"warning"} [type]
 */
export function notify(message, type = "info") {
  // TODO: implement toast UI in Phase 1
  const prefix = { info: "", success: "✓ ", error: "✗ ", warning: "⚠ " }[type] || "";
  console.log(`${prefix}${message}`);
}
