#!/bin/sh
set -e
cd "$(dirname "$0")"

load_nvm() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh"
  fi
}

load_nvm

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed. Node.js is required to run this site."
  echo
  echo "Quick fix (Linux / macOS, no sudo):"
  echo "  ./install-node.sh"
  echo "  ./start.sh"
  echo
  echo "Or install Node 22 LTS yourself:"
  echo "  Ubuntu/Debian:  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt-get install -y nodejs"
  echo "  macOS Homebrew: brew install node@22"
  echo "  Windows:        winget install OpenJS.NodeJS.LTS"
  echo "                  then close and reopen the terminal"
  echo
  echo "Download: https://nodejs.org/en/download"
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run)..."
  npm install
fi

echo "Starting Raya at http://127.0.0.1:43127"
exec npm run dev
