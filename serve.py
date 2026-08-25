#!/usr/bin/env python3
"""Static dev server for the EWB Cornell site.

`python3 -m http.server` sends no Cache-Control header, so browsers fall back
to heuristic freshness (roughly 10% of the file's age) and will happily serve
stale HTML for days without ever revalidating. That is why edited pages appear
unchanged on reload. This handler is the same static server with caching off.
"""

import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("PORT", "3456"))
ROOT = os.path.dirname(os.path.abspath(__file__))


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        if "304" not in (args[1] if len(args) > 1 else ""):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    os.chdir(ROOT)
    print(f"EWB Cornell dev server (no-cache) -> http://localhost:{PORT}")
    ThreadingHTTPServer(("", PORT), NoCacheHandler).serve_forever()
