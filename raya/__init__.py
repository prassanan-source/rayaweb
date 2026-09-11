from flask import Flask
import click

from raya.config import Config


def create_app(config_object: type[Config] | None = None) -> Flask:
    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )
    app.config.from_object(config_object or Config)

    from raya.views import bp
    from raya.staff import bp as staff_bp

    app.register_blueprint(bp)
    app.register_blueprint(staff_bp)

    with app.app_context():
        from raya.order_store import init_order_store

        init_order_store()

    @app.cli.command("square-sync-menu")
    def square_sync_menu():
        """Create website menu items missing from the Square catalog."""
        from raya.square.sync import sync_catalog

        result = sync_catalog()
        click.echo(
            f"Square menu sync complete: {result['created_count']} created, "
            f"{result['existing_count']} already present."
        )
        for name in result["created"]:
            click.echo(f"  created: {name}")

    @app.errorhandler(404)
    def not_found(_error):
        from flask import render_template

        from raya.hours import status_copy
        from raya.restaurant import formatted_address, restaurant, square_order_url

        return (
            render_template(
                "404.html",
                restaurant=restaurant,
                formatted_address=formatted_address(),
                square_order_url=square_order_url,
                status=status_copy(),
                bag_count=0,
            ),
            404,
        )

    return app
