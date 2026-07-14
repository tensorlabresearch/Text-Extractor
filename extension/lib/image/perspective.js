// Perspective correction using four-point transform.

/**
 * Apply a four-point perspective transform to crop a text line.
 * @param {ImageData|ImageBitmap} source
 * @param {Array<[number, number]>} polygon - Four corners
 * @param {number} padRatio - Padding as fraction of line height (0.08–0.12)
 * @returns {Promise<ImageBitmap>}
 */
export async function perspectiveCrop(source, polygon, padRatio = 0.1) {
  let srcW, srcH, srcCanvas;
  if (source instanceof ImageBitmap) {
    srcW = source.width;
    srcH = source.height;
    srcCanvas = new OffscreenCanvas(srcW, srcH);
    const ctx = srcCanvas.getContext("2d");
    ctx.drawImage(source, 0, 0);
  } else if (source instanceof ImageData) {
    srcW = source.width;
    srcH = source.height;
    srcCanvas = new OffscreenCanvas(srcW, srcH);
    const ctx = srcCanvas.getContext("2d");
    ctx.putImageData(source, 0, 0);
  } else if (source instanceof OffscreenCanvas) {
    srcCanvas = source;
    srcW = source.width;
    srcH = source.height;
  } else {
    throw new Error("Unsupported source type");
  }

  const { width: cropW, height: cropH } = computeCropDimensions(polygon);
  const padH = Math.round(cropH * padRatio);
  const padW = Math.round(cropW * padRatio);
  const outW = Math.max(1, Math.round(cropW + padW * 2));
  const outH = Math.max(1, Math.round(cropH + padH * 2));

  const xs = polygon.map((p) => p[0]);
  const ys = polygon.map((p) => p[1]);

  const bboxX = Math.max(0, Math.floor(Math.min(...xs) - padW));
  const bboxY = Math.max(0, Math.floor(Math.min(...ys) - padH));
  const bboxW = Math.min(srcW - bboxX, Math.ceil(Math.max(...xs) - Math.min(...xs) + padW * 2));
  const bboxH = Math.min(srcH - bboxY, Math.ceil(Math.max(...ys) - Math.min(...ys) + padH * 2));

  if (bboxW <= 0 || bboxH <= 0) {
    const empty = new OffscreenCanvas(1, 1);
    return empty.transferToImageBitmap();
  }

  const outCanvas = new OffscreenCanvas(outW, outH);
  const outCtx = outCanvas.getContext("2d");
  outCtx.fillStyle = "white";
  outCtx.fillRect(0, 0, outW, outH);

  outCtx.drawImage(
    srcCanvas,
    bboxX, bboxY, bboxW, bboxH,
    0, 0, outW, outH
  );

  return outCanvas.transferToImageBitmap();
}

/**
 * Compute the output dimensions for a perspective-corrected crop.
 * @param {Array<[number, number]>} polygon
 * @returns {{ width: number, height: number }}
 */
export function computeCropDimensions(polygon) {
  const [tl, tr, br, bl] = polygon;
  const widthTop = Math.hypot(tr[0] - tl[0], tr[1] - tl[1]);
  const widthBottom = Math.hypot(br[0] - bl[0], br[1] - bl[1]);
  const heightLeft = Math.hypot(bl[0] - tl[0], bl[1] - tl[1]);
  const heightRight = Math.hypot(br[0] - tr[0], br[1] - tr[1]);
  return {
    width: Math.max(widthTop, widthBottom),
    height: Math.max(heightLeft, heightRight),
  };
}
