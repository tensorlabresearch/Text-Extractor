// Model registry — maps logical model names to extension-local paths.

/**
 * @typedef {Object} ModelEntry
 * @property {string} id
 * @property {string} path - Extension-relative path to model directory.
 * @property {string[]} files - Required files.
 */

/** @type {Record<string, ModelEntry>} */
const REGISTRY = {
  "trocr-small-printed": {
    id: "trocr-small-printed",
    path: "models/trocr-small-printed",
    files: [
      "onnx/encoder_model_quantized.onnx",
      "onnx/decoder_model_merged_quantized.onnx",
      "config.json",
      "generation_config.json",
      "preprocessor_config.json",
      "tokenizer.json",
      "tokenizer_config.json",
      "sentencepiece.bpe.model",
      "special_tokens_map.json",
    ],
  },
  "ppocrv5-mobile-det": {
    id: "ppocrv5-mobile-det",
    path: "models/ppocrv5-mobile-det",
    files: [
      "inference.onnx",
      "inference.yml",
    ],
  },
};

/**
 * Get a model entry by ID.
 * @param {string} id
 * @returns {ModelEntry}
 */
export function getModelEntry(id) {
  const entry = REGISTRY[id];
  if (!entry) throw new Error(`Unknown model: ${id}`);
  return entry;
}

/**
 * Get the full extension URL for a model file.
 * @param {string} modelId
 * @param {string} file
 * @returns {string}
 */
export function getModelUrl(modelId, file) {
  const entry = getModelEntry(modelId);
  return chrome.runtime.getURL(`${entry.path}/${file}`);
}

/**
 * List all registered model IDs.
 * @returns {string[]}
 */
export function listModels() {
  return Object.keys(REGISTRY);
}
