// Integrated-mode entrypoint — dynamic-imported by aw-workspace-ui's
// loadComponentPlugin() once this app is installed with "ui:code" +
// "ui:slots:core.nav.workspace" granted. Built by `npm run build` ->
// ui/dist/terminal.js, referenced from aw-app.json's contributes.frontend.bundle.
//
// register(host) is the ONE required export. `host` is the APP-SCOPED handle
// from aw-workspace-ui's hostForApp() (src/apps/pluginHost.js) — host.React /
// host.h are the shared instances (never import your own React),
// host.registerSlot is how this fills the `core.nav.workspace` slot the
// workspace nav popover renders.
//
// JSX in this file compiles to host.h(...)/host.React.Fragment calls, not
// react's own createElement — see vite.config.js's esbuild.jsxFactory. Every
// component below is a plain function DECLARED INSIDE register(host) so it
// closes over `host` without importing react itself (ADR "one shared React
// instance" — external: ['react','react-dom'] in vite.config.js).
//
// This is the "Terminal" launcher, extracted out of aw-app-code-agent-clis'
// Agents menu (its `isTerminalLauncher` branch) so a plain shell no longer
// lives under "Agents". The UI is all this app owns: the PTY shell itself,
// `/api/terminals`, `/ws/terminal/*` and the terminal window chrome stay
// core-owned (2026-08-03 decision) and are reached here over plain REST plus
// core's own `window.__awOpenTerminal` global — the same path
// aw-workspace-ui's WorkspaceNav.jsx uses to open a repo terminal. That is
// deliberately a ZERO-PROP contribution: `core.nav.workspace` passes no props
// to its fillers, so this row works wherever that slot happens to be rendered.

import { createClient, nextTerminalName } from './client.js';

function byName(a, b) {
  return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
}

export function register(host) {
  const client = createClient({ fetchImpl: host.sdk.api.fetch });

  // Expose the shared terminal management service globally so dependents
  // (e.g. aw-app-code-agent-clis) and workspace UI components can create,
  // restart, rename, close, and open terminal sessions through one contract.
  if (typeof window !== 'undefined') {
    const api = {
      ...client,
      nextTerminalName,
      openTerminal(id) {
        if (window.__awOpenTerminal) {
          window.__awOpenTerminal(id);
          return true;
        }
        return false;
      },
    };
    window.__awTerminal = api;
    window.dispatchEvent(new CustomEvent('aw-terminal-app-ready', { detail: api }));
    if (typeof host.onDispose === 'function') {
      host.onDispose(() => {
        if (window.__awTerminal === api) delete window.__awTerminal;
      });
    }
  }

  const { useState, useRef, useCallback, useEffect } = host.React;

  function TerminalIcon() {
    return (
      <svg className="w-3.5 h-3.5 shrink-0 text-[var(--color-accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    );
  }

  function TerminalNavRow() {
    const [submenu, setSubmenu] = useState(false);
    const [terminals, setTerminals] = useState([]);
    const [error, setError] = useState(null);
    const closeTimer = useRef(null);

    const refresh = useCallback(async () => {
      try {
        setTerminals(await client.listTerminals());
        setError(null);
      } catch (e) {
        setError(String(e.message || e));
      }
    }, []);

    // Fetch on mount and again on every flyout open — no standing WS listener
    // on purpose. This row only exists while the nav popover is open, so a
    // subscription held here would be dead most of the time anyway (the
    // whiteboard "standing listener unmounts with the popover" bug); a
    // poll-on-open is correct for a picker menu and is what the sibling rows
    // in this slot already do (aw-app-tasks' TasksNavSlot).
    useEffect(() => { refresh(); }, [refresh]);
    useEffect(() => () => clearTimeout(closeTimer.current), []);

    const enter = useCallback(() => {
      clearTimeout(closeTimer.current);
      setSubmenu(true);
      refresh();
    }, [refresh]);

    const leave = useCallback(() => {
      closeTimer.current = setTimeout(() => setSubmenu(false), 150);
    }, []);

    const newTerminal = useCallback(async () => {
      setSubmenu(false);
      try {
        const created = await client.createTerminal(nextTerminalName(terminals));
        if (!created?.id) {
          setError('failed to create terminal');
          return;
        }
        // Core owns the terminal window; this global is how it lets anything
        // else open one (registered in aw-workspace-ui App.jsx).
        if (window.__awOpenTerminal) window.__awOpenTerminal(created.id);
        else setError('this workspace UI cannot open terminal windows');
        refresh();
      } catch (e) {
        setError(String(e.message || e));
      }
    }, [terminals, refresh]);

    const openTerminal = useCallback((id) => {
      setSubmenu(false);
      if (window.__awOpenTerminal) window.__awOpenTerminal(id);
      else setError('this workspace UI cannot open terminal windows');
    }, []);

    const closeTerminal = useCallback(async (id) => {
      try {
        await client.deleteTerminal(id);
      } catch (e) {
        setError(String(e.message || e));
      }
      // Core prunes its own open window off the terminal_update broadcast;
      // this just re-syncs the list this menu shows.
      refresh();
    }, [refresh]);

    const sorted = [...terminals].sort(byName);

    return (
      <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
        <div
          onClick={newTerminal}
          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.06] cursor-pointer"
          title="Open a new terminal"
        >
          <TerminalIcon />
          <span className="flex-1 text-[13px] text-[var(--color-text-primary)]">Terminal</span>
          {terminals.length > 0 && (
            <span className="text-[10px] text-[var(--color-text-muted)]">{terminals.length}</span>
          )}
          <svg className="w-3 h-3 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </div>

        {submenu && (
          <div
            className="absolute left-full top-0 ml-1 z-50 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg shadow-2xl p-2"
            style={{ minWidth: 280, maxWidth: 360 }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); newTerminal(); }}
              title="New terminal"
              aria-label="Start new terminal"
              className="w-full text-left px-2 py-1.5 rounded text-xs text-[var(--color-accent)] hover:bg-white/5 flex items-center gap-1.5"
            >
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
              <span className="font-medium">New Terminal</span>
              <span className="ml-auto text-[10px] text-[var(--color-text-muted)]">{terminals.length}</span>
            </button>

            {error && (
              <div className="mx-1 my-1 px-2 py-1 text-[11px] rounded bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/30">
                {error}
              </div>
            )}

            <div className="border-t border-[var(--color-border)] my-1" />

            {sorted.length === 0 ? (
              <div className="px-2 py-3 text-xs text-[var(--color-text-muted)]">No running terminals.</div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
                {sorted.map((t) => (
                  <div
                    key={t.id}
                    className="group relative w-full rounded hover:bg-white/5 transition-colors"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); openTerminal(t.id); }}
                      className="w-full text-left px-2 py-1.5 pr-8"
                      title={`Open ${t.name}`}
                    >
                      <div className="text-xs font-medium text-[var(--color-text-primary)] truncate flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{t.name}</span>
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); closeTerminal(t.id); }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--color-danger)]/20 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-opacity cursor-pointer"
                      title="Close terminal"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  host.registerSlot('core.nav.workspace', TerminalNavRow);
}

export default register;
