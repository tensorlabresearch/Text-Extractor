// Connected components labeling for DB postprocessing.
//
// Two-pass connected components algorithm on a binary mask.

/**
 * Label connected components in a binary mask.
 * @param {Uint8Array} mask - Binary mask [H * W], non-zero = foreground.
 * @param {number} width
 * @param {number} height
 * @returns {{ labels: Int32Array, count: number }} - Label map and component count.
 */
export function connectedComponents(mask, width, height) {
  const labels = new Int32Array(width * height);
  let count = 0;
  const stack = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] === 0 || labels[idx] !== 0) continue;
      count++;
      labels[idx] = count;
      stack.push(idx);
      while (stack.length > 0) {
        const cur = stack.pop();
        const cx = cur % width;
        const cy = (cur / width) | 0;
        const neighbors = [
          cx > 0 ? cur - 1 : -1,
          cx < width - 1 ? cur + 1 : -1,
          cy > 0 ? cur - width : -1,
          cy < height - 1 ? cur + width : -1,
        ];
        for (const n of neighbors) {
          if (n >= 0 && mask[n] !== 0 && labels[n] === 0) {
            labels[n] = count;
            stack.push(n);
          }
        }
      }
    }
  }

  return { labels, count };
}
