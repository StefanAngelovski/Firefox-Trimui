#!/bin/bash
# Firefox ESR (Debian chroot) on Weston for CrossmixOS / TrimUI Smart Pro
B=/mnt/UDISK/browser/app
PM=/mnt/SDCARD/Apps/PortMaster/PortMaster
LOG=/mnt/UDISK/browser/log.txt
exec > "$LOG" 2>&1
echo "== Browser start $(date)"

[ -d /mnt/UDISK/debian/usr/bin ] || { echo "Debian rootfs missing"; exit 1; }

swapon /mnt/UDISK/browser.swap 2>/dev/null
rm -f /var/trimui_inputd/sticks_disabled   # analog sticks drive the mouse
mkdir -p /mnt/SDCARD/Downloads

# gamepad -> virtual mouse/keyboard; must exist before weston (no input hotplug through the shim)
export SDL_GAMECONTROLLERCONFIG_FILE=$PM/gamecontrollerdb.txt
LD_PRELOAD=$PM/libinterpose.aarch64.so $PM/gptokeyb2 -1 "firefox-esr" -c "$B/browser.gptk" > /tmp/gptokeyb.log 2>&1 &
GPTK=$!
for i in $(seq 30); do grep -q "Fake Keyboard Mouse" /proc/bus/input/devices && break; sleep 0.1; done
udevadm settle -t 3 2>/dev/null

"$B/weston.sh" start || { kill $GPTK; "$B/weston.sh" stop; swapoff /mnt/UDISK/browser.swap; exit 1; }

"$B/chroot.sh" /opt/trimui/firefox.sh
echo "firefox exited rc=$?"

kill $GPTK 2>/dev/null
"$B/weston.sh" stop
"$B/chroot.sh" umount
swapoff /mnt/UDISK/browser.swap 2>/dev/null
sync
echo "== Browser end $(date)"
