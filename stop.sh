#!/bin/sh
cd "$(dirname "$0")"
killed=0
if command -v lsof >/dev/null 2>&1; then
  pids=$(lsof -t -i:43127 2>/dev/null || true)
  if [ -n "$pids" ]; then
    kill $pids 2>/dev/null || true
    killed=1
  fi
fi
pkill -f "flask --app raya run" 2>/dev/null && killed=1 || true
pkill -f "gunicorn.*wsgi:app" 2>/dev/null && killed=1 || true
if [ "$killed" -eq 1 ]; then
  echo "Stopped Raya (port 43127)."
else
  echo "Nothing was listening on port 43127."
fi
