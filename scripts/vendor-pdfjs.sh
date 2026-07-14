#!/usr/bin/env bash
# Copies the PDF.js worker and build artifacts the extension needs
# from node_modules/ into extension/lib/vendor/pdfjs/.
#
# Run after `npm install` whenever pdfjs-dist is updated.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO_ROOT/node_modules/pdfjs-dist"
DEST="$REPO_ROOT/extension/lib/vendor/pdfjs"

if [ ! -d "$SRC" ]; then
  echo "[vendor-pdfjs] pdfjs-dist not installed; run npm install first." >&2
  exit 1
fi

mkdir -p "$DEST"

# Copy the main build and worker
cp "$SRC/build/pdf.min.mjs"           "$DEST/pdf.min.mjs"
cp "$SRC/build/pdf.worker.min.mjs"    "$DEST/pdf.worker.min.mjs"

# Copy LICENSE
cp "$SRC/LICENSE" "$DEST/LICENSE" 2>/dev/null || true

echo "[vendor-pdfjs] done."
ls -la "$DEST"
