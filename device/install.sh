#!/bin/sh
# Install / update Firefox for CrossmixOS on the Trimui Smart Pro.
# Run on the device from the extracted release folder:
#   sh install.sh                          # launcher + scripts (+ rootfs if rootfs-arm64.tar.gz is next to it)
#   sh install.sh /path/rootfs-arm64.tar.gz
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
ROOTFS=${1:-$HERE/rootfs-arm64.tar.gz}
APP=/mnt/UDISK/browser/app
DEB=/mnt/UDISK/debian
SWAP=/mnt/UDISK/browser.swap

if pidof firefox-esr >/dev/null 2>&1; then
  echo "Firefox is running - quit it (Select+Start) and run this again."; exit 1
fi

echo "* launcher and scripts"
mkdir -p "$APP" /mnt/SDCARD/Apps/Browser
cp "$HERE"/browser/* "$APP"/
chmod +x "$APP"/*.sh
cp "$HERE"/Apps/Browser/* /mnt/SDCARD/Apps/Browser/
chmod +x /mnt/SDCARD/Apps/Browser/launch.sh

echo "* udev input tagging (lets Weston/libinput see the gamepad mouse)"
mkdir -p /etc/udev/rules.d
cp "$HERE"/udev/60-input-id.rules /etc/udev/rules.d/
udevadm control --reload 2>/dev/null || true
udevadm trigger --subsystem-match=input --action=change 2>/dev/null || true

if [ ! -f "$SWAP" ]; then
  echo "* 1.5 GB swapfile (only enabled while Firefox runs)"
  dd if=/dev/zero of="$SWAP" bs=1M count=1536 2>/dev/null
  chmod 600 "$SWAP"
  mkswap "$SWAP" >/dev/null
fi

if [ -f "$ROOTFS" ]; then
  echo "* Debian + Firefox userland -> $DEB"
  "$APP/chroot.sh" umount 2>/dev/null || true
  # never delete through a live bind mount (/mnt/SDCARD, /dev, /tmp are bound inside)
  if grep -q " $DEB/" /proc/mounts; then
    echo "Something is still mounted under $DEB - reboot and run this again."; exit 1
  fi
  if [ -d "$DEB/root/firefox-profile" ]; then
    rm -rf /mnt/UDISK/firefox-profile.keep
    mv "$DEB/root/firefox-profile" /mnt/UDISK/firefox-profile.keep
  fi
  rm -rf "$DEB"
  mkdir -p "$DEB"
  gzip -dc "$ROOTFS" | tar -x -C "$DEB"
  if [ -d /mnt/UDISK/firefox-profile.keep ]; then
    mv /mnt/UDISK/firefox-profile.keep "$DEB/root/firefox-profile"
  fi
elif [ ! -d "$DEB/usr/bin" ]; then
  echo "No rootfs found: put rootfs-arm64.tar.gz next to install.sh (first install needs it)."; exit 1
fi

sync
echo "Done. Launch it from Apps -> Firefox."
