#!/bin/bash
# Aero Villas offline preview for Mac: serves ./site on localhost and opens it.
cd "$(dirname "$0")/site" || exit 1

if ! command -v python3 >/dev/null 2>&1 || ! python3 -c "" >/dev/null 2>&1; then
  echo "Python 3 is needed. macOS will offer to install it (Command Line Tools)."
  echo "Accept, then double-click this file again."
  xcode-select --install 2>/dev/null
  read -r -p "Press Enter to close"
  exit 1
fi

PORT=8080
while lsof -i :"$PORT" >/dev/null 2>&1; do PORT=$((PORT + 1)); done

echo ""
echo "  AERO VILLAS - offline preview"
echo "  Running at http://localhost:$PORT/"
echo "  Keep this window open while you browse. Close it to stop."
echo ""
(sleep 1 && open "http://localhost:$PORT/") &

# Serve page routes like /master-plan from master-plan.html
exec python3 - "$PORT" <<'PY'
import http.server, os, sys

class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        full = super().translate_path(path)
        if not os.path.exists(full) or os.path.isdir(full):
            if os.path.isfile(full.rstrip("/") + ".html"):
                return full.rstrip("/") + ".html"
        return full

    def send_error(self, code, message=None, explain=None):
        if code == 404 and os.path.isfile("404.html"):
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            with open("404.html", "rb") as f:
                self.wfile.write(f.read())
            return
        super().send_error(code, message, explain)

    def log_message(self, *args):
        pass

http.server.ThreadingHTTPServer(("localhost", int(sys.argv[1])), Handler).serve_forever()
PY
