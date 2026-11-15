"""The manifest-to-bundle contract, checked against the committed bundle.

This app contributes exactly one thing and ships it as prebuilt bytes
(`ui/dist/terminal.js`, committed — there is no build step at install or
serve time). Three ways that silently breaks, all of them invisible at
install time because nothing fails:

1. `contributes.frontend.bundle` names a file that isn't there -> the nav row
   never renders and the only trace is a console 404.
2. The bundle registers a slot the manifest didn't declare a
   `ui:slots:<id>` permission for -> pluginHost's registerSlot logs
   "not granted slot" and returns a no-op (src/apps/pluginHost.js).
3. The row stops driving core's terminal API / window opener -> a Terminal
   menu that can list nothing and open nothing.

Asserted against the built artifact rather than the source, because the
artifact is what ships. `.github/workflows/release.yml`'s check-dist job is
the other half of this: it proves the artifact actually came from ui/src.

Run: python3 -m pytest tests/ -q
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = json.loads((ROOT / "aw-app.json").read_text(encoding="utf-8"))
FRONTEND = MANIFEST["contributes"]["frontend"]
BUNDLE = ROOT / FRONTEND["bundle"]


def test_the_declared_bundle_is_committed():
    assert BUNDLE.is_file(), f"{FRONTEND['bundle']} is declared in aw-app.json but missing"


def test_every_slot_the_bundle_fills_is_declared_and_permitted():
    source = BUNDLE.read_text(encoding="utf-8")
    for slot in FRONTEND["slots"]:
        assert f'"{slot}"' in source or f"'{slot}'" in source, (
            f"aw-app.json declares slot {slot} that the bundle never registers")
        assert f"ui:slots:{slot}" in MANIFEST["permissions"], (
            f"slot {slot} is contributed without its ui:slots:{slot} permission")


def test_the_bundle_still_drives_cores_terminal_api_and_window_opener():
    source = BUNDLE.read_text(encoding="utf-8")
    # Core-owned, NOT /api/apps/terminal/* — the PTY shell stays in core.
    assert "/api/terminals" in source
    assert "/api/apps/terminal" not in source
    assert "__awOpenTerminal" in source
    assert "__awTerminal" in source
    assert "restartTerminal" in source
    assert "renameTerminal" in source
