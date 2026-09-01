#!/bin/sh
# Installs Node.js 22 (includes npm) with nvm. No sudo required.
set -e

need() {
  command -v "$1" >/dev/null 2>&1
}

if need npm; then
  echo "npm is already installed: $(npm -v) (Node $(node -v))"
  exit 0
fi

if ! need curl && ! need wget; then
  echo "Install curl first, then run this script again."
  echo "  Ubuntu/Debian:  sudo apt update && sudo apt install -y curl"
  echo "  Fedora/RHEL:    sudo dnf install -y curl"
  echo "  macOS:          curl is already there, or: brew install curl"
  exit 1
fi

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "Installing nvm (Node Version Manager)..."
  if need curl; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  else
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
  fi
fi

# shellcheck disable=SC1090
. "$NVM_DIR/nvm.sh"

echo "Installing Node.js 22 LTS (this includes npm)..."
nvm install 22
nvm alias default 22
nvm use 22

echo
echo "Node $(node -v)  npm $(npm -v)"
echo
echo "If a new terminal still says npm: command not found, run:"
echo "  export NVM_DIR=\"\$HOME/.nvm\""
echo "  . \"\$NVM_DIR/nvm.sh\""
echo
echo "Then:"
echo "  cd $(dirname "$0")"
echo "  npm install"
echo "  npm run dev"
