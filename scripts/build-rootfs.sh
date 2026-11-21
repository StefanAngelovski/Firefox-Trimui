#!/bin/sh
# Build the Debian trixie arm64 userland with Firefox ESR, add the overlay and the add-on,
# and export it as dist/rootfs-arm64.tar.gz. Needs Docker and qemu-user binfmt for arm64.
set -e
cd "$(dirname "$0")/.."
IMAGE=trimui-firefox-rootfs
mkdir -p dist
scripts/build-addon.sh >/dev/null

docker build -t "$IMAGE" rootfs
C=$(docker create --platform linux/arm64 "$IMAGE")
trap 'docker rm -f "$C" >/dev/null' EXIT

# overlay files, owned by root inside the image
tar -C rootfs/overlay --owner=0 --group=0 -cf - . | docker cp - "$C:/"
# sideload the add-on in the app scope (this Firefox build allows unsigned add-ons there)
mkdir -p dist/stage/usr/lib/firefox-esr/browser/extensions
cp "dist/osk@trimui.local.xpi" dist/stage/usr/lib/firefox-esr/browser/extensions/
tar -C dist/stage --owner=0 --group=0 -cf - . | docker cp - "$C:/"
rm -rf dist/stage

docker export "$C" | gzip -1 > dist/rootfs-arm64.tar.gz
ls -lh dist/rootfs-arm64.tar.gz
