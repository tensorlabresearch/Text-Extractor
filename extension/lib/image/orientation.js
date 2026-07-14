// Image orientation and rotation utilities.

/**
 * Rotate an ImageBitmap by a multiple of 90 degrees.
 * @param {ImageBitmap} bitmap
 * @param {number} degrees - 0, 90, 180, or 270
 * @returns {Promise<ImageBitmap>}
 */
export async function rotateBitmap(bitmap, degrees) {
  const normalized = ((degrees % 360) + 360) % 360;
  if (normalized === 0) return bitmap;

  const canvas = new OffscreenCanvas(
    normalized === 90 || normalized === 270 ? bitmap.height : bitmap.width,
    normalized === 90 || normalized === 270 ? bitmap.width : bitmap.height
  );
  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((normalized * Math.PI) / 180);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  return canvas.transferToImageBitmap();
}
