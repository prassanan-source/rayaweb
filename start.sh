#!/bin/sh
set -e
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  npm install
fi
echo "Starting Raya at http://127.0.0.1:43127"
exec npm run dev
