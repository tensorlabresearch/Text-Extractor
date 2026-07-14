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
import { connectedComponents } from "./connected-components.js";
import { expandPolygon } from "./polygon.js";
import { boundingBox } from "../../image/geometry.js";

/**
 * Run DB postprocessing on a probability map.
 *
 * @param {Float32Array} probMap - Probability map [H * W], values 0–1
 * @param {number} width - Map width
 * @param {number} height - Map height
 * @param {number} sourceWidth - Original image width
 * @param {number} sourceHeight - Original image height
 * @param {Object} [params]
 * @returns {Array<{ polygon: Array<[number, number]>, score: number, boundingBox: [number, number, number, number] }>}
 */
export function dbPostprocess(probMap, width, height, sourceWidth, sourceHeight, params = {}) {
  const {
    threshold = DB_DEFAULTS.threshold,
    boxThreshold = DB_DEFAULTS.boxThreshold,
    maxCandidates = DB_DEFAULTS.maxCandidates,
    unclipRatio = DB_DEFAULTS.unclipRatio,
    minArea = DB_DEFAULTS.minArea,
  } = params;

  const ratioW = sourceWidth / width;
  const ratioH = sourceHeight / height;

  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    mask[i] = probMap[i] > threshold ? 1 : 0;
  }

  const { labels } = connectedComponents(mask, width, height);
  const results = [];

  const contours = new Map();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const label = labels[y * width + x];
      if (label === 0) continue;
      if (!contours.has(label)) contours.set(label, []);
      const points = contours.get(label);
      const isBoundary =
        x === 0 || y === 0 || x === width - 1 || y === height - 1 ||
        labels[y * width + (x - 1)] !== label ||
        labels[y * width + (x + 1)] !== label ||
        labels[(y - 1) * width + x] !== label ||
        labels[(y + 1) * width + x] !== label;
      if (isBoundary) {
        points.push([x, y]);
      }
    }
  }

  const sortedLabels = Array.from(contours.keys()).sort((a, b) => {
    const ca = contours.get(a).length;
    const cb = contours.get(b).length;
    return cb - ca;
  });

  for (const label of sortedLabels) {
    if (results.length >= maxCandidates) break;

    const contour = contours.get(label);
    if (contour.length < 3) continue;

    const rect = minAreaRect(contour);
    const boxScore = computeBoxScore(probMap, rect.corners, width);

    if (boxScore < boxThreshold) continue;

    const expanded = expandPolygon(rect.corners, unclipRatio);

    const area = polygonAreaSigned(expanded);
    if (Math.abs(area) < minArea) continue;

    const mappedPolygon = expanded.map(([x, y]) => [
      Math.max(0, Math.min(sourceWidth, x * ratioW)),
      Math.max(0, Math.min(sourceHeight, y * ratioH)),
    ]);

    results.push({
      polygon: mappedPolygon,
      score: boxScore,
      boundingBox: boundingBox(mappedPolygon),
    });
  }

  return results;
}

function computeBoxScore(probMap, corners, width) {
  let sum = 0;
  let _count = 0;

  const xs = corners.map((c) => c[0]);
  const ys = corners.map((c) => c[1]);
  const minX = Math.floor(Math.min(...xs));
  const maxX = Math.ceil(Math.max(...xs));
  const minY = Math.floor(Math.min(...ys));
  const maxY = Math.ceil(Math.max(...ys));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (x < 0 || x >= width || y < 0 || y >= probMap.length / width) continue;
      if (pointInPolygon([x, y], corners)) {
        sum += probMap[y * width + x];
        _count++;
      }
    }
  }

  return _count > 0 ? sum / _count : 0;
}

function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
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

function minAreaRect(contour) {
  if (contour.length <= 2) {
    const xs = contour.map((p) => p[0]);
    const ys = contour.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return {
      corners: [[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]],
      center: [(minX + maxX) / 2, (minY + maxY) / 2],
      width: maxX - minX,
      height: maxY - minY,
      angle: 0,
    };
  }

  const hull = convexHull(contour);

  let minArea = Infinity;
  let bestRect = null;

  for (let i = 0; i < hull.length; i++) {
    const j = (i + 1) % hull.length;
    const [x1, y1] = hull[i];
    const [x2, y2] = hull[j];

    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    if (length < 1e-6) continue;

    const ax = dx / length;
    const ay = dy / length;
    const px = -ay;
    const py = ax;

    let minProjA = Infinity, maxProjA = -Infinity;
    let minProjP = Infinity, maxProjP = -Infinity;

    for (const [x, y] of hull) {
      const projA = (x - x1) * ax + (y - y1) * ay;
      const projP = (x - x1) * px + (y - y1) * py;
      if (projA < minProjA) minProjA = projA;
      if (projA > maxProjA) maxProjA = projA;
      if (projP < minProjP) minProjP = projP;
      if (projP > maxProjP) maxProjP = projP;
    }

    const w = maxProjA - minProjA;
    const h = maxProjP - minProjP;
    const area = w * h;

    if (area < minArea) {
      minArea = area;
      const cx = x1 + ax * (minProjA + maxProjA) / 2 + px * (minProjP + maxProjP) / 2;
      const cy = y1 + ay * (minProjA + maxProjA) / 2 + py * (minProjP + maxProjP) / 2;

      const corners = [
        [x1 + ax * minProjA + px * minProjP, y1 + ay * minProjA + py * minProjP],
        [x1 + ax * maxProjA + px * minProjP, y1 + ay * maxProjA + py * minProjP],
        [x1 + ax * maxProjA + px * maxProjP, y1 + ay * maxProjA + py * maxProjP],
        [x1 + ax * minProjA + px * maxProjP, y1 + ay * minProjA + py * maxProjP],
      ];

      bestRect = {
        corners,
        center: [cx, cy],
        width: w,
        height: h,
        angle: Math.atan2(ay, ax),
      };
    }
  }

  return bestRect || {
    corners: contour.slice(0, 4),
    center: [0, 0],
    width: 0,
    height: 0,
    angle: 0,
  };
}

function convexHull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length <= 2) return sorted;

  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
