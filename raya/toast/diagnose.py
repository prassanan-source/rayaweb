from raya.config import Config
from raya.restaurant import restaurant


def _env(name: str) -> str | None:
    value = getattr(Config, name, None)
    if isinstance(value, str):
        value = value.strip()
    return value or None


def toast_host() -> str:
    return (Config.TOAST_API_HOST or "https://ws-api.toasttab.com").rstrip("/")


def mask(value: str | None, kind: str) -> str:
    if not value:
        return "not set"
    if kind == "secret":
        return f"set ({len(value)} characters)"
    if len(value) <= 8:
        return "set"
    return f"set ({value[:4]}…{value[-4:]})"


def credential_inventory() -> str:
    return "\n".join(
        [
            f"TOAST_API_HOST: {toast_host()}",
            f"TOAST_CLIENT_ID: {mask(Config.TOAST_CLIENT_ID, 'id')}",
            f"TOAST_CLIENT_SECRET: {mask(Config.TOAST_CLIENT_SECRET, 'secret')}",
            f"TOAST_RESTAURANT_GUID: {Config.TOAST_RESTAURANT_GUID or restaurant['toast']['guid']}",
        ]
    )


def missing_credential_message() -> str:
    missing = [
        name
        for name, value in (
            ("TOAST_CLIENT_ID", Config.TOAST_CLIENT_ID),
            ("TOAST_CLIENT_SECRET", Config.TOAST_CLIENT_SECRET),
        )
        if not value
    ]
    noun = "variable" if len(missing) == 1 else "variables"
    return "\n".join(
        [
            "Toast API credentials are not connected, so this site cannot create a kitchen ticket.",
            f"Missing environment {noun}: {', '.join(missing) or 'unknown'}.",
            "This is not a wrong-password error and not a write-privilege error — Toast was never called.",
            "",
            "Set these in .env (local) or /home/hemashan/rayaweb/.env (server), then restart the app:",
            credential_inventory(),
            "",
            "After they are set, a failed checkout will tell you whether login failed (wrong client ID/secret) "
            "or Toast returned 403 (no write privilege / integration not enabled on this restaurant).",
        ]
    )


def read_token_scopes(access_token: str) -> list[str]:
    parts = access_token.split(".")
    if len(parts) < 2:
        return []
    try:
        import base64
        import json

        padded = parts[1] + "=" * (-len(parts[1]) % 4)
        payload = json.loads(base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8"))
        raw = payload.get("scope") or payload.get("scp")
        if isinstance(raw, list):
            return [str(item) for item in raw]
        if isinstance(raw, str):
            return [part for part in raw.replace(",", " ").split() if part]
    except Exception:
        return []
    return []


def privilege_message(scopes: list[str]) -> str:
    needed = ["orders.orders:write", "menus.channel:read", "config:read"]
    missing = [scope for scope in needed if scope not in scopes]
    current = ", ".join(scopes) or "(none)"
    if not scopes:
        return (
            "Login succeeded, but the access token did not list scopes. If the kitchen ticket still "
            "fails with HTTP 403, the client likely lacks orders.orders:write on this location."
        )
    if "orders.orders:write" in missing:
        return (
            f"Login succeeded, but this client does not have write privilege. Missing: {', '.join(missing)}. "
            f"Current scopes: {current}."
        )
    if missing:
        return (
            f"Login succeeded. Write looks present, but some scopes are missing ({', '.join(missing)}). "
            f"Current scopes: {current}."
        )
    return f"Login succeeded with write privilege. Scopes: {current}."
