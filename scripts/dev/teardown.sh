#!/bin/sh
for p in $(pidof firefox-esr dbus-run-session gptokeyb2); do kill $p; done
sleep 3
for p in $(pidof firefox-esr); do kill -9 $p; done
/mnt/UDISK/browser/app/weston.sh stop
/mnt/UDISK/browser/app/chroot.sh umount
swapoff /mnt/UDISK/browser.swap 2>/dev/null
kill -CONT $(pidof MainUI) 2>/dev/null
echo "teardown done"; grep -c UDISK/debian /proc/mounts; free -m | sed -n 2,3p
