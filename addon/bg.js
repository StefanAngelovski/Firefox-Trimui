// Resolve "go to" text from the keyboard: URL if it looks like one, otherwise a web search.
function toUrl(q) {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(q)) return q;
  if (!/\s/.test(q) && /^(localhost|[^\s/]+\.[a-z]{2,}|\d{1,3}(\.\d{1,3}){3})(:\d+)?(\/.*)?$/i.test(q)) return "https://" + q;
  return null;
}
browser.runtime.onMessage.addListener((m, sender) => {
  if (typeof m.go !== "string") return;
  const q = m.go.trim();
  if (!q) return;
  const tabId = sender.tab ? sender.tab.id : undefined;
  const url = toUrl(q);
  return url ? browser.tabs.update(tabId, { url }) : browser.search.search({ query: q, tabId });
});

// Gamepad X / Start arrive as Ctrl+F8 / Ctrl+F9 (gptokeyb). Commands work on every page,
// including Firefox's own pages where content scripts can't run.
const START = browser.runtime.getURL("start.html");
browser.commands.onCommand.addListener(async (name) => {
  const what = name === "osk-go" ? "go" : "type";
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  if (tab.url && tab.url.startsWith(START)) {
    return browser.runtime.sendMessage({ osk: what, tabId: tab.id }).catch(() => {});
  }
  try {
    await browser.tabs.sendMessage(tab.id, { osk: what });
  } catch (_) {
    // no keyboard possible on this page (about:, addons, PDF viewer...): open the start page with it
    browser.tabs.update(tab.id, { url: START + "#" + what });
  }
});
