import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def _clean(value: str | None) -> str | None:
    if value is None:
        return None
    text = str(value).strip().strip('"').strip("'")
    if not text or text.lower() in {"not set", "none", "null", "undefined"}:
        return None
    return text


def parse_env_file(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.is_file():
        return out
    text = path.read_text(encoding="utf-8-sig")
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.lower().startswith("export "):
            line = line[7:].strip()
        if "=" in line:
            key, _, value = line.partition("=")
        elif ":" in line:
            key, _, value = line.partition(":")
        else:
            continue
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            out[key] = value
    return out


def env_file_paths() -> list[Path]:
    paths = [ROOT / ".env.local", ROOT / ".env"]
    cwd = Path.cwd().resolve()
    if cwd != ROOT.resolve():
        paths.extend([cwd / ".env.local", cwd / ".env"])
    home = Path.home() / "rayaweb"
    if home.resolve() != ROOT.resolve():
        paths.extend([home / ".env.local", home / ".env"])
    seen: set[Path] = set()
    unique: list[Path] = []
    for path in paths:
        try:
            resolved = path.resolve()
        except OSError:
            continue
        if resolved in seen:
            continue
        seen.add(resolved)
        unique.append(path)
    return unique


def loaded_env_files() -> list[str]:
    return [str(path) for path in env_file_paths() if path.is_file()]


def load_square_env() -> None:
    for path in env_file_paths():
        if not path.is_file():
            continue
        for key, value in parse_env_file(path).items():
            cleaned = _clean(value)
            if cleaned is not None:
                os.environ[key] = cleaned


load_square_env()


class _EnvStr:
    def __init__(self, name: str, default: str | None = None):
        self.name = name
        self.default = default

    def __get__(self, _obj, _owner=None):
        load_square_env()
        value = _clean(os.environ.get(self.name))
        if value:
            return value
        return self.default


class Config:
    SECRET_KEY = _EnvStr("FLASK_SECRET_KEY", "raya-dev-secret-change-me")
    SQUARE_API_HOST = _EnvStr("SQUARE_API_HOST", "https://connect.squareup.com")
    SQUARE_API_VERSION = _EnvStr("SQUARE_API_VERSION", "2026-08-19")
    SQUARE_ACCESS_TOKEN = _EnvStr("SQUARE_ACCESS_TOKEN")
    SQUARE_LOCATION_ID = _EnvStr("SQUARE_LOCATION_ID")
    SQUARE_ORDER_URL = _EnvStr("SQUARE_ORDER_URL")
