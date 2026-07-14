// Native text-layer credibility classifier.
//
// Decides whether a PDF page's embedded text layer is credible enough
// to use directly, or whether OCR should be used instead.

/**
 * @typedef {Object} TextLayerStats
 * @property {number} nonWhitespaceChars
 * @property {number} printableRatio
 * @property {number} replacementCharRatio
 * @property {number} credibleGeometryRatio
 * @property {number} uniquePositions
 * @property {number} duplicatePositionRatio
 * @property {boolean} allOffPage
 */

/**
 * Compute statistics about a text layer.
 * @param {Array<{ str: string, transform: number[], width: number, height: number }>} items
 * @param {{ width: number, height: number }} viewport
 * @returns {TextLayerStats}
 */
export function computeStats(items, viewport) {
  const nonEmpty = items.filter((it) => it.str.trim().length > 0);
  const totalChars = items.reduce((sum, it) => sum + it.str.length, 0);
  const nonWhitespaceChars = items.reduce(
    (sum, it) => sum + it.str.replace(/\s/g, "").length,
    0
  );

  const replacementChars = items.reduce(
    (sum, it) => sum + (it.str.match(/\uFFFD/g) || []).length,
    0
  );

  const printableChars = items.reduce(
    (sum, it) =>
      sum + (it.str.match(/[\x20-\x7E\u00A0-\uFFFF]/g) || []).length,
    0
  );

  const withGeometry = nonEmpty.filter(
    (it) => it.width > 0 && it.height > 0
  );

  const positions = new Set();
  let duplicates = 0;
  for (const it of nonEmpty) {
    const key = `${Math.round(it.transform?.[4] || 0)},${Math.round(it.transform?.[5] || 0)}`;
    if (positions.has(key)) duplicates++;
    else positions.add(key);
  }

  const allOffPage = nonEmpty.length > 0 && nonEmpty.every((it) => {
    const x = it.transform?.[4] || 0;
    const y = it.transform?.[5] || 0;
    return x < 0 || y < 0 || x > viewport.width || y > viewport.height;
  });

  return {
    nonWhitespaceChars,
    printableRatio: totalChars > 0 ? printableChars / totalChars : 0,
    replacementCharRatio: totalChars > 0 ? replacementChars / totalChars : 0,
    credibleGeometryRatio: nonEmpty.length > 0 ? withGeometry.length / nonEmpty.length : 0,
    uniquePositions: positions.size,
    duplicatePositionRatio: nonEmpty.length > 0 ? duplicates / nonEmpty.length : 0,
    allOffPage,
  };
}

/**
 * Decide whether a text layer is credible.
 *
 * Use native text when:
 * - at least 20 non-whitespace characters exist,
 * - printable-character ratio is at least 90%,
 * - at least 70% of non-empty items have credible geometry,
 * - replacement-character ratio is below 5%,
 * - coordinate duplication is not pathological.
 *
 * @param {TextLayerStats} stats
 * @returns {boolean}
 */
export function isCredible(stats) {
  if (stats.nonWhitespaceChars < 20) return false;
  if (stats.printableRatio < 0.9) return false;
  if (stats.credibleGeometryRatio < 0.7) return false;
  if (stats.replacementCharRatio >= 0.05) return false;
  if (stats.duplicatePositionRatio > 0.5) return false;
  if (stats.allOffPage) return false;
  return true;
}

/**
 * Classify a page's text layer.
 * @param {Array<{ str: string, transform: number[], width: number, height: number }>} items
 * @param {{ width: number, height: number }} viewport
 * @returns {{"native"|"ocr", stats: TextLayerStats}}
 */
export function classifyTextLayer(items, viewport) {
  const stats = computeStats(items, viewport);
  return { source: isCredible(stats) ? "native" : "ocr", stats };
}
