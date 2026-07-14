import { describe, it, expect } from "vitest";
import { polygonArea, expandPolygon } from "../../extension/lib/ocr/detector/polygon.js";

describe("polygon", () => {
  it("computes area of a unit square", () => {
    expect(polygonArea([[0, 0], [1, 0], [1, 1], [0, 1]])).toBe(1);
  });

  it("computes area of a triangle", () => {
    expect(polygonArea([[0, 0], [4, 0], [0, 3]])).toBe(6);
  });

  it("expandPolygon expands the polygon area", () => {
    const rect = [[0, 0], [100, 0], [100, 20], [0, 20]];
    const expanded = expandPolygon(rect, 1.5);
    expect(expanded).toHaveLength(4);
    const expandedArea = polygonArea(expanded);
    const originalArea = polygonArea(rect);
    expect(expandedArea).toBeGreaterThan(originalArea);
  });

  it("expandPolygon handles degenerate polygon", () => {
    expect(expandPolygon([[0, 0]], 1.5)).toEqual([[0, 0]]);
  });
});
