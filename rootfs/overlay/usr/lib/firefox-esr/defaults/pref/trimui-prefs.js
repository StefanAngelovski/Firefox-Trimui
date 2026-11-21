// TrimUI Smart Pro defaults (1GB RAM, no seccomp, no GPU for clients)
// -- processes / memory
pref("fission.autostart", false);
pref("dom.ipc.processCount", 1);
pref("dom.ipc.processCount.webIsolated", 1);
pref("dom.ipc.processPrelaunch.enabled", false);
pref("browser.tabs.unloadOnLowMemory", true);
pref("browser.sessionhistory.max_total_viewers", 0);
pref("browser.cache.memory.capacity", 32768);
pref("browser.cache.disk.capacity", 262144);
pref("javascript.options.mem.gc_incremental_slice_ms", 5);
pref("network.prefetch-next", false);
pref("network.dns.disablePrefetch", true);
pref("network.predictor.enabled", false);
pref("browser.sessionstore.interval", 60000);
// -- no sandbox possible on this kernel (no seccomp, no namespaces)
pref("security.sandbox.content.level", 0);
// -- rendering: software WebRender
pref("gfx.webrender.software", true);
pref("layers.acceleration.disabled", true);
pref("gfx.canvas.accelerated", false);
pref("media.hardware-video-decoding.enabled", false);
pref("layout.frame_rate", 30);
pref("general.smoothScroll", false);
// -- 720p handheld screen
pref("layout.css.devPixelsPerPx", "1.25");
pref("browser.uidensity", 1);
pref("browser.compactmode.show", true);
pref("browser.toolbars.bookmarks.visibility", "never");
// -- quiet startup, no background noise
pref("browser.shell.checkDefaultBrowser", false);
pref("browser.aboutwelcome.enabled", false);
pref("browser.startup.homepage_override.mstone", "ignore");
pref("trailhead.firstrun.didSeeAboutWelcome", true);
pref("datareporting.healthreport.uploadEnabled", false);
pref("datareporting.policy.dataSubmissionEnabled", false);
pref("toolkit.telemetry.enabled", false);
pref("app.normandy.enabled", false);
pref("app.shield.optoutstudies.enabled", false);
pref("extensions.pocket.enabled", false);
pref("browser.newtabpage.activity-stream.feeds.topsites", true);
pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
pref("browser.newtabpage.activity-stream.showSponsored", false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
pref("browser.download.dir", "/mnt/SDCARD/Downloads");
pref("browser.download.folderList", 2);
pref("browser.download.useDownloadDir", true);
// -- weston via crusty shim gives unreliable frame callbacks: use a software vsync timer
pref("widget.wayland.vsync.enabled", false);
pref("widget.wayland.opaque-region.enabled", false);
// -- kiosk-shell makes the window fullscreen: keep toolbars visible, allow userChrome.css
pref("browser.fullscreen.autohide", false);
pref("toolkit.legacyUserProfileCustomizations.stylesheets", true);
pref("full-screen-api.warning.timeout", 0);
// -- Select+Start hard-kills firefox: no crash-restore page, no safe-mode prompt
pref("browser.sessionstore.resume_from_crash", false);
pref("browser.sessionstore.max_resumed_crashes", -1);
pref("toolkit.startup.max_resumed_crashes", -1);
// -- video: software decode only. AV1 is too slow on Cortex-A53; prefer H.264 (FFmpeg) like h264ify
pref("media.av1.enabled", false);
pref("media.mediasource.webm.enabled", false);
pref("media.mediasource.webm.audio.enabled", true);
pref("media.ffmpeg.enabled", true);
pref("media.ffvpx.enabled", true);
pref("media.cubeb.backend", "alsa");
// -- gamepad keyboard add-on: unsigned, sideloaded in the app scope (browser/extensions), allowed by this build
pref("xpinstall.signatures.required", false);
pref("extensions.autoDisableScopes", 0);
pref("extensions.enabledScopes", 15);
pref("extensions.sideloadedAddons.enabled", true);
// -- fixed internal UUID for the keyboard add-on so its start page has a stable URL
pref("extensions.webextensions.uuids", "{\"osk@trimui.local\":\"142cb207-9869-46fc-982c-595a2354940e\"}");
pref("browser.startup.homepage", "moz-extension://142cb207-9869-46fc-982c-595a2354940e/start.html");
pref("browser.startup.page", 1);
