from raya.config import Config
from raya.restaurant import restaurant


def square_host() -> str:
    return (Config.SQUARE_API_HOST or "https://connect.squareup.com").rstrip("/")


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
            f"SQUARE_API_HOST: {square_host()}",
            f"SQUARE_ACCESS_TOKEN: {mask(Config.SQUARE_ACCESS_TOKEN, 'secret')}",
            f"SQUARE_LOCATION_ID: {Config.SQUARE_LOCATION_ID or restaurant['square']['location_id'] or 'not set'}",
        ]
    )


def missing_credential_message() -> str:
    missing = [
        name
        for name, value in (
            ("SQUARE_ACCESS_TOKEN", Config.SQUARE_ACCESS_TOKEN),
            ("SQUARE_LOCATION_ID", Config.SQUARE_LOCATION_ID),
        )
        if not value
    ]
    noun = "variable" if len(missing) == 1 else "variables"
    return "\n".join(
        [
            "Square API credentials are not connected, so this site cannot create a kitchen ticket.",
            f"Missing environment {noun}: {', '.join(missing) or 'unknown'}.",
            "This is not a wrong-password error and not a write-privilege error — Square was never called.",
            "",
            "Set these in .env (local) or on the server, then restart the app:",
            credential_inventory(),
            "",
            "After they are set, a failed checkout will tell you whether the access token failed (HTTP 401) "
            "or Square returned 403 (no write privilege / application not enabled on this location).",
        ]
    )


def privilege_message(scopes: list[str]) -> str:
    needed = ["ORDERS_WRITE", "ORDERS_READ", "ITEMS_READ"]
    normalized = [scope.replace(".", "_").upper() for scope in scopes]
    missing = [scope for scope in needed if scope not in normalized]
    current = ", ".join(scopes) or "(none)"
    if not scopes:
        return (
            "The access token did not list scopes. If the kitchen ticket still fails with HTTP 403, "
            "the application likely lacks ORDERS_WRITE on this location."
        )
    if "ORDERS_WRITE" in missing:
        return (
            f"This token does not have write privilege. Missing: {', '.join(missing)}. "
            f"Current scopes: {current}."
        )
    if missing:
        return (
            f"Write looks present, but some scopes are missing ({', '.join(missing)}). "
            f"Current scopes: {current}."
        )
    return f"Token has write privilege. Scopes: {current}."
