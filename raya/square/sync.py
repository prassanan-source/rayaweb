from raya.menu import menu_categories
from raya.square.client import sync_web_menu


def sync_catalog() -> dict:
    return sync_web_menu(menu_categories())
