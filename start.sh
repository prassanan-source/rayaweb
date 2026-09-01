#!/bin/sh
set -e
cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is not installed. Run ./install-python.sh first."
  echo "Or install Python 3.12+ from https://www.python.org/downloads/"
  exit 1
fi

if [ ! -d .venv ]; then
  echo "Creating virtualenv..."
  if ! python3 -m venv .venv; then
    echo "Could not create a virtualenv. On Ubuntu/Debian run:"
    echo "  sudo apt-get update && sudo apt-get install -y python3 python3-venv python3-pip"
    echo "Then run ./start.sh again."
    exit 1
  fi
fi

# shellcheck disable=SC1091
. .venv/bin/activate

python -m pip install --upgrade pip >/dev/null
python -m pip install -r requirements.txt

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "Copied .env.example to .env — add Toast keys if you want kitchen tickets."
fi

echo "Starting Raya (Flask) at http://127.0.0.1:43127"
exec python -m flask --app raya run --host 0.0.0.0 --port 43127
