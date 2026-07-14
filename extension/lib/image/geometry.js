// Geometry utilities for bounding boxes and coordinate transforms.

/**
 * Compute the axis-aligned bounding box of a polygon.
 * @param {Array<[number, number]>} polygon
 * @returns {[number, number, number, number]} [x, y, width, height]
 */
export function boundingBox(polygon) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of polygon) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX - minX, maxY - minY];
}

/**
 * Scale polygon coordinates by a factor.
 * @param {Array<[number, number]>} polygon
 * @param {number} sx
 * @param {number} sy
 * @returns {Array<[number, number]>}
 */
export function scalePolygon(polygon, sx, sy) {
  return polygon.map(([x, y]) => [x * sx, y * sy]);
}

/**
 * Translate polygon coordinates by an offset.
 * @param {Array<[number, number]>} polygon
 * @param {number} dx
 * @param {number} dy
 * @returns {Array<[number, number]>}
 */
export function translatePolygon(polygon, dx, dy) {
  return polygon.map(([x, y]) => [x + dx, y + dy]);
}

/**
 * Compute IoU (intersection over union) of two bounding boxes.
 * @param {[number, number, number, number]} a
 * @param {[number, number, number, number]} b
 * @returns {number}
 */
export function iou(a, b) {
  const [ax, ay, aw, ah] = a;
  const [bx, by, bw, bh] = b;
  const x1 = Math.max(ax, bx);
  const y1 = Math.max(ay, by);
  const x2 = Math.min(ax + aw, bx + bw);
  const y2 = Math.min(ay + ah, by + bh);
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = aw * ah + bw * bh - intersection;
  return union > 0 ? intersection / union : 0;
}
