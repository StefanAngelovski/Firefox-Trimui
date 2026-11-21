#!/bin/sh
# Runs inside the chroot. Firefox ESR tuned for a 1GB, no-seccomp, software-rendered handheld.
export MOZ_ENABLE_WAYLAND=1 GDK_BACKEND=wayland
export MOZ_DISABLE_CONTENT_SANDBOX=1 MOZ_DISABLE_RDD_SANDBOX=1 MOZ_DISABLE_GMP_SANDBOX=1 \
       MOZ_DISABLE_SOCKET_PROCESS_SANDBOX=1 MOZ_DISABLE_UTILITY_SANDBOX=1 MOZ_DISABLE_GPU_SANDBOX=1
export MOZ_CRASHREPORTER_DISABLE=1 MOZ_DBUS_REMOTE=0 NO_AT_BRIDGE=1
export GTK_THEME=Adwaita
P=/root/firefox-profile
mkdir -p /tmp/shm "$P/chrome"
cp /opt/trimui/userChrome.css "$P/chrome/userChrome.css"
# Downloads always land on the SD card: Firefox can fall back to the XDG/home Downloads folder
# even with browser.download.dir set, so point that at the SD card too.
DL=/mnt/SDCARD/Downloads
mkdir -p "$DL" /root/.config
if [ -d /root/Downloads ] && [ ! -L /root/Downloads ]; then
  mv /root/Downloads/* "$DL"/ 2>/dev/null
  rmdir /root/Downloads 2>/dev/null || mv /root/Downloads /root/Downloads.old
fi
[ -e /root/Downloads ] || ln -s "$DL" /root/Downloads
echo "XDG_DOWNLOAD_DIR=\"$DL\"" > /root/.config/user-dirs.dirs
exec dbus-run-session -- firefox-esr --no-remote --profile "$P" "$@"
