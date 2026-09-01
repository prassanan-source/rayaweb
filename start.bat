@echo off
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python is not installed. Install Python 3.12 from https://www.python.org/downloads/
  echo Check "Add python.exe to PATH" during setup, then open a new terminal.
  exit /b 1
)
if not exist .venv (
  python -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if not exist .env copy .env.example .env
echo Starting Raya (Flask) at http://127.0.0.1:43127
python -m flask --app raya run --host 0.0.0.0 --port 43127
