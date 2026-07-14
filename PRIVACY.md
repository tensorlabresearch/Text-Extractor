# Privacy Policy

Text Extractor is a local-first Chrome extension. Your documents never leave
your device.

## Data collection

Text Extractor does **not** collect, transmit, or share any data:

- **No network requests.** The extension makes zero HTTP/HTTPS requests at
  runtime. All processing happens on-device.
- **No telemetry.** No usage analytics, crash reports, or error reports are
  sent anywhere.
- **No accounts.** No login, registration, or account system exists.
- **No cloud APIs.** No cloud API keys are included or used.
- **No remote content.** No remote fonts, images, scripts, or stylesheets are
  loaded.

## Data storage

- **User settings** (engine preference, quality setting, export format, etc.)
  are stored in `chrome.storage.local` on your device.
- **Optional session recovery** (off by default) stores per-page OCR results
  and user edits in IndexedDB for crash recovery. Original document bytes are
  never persisted.
- **Model files** (~74 MB) are bundled with the extension or cached locally
  by the browser after first use.

## Document processing

All document processing — PDF parsing, page rendering, text detection, text
recognition, and export — happens entirely in your browser using local
JavaScript and WebAssembly runtimes. Document content is never transmitted to
any server.

## Permissions

- `storage` — saves user settings locally.
- `downloads` — enables export with predictable filenames.

No `host_permissions`, `activeTab`, `tabs`, `scripting`, or network
permissions are requested.

## Open source

The entire source code is available at
<https://github.com/tensorlabresearch/Text-Extractor>.
