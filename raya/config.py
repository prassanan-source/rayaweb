import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env.local")
load_dotenv(ROOT / ".env")


class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY") or "raya-dev-secret-change-me"
    TOAST_API_HOST = (os.environ.get("TOAST_API_HOST") or "https://ws-api.toasttab.com").rstrip("/")
    TOAST_CLIENT_ID = (os.environ.get("TOAST_CLIENT_ID") or "").strip() or None
    TOAST_CLIENT_SECRET = (os.environ.get("TOAST_CLIENT_SECRET") or "").strip() or None
    TOAST_RESTAURANT_GUID = (
        os.environ.get("TOAST_RESTAURANT_GUID") or "82a7a0d7-cf2d-4563-b767-0ea0622c5e2f"
    ).strip()
    TOAST_SLUG = (os.environ.get("TOAST_SLUG") or "raya-7150-village-pkwy").strip()
