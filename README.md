# Firefox for CrossmixOS (Trimui Smart Pro)

A modern Firefox (ESR 153, Debian trixie) running on the Trimui Smart Pro under CrossmixOS,
launched from the normal **Apps** menu and driven entirely by the gamepad, with a
built-in on-screen keyboard. CrossmixOS itself is untouched: quitting Firefox drops you
back in MainUI.

- Debian arm64 userland in a chroot on the internal `UDISK` partition; nothing runs in the background
- Weston (from PortMaster's `weston_pkg`) composites through the PowerVR GPU; Firefox renders in software
- Gamepad → mouse/keyboard via PortMaster's `gptokeyb2`
- Gamepad on-screen keyboard and start page as a Firefox add-on
- YouTube works (H.264 forced, ALSA audio)

## Requirements

- Trimui Smart Pro with CrossmixOS and **PortMaster** installed (provides Weston and gptokeyb2)
- About 1 GB free on `/mnt/UDISK` (≈850 MB userland + 1.5 GB swapfile — the partition is 6.5 GB)
- Wi-Fi

## Install

From a release:

1. Download `trimui-firefox-device-<version>.zip` and `rootfs-arm64.tar.gz`.
2. Copy both to the device (SD card, SFTP or Samba), e.g. into `/mnt/SDCARD/tmp/`.
3. Unzip the device bundle and run the installer over SSH:
   ```sh
   cd /mnt/SDCARD/tmp && unzip trimui-firefox-device-*.zip
   sh trimui-firefox-device-*/install.sh /mnt/SDCARD/tmp/rootfs-arm64.tar.gz
   ```
4. Open **Apps → Firefox**. The first start takes 20–40 seconds.

Re-running `install.sh` updates in place and keeps your Firefox profile (bookmarks, logins, history).
Without a rootfs argument it only updates the launcher and scripts.

From source (needs Docker with arm64 emulation, `zip`, Python 3 + Pillow, and `ssh trimui` access):

```sh
scripts/deploy.sh --rootfs   # first time: builds everything and installs it
scripts/deploy.sh            # later: launcher/scripts/icon only
```

## Controls

| Button | Browsing | While the keyboard is open |
|---|---|---|
| Left stick | Mouse pointer | |
| Right stick | Scroll / left-right arrows | |
| D-pad | Arrow keys | Move between keys |
| A | Click | Click a key with the pointer |
| B | Back | Delete |
| X | Keyboard: go to address / search | Switch to address mode |
| Y | Enter | Press highlighted key |
| Start | Keyboard: type into the selected field | Close |
| L1 / R1 | Previous / next tab | |
| L2 / R2 | Page up / page down | |
| L3 / R3 | Middle click / right click | |
| Menu + A / B | Reload / forward | |
| Menu + X / Y | New tab / close tab | |
| Menu + L1 / R1 | Zoom out / in | |
| Menu + Up / Down | Top / bottom of page | |
| Menu + R3 | Reset zoom | |
| Menu + Start | Character-picker text entry (works in Firefox's own address bar) | |
| **Select + Start** | **Quit to MainUI** | |

A USB-C or Bluetooth keyboard also works if it is connected *before* launching Firefox.

## Known limitations

- No browser sandbox: the vendor kernel (4.9) has no seccomp or namespaces.
- Software rendering only; 360p–480p video plays best. AV1 is disabled.
- The on-screen keyboard can't appear on Firefox's own pages (`about:` pages, settings) or sites
  that block add-ons; X opens the start page instead. Text fields inside iframes aren't handled yet.
- Input devices are detected at launch only (no hotplug through the display shim).

## Layout

| Path | Goes to | What |
|---|---|---|
| `rootfs/Dockerfile` | — | Debian trixie arm64 + Firefox ESR |
| `rootfs/overlay/` | `/mnt/UDISK/debian/` | Firefox prefs, launcher, `userChrome.css`, ALSA config |
| `addon/` | inside the rootfs | Gamepad keyboard + start page add-on (`osk@trimui.local`) |
| `device/Apps/Browser/` | `/mnt/SDCARD/Apps/Browser/` | Apps-menu entry |
| `device/browser/` | `/mnt/UDISK/browser/app/` | Weston launcher, chroot runner, gamepad map |
| `device/udev/` | `/etc/udev/rules.d/` | Input tagging for libinput |
| `device/install.sh` | — | On-device installer |
| `scripts/` | — | Build, packaging and deploy tooling; `scripts/dev/` has test helpers |

See [docs/NOTES.md](docs/NOTES.md) for how it works and why.

The Firefox name and logo are trademarks of the Mozilla Foundation. The app icon is extracted
from the Firefox package at build time and is not part of this repository.
