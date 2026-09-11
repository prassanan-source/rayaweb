import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env.local")
load_dotenv(ROOT / ".env")


class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY") or "raya-dev-secret-change-me"
    SQUARE_API_HOST = (os.environ.get("SQUARE_API_HOST") or "https://connect.squareup.com").rstrip("/")
    SQUARE_ACCESS_TOKEN = (os.environ.get("SQUARE_ACCESS_TOKEN") or "").strip() or None
    SQUARE_LOCATION_ID = (os.environ.get("SQUARE_LOCATION_ID") or "").strip() or None
    SQUARE_SITE_SLUG = (os.environ.get("SQUARE_SITE_SLUG") or "raya-7150-village-pkwy").strip()
    SQUARE_ORDER_URL = (os.environ.get("SQUARE_ORDER_URL") or "").strip() or None
