// Tiling utilities for dense-page detection.

/**
 * Split a page into overlapping tiles.
 * @param {{ width: number, height: number }} pageSize
 * @param {number} cols - Grid columns
 * @param {number} rows - Grid rows
 * @param {number} overlap - Overlap fraction (0–1)
 * @returns {Array<{ x: number, y: number, width: number, height: number }>}
 */
export function createTiles(pageSize, cols = 2, rows = 2, overlap = 0.12) {
  const tileW = pageSize.width / (cols - (cols - 1) * overlap);
  const tileH = pageSize.height / (rows - (rows - 1) * overlap);
  const stepX = tileW * (1 - overlap);
  const stepY = tileH * (1 - overlap);

  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({
        x: Math.round(c * stepX),
        y: Math.round(r * stepY),
        width: Math.round(tileW),
        height: Math.round(tileH),
      });
    }
  }
  return tiles;
}

/**
 * Map a polygon from tile coordinates back to page coordinates.
 * @param {Array<[number, number]>} polygon
 * @param {{ x: number, y: number }} tileOffset
 * @returns {Array<[number, number]>}
 */
export function mapToPage(polygon, tileOffset) {
  return polygon.map(([x, y]) => [x + tileOffset.x, y + tileOffset.y]);
}
