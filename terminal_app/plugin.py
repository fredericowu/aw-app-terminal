"""Entrypoint referenced by aw-app.json's runtime.entrypoint
("terminal_app.plugin:TerminalAppPlugin").

This app contributes exactly one thing — a frontend bundle filling the
``core.nav.workspace`` slot (``contributes.frontend``, loaded by the SPA, not
by this process) — so there is nothing for activate() to do: no system CLI to
install, no routes to mount, no tables to migrate, no background work. The
hooks exist because a Tier-1 app must declare a ``runtime.entrypoint``
("module:ClassName", enforced in aw-workspace's src/apps/manifest.py), and
the reconciler calls activate() on every boot.

Deliberately NOT a backend for terminals. The PTY shell, ``/api/terminals``
and ``/ws/terminal/*`` are core-owned and consumed by core itself, by
aw-app-tasks' "terminal" tasks and by aw-app-code-agent-clis' session
launches; moving them here would make this app a required dependency of half
the workspace for no user-visible gain. See the 2026-08-03 "PTY shell stays
core" decision, restated in aw-app-code-agent-clis'
``ui/src/plugin.jsx`` header.
"""

from __future__ import annotations

import logging

log = logging.getLogger("aw_apps.terminal")


class TerminalAppPlugin:
    async def activate(self, ctx) -> None:
        log.info("aw-app-terminal activated: nav slot is served from the frontend bundle")

    async def deactivate(self) -> None:
        log.info("aw-app-terminal deactivated")
