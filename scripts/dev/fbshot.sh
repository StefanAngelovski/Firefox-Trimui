#!/bin/sh
# dump the currently displayed fb page (1280x720 BGRA)
Y=$(cut -d, -f2 /sys/class/graphics/fb0/pan)
dd if=/dev/fb0 of=/tmp/fb.raw bs=5120 skip=$Y count=720 2>/dev/null; echo "pan y=$Y"
