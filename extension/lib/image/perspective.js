// Perspective correction using four-point transform.

/**
 * Apply a four-point perspective transform to crop a text line.
 * @param {ImageData|ImageBitmap} source
 * @param {Array<[number, number]>} polygon - Four corners
 * @param {number} padRatio - Padding as fraction of line height (0.08–0.12)
 * @returns {Promise<ImageBitmap>}
 */
export async function perspectiveCrop(source, polygon, _padRatio = 0.1) {
  // TODO: implement in Phase 4
  throw new Error("Perspective crop not yet implemented — Phase 4");
}

/**
 * Compute the output dimensions for a perspective-corrected crop.
 * @param {Array<[number, number]>} polygon
 * @returns {{ width: number, height: number }}
 */
export function computeCropDimensions(polygon) {
  const [tl, tr, br, bl] = polygon;
  const widthTop = Math.hypot(tr[0] - tl[0], tr[1] - tl[1]);
  const widthBottom = Math.hypot(br[0] - bl[0], br[1] - bl[1]);
  const heightLeft = Math.hypot(bl[0] - tl[0], bl[1] - tl[1]);
  const heightRight = Math.hypot(br[0] - tr[0], br[1] - tr[1]);
  return {
    width: Math.max(widthTop, widthBottom),
    height: Math.max(heightLeft, heightRight),
  };
}
