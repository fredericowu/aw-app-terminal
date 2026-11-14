// Framework-free API client for the three CORE terminal endpoints this app
// drives (src/api/terminal.py in aw-workspace):
//
//   GET    /api/terminals          -> list every PTY session
//   POST   /api/terminals          -> create one, returns {id, name, type}
//   DELETE /api/terminals/{id}     -> kill one
//
// These are CORE routes, not this app's own `/api/apps/terminal/*` — the PTY
// shell stays core-owned (see terminal_app/plugin.py). So `fetchImpl` must be
// the RAW host.sdk.api.fetch; host.app.fetch would prefix `/api/apps/terminal`
// and 404.
//
// No framework imports here on purpose: this file is plain JS so it can be
// reasoned about (and reused) without a React host.

// `/api/terminals` returns EVERY session, including the agent-CLI ones
// aw-app-code-agent-clis owns and dead ones that have not been reaped yet.
// Core splits the same payload the same way (aw-workspace-ui App.jsx's
// applyTerminalUpdate: type 'terminal' is a plain shell, 'stubborn' is
// deliberately hidden, anything else is an agent session) — this app's menu
// must only ever show plain, live shells.
function isPlainLiveTerminal(t) {
  return !!t && t.alive && t.type === 'terminal';
}

export function createClient({ fetchImpl }) {
  async function json(path, init) {
    const res = await fetchImpl(path, init);
    if (!res.ok) throw new Error(`${init?.method || 'GET'} ${path} -> ${res.status}`);
    return res.json();
  }

  return {
    async listTerminals() {
      const data = await json('/api/terminals');
      return (Array.isArray(data) ? data : []).filter(isPlainLiveTerminal);
    },

    createTerminal(name) {
      return json('/api/terminals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
    },

    deleteTerminal(id) {
      return json(`/api/terminals/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  };
}
