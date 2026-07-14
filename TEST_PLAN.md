# Test Plan

## Unit tests

Test independently:

- PDF text-layer scoring.
- Coordinate transforms.
- Page-to-tile and tile-to-page mapping.
- Image rotation.
- Detector normalization.
- Thresholding.
- Connected components.
- Polygon expansion.
- Rotated rectangle calculation.
- NMS and duplicate merging.
- Perspective transform.
- Blank-crop detection.
- Long-line split points.
- Split-result merging.
- Reading order.
- Plain-text serialization.
- JSON serialization.
- Queue transitions.
- Cancellation state.

## Worker tests

Test the complete worker protocol:

- Worker boots.
- Local model paths resolve.
- Models load.
- Engine is reported.
- Progress messages are ordered.
- Incorrect job IDs are ignored.
- Cancellation stops additional recognition.
- Worker errors are serializable.
- Worker termination and recreation succeeds.
- Repeated load/dispose cycles do not fail.

## Playwright E2E tests

Use a persistent Chromium context with the unpacked extension.

Required scenarios:

1. Click toolbar icon and open workspace.
2. Click again and focus the existing workspace.
3. Drop a clean image and extract expected text.
4. Paste an image and extract expected text.
5. Open a native-text PDF.
6. Open a scanned PDF.
7. Force OCR on a native-text page.
8. Process a page range.
9. Cancel a multi-page job.
10. Edit a recognized line.
11. Export TXT.
12. Export structured JSON.
13. Disable WebGPU and run WASM.
14. Block all network traffic and repeat image/PDF OCR.
15. Terminate the OCR worker and verify recovery.

## Accuracy corpus

Build a controlled internal corpus containing at least:

- 50 clean scanned pages.
- 30 screenshots.
- 30 phone photographs.
- 20 two-column pages.
- 20 low-contrast pages.
- 20 rotated or skewed pages.
- 10 forms.
- 10 receipts.
- 10 technical-manual pages.

Also maintain at least 1,000 manually verified line crops for recognition-only
benchmarking.

## Metrics

- Detector precision.
- Detector recall.
- Character error rate (CER).
- Word error rate (WER).
- Reading-order errors.
- Page latency.
- Line latency.
- Cold model-load time.
- Warm page-processing time.
- Peak memory.
- Worker recovery failures.

## Initial release targets

```
Clean scan detector recall:
≥ 95% for text lines whose rendered x-height is at least 16 pixels

Clean printed-page character error rate:
≤ 3%

Clean screenshot character error rate:
≤ 2%

100-page image-only PDF:
Completes without crash or unbounded memory growth

Offline operation:
Zero external HTTP/HTTPS requests

Page integrity:
No silently skipped pages

Cancellation:
No cancelled result written into the active document
```
