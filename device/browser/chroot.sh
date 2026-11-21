#!/bin/sh
# Run a command inside the Debian userland at /mnt/UDISK/debian.
#   chroot.sh mount         -> just set up bind mounts
#   chroot.sh umount        -> tear down bind mounts
#   chroot.sh <cmd> [args]  -> run command inside (mounts on demand)
R=/mnt/UDISK/debian

is_mnt() { grep -q " $1 " /proc/mounts; }
bind() { mkdir -p "$R$1"; is_mnt "$R$1" || mount --bind "$1" "$R$1"; }

do_mount() {
  is_mnt $R/proc || mount -t proc proc $R/proc
  is_mnt $R/sys  || mount -t sysfs sys $R/sys
  bind /dev
  is_mnt $R/dev/pts || { mkdir -p $R/dev/pts; mount -t devpts devpts $R/dev/pts 2>/dev/null || mount --bind /dev/pts $R/dev/pts; }
  bind /tmp
  mkdir -p /tmp/shm; chmod 1777 /tmp/shm
  bind /mnt/SDCARD
  mkdir -p $R/run; is_mnt $R/run || mount -t tmpfs -o mode=755 tmpfs $R/run
  cp /etc/resolv.conf $R/etc/resolv.conf 2>/dev/null
  [ -e /dev/shm ] || ln -s /tmp/shm /dev/shm
}

do_umount() {
  for m in $(awk -v r="$R" '$2 ~ "^"r"/" {print $2}' /proc/mounts | sort -r); do umount -l "$m"; done
}

case "$1" in
  mount)  do_mount ;;
  umount) do_umount ;;
  "")     echo "usage: $0 mount|umount|<cmd>"; exit 2 ;;
  *)      do_mount
          exec chroot $R /usr/bin/env -i HOME=/root USER=root LANG=en_US.UTF-8 TERM=${TERM:-linux} \
            PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
            XDG_RUNTIME_DIR=/tmp/weston_runtime WAYLAND_DISPLAY=${WAYLAND_DISPLAY:-wayland-5} \
            $CHROOT_ENV "$@" ;;
esac
