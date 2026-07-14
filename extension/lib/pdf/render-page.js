// PDF page rendering helper.

/**
 * Render a PDF page to a canvas at a given scale.
 * @param {Object} page - PDFPageProxy
 * @param {number} scale - Render scale (1.0 = 72 DPI)
 * @param {HTMLCanvasElement|OffscreenCanvas} canvas
 * @returns {Promise<{ width: number, height: number }>}
 */
export async function renderPage(page, scale, canvas) {
  const viewport = page.getViewport({ scale });
  const ctx = canvas.getContext("2d");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  await page.render({
    canvasContext: ctx,
    viewport,
  }).promise;

  return { width: canvas.width, height: canvas.height };
}

/**
 * Approximate DPI for a given PDF.js scale.
 * @param {number} scale
 * @returns {number}
 */
export function scaleToDpi(scale) {
  return scale * 72;
}

/**
 * Approximate PDF.js scale for a desired DPI.
 * @param {number} dpi
 * @returns {number}
 */
export function dpiToScale(dpi) {
  return dpi / 72;
}
