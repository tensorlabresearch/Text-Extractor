// Native PDF text extraction via PDF.js getTextContent().

/**
 * Extract raw text content items from a PDF page.
 * @param {Object} page - PDFPageProxy
 * @returns {Promise<Array<{ str: string, transform: number[], width: number, height: number }>>}
 */
export async function getNativeTextItems(page) {
  const content = await page.getTextContent();
  return content.items.map((item) => ({
    str: String(item.str || ""),
    transform: item.transform,
    width: item.width,
    height: item.height,
  }));
}

/**
 * Join text items into a plain-text approximation of the page.
 * @param {Array<{ str: string, transform: number[] }>} items
 * @returns {string}
 */
export function itemsToPlainText(items) {
  return items
    .map((item) => item.str)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}
