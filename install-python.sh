#!/bin/sh
# Installs Python 3 if it is missing (Linux / macOS).
set -e

if command -v python3 >/dev/null 2>&1; then
  echo "Python is already installed: $(python3 --version)"
  python3 -m venv --help >/dev/null 2>&1 || {
    echo "python3-venv is missing. On Ubuntu/Debian run:"
    echo "  sudo apt-get update && sudo apt-get install -y python3 python3-venv python3-pip"
    exit 1
  }
  exit 0
fi

echo "Python 3 is not installed."
echo
echo "Ubuntu / Debian:"
echo "  sudo apt-get update && sudo apt-get install -y python3 python3-venv python3-pip"
echo
echo "macOS Homebrew:"
echo "  brew install python"
echo
echo "Windows:"
echo "  winget install Python.Python.3.12"
echo "  then close and reopen the terminal"
echo
echo "Download: https://www.python.org/downloads/"
exit 1
