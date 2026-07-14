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
 * @param {ImageData|ImageBitmap} image
 * @returns {{ tensor: Float32Array, width: number, height: number, scale: number }}
 */
export function preprocessForDetector(_image) {
  // TODO: implement in Phase 3
  throw new Error("Detector preprocessing not yet implemented — Phase 3");
}
