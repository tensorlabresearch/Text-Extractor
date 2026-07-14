// Bounding box overlay on the page viewer.

/**
 * Create an overlay controller bound to an SVG element.
 * @param {SVGSVGElement} svg
 */
export function createPageOverlay(svg) {
  let selectedId = null;

  return {
    /**
     * Render bounding box polygons.
     * @param {Array<{ id: string, polygon: Array<[number, number]> }>} regions
     * @param {{ width: number, height: number }} viewBox
     */
    render(regions, viewBox) {
      svg.setAttribute("viewBox", `0 0 ${viewBox.width} ${viewBox.height}`);
      svg.setAttribute("width", viewBox.width);
      svg.setAttribute("height", viewBox.height);
      svg.innerHTML = "";

      for (const region of regions) {
        const points = region.polygon.map(([x, y]) => `${x},${y}`).join(" ");
        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", points);
        polygon.setAttribute("class", "bbox");
        polygon.dataset.id = region.id;
        if (region.id === selectedId) polygon.classList.add("selected");
        svg.appendChild(polygon);
      }
    },

    /**
     * Highlight a region by ID.
     * @param {string|null} id
     */
    select(id) {
      selectedId = id;
      for (const el of svg.querySelectorAll(".bbox")) {
        el.classList.toggle("selected", el.dataset.id === id);
      }
    },

    clear() {
      svg.innerHTML = "";
    },
  };
}
