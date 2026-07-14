// PDF.js document controller.
//
// Wraps vendored PDF.js to provide document loading, page rendering,
// native text extraction, and cleanup. All PDF.js state lives here —
// the service worker never touches it.

// TODO: import from vendored PDF.js in Phase 2
// import * as pdfjsLib from "../vendor/pdfjs/pdf.min.mjs";

export function createPdfController() {
  let pdfDocument = null;

  return {
    /**
     * Load a PDF from bytes.
     * @param {ArrayBuffer} bytes
     * @param {string} [password]
     * @returns {Promise<{ pageCount: number }>}
     */
    async open(_bytes, _password) {
      // TODO: implement with vendored PDF.js in Phase 2
      throw new Error("PDF.js not yet vendored — Phase 2");
    },

    /**
     * Get page proxy.
     * @param {number} pageNumber - 1-based page number.
     */
    async getPage(pageNumber) {
      if (!pdfDocument) throw new Error("No document open");
      return pdfDocument.getPage(pageNumber);
    },

    /**
     * Get page count.
     * @returns {number}
     */
    get pageCount() {
      return pdfDocument?.numPages ?? 0;
    },

    /**
     * Close and destroy the PDF document, releasing memory.
     */
    async close() {
      if (pdfDocument) {
        try { await pdfDocument.destroy(); } catch (_) {}
        pdfDocument = null;
      }
    },
  };
}
