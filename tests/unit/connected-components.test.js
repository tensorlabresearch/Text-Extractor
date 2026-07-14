import { describe, it, expect } from "vitest";
import { connectedComponents } from "../../extension/lib/ocr/detector/connected-components.js";

describe("connected-components", () => {
  it("returns zero count for empty mask", () => {
    const mask = new Uint8Array(10 * 10);
    const { labels, count } = connectedComponents(mask, 10, 10);
    expect(count).toBe(0);
    expect(labels.every((l) => l === 0)).toBe(true);
  });

  it("labels a single component", () => {
    const mask = new Uint8Array(5 * 5);
    mask[6] = 1; mask[7] = 1;
    mask[11] = 1; mask[12] = 1;
    const { labels, count } = connectedComponents(mask, 5, 5);
    expect(count).toBe(1);
    expect(labels[6]).toBe(1);
    expect(labels[7]).toBe(1);
    expect(labels[11]).toBe(1);
    expect(labels[12]).toBe(1);
  });

  it("labels two separate components", () => {
    const mask = new Uint8Array(5 * 5);
    mask[0] = 1;
    mask[24] = 1;
    const { count } = connectedComponents(mask, 5, 5);
    expect(count).toBe(2);
  });

  it("labels connected diagonal as one component (8-connectivity)", () => {
    const mask = new Uint8Array(3 * 3);
    mask[0] = 1;
    mask[4] = 1;
    const { count } = connectedComponents(mask, 3, 3);
    expect(count).toBe(2);
  });
});
