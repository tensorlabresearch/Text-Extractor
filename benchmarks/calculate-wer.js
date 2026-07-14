// Calculate Word Error Rate (WER) between recognized and ground-truth text.

/**
 * @param {string} recognized
 * @param {string} groundTruth
 * @returns {number} WER (0 = perfect, 1 = completely wrong)
 */
export function calculateWER(recognized, groundTruth) {
  const r = recognized.trim().split(/\s+/).filter(Boolean);
  const g = groundTruth.trim().split(/\s+/).filter(Boolean);
  if (g.length === 0) return r.length === 0 ? 0 : 1;

  const dp = Array.from({ length: r.length + 1 }, (_, i) => [i, ...new Array(g.length).fill(0)]);
  for (let j = 0; j <= g.length; j++) dp[0][j] = j;

  for (let i = 1; i <= r.length; i++) {
    for (let j = 1; j <= g.length; j++) {
      const cost = r[i - 1] === g[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[r.length][g.length] / g.length;
}
