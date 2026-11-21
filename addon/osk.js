// TrimUI gamepad on-screen keyboard.
// Opened by the add-on's commands (gamepad Start=Ctrl+F9 type, X=Ctrl+F8 go to), relayed by bg.js.
// gptokeyb sends D-pad=arrows, Y=Enter, B=Alt+Left; while the keyboard is open those keys drive it.
(() => {
  if (window.top !== window || window.__trimuiOSK) return;
  window.__trimuiOSK = true;

  const ROW_NUM = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const LAYOUTS = {
    lower: [ROW_NUM,
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", "@"],
      ["SHIFT", "z", "x", "c", "v", "b", "n", "m", ".", "BKSP"],
      ["SYM", "/", ".com", "SPACE", "-", "ENTER", "CLOSE"]],
    upper: [ROW_NUM,
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "@"],
      ["SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", "BKSP"],
      ["SYM", "/", ".com", "SPACE", "-", "ENTER", "CLOSE"]],
    sym: [ROW_NUM,
      ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
      ["-", "_", "=", "+", "[", "]", "{", "}", ";", ":"],
      ["'", "\"", ",", "?", "<", ">", "|", "\\", "~", "BKSP"],
      ["ABC", "`", "/", "SPACE", ".", "ENTER", "CLOSE"]],
  };
  const LABEL = { SHIFT: "⇧", BKSP: "⌫", SYM: "?123", ABC: "abc", SPACE: "space", ENTER: "⏎ Go", CLOSE: "✕" };
  const WIDE = { SPACE: 4, ENTER: 1.6, SYM: 1.4, ABC: 1.4, ".com": 1.3 };

  let host = null, root = null, panel = null, titleEl = null, lineEl = null;
  let open = false, goMode = false, mode = "lower", row = 1, col = 0;
  let target = null, lastEditable = null, buf = "";

  const isEditable = (el) => {
    if (!el || el.nodeType !== 1) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === "TEXTAREA") return !el.readOnly && !el.disabled;
    if (el.tagName !== "INPUT" || el.readOnly || el.disabled) return false;
    return ["", "text", "search", "url", "email", "password", "tel", "number"].includes((el.getAttribute("type") || "").toLowerCase());
  };
  const deepActive = () => {
    let a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
    return a;
  };
  document.addEventListener("focusin", (e) => {
    const t = e.composedPath ? e.composedPath()[0] : e.target;
    if (isEditable(t)) lastEditable = t;
  }, true);

  // ---------- rendering (inline styles only: immune to page CSS and CSP) ----------
  function build() {
    host = document.createElement("trimui-osk");
    host.style.cssText = "all:initial;position:fixed;left:0;right:0;bottom:0;z-index:2147483647;display:block;";
    root = host.attachShadow({ mode: "closed" });
    panel = document.createElement("div");
    panel.style.cssText = "box-sizing:border-box;width:100%;padding:6px 8px 8px;background:rgba(28,28,32,.97);" +
      "border-top:2px solid #555;font:16px/1.2 sans-serif;color:#eee;user-select:none;-moz-user-select:none;";
    const head = document.createElement("div");
    head.style.cssText = "display:flex;align-items:center;gap:10px;margin:0 2px 6px;min-height:26px;";
    titleEl = document.createElement("span");
    titleEl.style.cssText = "font-size:13px;color:#aaa;white-space:nowrap;";
    lineEl = document.createElement("span");
    lineEl.style.cssText = "flex:1;background:#fff;color:#111;border-radius:4px;padding:3px 8px;font-size:17px;" +
      "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:ltr;";
    const hint = document.createElement("span");
    hint.textContent = "D-pad move · Y press · B delete · Start close";
    hint.style.cssText = "font-size:12px;color:#888;white-space:nowrap;";
    head.append(titleEl, lineEl, hint);
    panel.appendChild(head);
    panel.appendChild(document.createElement("div"));
    root.appendChild(panel);
    // keep focus in the page's text field when keys are clicked with the pointer
    panel.addEventListener("mousedown", (e) => e.preventDefault(), true);
  }

  function render() {
    const keysBox = panel.lastChild;
    keysBox.textContent = "";
    titleEl.textContent = goMode ? "Go to / search:" : "Typing:";
    lineEl.style.display = goMode ? "" : "none";
    lineEl.textContent = buf + "▏";
    LAYOUTS[mode].forEach((keys, r) => {
      const rowEl = document.createElement("div");
      rowEl.style.cssText = "display:flex;gap:5px;margin-top:5px;";
      keys.forEach((k, c) => {
        const b = document.createElement("div");
        const sel = r === row && c === col;
        const special = k.length > 1 && k !== ".com";
        b.textContent = LABEL[k] || k;
        b.style.cssText = `flex:${WIDE[k] || 1} 1 0;height:40px;display:flex;align-items:center;justify-content:center;` +
          `border-radius:6px;font-size:${special ? 15 : 20}px;cursor:pointer;box-sizing:border-box;` +
          `background:${sel ? "#ff7139" : (k === "SHIFT" && mode === "upper") ? "#5a5a66" : special ? "#3a3a42" : "#4a4a52"};` +
          `color:${sel ? "#fff" : "#eee"};border:2px solid ${sel ? "#fff" : "transparent"};`;
        b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); row = r; col = c; press(k); });
        rowEl.appendChild(b);
      });
      keysBox.appendChild(rowEl);
    });
  }

  // ---------- text operations ----------
  function focusTarget() {
    if (target && deepActive() !== target) target.focus({ preventScroll: true });
  }
  function insert(t) {
    if (goMode) { buf += t; return render(); }
    if (!target || !target.isConnected) return;
    focusTarget();
    if (document.execCommand("insertText", false, t)) return;
    try {
      const s = target.selectionStart, e = target.selectionEnd;
      target.setRangeText(t, s, e, "end");
    } catch (_) { target.value += t; }
    target.dispatchEvent(new InputEvent("input", { bubbles: true, data: t, inputType: "insertText" }));
  }
  function backspace() {
    if (goMode) { buf = buf.slice(0, -1); return render(); }
    if (!target || !target.isConnected) return;
    focusTarget();
    if (document.execCommand("delete", false)) return;
    try {
      let s = target.selectionStart, e = target.selectionEnd;
      if (s === e && s > 0) s--;
      target.setRangeText("", s, e, "end");
    } catch (_) { target.value = target.value.slice(0, -1); }
    target.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" }));
  }
  function enter() {
    if (goMode) {
      const q = buf;
      close();
      if (typeof window.__trimuiGo === "function") window.__trimuiGo(q);   // start page hook
      else browser.runtime.sendMessage({ go: q });
      return;
    }
    if (!target || !target.isConnected) return close();
    focusTarget();
    if (target.tagName === "TEXTAREA" || target.isContentEditable) return insert("\n");
    const el = target;
    close();
    const opts = { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true };
    const handled = !el.dispatchEvent(new KeyboardEvent("keydown", opts));
    el.dispatchEvent(new KeyboardEvent("keypress", opts));
    el.dispatchEvent(new KeyboardEvent("keyup", opts));
    if (!handled && el.form) {
      if (el.form.requestSubmit) el.form.requestSubmit(); else el.form.submit();
    }
  }

  function press(k) {
    switch (k) {
      case "SHIFT": mode = mode === "upper" ? "lower" : "upper"; break;
      case "SYM": mode = "sym"; break;
      case "ABC": mode = "lower"; break;
      case "BKSP": return backspace();
      case "SPACE": return insert(" ");
      case "ENTER": return enter();
      case "CLOSE": return close();
      default:
        insert(k);
        if (mode === "upper") mode = "lower";   // one-shot shift
    }
    clampCol();
    render();
  }

  function clampCol() { col = Math.min(col, LAYOUTS[mode][row].length - 1); }
  function move(dr, dc) {
    const rows = LAYOUTS[mode];
    if (dr) {
      // keep roughly the same horizontal position across rows of different widths
      const frac = (col + 0.5) / rows[row].length;
      row = (row + dr + rows.length) % rows.length;
      col = Math.min(rows[row].length - 1, Math.floor(frac * rows[row].length));
    } else {
      col = (col + dc + rows[row].length) % rows[row].length;
    }
    render();
  }

  // ---------- open / close ----------
  function show(wantGo) {
    const a = deepActive();
    target = !wantGo && isEditable(a) ? a
      : !wantGo && lastEditable && lastEditable.isConnected ? lastEditable : null;
    goMode = !target;
    buf = "";
    if (target) target.focus({ preventScroll: true });
    if (!host) build();
    if (!host.isConnected) (document.body || document.documentElement).appendChild(host);
    open = true; mode = "lower"; row = 1; col = 0;
    render();
    if (target) setTimeout(() => target.scrollIntoView({ block: "center" }), 0);
  }
  function close() {
    open = false;
    if (host) host.remove();
  }

  window.addEventListener("keydown", (e) => {
    if (!open || e.key === "F8" || e.key === "F9") return;   // F-keys belong to the commands
    let used = true;
    if (e.key === "ArrowLeft" && e.altKey) backspace();          // B button
    else if (e.key === "ArrowUp") move(-1, 0);
    else if (e.key === "ArrowDown") move(1, 0);
    else if (e.key === "ArrowLeft") move(0, -1);
    else if (e.key === "ArrowRight") move(0, 1);
    else if (e.key === "Enter") press(LAYOUTS[mode][row][col]); // Y button
    else if (e.key === "Escape") close();
    else if (e.key === "Backspace") backspace();
    else used = false;
    if (used) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  // toggle from the background command relay
  function toggle(what) {
    const wantGo = what === "go";
    if (open && goMode === wantGo) return close();
    if (open) close();
    show(wantGo);
  }
  window.__trimuiOSKToggle = toggle;
  browser.runtime.onMessage.addListener((m) => {
    if (!m || !m.osk) return;
    if (m.tabId !== undefined && window.__trimuiTabId !== undefined && m.tabId !== window.__trimuiTabId) return;
    toggle(m.osk);
  });

  // swallow the matching keyup/keypress so pages don't react to keyboard navigation
  for (const t of ["keyup", "keypress"]) {
    window.addEventListener(t, (e) => {
      if (open && /^(Arrow|Enter$|Escape$)/.test(e.key)) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
  }
})();
