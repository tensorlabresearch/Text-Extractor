// Application state for the workspace.
//
// Owns the current source file, PDF document object, page thumbnails,
// per-page source mode, page queue, render cache, OCR results, user edits,
// export state, and worker lifecycle references.

export function createState() {
  return {
    /** @type {ArrayBuffer|null} */
    fileBytes: null,
    /** @type {string|null} */
    fileName: null,
    /** @type {string|null} */
    fileFingerprint: null,
    /** @type {string|null} */
    fileType: null, // "pdf" | "image"
    /** @type {number} */
    pageCount: 0,
    /** @type {Array<Object>} */
    pages: [],
    /** @type {number|null} */
    currentPage: null,
    /** @type {Map<number, Object>} */
    results: new Map(),
    /** @type {string} */
    mode: "auto",
    /** @type {string} */
    quality: "document",
    /** @type {string} */
    engine: "auto",
    /** @type {AbortController|null} */
    abortController: null,
  };
}
