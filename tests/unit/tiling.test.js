import { describe, it, expect } from "vitest";
import { createTiles, mapToPage } from "../../extension/lib/image/tiling.js";

describe("tiling", () => {
  it("creates 2x2 grid with overlap", () => {
    const tiles = createTiles({ width: 1000, height: 1000 }, 2, 2, 0.12);
    expect(tiles).toHaveLength(4);
    for (const tile of tiles) {
      expect(tile.width).toBeGreaterThan(0);
      expect(tile.height).toBeGreaterThan(0);
    }
  });

  it("creates 1x1 grid without overlap", () => {
    const tiles = createTiles({ width: 100, height: 100 }, 1, 1, 0);
    expect(tiles).toHaveLength(1);
    expect(tiles[0].x).toBe(0);
    expect(tiles[0].y).toBe(0);
  });

  it("maps polygon coordinates to page space", () => {
    const polygon = [[10, 20], [30, 40]];
    const result = mapToPage(polygon, { x: 100, y: 200 });
    expect(result).toEqual([[110, 220], [130, 240]]);
  });
});
