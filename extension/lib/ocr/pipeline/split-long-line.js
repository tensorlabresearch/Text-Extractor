// Split long text-line crops for TrOCR.
//
// TrOCR's processor resizes every image to 384×384, which can heavily
// distort wide lines. Splitting at low-ink vertical projection valleys
// mitigates this.

/**
 * Check if a crop should be split.
 * @param {{ width: number, height: number }} dimensions
 * @returns {boolean}
 */
export function shouldSplit(dimensions) {
  const aspectRatio = dimensions.width / dimensions.height;
  return aspectRatio > 8;
}

/**
 * Estimate split points using vertical projection of ink density.
 * @param {ImageData} imageData
 * @returns {number[]} - X coordinates of split points.
 */
export function findSplitPoints(imageData) {
  // TODO: implement vertical projection analysis in Phase 4
  return [];
}

/**
 * Split a crop at the given x coordinates.
 * @param {ImageBitmap} bitmap
 * @param {number[]} splitPoints
 * @returns {Promise<ImageBitmap[]>}
 */
export async function splitAt(bitmap, splitPoints) {
  if (splitPoints.length === 0) return [bitmap];

  const parts = [];
  const bounds = [0, ...splitPoints, bitmap.width];
  for (let i = 0; i < bounds.length - 1; i++) {
    const canvas = new OffscreenCanvas(bounds[i + 1] - bounds[i], bitmap.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, bounds[i], 0, bounds[i + 1] - bounds[i], bitmap.height, 0, 0, bounds[i + 1] - bounds[i], bitmap.height);
    parts.push(canvas.transferToImageBitmap());
  }
  return parts;
}
