// Image decoding utilities.

/**
 * Decode an image ArrayBuffer into an ImageBitmap with EXIF orientation.
 * @param {ArrayBuffer} bytes
 * @param {string} mimeType
 * @returns {Promise<ImageBitmap>}
 */
export async function decodeImage(bytes, mimeType) {
  const blob = new Blob([bytes], { type: mimeType });
  return createImageBitmap(blob, { imageOrientation: "from-image" });
}

/**
 * Check if a MIME type is a supported image format.
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isSupportedImage(mimeType) {
  return ["image/png", "image/jpeg", "image/webp"].includes(mimeType);
}
