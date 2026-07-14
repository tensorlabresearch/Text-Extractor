// Abstract recognizer backend interface.

/**
 * @typedef {Object} RecognitionResult
 * @property {string} text
 * @property {number|null} score
 * @property {Object} diagnostics
 */

/**
 * Abstract recognition interface.
 * Subclasses must implement load(), recognize(), and dispose().
 */
export class RecognizerBackend {
  /**
   * @param {Object} _options
   * @returns {Promise<void>}
   */
  async load(_options) {
    throw new Error("Not implemented");
  }

  /**
   * @param {Array<ImageBitmap|ImageData>} _crops
   * @param {Object} _options
   * @param {AbortSignal} _signal
   * @returns {Promise<RecognitionResult[]>}
   */
  async recognize(_crops, _options, _signal) {
    throw new Error("Not implemented");
  }

  /**
   * @returns {Promise<void>}
   */
  async dispose() {
    throw new Error("Not implemented");
  }
}
