// Export utilities for TXT, Markdown, and structured JSON.

/**
 * @typedef {import("../ocr/protocol.js").PageResult} PageResult
 */

/**
 * Export page results as plain text.
 * @param {PageResult[]} pages
 * @returns {string}
 */
export function exportTxt(pages) {
  return pages
    .map((page) => {
      const header = `--- Page ${page.pageNumber} ---\n`;
      return header + page.plainText;
    })
    .join("\n\n");
}

/**
 * Export page results as Markdown.
 * @param {PageResult[]} pages
 * @returns {string}
 */
export function exportMarkdown(pages) {
  return pages
    .map((page) => {
      const header = `## Page ${page.pageNumber}\n\n`;
      return header + page.plainText;
    })
    .join("\n\n---\n\n");
}

/**
 * Export page results as structured JSON.
 * @param {PageResult[]} pages
 * @returns {string}
 */
export function exportJson(pages) {
  return JSON.stringify(pages, null, 2);
}

/**
 * Get the appropriate export function for a format.
 * @param {"txt"|"markdown"|"json"} format
 * @returns {(pages: PageResult[]) => string}
 */
export function getExporter(format) {
  switch (format) {
    case "txt":
      return exportTxt;
    case "markdown":
      return exportMarkdown;
    case "json":
      return exportJson;
    default:
      throw new Error(`Unknown export format: ${format}`);
  }
}

/**
 * Trigger a browser download of exported text.
 * @param {string} content
 * @param {string} filename
 */
export function downloadExport(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
