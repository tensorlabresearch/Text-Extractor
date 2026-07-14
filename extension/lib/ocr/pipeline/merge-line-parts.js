// Merge split line parts back into a single text line.
//
// Deduplicates repeated boundary characters from overlapping crops.

/**
 * Merge recognized text from split parts.
 * @param {string[]} parts
 * @param {number} overlapChars - Approximate overlap character count.
 * @returns {string}
 */
export function mergeLineParts(parts, overlapChars = 2) {
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];

  let result = parts[0];
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (overlapChars > 0 && result.length >= overlapChars) {
      const tail = result.slice(-overlapChars);
      if (part.startsWith(tail)) {
        result += part.slice(overlapChars);
      } else {
        result += part;
      }
    } else {
      result += part;
    }
  }
  return result;
}
