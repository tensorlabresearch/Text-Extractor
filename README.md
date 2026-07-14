# Text Extractor

![Text Extractor Logo](extension/icons/icon128.png)

Extract text from PDFs and images entirely on this device. Local-first Chrome
extension with on-device OCR — no network requests, no telemetry, no cloud
fallback.

Text Extractor uses [PDF.js](https://mozilla.github.io/pdf.js/) for native text
extraction and page rendering, [PP-OCRv5](https://github.com/PaddlePaddle/PaddleOCR)
for text detection via [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/),
and [TrOCR](https://huggingface.co/microsoft/trocr-small-printed) for text
recognition via [Transformers.js](https://github.com/huggingface/transformers.js).

## Quick start

### Chrome Web Store

Install from the Chrome Web Store once the listing is live.

### Local development install

1. Grab the latest release zip:
   <https://github.com/tensorlabresearch/Text-Extractor/releases/latest>
   (look for `text-extractor-vX.Y.Z.zip`).
2. Unzip it to a folder you'll keep around — the browser loads the unpacked
   directory directly.
3. Open the extensions page:
   - Chrome: `chrome://extensions`
   - Brave:  `brave://extensions`
4. Enable **Developer mode** (top-right toggle).
5. Click **Load unpacked** and pick the unzipped folder.
6. Click the Text Extractor toolbar icon. The workspace opens in its own tab.

First use downloads and caches the OCR models (~74 MB) locally. After that,
the extension works fully offline.

## What it does

- Accepts PDF, PNG, JPEG, and WebP files by picker, drag-and-drop, or clipboard paste.
- Extracts native text directly from PDFs when a credible text layer exists.
- Rasterizes image-only PDF pages with PDF.js for OCR.
- Detects text regions with a local PP-OCRv5 ONNX detector.
- Rectifies and recognizes text lines with a local TrOCR model.
- Preserves page numbers and text-region coordinates.
- Shows the source page, bounding regions, and editable OCR text together.
- Processes a selected page, page range, or complete PDF.
- Copies text and exports TXT, Markdown, and structured JSON.
- Works immediately with networking disabled after installation.
- Makes zero network requests, collects no telemetry, and requires no website
  host permissions.

## Privacy

- No network requests at runtime.
- No telemetry, analytics, or crash-reporting.
- No remote fonts, images, or accounts.
- No cloud API keys.
- Models and documents are processed entirely on-device.

See [PRIVACY.md](PRIVACY.md) for the full privacy policy.

## Development

```bash
npm install
npm run vendor:transformers  # vendor Transformers.js + ONNX Runtime
npm run vendor:pdfjs         # vendor PDF.js
npm run vendor:models        # download and verify pinned models
npm run lint
npm test
npm run test:e2e
```

Load `extension/` as an unpacked extension in Chrome.

## Architecture

The extension borrows structural conventions from
[Tab Recorder](https://github.com/tensorlabresearch/Tab-Recorder): a dedicated
full-page extension tab, a thin Manifest V3 service worker, plain ESM source
that loads unpacked without compiling, vendored browser runtimes, Vitest/
Playwright testing, and automated release packaging.

The service worker only opens/focuses the workspace tab and manages settings.
All PDF state, model sessions, and OCR results live in the long-lived
workspace tab. A dedicated module worker runs both the detector and recognizer
to avoid inter-worker transfers and competing WebGPU contexts.

See [TEST_PLAN.md](TEST_PLAN.md) for the full test plan and
[MODEL_PROVENANCE.md](MODEL_PROVENANCE.md) for model hashes and provenance.

## License

MIT — see [LICENSE](LICENSE).
