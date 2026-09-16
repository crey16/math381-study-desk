#!/usr/bin/env python3
"""Static server for the study desk.

Caching is disabled, and every relative module import is rewritten to carry a
?v= token derived from the JavaScript mtimes. A browser that cached an old copy
of a module before no-store was in place therefore asks for a URL it has never
seen, so an edit is always the code that runs.
"""
import http.server, io, os, re, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
IMPORT = re.compile(rb"""(from\s*|import\s*\(?\s*)(['"])(\.{1,2}/[^'"?]+?\.js)\2""")

def version():
    stamp = 0
    for base, _, names in os.walk(os.path.join(ROOT, 'js')):
        for n in names:
            if n.endswith('.js'):
                stamp = max(stamp, int(os.stat(os.path.join(base, n)).st_mtime_ns))
    return str(stamp)

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            if not self.path.endswith('/'):
                return super().send_head()
            path = os.path.join(path, 'index.html')
        if not (path.endswith('.js') or path.endswith('.html')) or not os.path.isfile(path):
            return super().send_head()
        v = version().encode()
        with open(path, 'rb') as f:
            body = f.read()
        body = IMPORT.sub(lambda m: m.group(1) + m.group(2) + m.group(3) + b'?v=' + v + m.group(2), body)
        if path.endswith('.html'):
            body = re.sub(rb'''(src=")(js/[^"?]+\.js)(")''', lambda m: m.group(1) + m.group(2) + b'?v=' + v + m.group(3), body)
        self.send_response(200)
        self.send_header('Content-Type', 'text/javascript' if path.endswith('.js') else 'text/html')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        return io.BytesIO(body)

    def log_message(self, *a): pass

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
print(f'Serving on http://localhost:{port}')
http.server.ThreadingHTTPServer(('', port), H).serve_forever()
