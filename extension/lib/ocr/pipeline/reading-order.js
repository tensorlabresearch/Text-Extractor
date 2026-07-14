// Reading-order reconstruction.
//
// Groups lines by vertical overlap, clusters into columns using x-position
// gaps or recursive XY-cut, orders columns left-to-right and lines top-to-bottom.

/**
 * Assign reading order to recognized lines.
 * @param {Array<{ polygon: Array<[number, number]>, readingOrder?: number }>} lines
 * @returns {Array<{ polygon: Array<[number, number]>, readingOrder: number }>}
 */
export function assignReadingOrder(lines) {
  if (lines.length === 0) return [];

  // Simple top-to-bottom, left-to-right ordering for V1.
  // TODO: implement column detection and XY-cut in Phase 5.
  const sorted = [...lines].sort((a, b) => {
    const ay = a.polygon[0]?.[1] ?? 0;
    const by = b.polygon[0]?.[1] ?? 0;
    const ax = a.polygon[0]?.[0] ?? 0;
    const bx = b.polygon[0]?.[0] ?? 0;
    // Group by approximate row (50px tolerance)
    if (Math.abs(ay - by) > 50) return ay - by;
    return ax - bx;
  });

  return sorted.map((line, i) => ({
    ...line,
    readingOrder: i,
  }));
}
