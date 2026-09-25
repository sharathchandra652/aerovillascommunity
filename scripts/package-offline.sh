#!/bin/bash
# Builds the static site and packages it with the offline launchers as
# dist/aero-villas-offline.zip.
set -euo pipefail
cd "$(dirname "$0")/.."

OFFLINE=1 npx next build

DIST=dist/aero-villas-offline
rm -rf dist
mkdir -p "$DIST"
cp -R out "$DIST/site"
cp offline/start-server.ps1 offline/*.bat offline/*.command offline/README.txt "$DIST/"

# Windows files need CRLF line endings; the Mac launcher must be executable
for f in "$DIST"/*.bat "$DIST"/*.ps1 "$DIST"/README.txt; do
  sed -i.bak 's/\r*$/\r/' "$f" && rm -f "$f.bak"
done
chmod +x "$DIST"/*.command

(cd dist && zip -qr -X aero-villas-offline.zip aero-villas-offline)
echo "Created dist/aero-villas-offline.zip ($(du -h dist/aero-villas-offline.zip | cut -f1))"
