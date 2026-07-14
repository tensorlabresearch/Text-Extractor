// PDF.js document controller.
//
// Wraps vendored PDF.js to provide document loading, page rendering,
// native text extraction, and cleanup. All PDF.js state lives here —
// the service worker never touches it.

// TODO: import from vendored PDF.js in Phase 2
// import * as pdfjsLib from "../vendor/pdfjs/pdf.min.mjs";

export function createPdfController() {
  let pdfDocument = null;
  let pdfjsLib = null;

  async function ensurePdfjs() {
    if (pdfjsLib) return pdfjsLib;
    pdfjsLib = await import("../vendor/pdfjs/pdf.min.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("lib/vendor/pdfjs/pdf.worker.min.mjs");
    return pdfjsLib;
  }

  return {
    async open(bytes, password) {
      const lib = await ensurePdfjs();
      const loadingTask = lib.getDocument({
        data: bytes,
        password: password || undefined,
        useWorkerFetch: false,
        isEvalSupported: false,
      });
      pdfDocument = await loadingTask.promise;
      return { pageCount: pdfDocument.numPages };
    },

    async getPage(pageNumber) {
      if (!pdfDocument) throw new Error("No document open");
      return pdfDocument.getPage(pageNumber);
    },

    get pageCount() {
      return pdfDocument?.numPages ?? 0;
    },

    async close() {
      if (pdfDocument) {
        try { await pdfDocument.destroy(); } catch (_) {}
        pdfDocument = null;
      }
    },
  };
}
