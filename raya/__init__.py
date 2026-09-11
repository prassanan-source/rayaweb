from flask import Flask

from raya.config import Config


def create_app(config_object: type[Config] | None = None) -> Flask:
    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )
    app.config.from_object(config_object or Config)

    from raya.views import bp

    app.register_blueprint(bp)

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
