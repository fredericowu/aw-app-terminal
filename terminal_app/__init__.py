"""aw-app-terminal — the Terminal launcher row in the workspace nav.

Frontend-only app: everything user-visible lives in ``ui/src/plugin.jsx``,
which the SPA loads from the committed ``ui/dist/terminal.js`` bundle. This
package exists because a Tier-1 (``"tier": "inprocess"``) app must name a
``runtime.entrypoint`` — see ``terminal_app/plugin.py``.
"""
