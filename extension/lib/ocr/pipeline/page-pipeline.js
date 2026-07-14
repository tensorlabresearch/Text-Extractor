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
import { cropLines } from "./crop-lines.js";
import { assignReadingOrder } from "./reading-order.js";
import { normalizeText } from "./text-normalization.js";

export async function runPagePipeline({ detector, recognizer, image, options = {}, signal }) {
  if (signal?.aborted) throw new Error("Aborted");

  const regions = await detector.detect(image, options, signal);
  if (signal?.aborted) throw new Error("Aborted");

  if (regions.length === 0) {
    return {
      pageNumber: options.pageNumber || 1,
      source: options.source || "ocr",
      width: options.width || 0,
      height: options.height || 0,
      lines: [],
      plainText: "",
      diagnostics: {
        engine: detector.engine,
        detectorDuration: 0,
        recognizerDuration: 0,
        detectedLines: 0,
      },
    };
  }

  const crops = await cropLines(image, regions, options.padRatio || 0.1);
  if (signal?.aborted) throw new Error("Aborted");

  const recognitionResults = await recognizer.recognize(
    crops.map((c) => c.bitmap),
    options,
    signal
  );
  if (signal?.aborted) throw new Error("Aborted");

  let lines = regions.map((region, i) => ({
    id: region.id,
    text: normalizeText(recognitionResults[i]?.text || ""),
    polygon: region.polygon,
    readingOrder: i,
    detectorScore: region.detectorScore,
    recognitionScore: recognitionResults[i]?.score ?? null,
    userEdited: false,
    diagnostics: recognitionResults[i]?.diagnostics || {},
  }));

  lines = assignReadingOrder(lines);

  const plainText = lines
    .slice()
    .sort((a, b) => a.readingOrder - b.readingOrder)
    .map((l) => l.text)
    .join("\n");

  return {
    pageNumber: options.pageNumber || 1,
    source: options.source || "ocr",
    width: options.width || 0,
    height: options.height || 0,
    lines,
    plainText,
    diagnostics: {
      engine: recognizer.engine,
      detectedLines: regions.length,
    },
  };
}
