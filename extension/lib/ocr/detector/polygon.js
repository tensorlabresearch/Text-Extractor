// Polygon utilities.

/**
 * Compute the area of a polygon using the shoelace formula.
 * @param {Array<[number, number]>} polygon
 * @returns {number}
 */
export function polygonArea(polygon) {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % polygon.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

/**
 * Expand a polygon outward using the unclip ratio.
 * @param {Array<[number, number]>} polygon
 * @param {number} ratio
 * @returns {Array<[number, number]>}
 */
export function unclipPolygon(polygon, ratio) {
  // TODO: implement proper offset curve in Phase 3
  // For now, expand bounding box by ratio
  return polygon;
}

/**
 * Compute the minimum-area bounding rectangle of a polygon.
 * @param {Array<[number, number]>} polygon
 * @returns {{ center: [number, number], width: number, height: number, angle: number }}
 */
export function minAreaRect(polygon) {
  // TODO: implement rotating calipers in Phase 3
  throw new Error("minAreaRect not yet implemented — Phase 3");
}
