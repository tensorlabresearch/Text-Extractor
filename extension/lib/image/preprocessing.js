// Image preprocessing for OCR.
//
// Applies detector preprocessing: RGB→BGR, resize, normalize, HWC→CHW.

export const DETECTOR_PREPROCESS = Object.freeze({
  resizeLongSide: 960,
  colorOrder: "BGR",
  mean: [0.485, 0.456, 0.406],
  std: [0.229, 0.224, 0.225],
});

/**
 * Preprocess an image for the PP-OCRv5 detector.
 *
 * @param {ImageData|ImageBitmap|OffscreenCanvas} image
 * @returns {{ tensor: Float32Array, width: number, height: number, origWidth: number, origHeight: number, ratioW: number, ratioH: number }}
 */
export function preprocessForDetector(image) {
  let bitmap;
  if (image instanceof ImageData) {
    bitmap = image;
  } else if (image instanceof ImageBitmap) {
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    bitmap = ctx.getImageData(0, 0, image.width, image.height);
  } else if (image instanceof OffscreenCanvas) {
    const ctx = image.getContext("2d");
    bitmap = ctx.getImageData(0, 0, image.width, image.height);
  } else {
    throw new Error("Unsupported image type for detector preprocessing");
  }

  const origW = bitmap.width;
  const origH = bitmap.height;

  const longSide = DETECTOR_PREPROCESS.resizeLongSide;
  let resizeW, resizeH;
  const ratio = longSide / Math.max(origW, origH);
  resizeW = Math.round(origW * ratio);
  resizeH = Math.round(origH * ratio);

  resizeW = Math.max(32, Math.ceil(resizeW / 32) * 32);
  resizeH = Math.max(32, Math.ceil(resizeH / 32) * 32);

  const tempCanvas = new OffscreenCanvas(origW, origH);
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.putImageData(bitmap, 0, 0);
  const resizedCanvas = new OffscreenCanvas(resizeW, resizeH);
  const resizedCtx = resizedCanvas.getContext("2d");
  resizedCtx.drawImage(tempCanvas, 0, 0, origW, origH, 0, 0, resizeW, resizeH);
  const resizedData = resizedCtx.getImageData(0, 0, resizeW, resizeH).data;

  const { mean, std } = DETECTOR_PREPROCESS;
  const tensor = new Float32Array(3 * resizeW * resizeH);

  for (let i = 0; i < resizeW * resizeH; i++) {
    const r = resizedData[i * 4];
    const g = resizedData[i * 4 + 1];
    const b = resizedData[i * 4 + 2];

    tensor[0 * resizeW * resizeH + i] = (b / 255.0 - mean[0]) / std[0];
    tensor[1 * resizeW * resizeH + i] = (g / 255.0 - mean[1]) / std[1];
    tensor[2 * resizeW * resizeH + i] = (r / 255.0 - mean[2]) / std[2];
  }

  return {
    tensor,
    width: resizeW,
    height: resizeH,
    origWidth: origW,
    origHeight: origH,
    ratioW: origW / resizeW,
    ratioH: origH / resizeH,
  };
}
