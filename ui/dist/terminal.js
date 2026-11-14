function k(e) {
  return !!e && e.alive && e.type === "terminal";
}
function C({ fetchImpl: e }) {
  async function a(t, l) {
    const n = await e(t, l);
    if (!n.ok) throw new Error(`${(l == null ? void 0 : l.method) || "GET"} ${t} -> ${n.status}`);
    return n.json();
  }
  return {
    async listTerminals() {
      const t = await a("/api/terminals");
      return (Array.isArray(t) ? t : []).filter(k);
    },
    createTerminal(t) {
      return a("/api/terminals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: t })
      });
    },
    deleteTerminal(t) {
      return a(`/api/terminals/${encodeURIComponent(t)}`, { method: "DELETE" });
    }
  };
}
function S(e) {
  const a = (e || []).map((t) => {
    const l = /^Terminal (\d+)$/.exec(t.name || "");
    return l ? Number(l[1]) : 0;
  });
  return `Terminal ${Math.max(0, ...a) + 1}`;
}
function E(e, a) {
  return (e.name || "").toLowerCase().localeCompare((a.name || "").toLowerCase());
}
function M(e) {
  const a = C({ fetchImpl: e.sdk.api.fetch }), { useState: t, useRef: l, useCallback: n, useEffect: d } = e.React;
  function w() {
    return /* @__PURE__ */ e.h("svg", { className: "w-3.5 h-3.5 shrink-0 text-[var(--color-accent)]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ e.h("polyline", { points: "4 17 10 11 4 5" }), /* @__PURE__ */ e.h("line", { x1: "12", y1: "19", x2: "20", y2: "19" }));
  }
  function h() {
    const [f, m] = t(!1), [s, g] = t([]), [p, i] = t(null), u = l(null), o = n(async () => {
      try {
        g(await a.listTerminals()), i(null);
      } catch (r) {
        i(String(r.message || r));
      }
    }, []);
    d(() => {
      o();
    }, [o]), d(() => () => clearTimeout(u.current), []);
    const y = n(() => {
      clearTimeout(u.current), m(!0), o();
    }, [o]), N = n(() => {
      u.current = setTimeout(() => m(!1), 150);
    }, []), x = n(async () => {
      m(!1);
      try {
        const r = await a.createTerminal(S(s));
        if (!(r != null && r.id)) {
          i("failed to create terminal");
          return;
        }
        window.__awOpenTerminal ? window.__awOpenTerminal(r.id) : i("this workspace UI cannot open terminal windows"), o();
      } catch (r) {
        i(String(r.message || r));
      }
    }, [s, o]), T = n((r) => {
      m(!1), window.__awOpenTerminal ? window.__awOpenTerminal(r) : i("this workspace UI cannot open terminal windows");
    }, []), b = n(async (r) => {
      try {
        await a.deleteTerminal(r);
      } catch (c) {
        i(String(c.message || c));
      }
      o();
    }, [o]), v = [...s].sort(E);
    return /* @__PURE__ */ e.h("div", { className: "relative", onMouseEnter: y, onMouseLeave: N }, /* @__PURE__ */ e.h(
      "div",
      {
        onClick: x,
        className: "flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.06] cursor-pointer",
        title: "Open a new terminal"
      },
      /* @__PURE__ */ e.h(w, null),
      /* @__PURE__ */ e.h("span", { className: "flex-1 text-[13px] text-[var(--color-text-primary)]" }, "Terminal"),
      s.length > 0 && /* @__PURE__ */ e.h("span", { className: "text-[10px] text-[var(--color-text-muted)]" }, s.length),
      /* @__PURE__ */ e.h("svg", { className: "w-3 h-3 text-[var(--color-text-muted)]", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ e.h("path", { d: "M9 6l6 6-6 6" }))
    ), f && /* @__PURE__ */ e.h(
      "div",
      {
        className: "absolute left-full top-0 ml-1 z-50 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-2xl p-2",
        style: { minWidth: 280, maxWidth: 360 }
      },
      /* @__PURE__ */ e.h(
        "button",
        {
          onClick: (r) => {
            r.stopPropagation(), x();
          },
          title: "New terminal",
          "aria-label": "Start new terminal",
          className: "w-full text-left px-2 py-1.5 rounded text-xs text-[var(--color-accent)] hover:bg-white/5 flex items-center gap-1.5"
        },
        /* @__PURE__ */ e.h("svg", { className: "w-3 h-3 shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ e.h("path", { d: "M12 5v14M5 12h14" })),
        /* @__PURE__ */ e.h("span", { className: "font-medium" }, "New Terminal"),
        /* @__PURE__ */ e.h("span", { className: "ml-auto text-[10px] text-[var(--color-text-muted)]" }, s.length)
      ),
      p && /* @__PURE__ */ e.h("div", { className: "mx-1 my-1 px-2 py-1 text-[11px] rounded bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/30" }, p),
      /* @__PURE__ */ e.h("div", { className: "border-t border-[var(--color-border)] my-1" }),
      v.length === 0 ? /* @__PURE__ */ e.h("div", { className: "px-2 py-3 text-xs text-[var(--color-text-muted)]" }, "No running terminals.") : /* @__PURE__ */ e.h("div", { className: "overflow-y-auto", style: { maxHeight: "70vh" } }, v.map((r) => /* @__PURE__ */ e.h(
        "div",
        {
          key: r.id,
          className: "group relative w-full rounded hover:bg-white/5 transition-colors"
        },
        /* @__PURE__ */ e.h(
          "button",
          {
            onClick: (c) => {
              c.stopPropagation(), T(r.id);
            },
            className: "w-full text-left px-2 py-1.5 pr-8",
            title: `Open ${r.name}`
          },
          /* @__PURE__ */ e.h("div", { className: "text-xs font-medium text-[var(--color-text-primary)] truncate flex items-center gap-2" }, /* @__PURE__ */ e.h("span", { className: "w-2 h-2 rounded-full bg-emerald-400 shrink-0" }), /* @__PURE__ */ e.h("span", { className: "truncate" }, r.name))
        ),
        /* @__PURE__ */ e.h(
          "button",
          {
            onClick: (c) => {
              c.stopPropagation(), b(r.id);
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
  M as default,
  M as register
};
