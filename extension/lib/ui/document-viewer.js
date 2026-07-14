// Document viewer — renders the current page to canvas.

/**
 * Create a document viewer bound to a canvas element.
 * @param {HTMLCanvasElement} canvas
 */
export function createDocumentViewer(canvas) {
  return {
    /**
     * Render an image bitmap to the canvas.
     * @param {ImageBitmap} bitmap
     */
    render(bitmap) {
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
    },

    clear() {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}
