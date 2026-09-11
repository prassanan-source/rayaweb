class SquareApiError(Exception):
    def __init__(self, message: str, code: str, status: int | None = None):
        super().__init__(message)
        self.code = code
        self.status = status


def snippet(body: str, max_len: int = 220) -> str:
    text = " ".join((body or "").split()).strip()
    if not text:
        return ""
    return text if len(text) <= max_len else f"{text[:max_len]}…"


def classify_square_http(status: int, operation: str, body: str = "") -> SquareApiError:
    detail = snippet(body)
    suffix = f" Square said: {detail}" if detail else ""

    if status == 401:
        return SquareApiError(
            "Square authentication failed (HTTP 401). The access token is wrong, expired, "
            "or for a different Square environment (production vs sandbox)." + suffix,
            "SQUARE_AUTH_FAILED",
            401,
        )
    if status == 403:
        return SquareApiError(
            f"Square authenticated but refused {operation} (HTTP 403). This access token does not "
            "have write/read privilege for Raya — 7150 Village Pkwy. In the Square Developer Dashboard, "
            "grant ORDERS_WRITE, ORDERS_READ, ITEMS_READ, and ITEMS_WRITE." + suffix,
            "SQUARE_FORBIDDEN",
            403,
        )
    if status == 404:
        return SquareApiError(
            f"Square could not find that resource during {operation} (HTTP 404). The location "
            "ID may be wrong or the application is not installed on this location." + suffix,
            "SQUARE_REJECTED",
            404,
        )
    return SquareApiError(
        f"Square {operation} failed (HTTP {status}).{suffix}",
        "SQUARE_REJECTED",
        status,
    )


def failure_from_unknown(error: Exception, fallback: dict) -> dict:
    if isinstance(error, SquareApiError):
        return {"ok": False, "code": error.code, "error": str(error)}
    return {**fallback, "error": str(error) or fallback.get("error", "Square error")}
