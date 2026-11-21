#!/bin/sh
# Push the current tree to the handheld over `ssh trimui` and run the installer.
#   scripts/deploy.sh            update launcher, scripts and icon only
#   scripts/deploy.sh --rootfs   also (re)install the Debian userland (keeps the Firefox profile)
set -e
cd "$(dirname "$0")/.."
HOST=${TRIMUI_HOST:-trimui}
scripts/package-release.sh dev >/dev/null
ssh "$HOST" 'rm -rf /mnt/UDISK/trimui-firefox-dev && mkdir -p /mnt/UDISK'
(cd dist && unzip -q -o trimui-firefox-device-dev.zip)
scp -q -r dist/trimui-firefox-device-dev "$HOST:/mnt/UDISK/trimui-firefox-dev"
rm -rf dist/trimui-firefox-device-dev
if [ "$1" = "--rootfs" ]; then
  scp -q dist/rootfs-arm64.tar.gz "$HOST:/mnt/UDISK/trimui-firefox-dev/"
fi
ssh "$HOST" 'sh /mnt/UDISK/trimui-firefox-dev/install.sh && rm -rf /mnt/UDISK/trimui-firefox-dev'
