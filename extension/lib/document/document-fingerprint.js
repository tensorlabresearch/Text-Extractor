// Compute a SHA-256 fingerprint for document identification.
//
// Used for IndexedDB recovery keys and deduplication. Never transmitted.

/**
 * @param {ArrayBuffer} bytes
 * @returns {Promise<string>} Hex-encoded SHA-256 hash.
 */
export async function computeFingerprint(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const array = new Uint8Array(digest);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
