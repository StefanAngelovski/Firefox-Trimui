#!/bin/bash
# Minimal Weston launcher for TrimUI Smart Pro using PortMaster's westonpack (crusty GBM shim -> SDL2/PowerVR EGL)
#   weston.sh start   -> start compositor in background (wayland-5)
#   weston.sh stop    -> stop compositor and seatd
W=/tmp/weston
PKG=/mnt/SDCARD/Apps/PortMaster/PortMaster/libs/weston_pkg_0.2.squashfs
HERE="$(cd "$(dirname "$0")" && pwd)"
CRUSTY=$W/lib_aarch64/graphics/crusty_gbm
export XDG_RUNTIME_DIR=/tmp/weston_runtime

stop() {
  for p in $(pidof wp_weston seatd Xwayland); do kill $p 2>/dev/null; done
  sleep 0.5
  for p in $(pidof wp_weston seatd Xwayland); do kill -9 $p 2>/dev/null; done
  rm -f /tmp/drmpipe /run/seatd.sock $XDG_RUNTIME_DIR/wayland-5 $XDG_RUNTIME_DIR/wayland-5.lock
}

start() {
  stop
  mkdir -p $W /run $XDG_RUNTIME_DIR /tmp/.X11-unix
  chmod 700 $XDG_RUNTIME_DIR
  rm -f /tmp/drmpipe; mkfifo /tmp/drmpipe
  mountpoint -q $W || mount -t squashfs -o loop,ro "$PKG" $W || exit 1
  ln -sfn $W/fonts /tmp/fonts
  ln -sfn $W/share /tmp/share

  export LD_LIBRARY_PATH=$CRUSTY:$W/lib_aarch64:/usr/trimui/lib
  export WESTON_MODULE_MAP="drm-backend.so=$W/lib_aarch64/libweston-14/drm-backend.so;gl-renderer.so=$W/lib_aarch64/libweston-14/gl-renderer.so;kiosk-shell.so=$W/lib_aarch64/weston/kiosk-shell.so;xwayland.so=$W/lib_aarch64/libweston-14/xwayland.so;"
  export WESTON_DATA_DIR=$W/data WESTON_LIBEXEC_DIR=$W/libexec
  export XKB_CONFIG_ROOT=/tmp/share/xkb
  export CRUSTY_LIBEGL=/usr/lib64/libEGL.so CRUSTY_LIBSDL=/usr/trimui/lib/libSDL2-2.0.so.0
  export CRUSTY_SHOW_CURSOR=${CRUSTY_SHOW_CURSOR:-0}
  export XWAYLAND_LD_LIBRARY_PATH=$W/lib_aarch64/graphics/mesa_x11_stub

  cd $W
  LD_PRELOAD=$CRUSTY/libcrusty.so ./seatd > /tmp/seatd.log 2>&1 &
  for i in $(seq 20); do [ -S /run/seatd.sock ] && break; sleep 0.1; done
  chmod 777 /run/seatd.sock

  LD_PRELOAD=$CRUSTY/libcrusty.so ./wp_weston -c "${WESTON_INI:-$HERE/weston.ini}" -B drm --drm-device card0 \
     --renderer=gl --shell=kiosk-shell.so -i0 -Swayland-5 $WESTON_EXTRA > /tmp/weston.log 2>&1 &
  for i in $(seq 100); do [ -S $XDG_RUNTIME_DIR/wayland-5 ] && return 0; sleep 0.1; done
  echo "weston failed to start, see /tmp/weston.log" >&2; return 1
}

case "$1" in start) start ;; stop) stop ;; *) echo "usage: $0 start|stop"; exit 2 ;; esac
