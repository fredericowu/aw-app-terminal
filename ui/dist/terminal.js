function C(e) {
  return !!e && e.alive && e.type === "terminal";
}
function _(e) {
  return !!e && e.alive && e.type !== "terminal" && e.type !== "stubborn";
}
function v(e) {
  const n = (e || []).map((r) => {
    const t = /^Terminal (\d+)$/.exec(r.name || "");
    return t ? Number(t[1]) : 0;
  });
  return `Terminal ${Math.max(0, ...n) + 1}`;
}
function S({ fetchImpl: e }) {
  async function n(r, t) {
    const o = await e(r, t);
    if (!o.ok) throw new Error(`${(t == null ? void 0 : t.method) || "GET"} ${r} -> ${o.status}`);
    return o.json();
  }
  return {
    async listSessions() {
      const r = await n("/api/terminals");
      return (Array.isArray(r) ? r : []).filter((t) => !!t && t.alive);
    },
    async listTerminals() {
      const r = await n("/api/terminals");
      return (Array.isArray(r) ? r : []).filter(C);
    },
    async listAgentSessions() {
      const r = await n("/api/terminals");
      return (Array.isArray(r) ? r : []).filter(_);
    },
    createTerminal(r) {
      const t = typeof r == "string" ? { name: r } : { ...r || {} };
      return n("/api/terminals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t)
      });
    },
    renameTerminal(r, t) {
      return n(`/api/terminals/${encodeURIComponent(r)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: t })
      });
    },
    restartTerminal(r, t = {}) {
      return n(`/api/terminals/${encodeURIComponent(r)}/restart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(t)
      });
    },
    deleteTerminal(r) {
      return n(`/api/terminals/${encodeURIComponent(r)}`, { method: "DELETE" });
    }
  };
}
function E(e, n) {
  return (e.name || "").toLowerCase().localeCompare((n.name || "").toLowerCase());
}
function O(e) {
  const n = S({ fetchImpl: e.sdk.api.fetch });
  if (typeof window < "u") {
    const d = {
      ...n,
      nextTerminalName: v,
      openTerminal(s) {
        return window.__awOpenTerminal ? (window.__awOpenTerminal(s), !0) : !1;
      }
    };
    window.__awTerminal = d, window.dispatchEvent(new CustomEvent("aw-terminal-app-ready", { detail: d })), typeof e.onDispose == "function" && e.onDispose(() => {
      window.__awTerminal === d && delete window.__awTerminal;
    });
  }
  const { useState: r, useRef: t, useCallback: o, useEffect: u } = e.React;
  function y() {
    return /* @__PURE__ */ e.h("svg", { className: "w-3.5 h-3.5 shrink-0 text-[var(--color-accent)]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ e.h("polyline", { points: "4 17 10 11 4 5" }), /* @__PURE__ */ e.h("line", { x1: "12", y1: "19", x2: "20", y2: "19" }));
  }
  function h() {
    const [d, s] = r(!1), [c, g] = r([]), [w, l] = r(null), p = t(null), i = o(async () => {
      try {
        g(await n.listTerminals()), l(null);
      } catch (a) {
        l(String(a.message || a));
      }
    }, []);
    u(() => {
      i();
    }, [i]), u(() => () => clearTimeout(p.current), []);
    const T = o(() => {
      clearTimeout(p.current), s(!0), i();
    }, [i]), b = o(() => {
      p.current = setTimeout(() => s(!1), 150);
    }, []), f = o(async () => {
      s(!1);
      try {
        const a = await n.createTerminal(v(c));
        if (!(a != null && a.id)) {
          l("failed to create terminal");
          return;
        }
        window.__awOpenTerminal ? window.__awOpenTerminal(a.id) : l("this workspace UI cannot open terminal windows"), i();
      } catch (a) {
        l(String(a.message || a));
      }
    }, [c, i]), N = o((a) => {
      s(!1), window.__awOpenTerminal ? window.__awOpenTerminal(a) : l("this workspace UI cannot open terminal windows");
    }, []), k = o(async (a) => {
      try {
        await n.deleteTerminal(a);
      } catch (m) {
        l(String(m.message || m));
      }
      i();
    }, [i]), x = [...c].sort(E);
    return /* @__PURE__ */ e.h("div", { className: "relative", onMouseEnter: T, onMouseLeave: b }, /* @__PURE__ */ e.h(
      "div",
      {
        onClick: f,
        className: "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.06] cursor-pointer",
        title: "Open a new terminal"
      },
      /* @__PURE__ */ e.h(y, null),
      /* @__PURE__ */ e.h("span", { className: "flex-1 text-[13px] text-[var(--color-text-primary)]" }, "Terminal"),
      c.length > 0 && /* @__PURE__ */ e.h("span", { className: "text-[10px] text-[var(--color-text-muted)]" }, c.length),
      /* @__PURE__ */ e.h("svg", { className: "w-3 h-3 text-[var(--color-text-muted)]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ e.h("path", { d: "M9 6l6 6-6 6" }))
    ), d && /* @__PURE__ */ e.h(
      "div",
      {
        className: "absolute left-full top-0 ml-1 z-50 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-2xl p-2",
        style: { minWidth: 280, maxWidth: 360 }
      },
      /* @__PURE__ */ e.h(
        "button",
        {
          onClick: (a) => {
            a.stopPropagation(), f();
          },
          title: "New terminal",
          "aria-label": "Start new terminal",
          className: "w-full text-left px-2 py-1.5 rounded text-xs text-[var(--color-accent)] hover:bg-white/5 flex items-center gap-1.5"
        },
        /* @__PURE__ */ e.h("svg", { className: "w-3 h-3 shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ e.h("path", { d: "M12 5v14M5 12h14" })),
        /* @__PURE__ */ e.h("span", { className: "font-medium" }, "New Terminal"),
        /* @__PURE__ */ e.h("span", { className: "ml-auto text-[10px] text-[var(--color-text-muted)]" }, c.length)
      ),
      w && /* @__PURE__ */ e.h("div", { className: "mx-1 my-1 px-2 py-1 text-[11px] rounded bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/30" }, w),
      /* @__PURE__ */ e.h("div", { className: "border-t border-[var(--color-border)] my-1" }),
      x.length === 0 ? /* @__PURE__ */ e.h("div", { className: "px-2 py-3 text-xs text-[var(--color-text-muted)]" }, "No running terminals.") : /* @__PURE__ */ e.h("div", { className: "overflow-y-auto", style: { maxHeight: "70vh" } }, x.map((a) => /* @__PURE__ */ e.h(
        "div",
        {
          key: a.id,
          className: "group relative w-full rounded hover:bg-white/5 transition-colors"
        },
        /* @__PURE__ */ e.h(
          "button",
          {
            onClick: (m) => {
              m.stopPropagation(), N(a.id);
            },
            className: "w-full text-left px-2 py-1.5 pr-8",
            title: `Open ${a.name}`
          },
          /* @__PURE__ */ e.h("div", { className: "text-xs font-medium text-[var(--color-text-primary)] truncate flex items-center gap-2" }, /* @__PURE__ */ e.h("span", { className: "w-2 h-2 rounded-full bg-emerald-400 shrink-0" }), /* @__PURE__ */ e.h("span", { className: "truncate" }, a.name))
        ),
        /* @__PURE__ */ e.h(
          "button",
          {
            onClick: (m) => {
              m.stopPropagation(), k(a.id);
            },
            className: "absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--color-danger)]/20 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-opacity cursor-pointer",
            title: "Close terminal"
          },
          /* @__PURE__ */ e.h("svg", { className: "w-3 h-3", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ e.h("path", { d: "M18 6L6 18M6 6l12 12" }))
        )
      )))
    ));
  }
  e.registerSlot("core.nav.workspace", h);
}
export {
  O as default,
  O as register
};
