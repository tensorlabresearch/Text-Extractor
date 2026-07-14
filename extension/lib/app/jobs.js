// Job definitions and types.

/**
 * @typedef {Object} OcrJob
 * @property {string} id
 * @property {"page"|"range"|"all"} scope
 * @property {number[]} pageNumbers
 * @property {"native"|"ocr"|"forced-ocr"} source
 * @property {"pending"|"running"|"cancelled"|"done"|"error"} status
 * @property {AbortController|null} abortController
 */
