// Page pipeline orchestrator.
//
// Coordinates detection, crop/rectification, recognition, and reading-order
// reconstruction for a single page. Independent of the specific model backends.

/**
 * Run the full OCR pipeline on a page image.
 *
 * @param {Object} params
 * @param {import("../detector/detector-backend.js").DetectorBackend} params.detector
 * @param {import("../recognizer/recognizer-backend.js").RecognizerBackend} params.recognizer
 * @param {ImageData|ImageBitmap} params.image
 * @param {Object} [params.options]
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<import("../protocol.js").PageResult>}
 */
export async function runPagePipeline({ detector, _recognizer, image, options = {}, signal }) {
  if (signal?.aborted) throw new Error("Aborted");

  // Stage 2: Detect text regions
  const _regions = await detector.detect(image, options, signal);
  if (signal?.aborted) throw new Error("Aborted");

  // Stage 5: Crop and perspective correction
  // TODO: import cropLines in Phase 4
  // const crops = await cropLines(image, regions, options);

  // Stage 7: Recognize
  // const recognitionResults = await recognizer.recognize(crops, options, signal);

  // Stage 9: Reading order
  // TODO: implement reading-order in Phase 5

  // TODO: assemble PageResult in Phase 5
  throw new Error("Page pipeline not yet implemented — Phase 4/5");
}
