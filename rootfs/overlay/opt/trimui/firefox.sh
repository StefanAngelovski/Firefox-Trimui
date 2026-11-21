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
exec dbus-run-session -- firefox-esr --no-remote --profile "$P" "$@"
