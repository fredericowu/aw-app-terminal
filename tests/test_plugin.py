"""Unit tests for terminal_app/plugin.py — this app's whole Python surface.

The plugin is deliberately inert (everything user-visible is the frontend
bundle), so what these tests actually pin down is that it stays inert: the
reconciler calls activate() on every boot, and an app that is only supposed
to contribute a slot must not grow a route/CLI/table contribution here
without someone noticing.

`ctx` is a MagicMock, not the real F4 runtime — activate() touches none of
its facades, which is the point being asserted.

Run: python3 -m pytest tests/ -q
"""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path
from unittest.mock import MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from terminal_app.plugin import TerminalAppPlugin  # noqa: E402


def test_activate_touches_no_gated_facade():
    ctx = MagicMock()

    assert asyncio.run(TerminalAppPlugin().activate(ctx)) is None

    # Not "no crash" — no capability used. This app declares only ui:code and
    # ui:slots:core.nav.workspace, so a call to any of these facades would be
    # a permission the manifest never asked for.
    assert ctx.mock_calls == []


def test_deactivate_completes_without_touching_ctx():
    # deactivate() takes no ctx — the framework's journal reverse-replay
    # handles revert; this just proves the coroutine returns cleanly.
    assert asyncio.run(TerminalAppPlugin().deactivate()) is None
