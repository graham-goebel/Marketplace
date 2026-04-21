#!/usr/bin/env bash
# One-time setup: install SheetJS and generate icons
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Marketplace Autofill — Setup"
echo ""

# ── 1. Generate icons ────────────────────────────────────────────────────────
echo "1/2  Generating icons..."
node generate-icons.js

# ── 2. Install & copy SheetJS ─────────────────────────────────────────────────
echo ""
echo "2/2  Installing SheetJS..."

if ! command -v npm &>/dev/null; then
  echo "ERROR: npm not found. Install Node.js from https://nodejs.org/"
  exit 1
fi

npm install --silent
node install-deps.js

echo ""
echo "✓ Setup complete!"
echo ""
echo "────────────────────────────────────────────────"
echo "  Load the extension in Chrome:"
echo "────────────────────────────────────────────────"
echo "  1. Open: chrome://extensions/"
echo "  2. Enable 'Developer mode' (top-right toggle)"
echo "  3. Click 'Load unpacked'"
echo "  4. Select this folder: $SCRIPT_DIR"
echo ""
echo "  Then go to Facebook Marketplace → Create listing"
echo "  and click the extension icon in your toolbar."
echo "────────────────────────────────────────────────"
