# How it works

```
MainUI ──(Apps → Firefox)──▶ launch.sh
                              ├─ swapon /mnt/UDISK/browser.swap
                              ├─ gptokeyb2 ── gamepad → "Fake Keyboard Mouse" (uinput)
                              ├─ weston.sh start
                              │    seatd + wp_weston (DRM backend, GL renderer, kiosk shell)
                              │      └─ libcrusty.so: fake DRM/GBM → TrimUI SDL2 → PowerVR EGL → screen
                              └─ chroot.sh /opt/trimui/firefox.sh
                                   Debian trixie (glibc 2.41) on the 4.9 kernel
                                   Firefox ESR, native Wayland client on wayland-5, software WebRender
```

On exit (Select+Start kills `firefox-esr`), `launch.sh` stops gptokeyb and Weston, unmounts the
chroot binds, turns swap off, and MainUI comes back.

## Device facts

- Allwinner A133: 4× Cortex-A53, PowerVR GE8300 (GLES 3.2 blob, framebuffer-only WSEGL), 1 GB RAM
- Tina Linux (OpenWrt) with glibc 2.33; kernel 4.9.191 without seccomp, namespaces or zram
- `/dev/dri/card0` is a render-only node; the panel is driven by sunxi DE2 (`/dev/fb0`, 1280×720)
- `/mnt/SDCARD` is vfat, `/mnt/UDISK` is ext4 — the chroot has to live on UDISK

## Gotchas (and the fix for each)

| Problem | Fix |
|---|---|
| PortMaster's `westonwrap.sh` scrambles its arguments (its sourced `control.txt` shifts them) | `device/browser/weston.sh` does only the needed steps |
| Weston's crusty shim needs TrimUI's own SDL2, `/usr/trimui/lib` on the path, and a `/tmp/drmpipe` FIFO | set in `weston.sh` |
| `/run` doesn't exist, so seatd can't create its socket | `weston.sh` creates it |
| libinput ignored every device: no `ID_INPUT*` udev tags on this OS | `device/udev/60-input-id.rules` |
| Gamepad mouse added after Weston starts is never seen (no hotplug through the shim) | `launch.sh` starts gptokeyb first and waits for its device |
| Firefox drew one frame and froze: Wayland frame callbacks are unreliable through the shim | `widget.wayland.vsync.enabled=false` |
| Kiosk shell makes the window fullscreen; Firefox sometimes collapses its toolbars | `userChrome.css` keeps the toolbox visible outside DOM fullscreen |
| "Security sandbox is disabled" banner (unfixable on this kernel) | hidden in `userChrome.css` |
| Select+Start hard-kills Firefox → crash-restore page, eventually a safe-mode prompt | crash restore and resumed-crash limits disabled |
| YouTube "can't play this video" | RDD decoder process re-enabled, AV1 off, WebM MSE off (H.264 via FFmpeg), ALSA backend |
| Unsigned add-on rejected via policies (`ERROR_SIGNEDSTATE_REQUIRED`) | sideloaded in the app scope (`browser/extensions/`), which this build allows unsigned |
| Add-ons can't run on `about:` pages (incl. Firefox's New Tab) | keyboard opened via add-on commands (Ctrl+F8/F9) + own start page with a fixed add-on UUID |
| gptokeyb2's built-in `text_input` state only exists without `-c` | defined explicitly in `browser.gptk` |

## Debugging

- Launch log: `/mnt/UDISK/browser/log.txt`; Weston: `/tmp/weston.log`; gptokeyb: `/tmp/gptokeyb.log`
- Screenshot of the current frame: `scripts/dev/fbshot.sh` on the device, then read `/tmp/fb.raw` (1280×720 BGRA)
- Stop a test session and resume MainUI: `scripts/dev/teardown.sh`
- Add-on/console messages: drop a prefs file with `extensions.logging.enabled` and
  `devtools.console.stdout.chrome` set to `true` into `defaults/pref/` — output lands in the launch log
- Check nothing of the user's is running (`pidof firefox-esr`, MainUI present) before starting a test session over SSH
