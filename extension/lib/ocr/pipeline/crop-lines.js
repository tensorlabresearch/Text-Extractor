// Crop text lines from a page image using detected regions.

import { perspectiveCrop } from "../../image/perspective.js";

/**
 * Crop text line regions from a page image.
 * @param {ImageData|ImageBitmap} image
 * @param {Array<{ polygon: Array<[number, number]> }>} regions
 * @param {number} padRatio
 * @returns {Promise<Array<{ bitmap: ImageBitmap, regionId: string }>>}
 */
export async function cropLines(image, regions, padRatio = 0.1) {
  const crops = [];
  for (const region of regions) {
    const bitmap = await perspectiveCrop(image, region.polygon, padRatio);
    crops.push({ bitmap, regionId: region.id });
  }
  return crops;
}
