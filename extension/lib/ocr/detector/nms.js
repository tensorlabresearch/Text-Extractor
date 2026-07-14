// Non-maximum suppression for detected text regions.

import { iou } from "../../image/geometry.js";

/**
 * Apply NMS to a list of detected regions.
 * @param {Array<{ boundingBox: [number, number, number, number], detectorScore: number }>} detections
 * @param {number} [threshold] - IoU threshold (default 0.4)
 * @returns {number[]} - Indices of kept detections.
 */
export function nms(detections, threshold = 0.4) {
  const indices = detections
    .map((d, i) => ({ i, score: d.detectorScore }))
    .sort((a, b) => b.score - a.score);

  const kept = [];
  const suppressed = new Set();

  for (const { i } of indices) {
    if (suppressed.has(i)) continue;
    kept.push(i);
    for (const { i: j } of indices) {
      if (j === i || suppressed.has(j)) continue;
      if (iou(detections[i].boundingBox, detections[j].boundingBox) > threshold) {
        suppressed.add(j);
      }
    }
  }

  return kept;
}
