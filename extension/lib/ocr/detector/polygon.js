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
/**
 * Expand a polygon outward using the unclip ratio.
 * Uses offset-line expansion: for each edge, compute the outward normal
 * and offset both endpoints by normal * distance.
 * @param {Array<[number, number]>} polygon
 * @param {number} ratio
 * @returns {Array<[number, number]>}
 */
export function expandPolygon(polygon, ratio) {
  if (polygon.length < 3) return polygon;

  const signedArea = polygonAreaSigned(polygon);
  const area = Math.abs(signedArea);
  const perimeter = polygonPerimeter(polygon);
  if (perimeter < 1e-6) return polygon;

  const distance = (area * ratio) / perimeter;
  const sign = signedArea > 0 ? -1 : 1;

  const expanded = [];
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const prev = polygon[(i - 1 + n) % n];
    const curr = polygon[i];
    const next = polygon[(i + 1) % n];

    const dx1 = curr[0] - prev[0];
    const dy1 = curr[1] - prev[1];
    const len1 = Math.hypot(dx1, dy1);
    if (len1 < 1e-6) {
      expanded.push(curr);
      continue;
    }
    const nx1 = (-dy1 / len1) * sign;
    const ny1 = (dx1 / len1) * sign;

    const dx2 = next[0] - curr[0];
    const dy2 = next[1] - curr[1];
    const len2 = Math.hypot(dx2, dy2);
    if (len2 < 1e-6) {
      expanded.push([curr[0] + nx1 * distance, curr[1] + ny1 * distance]);
      continue;
    }
    const nx2 = (-dy2 / len2) * sign;
    const ny2 = (dx2 / len2) * sign;

    const mx = (nx1 + nx2) / 2;
    const my = (ny1 + ny2) / 2;
    const mlen = Math.hypot(mx, my);
    if (mlen < 1e-6) {
      expanded.push([curr[0] + nx1 * distance, curr[1] + ny1 * distance]);
      continue;
    }

    const cosHalfAngle = (nx1 * mx + ny1 * my) / mlen;
    const offset = distance / Math.max(cosHalfAngle, 0.1);

    expanded.push([curr[0] + mx / mlen * offset, curr[1] + my / mlen * offset]);
  }

  return expanded;
}

function polygonAreaSigned(polygon) {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % polygon.length];
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function polygonPerimeter(polygon) {
  let perim = 0;
  for (let i = 0; i < polygon.length; i++) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % polygon.length];
    perim += Math.hypot(x2 - x1, y2 - y1);
  }
  return perim;
}

export function minAreaRect(_polygon) {
  throw new Error("minAreaRect not yet implemented — Phase 3");
}
