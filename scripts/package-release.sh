#!/bin/sh
# Build release assets in dist/:
#   trimui-firefox-device-<ver>.zip   launcher, scripts, icon, udev rule, install.sh
#   rootfs-arm64.tar.gz               Debian + Firefox userland (from build-rootfs.sh)
#   osk@trimui.local.xpi              the keyboard add-on on its own
set -e
cd "$(dirname "$0")/.."
VER=${1:?usage: package-release.sh <version>}
[ -f dist/rootfs-arm64.tar.gz ] || scripts/build-rootfs.sh
python3 scripts/make-icon.py

B=dist/trimui-firefox-device-$VER
rm -rf "$B" "$B.zip"
mkdir -p "$B"
cp -r device/Apps device/browser device/udev "$B/"
cp device/install.sh "$B/"
cp dist/icon.png "$B/Apps/Browser/icon.png"
(cd dist && zip -q -r "trimui-firefox-device-$VER.zip" "trimui-firefox-device-$VER")
rm -rf "$B"
ls -lh dist/*.zip dist/*.tar.gz dist/*.xpi
