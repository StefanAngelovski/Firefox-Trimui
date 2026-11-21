const DEFAULTS = [
  ["YouTube", "https://www.youtube.com/"], ["Wikipedia", "https://en.wikipedia.org/"],
  ["DuckDuckGo", "https://duckduckgo.com/"], ["Google", "https://www.google.com/"],
  ["Reddit", "https://www.reddit.com/"], ["GitHub", "https://github.com/"],
  ["Hacker News", "https://news.ycombinator.com/"], ["PortMaster", "https://portmaster.games/"],
];
const q = document.getElementById("q");
document.getElementById("f").addEventListener("submit", (e) => {
  e.preventDefault();
  browser.runtime.sendMessage({ go: q.value });
});

function tile(title, url, favicon) {
  const a = document.createElement("a");
  a.href = url;
  let icon;
  if (favicon) { icon = document.createElement("img"); icon.src = favicon; icon.alt = ""; }
  else { icon = document.createElement("div"); icon.className = "ph"; icon.textContent = (title || "?")[0].toUpperCase(); }
  const s = document.createElement("span");
  s.textContent = title;
  a.append(icon, s);
  return a;
}
(async () => {
  const box = document.getElementById("tiles");
  let sites = [];
  try { sites = await browser.topSites.get({ includeFavicon: true, limit: 8, onePerDomain: true }); } catch (_) {}
  const seen = new Set(sites.map((s) => new URL(s.url).hostname));
  for (const [t, u] of DEFAULTS) {
    if (sites.length >= 8) break;
    if (!seen.has(new URL(u).hostname)) sites.push({ title: t, url: u });
  }
  for (const s of sites.slice(0, 8)) box.appendChild(tile(s.title || new URL(s.url).hostname, s.url, s.favicon));
})();

// Keyboard relay: only react to commands for this tab; #go / #type opens the keyboard on arrival.
browser.tabs.getCurrent().then((t) => { if (t) window.__trimuiTabId = t.id; });
if (location.hash === "#go" || location.hash === "#type") {

  history.replaceState(null, "", location.pathname);
  q.focus();
  setTimeout(() => window.__trimuiOSKToggle("type"), 50);   // both modes type into the search box here
}
