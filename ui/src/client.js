// Framework-free API client for the CORE terminal endpoints this app and its
// dependents (e.g. aw-app-code-agent-clis) drive (src/api/terminal.py in
// aw-workspace):
//
//   GET    /api/terminals                  -> list every PTY session
//   POST   /api/terminals                  -> create one, returns {id, name, type}
//   PUT    /api/terminals/{id}             -> rename one
//   POST   /api/terminals/{id}/restart     -> restart one (new command/session/insecure flag)
//   DELETE /api/terminals/{id}             -> kill one
//
// These are CORE routes, not this app's own `/api/apps/terminal/*` — the PTY
// shell stays core-owned (see terminal_app/plugin.py). So `fetchImpl` must be
// the RAW host.sdk.api.fetch; host.app.fetch would prefix `/api/apps/terminal`
// and 404.
//
// No framework imports here on purpose: this file is plain JS so it can be
// reasoned about (and reused) without a React host.

export function isPlainLiveTerminal(t) {
  return !!t && t.alive && t.type === 'terminal';
}

export function isAgentLiveTerminal(t) {
  return !!t && t.alive && t.type !== 'terminal' && t.type !== 'stubborn';
}

export function nextTerminalName(terminals) {
  const nums = (terminals || []).map((t) => {
    const m = /^Terminal (\d+)$/.exec(t.name || '');
    return m ? Number(m[1]) : 0;
  });
  return `Terminal ${Math.max(0, ...nums) + 1}`;
}

export function createClient({ fetchImpl }) {
  async function json(path, init) {
    const res = await fetchImpl(path, init);
    if (!res.ok) throw new Error(`${init?.method || 'GET'} ${path} -> ${res.status}`);
    return res.json();
  }

  return {
    async listSessions() {
      const data = await json('/api/terminals');
      return (Array.isArray(data) ? data : []).filter((t) => !!t && t.alive);
    },

    async listTerminals() {
      const data = await json('/api/terminals');
      return (Array.isArray(data) ? data : []).filter(isPlainLiveTerminal);
    },

    async listAgentSessions() {
      const data = await json('/api/terminals');
      return (Array.isArray(data) ? data : []).filter(isAgentLiveTerminal);
    },

    createTerminal(nameOrOptions) {
      const payload = typeof nameOrOptions === 'string'
        ? { name: nameOrOptions }
        : { ...(nameOrOptions || {}) };
      return json('/api/terminals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },

    renameTerminal(id, name) {
      return json(`/api/terminals/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
    },

    restartTerminal(id, options = {}) {
      return json(`/api/terminals/${encodeURIComponent(id)}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
    },

    deleteTerminal(id) {
      return json(`/api/terminals/${encodeURIComponent(id)}`, { method: 'DELETE' });
    },
  };
}
