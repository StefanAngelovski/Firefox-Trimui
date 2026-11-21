#!/bin/sh
# Package the gamepad keyboard add-on as dist/osk@trimui.local.xpi
set -e
cd "$(dirname "$0")/.."
mkdir -p dist
rm -f "dist/osk@trimui.local.xpi"
(cd addon && zip -q -r -X "../dist/osk@trimui.local.xpi" manifest.json bg.js osk.js start.html start.css start.js)
echo "dist/osk@trimui.local.xpi"
