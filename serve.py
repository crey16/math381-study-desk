#!/usr/bin/env python3
"""Static server for the study desk with caching disabled, so a refresh always gets the latest files."""
import http.server, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store, must-revalidate'); self.send_header('Expires','0'); super().end_headers()
    def log_message(self,*a): pass
port=int(sys.argv[1]) if len(sys.argv)>1 else 8000
print(f'Serving on http://localhost:{port}'); http.server.ThreadingHTTPServer(('',port),H).serve_forever()
