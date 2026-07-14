// Page render cache with bounded size.

export function createPageCache(maxEntries = 8) {
  const cache = new Map();

  return {
    /**
     * @param {number} pageNumber
     * @returns {boolean}
     */
    has(pageNumber) {
      return cache.has(pageNumber);
    },

    /**
     * @param {number} pageNumber
     * @returns {ImageBitmap|undefined}
     */
    get(pageNumber) {
      const value = cache.get(pageNumber);
      if (value) {
        // Move to end (LRU)
        cache.delete(pageNumber);
        cache.set(pageNumber, value);
      }
      return value;
    },

    /**
     * @param {number} pageNumber
     * @param {ImageBitmap} bitmap
     */
    set(pageNumber, bitmap) {
      if (cache.has(pageNumber)) cache.delete(pageNumber);
      cache.set(pageNumber, bitmap);
      while (cache.size > maxEntries) {
        const oldest = cache.keys().next().value;
        const entry = cache.get(oldest);
        if (entry && typeof entry.close === "function") entry.close();
        cache.delete(oldest);
      }
    },

    /**
     * @param {number} pageNumber
     */
    evict(pageNumber) {
      const entry = cache.get(pageNumber);
      if (entry && typeof entry.close === "function") entry.close();
      cache.delete(pageNumber);
    },

    clear() {
      for (const entry of cache.values()) {
        if (entry && typeof entry.close === "function") entry.close();
      }
      cache.clear();
    },

    get size() {
      return cache.size;
    },
  };
}
