// Conservative text normalization.
//
// Applies Unicode NFC, replaces nonstandard whitespace, trims edges,
// removes repeated generated special tokens. Does NOT run spellcheck
// or rewrite product numbers, serial numbers, or code.

/**
 * Normalize recognized text.
 * @param {string} text
 * @returns {string}
 */
export function normalizeText(text) {
  return String(text || "")
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // control chars
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ") // nonstandard spaces
    .replace(/<\|.*?\|>/g, "") // generated special tokens
    .replace(/ {2,}/g, " ")
    .trim();
}
