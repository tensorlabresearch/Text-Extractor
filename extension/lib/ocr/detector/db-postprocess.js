// DB (Differentiable Binarization) postprocessing.
//
// Thresholds the probability map, finds connected components, computes
// rotated boxes, applies box threshold, expands with unclip ratio, and
// maps coordinates back to the source image.

export const DB_DEFAULTS = Object.freeze({
  threshold: 0.3,
  boxThreshold: 0.6,
  maxCandidates: 1000,
  unclipRatio: 1.5,
  minArea: 10,
});

/**
 * Run DB postprocessing on a probability map.
 *
 * @param {Float32Array} probMap - Probability map [H * W]
 * @param {number} width
 * @param {number} height
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @param {Object} [params]
 * @returns {Array<{ polygon: Array<[number, number]>, score: number, boundingBox: [number, number, number, number] }>}
 */
export function dbPostprocess(probMap, width, height, sourceWidth, sourceHeight, _params = {}) {
  // TODO: implement in Phase 3
  // 1. Threshold the probability map
  // 2. Find connected components or contours
  // 3. Reject components below minimum area
  // 4. Compute rotated minimum-area rectangle or polygon
  // 5. Calculate box score
  // 6. Apply box threshold
  // 7. Expand polygon using unclip ratio
  // 8. Map coordinates to source image
  throw new Error("DB postprocessing not yet implemented — Phase 3");
}
