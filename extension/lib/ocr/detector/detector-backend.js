// Abstract detector backend interface.

/**
 * @typedef {Object} TextRegion
 * @property {string} id
 * @property {Array<[number, number]>} polygon
 * @property {[number, number, number, number]} boundingBox
 * @property {number} detectorScore
 * @property {number} estimatedAngle
 */

/**
 * Abstract detector interface.
 * Subclasses must implement load(), detect(), and dispose().
 */
export class DetectorBackend {
  /**
   * @param {Object} _options
   * @returns {Promise<void>}
   */
  async load(_options) {
    throw new Error("Not implemented");
  }

  /**
   * @param {ImageData|ImageBitmap|OffscreenCanvas} _image
   * @param {Object} _options
   * @param {AbortSignal} _signal
   * @returns {Promise<TextRegion[]>}
   */
  async detect(_image, _options, _signal) {
    throw new Error("Not implemented");
  }

  /**
   * @returns {Promise<void>}
   */
  async dispose() {
    throw new Error("Not implemented");
  }
}
