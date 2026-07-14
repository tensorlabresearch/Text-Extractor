import { describe, it, expect } from "vitest";
import { computeStats, isCredible, classifyTextLayer } from "../../extension/lib/pdf/text-layer-classifier.js";

describe("text-layer-classifier", () => {
  it("rejects an empty text layer", () => {
    const stats = computeStats([], { width: 612, height: 792 });
    expect(isCredible(stats)).toBe(false);
  });

  it("accepts a credible text layer", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      str: `Line ${i} with some text content here.`,
      transform: [1, 0, 0, 1, 50, 700 - i * 20],
      width: 200,
      height: 12,
    }));
    const result = classifyTextLayer(items, { width: 612, height: 792 });
    expect(result.source).toBe("native");
  });

  it("rejects text with high replacement character ratio", () => {
    const items = Array.from({ length: 20 }, () => ({
      str: "\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD",
      transform: [1, 0, 0, 1, 50, 700],
      width: 50,
      height: 12,
    }));
    const result = classifyTextLayer(items, { width: 612, height: 792 });
    expect(result.source).toBe("ocr");
  });

  it("rejects text positioned entirely off-page", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      str: `Line ${i} text content.`,
      transform: [1, 0, 0, 1, -100, -100],
      width: 200,
      height: 12,
    }));
    const result = classifyTextLayer(items, { width: 612, height: 792 });
    expect(result.source).toBe("ocr");
  });
});
