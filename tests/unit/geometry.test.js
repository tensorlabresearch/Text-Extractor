import { describe, it, expect } from "vitest";
import { iou, boundingBox, scalePolygon, translatePolygon } from "../../extension/lib/image/geometry.js";

describe("geometry", () => {
  it("computes bounding box of a polygon", () => {
    const polygon = [[0, 0], [10, 0], [10, 5], [0, 5]];
    expect(boundingBox(polygon)).toEqual([0, 0, 10, 5]);
  });

  it("scales polygon coordinates", () => {
    const polygon = [[1, 2], [3, 4]];
    expect(scalePolygon(polygon, 2, 3)).toEqual([[2, 6], [6, 12]]);
  });

  it("translates polygon coordinates", () => {
    const polygon = [[1, 2], [3, 4]];
    expect(translatePolygon(polygon, 10, 20)).toEqual([[11, 22], [13, 24]]);
  });

  it("computes IoU of identical boxes as 1", () => {
    expect(iou([0, 0, 10, 10], [0, 0, 10, 10])).toBeCloseTo(1);
  });

  it("computes IoU of non-overlapping boxes as 0", () => {
    expect(iou([0, 0, 10, 10], [20, 20, 10, 10])).toBe(0);
  });

  it("computes partial overlap IoU", () => {
    const result = iou([0, 0, 10, 10], [5, 5, 10, 10]);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(1);
  });
});
