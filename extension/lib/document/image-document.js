// Image document helper for single-image files.

/**
 * Decode an image file into an ImageBitmap with EXIF orientation applied.
 * @param {ArrayBuffer} bytes
 * @param {string} mimeType
 * @returns {Promise<ImageBitmap>}
 */
export async function decodeImage(bytes, mimeType) {
  const blob = new Blob([bytes], { type: mimeType });
  // createImageBitmap applies EXIF orientation by default in Chromium
  return createImageBitmap(blob, { imageOrientation: "from-image" });
}
