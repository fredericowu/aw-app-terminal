# aw-app-terminal

The **Terminal** launcher in the aw-workspace nav: open a new shell, see which
terminals are running, jump into one, close one.

That is the whole app — one row, contributed into core's
`core.nav.workspace` slot by a frontend bundle. There is no backend here.

## Why it exists

"Terminal" used to be a row inside the **Agents** menu contributed by
[`aw-app-code-agent-clis`](https://github.com/tekflox/aw-app-code-agent-clis)
— its `isTerminalLauncher` branch. A plain shell is not an agent CLI session,
and putting it under "Agents" meant the Agents badge counted terminals and the
two concerns shared one component. This app is that row, extracted; the
agent-CLI app now declares a `dependencies.apps` entry on it.

## What this app does NOT own

The terminal itself. The PTY shell, `/api/terminals`, `/ws/terminal/*` and the
terminal window chrome are **core-owned** (the 2026-08-03 decoupling
decision), because core itself, `aw-app-tasks`' `terminal`-type tasks and
`aw-app-code-agent-clis`' session launches all drive them. Moving that here
would make this app a required dependency of half the workspace and change
nothing a user can see.

So the nav row talks to core over the same two public paths any other
contributor can use:

| Action | How |
|---|---|
| New terminal | `POST /api/terminals` then `window.__awOpenTerminal(id)` |
| List running | `GET /api/terminals`, filtered to `alive && type === 'terminal'` |
| Open existing | `window.__awOpenTerminal(id)` |
| Close | `DELETE /api/terminals/{id}` |

`window.__awOpenTerminal` is the global core registers for exactly this (see
aw-workspace-ui `App.jsx`); it is also how core's own repo-terminal row opens
a shell. The list is fetched on mount and on every flyout open — no standing
WebSocket subscription, because the row only exists while the nav popover is
open and a listener held there would be dead most of the time.

`core.nav.workspace` passes **no props** to its fillers, and this app needs
none: it is self-contained by design, so the row works wherever core chooses
to render that slot.

## Layout

```
aw-app.json            manifest — tier inprocess, permissions: ui:code + ui:slots:core.nav.workspace
terminal_app/plugin.py the (deliberately inert) Tier-1 entrypoint a manifest must name
ui/src/plugin.jsx      register(host) -> host.registerSlot('core.nav.workspace', TerminalNavRow)
ui/src/client.js       framework-free client for core's /api/terminals endpoints
ui/dist/terminal.js    COMMITTED prebuilt bundle — what actually ships
tests/                 plugin inertness + the manifest-to-bundle contract
```

`ui/dist` is committed on purpose: nothing builds it at install or serve time,
so a gitignored bundle would mean an installed app pointing at a file that
does not exist. `.github/workflows/release.yml`'s `check-dist` job rebuilds it
and fails the release if it does not match `ui/src`.

## Developing

```bash
cd ui
npm ci
npm run lint
npm run build          # -> ui/dist/terminal.js — COMMIT the result
cd ..
python3 -m pytest tests/ -q
python3 tests/validate_manifest.py aw-app.json
```

JSX in `ui/src/plugin.jsx` compiles to `host.h(...)` (see
`ui/vite.config.js`), not react's own `createElement` — never import React
here, there is exactly one shared instance and the plugin host hands it over
as `host.React`.

## Install

```bash
aw-workspace-cli marketplace install terminal
```
